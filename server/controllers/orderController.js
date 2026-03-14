import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import { sendOrderConfirmationEmail, sendShippingUpdateEmail } from '../utils/emailService.js';

// @desc    Create new order directly
export const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    const items = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images[0]?.url || '',
      quantity: item.quantity,
      price: item.price,
    }));

    const taxPrice = 0; // Removed per user request
    const shippingPrice = cart.totalPrice > 500 ? 0 : 30;
    const totalPrice = cart.totalPrice + taxPrice + shippingPrice;

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentInfo: { status: 'pending' },
      itemsPrice: cart.totalPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    // Send confirmation email
    await sendOrderConfirmationEmail(req.user.email, order, req.user.name);

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my orders
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    All orders (admin)
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (admin)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'email name');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const newStatus = req.body.status;
    order.orderStatus = newStatus;
    if (newStatus === 'Delivered') order.deliveredAt = new Date();
    await order.save();

    const notifyStatuses = ['Shipped', 'Out for Delivery', 'Delivered'];
    if (notifyStatuses.includes(newStatus) && order.user?.email) {
      try {
        await sendShippingUpdateEmail(order.user.email, order, order.user.name, newStatus);
      } catch (emailErr) {
        console.error('Shipping email error:', emailErr.message);
      }
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (user)
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    if (order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an order that has already been shipped or delivered.' });
    }

    order.orderStatus = 'Cancelled';
    await order.save();

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
