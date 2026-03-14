import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

// Use memoryStorage — we buffer the file in RAM and stream it to Cloudinary ourselves.
// This is the correct approach for cloudinary v2 + multer v2 + Express v5.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // If no file exists, just proceed
  if (!file) {
    return cb(null, true);
  }
  
  // Allow common image types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else if (file.mimetype === 'application/octet-stream' || file.size === 0) {
    // If it's an empty blob from JS FormData, just ignore it without throwing
    cb(null, false);
  } else {
    // Pass standard Error to multer
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/**
 * Upload a single buffer to Cloudinary via upload_stream.
 * Returns a Promise<{ public_id, url }>.
 */
const uploadBufferToCloudinary = (buffer, originalname) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'ecommerce',
        transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ public_id: result.public_id, url: result.secure_url });
      }
    );

    // Pipe the buffer into the upload stream
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

/**
 * Express middleware that processes req.files (from multer memoryStorage)
 * and uploads each to Cloudinary, then attaches results to req.cloudinaryFiles.
 */
export const uploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      req.cloudinaryFiles = [];
      return next();
    }

    const uploads = await Promise.all(
      req.files.map((file) => uploadBufferToCloudinary(file.buffer, file.originalname))
    );

    req.cloudinaryFiles = uploads;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an image from Cloudinary by public_id.
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};
