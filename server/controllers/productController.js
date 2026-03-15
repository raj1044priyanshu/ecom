import Product from '../models/Product.js';
import Review from '../models/Review.js';
import { getCache, setCache, flushCache } from '../utils/cache.js';
import { deleteFromCloudinary } from '../middleware/uploadMiddleware.js';


// @desc    Get all products with filtering, sorting, pagination
export const getProducts = async (req, res, next) => {
  try {
    const { keyword, category, brand, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

    const cacheKey = `products_${JSON.stringify(req.query)}`;
    const cached = getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    const query = {};
    if (keyword) {
      const searchRegex = new RegExp(keyword, 'i');
      query.$or = [
        { name: { $regex: searchRegex } },
        { category: { $regex: searchRegex } },
        { description: { $regex: searchRegex } }
      ];
    }
    if (category) query.category = category;
    if (brand) query.brand = { $regex: brand, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortOptions = {
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      newest: { createdAt: -1 },
      top_rated: { ratings: -1 },
    };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions[sort] || { createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');

    const result = {
      success: true,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      products,
    };

    setCache(cacheKey, result, 300);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by slug
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('seller', 'name');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product (admin)
export const createProduct = async (req, res, next) => {
  try {
    // req.cloudinaryFiles is populated by the uploadToCloudinary middleware
    const images = req.cloudinaryFiles || [];

    // Strip extra frontend-only fields before saving
    const { existingImages, discountPercent, ...bodyData } = req.body;

    const product = await Product.create({ ...bodyData, images, seller: req.user._id });
    flushCache();
    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (admin)
export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const newImages = req.cloudinaryFiles || [];
    if (newImages.length > 0) {
      let kept = [];
      try { kept = JSON.parse(req.body.existingImages || '[]'); } catch {}
      req.body.images = [...kept, ...newImages];
    }

    // Strip frontend-only fields before saving
    const { existingImages: _ei, discountPercent: _dp, ...updateData } = req.body;

    product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    flushCache();
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (admin)
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    // Delete images from Cloudinary
    for (const image of product.images) {
      await deleteFromCloudinary(image.public_id);
    }

    await product.deleteOne();
    flushCache();
    res.status(200).json({ success: true, message: 'Product deleted.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Create/Update review
export const createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const existingReview = await Review.findOne({ product: req.params.id, user: req.user._id });
    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
      await existingReview.save();
    } else {
      await Review.create({ product: req.params.id, user: req.user._id, rating, comment });
    }

    // Recalculate rating
    const reviews = await Review.find({ product: req.params.id });
    product.numOfReviews = reviews.length;
    product.ratings = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await product.save({ validateBeforeSave: false });

    res.status(201).json({ success: true, message: 'Review submitted.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a product
export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.id }).populate('user', 'name avatar');
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const cacheKey = 'featured_products';
    const cached = getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    const products = await Product.find({ isFeatured: true }).limit(8);
    const result = { success: true, products };
    setCache(cacheKey, result, 600);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
