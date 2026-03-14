import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get profile
export const getProfile = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

// @desc    Update profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;

    if (req.file) {
      if (req.user.avatar && req.user.avatar.includes('cloudinary')) {
        const publicId = req.user.avatar.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`ecommerce/${publicId}`);
      }
      updates.avatar = req.file.path;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Save (add/update) an address
export const saveAddress = async (req, res, next) => {
  try {
    const { _id, address, city, state, postalCode, country, phone, label, isDefault } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (_id) {
      // Update existing address
      const addr = user.addresses.id(_id);
      if (!addr) return res.status(404).json({ success: false, message: 'Address not found.' });
      addr.address = address;
      addr.city = city;
      addr.state = state;
      addr.postalCode = postalCode;
      addr.country = country || 'India';
      addr.phone = phone;
      addr.label = label || 'Home';
      if (isDefault) {
        user.addresses.forEach(a => { a.isDefault = false; });
        addr.isDefault = true;
      }
    } else {
      // Add new address
      if (isDefault) user.addresses.forEach(a => { a.isDefault = false; });
      user.addresses.push({ address, city, state, postalCode, country: country || 'India', phone, label: label || 'Home', isDefault: isDefault || user.addresses.length === 0 });
    }

    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an address
export const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const addrIndex = user.addresses.findIndex(a => a._id.toString() === req.params.addressId);
    if (addrIndex === -1) return res.status(404).json({ success: false, message: 'Address not found.' });

    user.addresses.splice(addrIndex, 1);
    // Make first address default if the removed one was default
    if (user.addresses.length > 0 && !user.addresses.some(a => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }
    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update preferences for AI
export const updatePreferences = async (req, res, next) => {
  try {
    const { categories } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'preferences.categories': categories },
      { new: true }
    );
    res.status(200).json({ success: true, preferences: user.preferences });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password -refreshToken');
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (admin)
export const updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.status(200).json({ success: true, message: 'User deleted.' });
  } catch (error) {
    next(error);
  }
};
