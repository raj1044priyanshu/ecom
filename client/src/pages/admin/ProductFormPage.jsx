import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FiArrowLeft, FiUploadCloud, FiX, FiCheckCircle } from 'react-icons/fi';
import axiosInstance from '../../api/axiosInstance.js';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner.jsx';

// These must exactly match the mongoose enum in Product.js
const CATEGORIES = [
  'Electronics', 'Fashion', 'Home & Kitchen',
  'Sports', 'Books', 'Beauty', 'Toys', 'Other',
];

const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().min(1, 'Brand is required'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  isFeatured: z.boolean().optional(),
  discountPercent: z.coerce.number().min(0).max(100).optional(),
});

const ProductFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [existingImages, setExistingImages] = useState([]); // {url, public_id} from DB
  const [newImageFiles, setNewImageFiles] = useState([]);   // File objects
  const [newImagePreviews, setNewImagePreviews] = useState([]); // Object URLs

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: { isFeatured: false, discountPercent: 0 }
  });

  const price = watch('price', 0);
  const discountPercent = watch('discountPercent', 0);
  const calculatedDiscountPrice = price && discountPercent > 0 
    ? Math.round(price * (1 - (discountPercent / 100))) 
    : 0;

  // Fetch by ID for the edit form
  const { data, isLoading } = useQuery({
    queryKey: ['adminProduct', id],
    queryFn: async () => {
      // The backend getProduct function looks up by slug. We query with id param instead.
      const res = await axiosInstance.get(`/products?id=${id}&limit=1`);
      // Fallback: try fetching by the id directly if the above doesn't return it
      const product = res.data?.products?.find(p => p._id === id);
      if (!product) throw new Error('Product not found');
      return product;
    },
    enabled: isEdit,
    retry: false,
  });

  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        price: data.price,
        description: data.description,
        category: data.category,
        brand: data.brand,
        stock: data.stock,
        isFeatured: data.isFeatured || false,
        discountPercent: data.discountPrice && data.price > 0 
          ? Math.round(((data.price - data.discountPrice) / data.price) * 100) 
          : 0,
      });
      setExistingImages(data.images || []);
    }
  }, [data, reset]);

  // Handle new file selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalCount = existingImages.length + newImageFiles.length + files.length;
    if (totalCount > 5) {
      toast.error(`Maximum 5 images allowed. You can add ${5 - existingImages.length - newImageFiles.length} more.`);
      return;
    }
    // Generate preview URLs
    const prevURLs = files.map(f => URL.createObjectURL(f));
    setNewImageFiles(prev => [...prev, ...files]);
    setNewImagePreviews(prev => [...prev, ...prevURLs]);
  };

  // Remove a newly selected (not yet saved) image
  const removeNewImage = (index) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Remove an existing (already saved in DB) image
  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      if (!isEdit && newImageFiles.length === 0) {
        throw new Error('Please upload at least one image.');
      }

      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'discountPercent') return; // backend doesn't want this
        if (value !== undefined && value !== null) fd.append(key, value);
      });
      
      // Inject the calculated price
      const calcDiscount = formData.price && formData.discountPercent > 0 
        ? Math.round(formData.price * (1 - (formData.discountPercent / 100))) 
        : 0;
      fd.append('discountPrice', calcDiscount);

      newImageFiles.forEach(file => fd.append('images', file));

      // Pass existing images that the admin kept (to avoid backend wiping them)
      fd.append('existingImages', JSON.stringify(existingImages));

      const url = isEdit ? `/products/${id}` : '/products';
      const method = isEdit ? 'put' : 'post';
      await axiosInstance[method](url, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Product updated!' : 'Product created!');
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      navigate('/admin/products');
    },
    onError: (error) => {
      const msg = error.message || error.response?.data?.message || 'Failed to save product';
      toast.error(msg);
    },
  });

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="h-8 w-8 text-primary-600" />
      </div>
    );
  }

  const totalImages = existingImages.length + newImageFiles.length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link to="/admin/products" className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 flex-shrink-0">
          <FiArrowLeft className="text-xl" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isEdit ? 'Update the details for this product.' : 'Fill out the form below to list a new product.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-8">

        {/* Main Fields */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-base font-bold text-gray-800">Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name <span className="text-red-500">*</span></label>
              <input
                {...register('name')}
                className={`input-field w-full ${errors.name ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                placeholder="e.g. Premium Wireless Headphones"
              />
              {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) <span className="text-red-500">*</span></label>
              <input type="number" step="0.01" {...register('price')}
                className={`input-field w-full ${errors.price ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                placeholder="0.00"
              />
              {errors.price && <p className="mt-1.5 text-xs text-red-500">{errors.price.message}</p>}
            </div>

            {/* Discount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
              <input type="number" step="1" min="0" max="100" {...register('discountPercent')}
                className="input-field w-full"
                placeholder="10"
              />
              {calculatedDiscountPrice > 0 && (
                <p className="mt-1.5 text-xs text-green-600">
                  Final sale price: <strong>₹{calculatedDiscountPrice}</strong>
                </p>
              )}
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Count <span className="text-red-500">*</span></label>
              <input type="number" {...register('stock')}
                className={`input-field w-full ${errors.stock ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                placeholder="0"
              />
              {errors.stock && <p className="mt-1.5 text-xs text-red-500">{errors.stock.message}</p>}
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand <span className="text-red-500">*</span></label>
              <input {...register('brand')}
                className={`input-field w-full ${errors.brand ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                placeholder="e.g. Sony"
              />
              {errors.brand && <p className="mt-1.5 text-xs text-red-500">{errors.brand.message}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category <span className="text-red-500">*</span></label>
              <select {...register('category')}
                className={`input-field w-full ${errors.category ? 'border-red-400 ring-2 ring-red-100' : ''}`}
              >
                <option value="">Select a category...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="mt-1.5 text-xs text-red-500">{errors.category.message}</p>}
            </div>

            {/* Featured Toggle */}
            <div className="md:col-span-2 flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <input type="checkbox" {...register('isFeatured')} id="isFeatured" className="sr-only" />
                <label htmlFor="isFeatured" className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-10 h-6 rounded-full transition-colors ${watch('isFeatured') ? 'bg-primary-600' : 'bg-gray-300'} relative`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${watch('isFeatured') ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Feature this product</span>
                    <p className="text-xs text-gray-400">Featured products are shown on the Home page hero section.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
              <textarea {...register('description')} rows="5"
                className={`input-field w-full resize-none ${errors.description ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                placeholder="Detailed product description..."
              />
              {errors.description && <p className="mt-1.5 text-xs text-red-500">{errors.description.message}</p>}
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-1">
            <h2 className="text-base font-bold text-gray-800">Product Images</h2>
            <span className="text-xs text-gray-400">{totalImages}/5 images</span>
          </div>
          <p className="text-xs text-gray-400 mb-5">
            Upload up to 5 images. Click the × button to remove an image. The first image is shown as the product thumbnail.
          </p>

          <div className="flex flex-wrap gap-4">
            {/* Existing Images */}
            {existingImages.map((img, i) => (
              <div key={`existing-${i}`} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group">
                <img src={img.url} alt="existing" className="w-full h-full object-cover" />
                {i === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-primary-600 text-white text-center text-xs py-0.5 font-medium">
                    Main
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeExistingImage(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  title="Remove this image"
                >
                  <FiX className="text-xs" />
                </button>
              </div>
            ))}

            {/* New Image Previews */}
            {newImagePreviews.map((url, i) => (
              <div key={`new-${i}`} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-green-400 group">
                <img src={url} alt="new upload preview" className="w-full h-full object-cover" />
                <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full p-0.5 shadow">
                  <FiCheckCircle className="text-xs" />
                </div>
                <button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  title="Remove this image"
                >
                  <FiX className="text-xs" />
                </button>
              </div>
            ))}

            {/* Upload trigger */}
            {totalImages < 5 && (
              <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 hover:border-primary-400 cursor-pointer transition-all">
                <FiUploadCloud className="text-2xl text-gray-400 mb-1" />
                <span className="text-xs text-gray-500 font-medium">Add image</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pb-4">
          <Link
            to="/admin/products"
            className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="btn-primary px-8 py-2.5 min-w-[150px] text-sm flex items-center justify-center gap-2"
          >
            {saveMutation.isPending ? (
              <Spinner className="h-4 w-4 text-white" />
            ) : (
              isEdit ? 'Save Changes' : 'Create Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;
