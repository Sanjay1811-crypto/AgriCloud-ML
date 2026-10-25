const mongoose = require('mongoose');
const { LocalAnalysis } = require('../config/localStore');

const topPredictionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    confidence: { type: Number, required: true },
    crop: { type: String },
    rawClass: { type: String }
  },
  { _id: false }
);

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true
    },
    uploadedByName: { type: String, default: 'Farmer' },
    uploadedByEmail: { type: String, default: '' },
    originalFilename: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    storageKey: { type: String, required: true },
    storageUrl: { type: String, required: true },
    displayImageUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'completed'
    },
    rawClass: { type: String },
    plantName: { type: String, required: true },
    predictedDisease: { type: String, required: true },
    confidence: { type: Number, required: true },
    confidenceLevel: {
      type: String,
      enum: ['High', 'Moderate', 'Low'],
      default: 'High'
    },
    topPredictions: [topPredictionSchema],
    modelVersion: { type: String, default: 'EfficientNet-B0-v1' },
    cause: { type: String, default: 'N/A' },
    symptoms: { type: String, default: 'N/A' },
    treatment: { type: String, default: 'N/A' },
    prevention: { type: String, default: 'N/A' },
    isHealthy: { type: Boolean, default: false },
    predictedLabel: { type: String, required: true },
    correctedLabel: { type: String, default: null },
    reviewStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Corrected'],
      default: 'Pending',
      index: true
    },
    reviewNotes: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.Mixed, default: null },
    reviewedByName: { type: String, default: null },
    reviewedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

const MongoAnalysis = mongoose.models.Analysis || mongoose.model('Analysis', analysisSchema);

const AnalysisProxy = new Proxy(MongoAnalysis, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    if (prop in LocalAnalysis) {
      return LocalAnalysis[prop];
    }
    return target[prop];
  }
});

module.exports = AnalysisProxy;
