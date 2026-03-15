import { useState, useRef, useEffect } from 'react';
import { Star, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import StarRatings from 'react-star-ratings';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance.js';

const ReviewModal = ({ product, isOpen, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setComment('');
      setImages([]);
      setPreviews([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 3) {
      toast.error('You can only upload up to 3 images');
      return;
    }

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
    setImages([...images, ...files]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('rating', rating);
    formData.append('comment', comment);
    images.forEach((image) => {
      formData.append('images', image);
    });

    try {
      await axiosInstance.post(`/products/${product.id || product._id}/reviews`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Review submitted successfully!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 pb-0 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Rate Product</h2>
            <p className="text-gray-600 font-medium text-sm mt-1">{product.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Star Rating */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Your Rating</span>
            <StarRatings
              rating={rating}
              starRatedColor="#f59e0b"
              starHoverColor="#f59e0b"
              starEmptyColor="#e7e5e4"
              changeRating={setRating}
              numberOfStars={5}
              starDimension="36px"
              starSpacing="5px"
              name="rating"
            />
          </div>

          {/* Comment */}
          <div className="space-y-3">
            <label className="text-xs font-black text-gray-700 uppercase tracking-widest block ml-1">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you like or dislike about the product..."
              className="w-full h-32 p-5 bg-surface-50 border-2 border-surface-200 rounded-3xl focus:border-primary-500 focus:outline-none transition-all font-medium text-gray-800 placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-black text-gray-700 uppercase tracking-widest">Add Photos (Max 3)</label>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{images.length}/3</span>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {previews.map((preview, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-surface-200 group">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {images.length < 3 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-2xl border-2 border-dashed border-surface-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-all bg-surface-50"
                >
                  <ImageIcon className="h-6 w-6 mb-1" />
                  <span className="text-[10px] font-black uppercase">Add</span>
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              multiple
              className="hidden"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary py-4 rounded-2xl text-lg font-black tracking-wide shadow-xl shadow-primary-500/20 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                Submitting...
              </>
            ) : (
              'Post Review'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
