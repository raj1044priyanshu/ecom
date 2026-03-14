import nodemailer from 'nodemailer';

const BRAND_COLOR = '#6366f1';
const BRAND_NAME = 'Ecom.';

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

const baseEmailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${BRAND_NAME}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:32px;font-weight:800;letter-spacing:-1px;">Ecom<span style="opacity:0.8">.</span></h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Your favourite shopping destination</p>
    </div>
    <!-- Body -->
    <div style="background:#fff;padding:40px;border-radius:0 0 16px 16px;box-shadow:0 10px 40px rgba(0,0,0,0.08);">
      ${content}
    </div>
    <!-- Footer -->
    <div style="text-align:center;padding:24px;color:#9ca3af;font-size:12px;line-height:1.6;">
      <p style="margin:0;">© ${new Date().getFullYear()} Ecom. All rights reserved.</p>
      <p style="margin:4px 0 0;">Need help? Reply to this email or visit <a href="${process.env.CLIENT_URL}" style="color:${BRAND_COLOR};text-decoration:none;">${process.env.CLIENT_URL}</a></p>
    </div>
  </div>
</body>
</html>`;

export const sendOTPEmail = async (email, otp, name) => {
  const transporter = createTransporter();
  const content = `
    <h2 style="color:#111827;font-size:24px;font-weight:700;margin:0 0 8px;">Hey ${name}! 👋</h2>
    <p style="color:#6b7280;margin:0 0 28px;font-size:16px;line-height:1.6;">Welcome to Ecom. Your one-time verification code is below. It expires in <strong>10 minutes</strong>.</p>
    <div style="background:linear-gradient(135deg,#f5f3ff,#ede9fe);border:2px dashed #c4b5fd;border-radius:12px;padding:28px;text-align:center;margin:0 0 28px;">
      <p style="margin:0 0 8px;color:#7c3aed;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:2px;">Your OTP Code</p>
      <span style="font-size:52px;font-weight:900;color:#6366f1;letter-spacing:12px;">${otp}</span>
    </div>
    <div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:4px;padding:12px 16px;margin:0 0 28px;">
      <p style="margin:0;color:#92400e;font-size:13px;">🔒 Never share this code with anyone. Ecom. will never ask for your OTP.</p>
    </div>
    <p style="color:#9ca3af;font-size:13px;margin:0;">If you didn't request this, you can safely ignore this email.</p>
  `;
  await transporter.sendMail({
    from: `"${BRAND_NAME}" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: `${otp} is your Ecom. verification code`,
    html: baseEmailWrapper(content),
  });
};

export const sendPasswordResetEmail = async (email, resetUrl, name) => {
  const transporter = createTransporter();
  const content = `
    <h2 style="color:#111827;font-size:24px;font-weight:700;margin:0 0 8px;">Password Reset Request</h2>
    <p style="color:#6b7280;margin:0 0 28px;font-size:16px;line-height:1.6;">Hi <strong>${name}</strong>, we received a request to reset the password for your account. Click the button below to proceed. This link expires in <strong>10 minutes</strong>.</p>
    <div style="text-align:center;margin:0 0 32px;">
      <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:16px 36px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px;box-shadow:0 4px 15px rgba(99,102,241,0.4);">Reset My Password →</a>
    </div>
    <div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:4px;padding:12px 16px;margin:0 0 28px;">
      <p style="margin:0;color:#92400e;font-size:13px;">⚠️ If you didn't request a password reset, please ignore this email. Your password will not be changed.</p>
    </div>
    <p style="color:#9ca3af;font-size:13px;margin:0;">For security, this link can only be used once and expires in 10 minutes.</p>
  `;
  await transporter.sendMail({
    from: `"${BRAND_NAME}" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: 'Reset your Ecom. password',
    html: baseEmailWrapper(content),
  });
};

const buildItemsTable = (items) => {
  const rows = items.map((item) => `
    <tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:12px 8px;font-size:14px;color:#374151;font-weight:500;">${item.name}</td>
      <td style="padding:12px 8px;text-align:center;font-size:14px;color:#6b7280;">× ${item.quantity}</td>
      <td style="padding:12px 8px;text-align:right;font-size:14px;font-weight:600;color:#111827;">₹${(item.price * item.quantity).toFixed(0)}</td>
    </tr>
  `).join('');
  return `
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:12px 8px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;font-weight:600;">Item</th>
          <th style="padding:12px 8px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;font-weight:600;">Qty</th>
          <th style="padding:12px 8px;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;font-weight:600;">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
};

export const sendOrderConfirmationEmail = async (email, order, name) => {
  const transporter = createTransporter();
  const orderId = order._id.toString().slice(-8).toUpperCase();
  const content = `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin:0 0 24px;display:flex;align-items:center;gap:12px;">
      <span style="font-size:24px;">✅</span>
      <div>
        <p style="margin:0;font-weight:700;color:#15803d;font-size:15px;">Order Confirmed!</p>
        <p style="margin:4px 0 0;color:#16a34a;font-size:13px;">Order #${orderId}</p>
      </div>
    </div>
    <h2 style="color:#111827;font-size:22px;font-weight:700;margin:0 0 8px;">Thanks for your order, ${name}! 🎉</h2>
    <p style="color:#6b7280;margin:0 0 24px;font-size:15px;line-height:1.6;">We've received your order and are getting it ready. You'll receive another email when your order ships.</p>
    ${buildItemsTable(order.items)}
    <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:0 0 24px;">
      <div style="display:flex;justify-content:space-between;margin:0 0 8px;">
        <span style="color:#6b7280;font-size:14px;">Subtotal</span>
        <span style="color:#374151;font-size:14px;">₹${order.itemsPrice}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin:0 0 12px;">
        <span style="color:#6b7280;font-size:14px;">Shipping</span>
        <span style="color:#374151;font-size:14px;">${order.shippingPrice === 0 ? 'Free' : '₹' + order.shippingPrice}</span>
      </div>
      <div style="display:flex;justify-content:space-between;border-top:2px solid #e5e7eb;padding-top:12px;">
        <span style="color:#111827;font-size:16px;font-weight:700;">Total</span>
        <span style="color:#6366f1;font-size:16px;font-weight:700;">₹${order.totalPrice}</span>
      </div>
    </div>
    <a href="${process.env.CLIENT_URL}/orders" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:14px 28px;border-radius:50px;text-decoration:none;font-weight:600;font-size:15px;">Track Your Order →</a>
  `;
  await transporter.sendMail({
    from: `"${BRAND_NAME}" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: `Order confirmed! #${orderId} – Ecom.`,
    html: baseEmailWrapper(content),
  });
};

export const sendShippingUpdateEmail = async (email, order, name, status) => {
  const transporter = createTransporter();
  const orderId = order._id.toString().slice(-8).toUpperCase();

  const statusConfig = {
    Shipped: {
      emoji: '📦',
      headline: "Your order is on its way!",
      message: `Great news, <strong>${name}</strong>! Your order <strong>#${orderId}</strong> has been picked up and is on its way to you.`,
      badge: { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', label: 'Shipped' },
    },
    'Out for Delivery': {
      emoji: '🛵',
      headline: "Out for Delivery!",
      message: `Exciting news, <strong>${name}</strong>! Your order <strong>#${orderId}</strong> is out for delivery today. Please be available to receive it.`,
      badge: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', label: 'Out for Delivery' },
    },
    Delivered: {
      emoji: '🎉',
      headline: "Your order has been delivered!",
      message: `Your order <strong>#${orderId}</strong> has been delivered, <strong>${name}</strong>! We hope you love your purchase. If you have any issues, our support team is here to help.`,
      badge: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', label: 'Delivered' },
    },
  };

  const cfg = statusConfig[status] || statusConfig['Shipped'];
  const content = `
    <div style="text-align:center;margin:0 0 28px;">
      <div style="font-size:56px;line-height:1;">${cfg.emoji}</div>
      <h2 style="color:#111827;font-size:24px;font-weight:700;margin:12px 0 8px;">${cfg.headline}</h2>
      <span style="display:inline-block;background:${cfg.badge.bg};border:1px solid ${cfg.badge.border};color:${cfg.badge.text};padding:4px 16px;border-radius:50px;font-size:13px;font-weight:600;">${cfg.badge.label}</span>
    </div>
    <p style="color:#6b7280;font-size:15px;line-height:1.7;margin:0 0 28px;text-align:center;">${cfg.message}</p>
    <div style="text-align:center;margin:0 0 28px;">
      <a href="${process.env.CLIENT_URL}/orders" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:600;font-size:15px;">View Order Details →</a>
    </div>
    ${status === 'Delivered' ? `<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:16px 20px;text-align:center;"><p style="margin:0;color:#6d28d9;font-size:14px;">⭐ Loved your purchase? Leave a review to help other shoppers!</p></div>` : ''}
  `;

  const subjects = {
    Shipped: `Your order #${orderId} has shipped! 📦`,
    'Out for Delivery': `Your order #${orderId} is out for delivery! 🛵`,
    Delivered: `Your order #${orderId} has been delivered! 🎉`,
  };

  await transporter.sendMail({
    from: `"${BRAND_NAME}" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: subjects[status] || `Order update for #${orderId}`,
    html: baseEmailWrapper(content),
  });
};
