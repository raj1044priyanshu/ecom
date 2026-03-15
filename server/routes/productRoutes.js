import express from 'express';
import {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, createReview, getProductReviews, getFeaturedProducts,
} from '../controllers/productController.js';
import { bulkImportCSV, bulkImportJSON, getCSVTemplate } from '../controllers/bulkImportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload, uploadToCloudinary, uploadCSV } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/bulk-template', protect, authorize('admin'), getCSVTemplate);
router.get('/:slug', getProduct);
router.get('/:id/reviews', getProductReviews);

router.post('/', protect, authorize('admin'), upload.array('images', 5), uploadToCloudinary, createProduct);
router.put('/:id', protect, authorize('admin'), upload.array('images', 5), uploadToCloudinary, updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

router.post('/bulk-csv', protect, authorize('admin'), uploadCSV.single('file'), bulkImportCSV);
router.post('/bulk-json', protect, authorize('admin'), bulkImportJSON);

router.post('/:id/reviews', protect, upload.array('images', 3), uploadToCloudinary, createReview);

export default router;
