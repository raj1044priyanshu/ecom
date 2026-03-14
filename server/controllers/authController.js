import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { generateTokens, setTokenCookies, clearTokenCookies } from '../utils/generateToken.js';
import { sendOTPEmail, sendPasswordResetEmail } from '../utils/emailService.js';

// @desc    Register user + send OTP
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // Create unverified user
    const user = await User.create({ name, email, password, isVerified: false });

    // Generate & send OTP
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    await OTP.findOneAndDelete({ email }); // Remove old OTPs
    await OTP.create({ email, otp });
    await sendOTPEmail(email, otp, name);

    res.status(201).json({
      success: true,
      message: 'OTP sent to your email. Please verify your account.',
      userId: user._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'OTP expired or invalid. Please try again.' });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP.' });
    }

    const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
    await OTP.findOneAndDelete({ email });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    setTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Account verified successfully!',
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend OTP
export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    await OTP.findOneAndDelete({ email });
    await OTP.create({ email, otp });
    await sendOTPEmail(email, otp, user.name);

    res.status(200).json({ success: true, message: 'New OTP sent to your email.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email first.' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    setTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout
export const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: '' });
    clearTokenCookies(res);
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'No refresh token.' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    setTokenCookies(res, accessToken, newRefreshToken);
    res.status(200).json({ success: true, message: 'Token refreshed.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth success handler
export const googleCallback = async (req, res) => {
  const { accessToken, refreshToken } = generateTokens(req.user._id);
  req.user.refreshToken = refreshToken;
  await req.user.save({ validateBeforeSave: false });
  setTokenCookies(res, accessToken, refreshToken);
  res.redirect(`${process.env.CLIENT_URL}/auth/oauth-success`);
};

// @desc    Forgot password
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: 'No user with that email.' });

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, resetUrl, user.name);

    res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
export const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ success: false, message: 'Token is invalid or expired.' });

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
export const getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};
