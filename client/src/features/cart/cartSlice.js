import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance.js';
import { toast } from 'react-hot-toast';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get('/cart');
    return data.cart;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
  }
});

export const addToCart = createAsyncThunk('cart/add', async ({ productId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post('/cart/add', { productId, quantity });
    toast.success('Added to cart');
    return data.cart;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to add item');
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ productId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.put(`/cart/item/${productId}`, { quantity });
    return data.cart;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update item');
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (productId, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.delete(`/cart/item/${productId}`);
    toast.success('Removed from cart');
    return data.cart;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to remove item');
  }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    await axiosInstance.delete('/cart/clear');
    return { items: [], totalPrice: 0 };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
  }
});

const initialState = {
  items: [],
  totalPrice: 0,
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Shared handler for all successful cart updates
    const handleCartUpdate = (state, action) => {
      state.isLoading = false;
      state.items = action.payload.items || [];
      state.totalPrice = action.payload.totalPrice || 0;
    };

    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => { state.isLoading = true; })
      .addCase(fetchCart.fulfilled, handleCartUpdate)
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add to Cart
      .addCase(addToCart.pending, (state) => { state.isLoading = true; })
      .addCase(addToCart.fulfilled, handleCartUpdate)
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Item
      .addCase(updateCartItem.fulfilled, handleCartUpdate)
      // Remove Item
      .addCase(removeFromCart.fulfilled, handleCartUpdate)
      // Clear Cart
      .addCase(clearCart.fulfilled, handleCartUpdate);
  },
});

export default cartSlice.reducer;
