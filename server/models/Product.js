import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    slug: { type: String, unique: true },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: { type: Number, default: 0 },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Electronics', 'Fashion', 'Home & Kitchen', 'Sports', 'Books', 'Beauty', 'Toys', 'Other'],
    },
    brand: { type: String, trim: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    images: [
      {
        public_id: String,
        url: String,
      },
    ],
    ratings: { type: Number, default: 0 },
    numOfReviews: { type: Number, default: 0 },
    tags: [String],
    isFeatured: { type: Boolean, default: false },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-generate slug from name
productSchema.pre('save', async function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

const Product = mongoose.model('Product', productSchema);
export default Product;
