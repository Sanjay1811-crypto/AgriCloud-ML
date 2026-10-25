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

    // 4. Retrieve structured disease curation information from cures.json
    const curation = getCureByClass(prediction.rawClass || prediction.disease);

    // 5. Build and save Analysis record
    const confidenceScore = prediction.confidence || 0.90;
    const confidenceLevel = getConfidenceLevel(confidenceScore);

    const analysis = await Analysis.create({
      userId: req.user._id,
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

// @desc    Get user's analysis history with search, filters, and pagination
// @route   GET /api/analysis
const getAnalyses = async (req, res, next) => {
  try {
    const { search, crop, status, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;

    const query = { userId: req.user._id };

    if (search) {
      query.$or = [
        { plantName: { $regex: search, $options: 'i' } },
        { predictedDisease: { $regex: search, $options: 'i' } },
        { originalFilename: { $regex: search, $options: 'i' } }
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
      count: items.length,
      data: items
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single analysis by ID (Enforces User Data Isolation)
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

    // STRICT USER DATA ISOLATION
    if (analysis.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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

// @desc    Submit Relabeling Review (Confirm Prediction or Correct Label)
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

    // User ownership check
    if (analysis.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    analysis.reviewStatus = reviewStatus;
    if (reviewStatus === 'Corrected' && correctedLabel) {
      analysis.correctedLabel = correctedLabel;
      // Also update curation information for the corrected label
      const newCuration = getCureByClass(correctedLabel);
      if (newCuration) {
        analysis.cause = newCuration.cause;
        analysis.symptoms = newCuration.symptoms;
        analysis.treatment = newCuration.treatment;
        analysis.prevention = newCuration.prevention;
        analysis.isHealthy = newCuration.isHealthy;
        analysis.plantName = newCuration.crop;
      }
    } else if (reviewStatus === 'Confirmed') {
      analysis.correctedLabel = analysis.predictedLabel;
    }

    if (reviewNotes !== undefined) {
      analysis.reviewNotes = reviewNotes;
    }

    analysis.reviewedAt = new Date();
    await analysis.save();

    res.status(200).json({
      success: true,
      message: `Analysis review successfully recorded as ${reviewStatus}.`,
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

    // User ownership check
    if (analysis.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
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
    const analyses = await Analysis.find({
      userId: req.user._id,
      reviewStatus: { $in: ['Confirmed', 'Corrected'] }
    });

    if (format === 'csv') {
      let csv = 'ID,Filename,PredictedLabel,CorrectedLabel,ReviewStatus,Confidence,ReviewedAt\n';
      analyses.forEach(item => {
        csv += `"${item._id}","${item.originalFilename}","${item.predictedLabel}","${item.correctedLabel || ''}","${item.reviewStatus}",${item.confidence},"${item.reviewedAt || ''}"\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="agricloud_relabel_dataset.csv"');
      return res.send(csv);
    }

    // Standard COCO / MLOps format
    const cocoExport = {
      info: {
        description: 'AgriCloud-ML Expert Relabeled Dataset',
        version: '1.0',
        year: new Date().getFullYear(),
        contributor: req.user.name
      },
      annotations: analyses.map((a, idx) => ({
        id: idx + 1,
        image_id: a._id,
        filename: a.originalFilename,
        image_url: a.displayImageUrl,
        predicted_label: a.predictedLabel,
        corrected_label: a.correctedLabel || a.predictedLabel,
        review_status: a.reviewStatus,
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
