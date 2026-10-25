const express = require('express');
const router = express.Router();
const {
  createAnalysis,
  getAnalyses,
  getAnalysisById,
  updateReview,
  deleteAnalysis,
  exportRelabeledData
} = require('../controllers/analysisController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect); // All analysis endpoints require authentication

router.post('/', upload.single('file'), createAnalysis);
router.get('/', getAnalyses);
router.get('/export/relabel', exportRelabeledData);
router.get('/:id', getAnalysisById);
router.put('/:id/review', updateReview);
router.delete('/:id', deleteAnalysis);

module.exports = router;
