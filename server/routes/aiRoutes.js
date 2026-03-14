import express from 'express';
import { getRecommendations, getSearchSuggestions, chatSupport } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/recommendations', protect, getRecommendations);
router.get('/search-suggestions', getSearchSuggestions);
router.post('/chat', chatSupport);

export default router;
