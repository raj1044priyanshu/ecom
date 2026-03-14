import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Get cart
export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images price stock');
    if (!cart) return res.status(200).json({ success: true, cart: { items: [], totalPrice: 0 } });
    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Add to cart
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock.' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const existingItem = cart.items.find((item) => item.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, price: product.discountPrice || product.price });
    }

    await cart.save();
    await cart.populate('items.product', 'name images price stock');
    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item quantity
export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

    const item = cart.items.find((item) => item.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not in cart.' });

    if (quantity <= 0) {
      cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.product', 'name images price stock');
    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
export const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

    cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId);
    await cart.save();
    res.status(200).json({ success: true, message: 'Item removed.', cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
export const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], totalPrice: 0 });
    res.status(200).json({ success: true, message: 'Cart cleared.' });
  } catch (error) {
    next(error);
  }
};
