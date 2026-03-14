import express from 'express';
import {
  getProfile, updateProfile, updatePreferences,
  getAllUsers, updateUserRole, deleteUser,
  saveAddress, deleteAddress,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.put('/preferences', protect, updatePreferences);
router.post('/addresses', protect, saveAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

// Admin
router.get('/', protect, authorize('admin'), getAllUsers);
router.put('/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;
