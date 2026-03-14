import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

export const sendOTPEmail = async (email, otp, name) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'Ecom.'}" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: 'Your OTP for Account Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6366f1;">Welcome to Ecom., ${name}! 👋</h2>
        <p>Use the OTP below to verify your account. It expires in <strong>10 minutes</strong>.</p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="font-size: 48px; letter-spacing: 8px; color: #6366f1; margin: 0;">${otp}</h1>
        </div>
        <p style="color: #6b7280;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (email, resetUrl, name) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'Ecom.'}" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6366f1;">Password Reset, ${name}</h2>
        <p>Click the button below to reset your password. This link expires in <strong>10 minutes</strong>.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin: 20px 0;">Reset Password</a>
        <p style="color: #6b7280;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
};

export const sendOrderConfirmationEmail = async (email, order, name) => {
  const transporter = createTransporter();
  const itemsHtml = order.items
    .map((item) => `<tr><td>${item.name}</td><td>x${item.quantity}</td><td>₹${item.price}</td></tr>`)
    .join('');

  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'Ecom.'}" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: `Order Confirmed! #${order._id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6366f1;">Order Confirmed, ${name}! 🎉</h2>
        <p>Your order <strong>#${order._id}</strong> has been placed successfully.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead><tr style="background: #f3f4f6;"><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p><strong>Total: ₹${order.totalPrice}</strong></p>
        <p style="color: #6b7280;">We'll notify you when your order ships.</p>
      </div>
    `,
  });
};
