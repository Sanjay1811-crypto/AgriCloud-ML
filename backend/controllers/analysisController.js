const Analysis = require('../models/Analysis');
const { uploadFile, deleteFile } = require('../services/s3Service');
const { predictDisease } = require('../services/mlService');
const { getCureByClass } = require('../services/cureService');
const { processPdf } = require('../services/pdfService');

// Helper to determine confidence level
const getConfidenceLevel = (score) => {
  if (score >= 0.80) return 'High';
  if (score >= 0.50) return 'Moderate';
  return 'Low';
};

// @desc    Upload image/PDF and run pathology analysis
// @route   POST /api/analysis
const createAnalysis = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a plant leaf image (.jpg, .jpeg, .png) or PDF report.'
      });
    }

    const { originalname, mimetype, size, buffer } = req.file;
    let inferenceImageBuffer = buffer;
    let displayImageUrl = '';

    // 1. Upload original file to storage (local or S3)
    const originalUpload = await uploadFile(buffer, originalname, mimetype);

    // 2. Handle PDF Preprocessing if required
    if (mimetype === 'application/pdf') {
      const pdfResult = await processPdf(buffer, originalname);
      inferenceImageBuffer = pdfResult.imageBuffer;
      displayImageUrl = pdfResult.displayImageUrl;
    } else {
      displayImageUrl = originalUpload.storageUrl;
    }

    // 3. Run EfficientNet-B0 Inference
    const prediction = await predictDisease(inferenceImageBuffer, originalname);

    // Guardrail: reject non-plant / out-of-distribution uploads
    if (prediction.isPlant === false) {
      return res.status(400).json({
        success: false,
        message: prediction.rejectionReason || 'No botanical plant leaf detected in the uploaded image. Please upload a clear photo of a crop leaf.'
      });
    }

    // 4. Retrieve structured disease curation information from cures.json
    const curation = getCureByClass(prediction.rawClass || prediction.disease);

    // 5. Build and save Analysis record
    const confidenceScore = prediction.confidence || 0.90;
    const confidenceLevel = getConfidenceLevel(confidenceScore);

    const analysis = await Analysis.create({
      userId: req.user._id,
      uploadedByName: req.user.name || 'Farmer',
      uploadedByEmail: req.user.email || '',
      originalFilename: originalname,
      fileType: mimetype,
      fileSize: size,
      storageKey: originalUpload.storageKey,
      storageUrl: originalUpload.storageUrl,
      displayImageUrl: displayImageUrl,
      status: 'completed',
      rawClass: prediction.rawClass,
      plantName: prediction.plantName || curation.crop,
      predictedDisease: prediction.disease || curation.disease,
      confidence: confidenceScore,
      confidenceLevel,
      topPredictions: prediction.topPredictions || [
        { label: prediction.disease, confidence: confidenceScore, crop: prediction.plantName, rawClass: prediction.rawClass }
      ],
      modelVersion: prediction.modelVersion || 'EfficientNet-B0-v1',
      cause: curation.cause,
      symptoms: curation.symptoms,
      treatment: curation.treatment,
      prevention: curation.prevention,
      isHealthy: curation.isHealthy || false,
      predictedLabel: prediction.disease || curation.disease,
      reviewStatus: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Plant pathology analysis completed successfully.',
      data: analysis
    });
  } catch (err) {
    if (err.isPlantError || err.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next(err);
  }
};

// @desc    Get user's analysis history or all submissions for experts
// @route   GET /api/analysis
const getAnalyses = async (req, res, next) => {
  try {
    const { search, crop, status, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;

    const query = {};

    // STRICT USER DATA ISOLATION:
    // Regular users can only see their own analyses.
    // Certified Experts and Admins can see ALL user-uploaded specimens across the system.
    if (req.user.role !== 'expert' && req.user.role !== 'admin') {
      query.userId = req.user._id;
    }

    if (search) {
      query.$or = [
        { plantName: { $regex: search, $options: 'i' } },
        { predictedDisease: { $regex: search, $options: 'i' } },
        { originalFilename: { $regex: search, $options: 'i' } },
        { uploadedByName: { $regex: search, $options: 'i' } },
        { uploadedByEmail: { $regex: search, $options: 'i' } }
      ];
    }

    if (crop && crop !== 'all') {
      query.plantName = { $regex: crop, $options: 'i' };
    }

    if (status && status !== 'all') {
      query.reviewStatus = status;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      Analysis.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      Analysis.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      isExpertView: req.user.role === 'expert' || req.user.role === 'admin',
      data: items
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single analysis record by ID
// @route   GET /api/analysis/:id
const getAnalysisById = async (req, res, next) => {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis record not found.'
      });
    }

    // Regular users can only access their own analyses.
    // Experts and Admins can view any submission for pathology validation.
    if (analysis.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'expert') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this analysis record.'
      });
    }

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit Relabeling Review (Confirm Prediction or Correct Label by Expert / User)
// @route   PUT /api/analysis/:id/review
const updateReview = async (req, res, next) => {
  try {
    const { reviewStatus, correctedLabel, reviewNotes } = req.body;

    if (!['Confirmed', 'Corrected'].includes(reviewStatus)) {
      return res.status(400).json({
        success: false,
        message: "reviewStatus must be either 'Confirmed' or 'Corrected'."
      });
    }

    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis record not found.'
      });
    }

    // Permission check: Owner or Certified Expert or Admin
    if (analysis.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'expert') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to review this analysis record.'
      });
    }

    analysis.reviewStatus = reviewStatus;
    analysis.reviewedBy = req.user._id;
    analysis.reviewedByName = req.user.name;
    analysis.reviewedAt = new Date();

    if (reviewNotes !== undefined) {
      analysis.reviewNotes = reviewNotes;
    }

    if (reviewStatus === 'Corrected' && correctedLabel) {
      analysis.correctedLabel = correctedLabel;
      // Retrieve updated botanical curation information for corrected label
      const newCuration = getCureByClass(correctedLabel);
      if (newCuration) {
        analysis.cause = newCuration.cause;
        analysis.symptoms = newCuration.symptoms;
        analysis.treatment = newCuration.treatment;
        analysis.prevention = newCuration.prevention;
        analysis.isHealthy = newCuration.isHealthy || false;
        analysis.plantName = newCuration.crop;
      }
    } else if (reviewStatus === 'Confirmed') {
      analysis.correctedLabel = analysis.predictedLabel || analysis.predictedDisease;
    }

    await analysis.save();

    res.status(200).json({
      success: true,
      message: `Analysis review successfully recorded as ${reviewStatus} by ${req.user.role === 'expert' ? 'Agronomist ' + req.user.name : 'User'}.`,
      data: analysis
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete analysis record and stored file
// @route   DELETE /api/analysis/:id
const deleteAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis record not found.'
      });
    }

    // User ownership or Admin check
    if (analysis.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the author or administrator can delete this record.'
      });
    }

    await deleteFile(analysis.storageKey);
    await analysis.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Analysis record deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Export dataset relabeling metadata for model retraining (COCO / JSON / CSV)
// @route   GET /api/analysis/export/relabel
const exportRelabeledData = async (req, res, next) => {
  try {
    const format = req.query.format || 'json';

    // Experts/Admins export all reviewed records across the platform; Users export their own
    const query = {
      reviewStatus: { $in: ['Confirmed', 'Corrected'] }
    };
    if (req.user.role !== 'expert' && req.user.role !== 'admin') {
      query.userId = req.user._id;
    }

    const analyses = await Analysis.find(query);

    if (format === 'csv') {
      let csv = 'ID,UploadedBy,Filename,PredictedLabel,CorrectedLabel,ReviewStatus,Confidence,ReviewedBy,ReviewedAt\n';
      analyses.forEach(item => {
        csv += `"${item._id}","${item.uploadedByName || ''}","${item.originalFilename}","${item.predictedLabel}","${item.correctedLabel || ''}","${item.reviewStatus}",${item.confidence},"${item.reviewedByName || ''}","${item.reviewedAt || ''}"\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="agricloud_relabel_dataset.csv"');
      return res.send(csv);
    }

    // Standard COCO / MLOps dataset format
    const cocoExport = {
      info: {
        description: 'AgriCloud-ML Expert Relabeled Dataset for Continuous Cloud Retraining',
        version: '2.0',
        year: new Date().getFullYear(),
        contributor: req.user.name,
        exporterRole: req.user.role
      },
      annotations: analyses.map((a, idx) => ({
        id: idx + 1,
        image_id: a._id,
        uploader: a.uploadedByName || 'Unknown',
        filename: a.originalFilename,
        image_url: a.displayImageUrl,
        predicted_label: a.predictedLabel,
        corrected_label: a.correctedLabel || a.predictedLabel,
        review_status: a.reviewStatus,
        reviewed_by: a.reviewedByName || null,
        confidence: a.confidence,
        model_version: a.modelVersion,
        reviewed_at: a.reviewedAt
      }))
    };

    res.status(200).json({
      success: true,
      totalRecords: analyses.length,
      dataset: cocoExport
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createAnalysis,
  getAnalyses,
  getAnalysisById,
  updateReview,
  deleteAnalysis,
  exportRelabeledData
};
