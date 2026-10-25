const Analysis = require('../models/Analysis');

// @desc    Get dashboard metrics computed live from MongoDB for authenticated user
// @route   GET /api/dashboard/stats
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [totalAnalyses, healthyCount, diseasedCount, avgResult, statusBreakdown] = await Promise.all([
      Analysis.countDocuments({ userId }),
      Analysis.countDocuments({ userId, isHealthy: true }),
      Analysis.countDocuments({ userId, isHealthy: false }),
      Analysis.aggregate([
        { $match: { userId } },
        { $group: { _id: null, avgConfidence: { $avg: '$confidence' } } }
      ]),
      Analysis.aggregate([
        { $match: { userId } },
        { $group: { _id: '$reviewStatus', count: { $sum: 1 } } }
      ])
    ]);

    const averageConfidence = avgResult.length > 0 && avgResult[0].avgConfidence
      ? Math.round(avgResult[0].avgConfidence * 100) / 100
      : 0;

    const reviewStats = {
      Pending: 0,
      Confirmed: 0,
      Corrected: 0
    };

    statusBreakdown.forEach(item => {
      if (item._id && reviewStats[item._id] !== undefined) {
        reviewStats[item._id] = item.count;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalAnalyses,
        diseasesDetected: diseasedCount,
        healthyPlants: healthyCount,
        averageConfidence: averageConfidence ? `${Math.round(averageConfidence * 100)}%` : '0%',
        averageConfidenceValue: averageConfidence,
        reviewStats
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get recent 5 analyses for authenticated user
// @route   GET /api/dashboard/recent
const getRecent = async (req, res, next) => {
  try {
    const recent = await Analysis.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      count: recent.length,
      data: recent
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStats,
  getRecent
};
