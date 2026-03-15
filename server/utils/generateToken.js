import jwt from 'jsonwebtoken';

export const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });

  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });

  return { accessToken, refreshToken };
};

export const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const clientUrl = process.env.CLIENT_URL || '';
  
  // Decide cookie options based on whether we're in production and if it's cross-origin
  const isCrossOrigin = clientUrl.includes('vercel.app') || clientUrl.includes('render.com');
  
  const cookieOptions = {
    httpOnly: true,
    // Use SameSite=None and Secure=true if in production OR if it's definitely cross-origin
    // Note: SameSite=None REQUIRES Secure=true, and Secure=true REQUIRES HTTPS.
    secure: isProduction || isCrossOrigin,
    sameSite: (isProduction || isCrossOrigin) ? 'none' : 'lax',
  };

  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearTokenCookies = (res) => {
  res.cookie('accessToken', '', { maxAge: 0 });
  res.cookie('refreshToken', '', { maxAge: 0 });
};
