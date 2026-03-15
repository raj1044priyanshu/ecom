import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, UploadCloud, X, CheckCircle } from 'lucide-react';
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
        <Spinner className="h-10 w-10 text-primary-600" />
      </div>
    );
  }

  const totalImages = existingImages.length + newImageFiles.length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center gap-5 border-b-2 border-primary-500 pb-5 inline-flex">
        <Link to="/admin/products" className="p-3 bg-white border-2 border-surface-300 rounded-2xl hover:bg-surface-50 hover:border-primary-400 transition-colors text-gray-800 flex-shrink-0 shadow-sm">
          <ArrowLeft className="h-6 w-6" strokeWidth={2.5} />
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-gray-700 font-bold text-sm mt-1">
            {isEdit ? 'Update the details for this product.' : 'Fill out the form below to list a new product.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-8">

        {/* Main Fields */}
        <div className="bg-white p-6 md:p-8 rounded-[1.5rem] shadow-sm border-2 border-surface-300 space-y-8">
          <h2 className="text-lg font-black text-gray-900 tracking-tight uppercase border-b-2 border-surface-300 pb-3">Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2 ml-1">Product Name <span className="text-red-500">*</span></label>
              <input
                {...register('name')}
                className={`input-field w-full shadow-sm text-base ${errors.name ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                placeholder="e.g. Premium Wireless Headphones"
              />
              {errors.name && <p className="mt-2 ml-1 text-xs font-bold text-red-500">{errors.name.message}</p>}
            </div>

            {/* Price */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2 ml-1">Price (₹) <span className="text-red-500">*</span></label>
              <input type="number" step="0.01" {...register('price')}
                className={`input-field w-full shadow-sm text-base ${errors.price ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                placeholder="0.00"
              />
              {errors.price && <p className="mt-2 ml-1 text-xs font-bold text-red-500">{errors.price.message}</p>}
            </div>

            {/* Discount */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2 ml-1">Discount (%)</label>
              <input type="number" step="1" min="0" max="100" {...register('discountPercent')}
                className="input-field w-full shadow-sm text-base"
                placeholder="10"
              />
              {calculatedDiscountPrice > 0 && (
                <div className="mt-3 ml-1 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-green-700">
                     Final sale price: <span className="bg-green-100 px-2.5 py-1 rounded-lg border border-green-200 shadow-sm ml-1 text-base tracking-tight text-green-900">₹{calculatedDiscountPrice}</span>
                   </p>
                </div>
              )}
            </div>

            {/* Stock */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2 ml-1">Stock Count <span className="text-red-500">*</span></label>
              <input type="number" {...register('stock')}
                className={`input-field w-full shadow-sm text-base ${errors.stock ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                placeholder="0"
              />
              {errors.stock && <p className="mt-2 ml-1 text-xs font-bold text-red-500">{errors.stock.message}</p>}
            </div>

            {/* Brand */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2 ml-1">Brand <span className="text-red-500">*</span></label>
              <input {...register('brand')}
                className={`input-field w-full shadow-sm text-base ${errors.brand ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                placeholder="e.g. Sony"
              />
              {errors.brand && <p className="mt-2 ml-1 text-xs font-bold text-red-500">{errors.brand.message}</p>}
            </div>

            {/* Category */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2 ml-1">Category <span className="text-red-500">*</span></label>
              <select {...register('category')}
                className={`input-field w-full shadow-sm text-base ${errors.category ? 'border-red-400 ring-2 ring-red-100' : ''}`}
              >
                <option value="">Select a category...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="mt-2 ml-1 text-xs font-bold text-red-500">{errors.category.message}</p>}
            </div>

            {/* Featured Toggle */}
            <div className="md:col-span-2 pt-4 border-t-2 border-surface-300 mt-2">
              <div className="relative">
                <input type="checkbox" {...register('isFeatured')} id="isFeatured" className="sr-only" />
                <label htmlFor="isFeatured" className="flex items-center gap-4 cursor-pointer bg-surface-50 p-4 rounded-2xl border border-surface-300">
                  <div className={`w-14 h-8 flex-shrink-0 rounded-full transition-colors border-2 ${watch('isFeatured') ? 'bg-primary-500 border-primary-600' : 'bg-surface-300 border-gray-400'} relative`}>
                    <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${watch('isFeatured') ? 'translate-x-[24px]' : 'translate-x-1'}`} />
                  </div>
                  <div>
                    <span className="text-sm font-black text-gray-900 tracking-tight">Feature this product</span>
                    <p className="text-xs font-medium text-gray-700 mt-0.5">Featured products are shown on the Home page hero section.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2 ml-1">Description <span className="text-red-500">*</span></label>
              <textarea {...register('description')} rows="6"
                className={`input-field w-full resize-y shadow-sm text-base ${errors.description ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                placeholder="Detailed product description..."
              />
              {errors.description && <p className="mt-2 ml-1 text-xs font-bold text-red-500">{errors.description.message}</p>}
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-6 md:p-8 rounded-[1.5rem] shadow-sm border-2 border-surface-300">
          <div className="flex justify-between items-center mb-4 mt-2 border-b-2 border-surface-300 pb-3">
            <h2 className="text-lg font-black text-gray-900 tracking-tight uppercase">Product Images</h2>
            <span className="text-[10px] font-black uppercase tracking-widest bg-surface-100 px-3 py-1 rounded-xl border border-surface-300 text-gray-800">{totalImages}/5 files</span>
          </div>
          <p className="text-sm font-bold text-gray-700 mb-6 bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-200">
            Upload up to 5 images. The first image will be set as the main product thumbnail.
          </p>

          <div className="flex flex-wrap gap-5">
            {/* Existing Images */}
            {existingImages.map((img, i) => (
              <div key={`existing-${i}`} className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-2 border-surface-300 group bg-surface-50 shadow-sm">
                <img src={img.url} alt="existing" className="w-full h-full object-cover" />
                {i === 0 && (
                  <div className="absolute top-2 left-2 bg-primary-600 text-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-md border border-primary-400">
                    Main
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeExistingImage(i)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-xl p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600 border border-red-400"
                  title="Remove this image"
                >
                  <X className="h-4 w-4" strokeWidth={3} />
                </button>
              </div>
            ))}

            {/* New Image Previews */}
            {newImagePreviews.map((url, i) => (
              <div key={`new-${i}`} className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-4 border-green-500 group bg-surface-50 shadow-md">
                <img src={url} alt="new upload preview" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 bg-green-500 text-white rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow-md border border-green-400">
                  <CheckCircle className="h-3 w-3" strokeWidth={3} />
                  <span className="text-[10px] font-black uppercase tracking-widest">New</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-xl p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600 border border-red-400"
                  title="Remove this image"
                >
                  <X className="h-4 w-4" strokeWidth={3} />
                </button>
              </div>
            ))}

            {/* Upload trigger */}
            {totalImages < 5 && (
              <label className="w-32 h-32 sm:w-40 sm:h-40 flex flex-col items-center justify-center border-[3px] border-dashed border-surface-300 rounded-2xl hover:bg-primary-50 hover:border-primary-500 cursor-pointer transition-all bg-surface-50 group">
                <UploadCloud className="h-10 w-10 text-gray-600 mb-3 group-hover:text-primary-500 transition-colors" strokeWidth={2} />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-700 group-hover:text-primary-700">Add Image</span>
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
        <div className="flex justify-end gap-5 pb-10 pt-4">
          <Link
            to="/admin/products"
            className="px-8 py-3.5 rounded-xl border-2 border-surface-300 text-gray-800 font-bold hover:bg-surface-50 hover:border-gray-400 transition-colors bg-white shadow-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="btn-primary px-10 py-3.5 min-w-[200px] text-base shadow-xl shadow-primary-500/30 flex items-center justify-center gap-2"
          >
            {saveMutation.isPending ? (
              <Spinner className="h-5 w-5 text-white" />
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
