import express from 'express';
import {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, createReview, getProductReviews, getFeaturedProducts,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload, uploadToCloudinary } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:slug', getProduct);
router.get('/:id/reviews', getProductReviews);

router.post('/', protect, authorize('admin'), upload.array('images', 5), uploadToCloudinary, createProduct);
router.put('/:id', protect, authorize('admin'), upload.array('images', 5), uploadToCloudinary, updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

router.post('/:id/reviews', protect, createReview);

export default router;
