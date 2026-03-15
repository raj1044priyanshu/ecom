import nodemailer from 'nodemailer';

const BRAND_COLOR = '#2449cc';
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

const baseEmailWrapper = (content, previewText = '') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${BRAND_NAME}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${previewText}</div>` : ''}
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <!-- Header -->
    <div style="background:#0f172a;border-radius:20px 20px 0 0;padding:32px 36px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">Ecom<span style="color:${BRAND_COLOR}">.</span></h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.5);font-size:13px;letter-spacing:0.5px;">Your favourite shopping destination</p>
    </div>
    <!-- Body -->
    <div style="background:#ffffff;padding:36px;border-radius:0 0 20px 20px;box-shadow:0 8px 40px rgba(0,0,0,0.07);">
      ${content}
    </div>
    <!-- Footer -->
    <div style="text-align:center;padding:24px;color:#9ca3af;font-size:12px;line-height:1.7;">
      <p style="margin:0;">© ${new Date().getFullYear()} Ecom. All rights reserved.</p>
      <p style="margin:4px 0 0;">Need help? <a href="mailto:${process.env.SMTP_EMAIL}" style="color:${BRAND_COLOR};text-decoration:none;">Reply to this email</a> or visit <a href="${process.env.CLIENT_URL}" style="color:${BRAND_COLOR};text-decoration:none;">ecom.in</a></p>
    </div>
  </div>
</body>
</html>`;

export const sendOTPEmail = async (email, otp, name) => {
  const transporter = createTransporter();
  const content = `
    <h2 style="color:#0f172a;font-size:22px;font-weight:800;margin:0 0 8px;">Hey ${name},</h2>
    <p style="color:#64748b;margin:0 0 28px;font-size:15px;line-height:1.6;">Welcome to Ecom. Your one-time verification code is below. It expires in <strong>10 minutes</strong>.</p>
    <div style="background:#f8fafc;border:2px dashed #cbd5e1;border-radius:16px;padding:28px;text-align:center;margin:0 0 28px;">
      <p style="margin:0 0 8px;color:#475569;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">Your OTP Code</p>
      <span style="font-size:52px;font-weight:900;color:${BRAND_COLOR};letter-spacing:10px;font-variant-numeric:tabular-nums;">${otp}</span>
    </div>
    <div style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:6px;padding:12px 16px;margin:0 0 24px;">
      <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;"><strong>Security reminder:</strong> Never share this code with anyone. Ecom. will never ask for your OTP.</p>
    </div>
    <p style="color:#94a3b8;font-size:13px;margin:0;">If you didn't request this, you can safely ignore this email.</p>
  `;
  await transporter.sendMail({
    from: `"${BRAND_NAME}" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: `${otp} — Your Ecom. verification code`,
    html: baseEmailWrapper(content, `Your OTP code is ${otp}`),
  });
};

export const sendPasswordResetEmail = async (email, resetUrl, name) => {
  const transporter = createTransporter();
  const content = `
    <h2 style="color:#0f172a;font-size:22px;font-weight:800;margin:0 0 8px;">Reset your password</h2>
    <p style="color:#64748b;margin:0 0 28px;font-size:15px;line-height:1.6;">Hi <strong>${name}</strong>, we received a request to reset your Ecom. account password. Click the button below — this link expires in <strong>10 minutes</strong>.</p>
    <div style="text-align:center;margin:0 0 32px;">
      <a href="${resetUrl}" style="display:inline-block;background:#0f172a;color:#fff;padding:16px 36px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:-0.2px;">Reset My Password</a>
    </div>
    <div style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:6px;padding:12px 16px;margin:0 0 24px;">
      <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;"><strong>Not you?</strong> If you didn't request a password reset, please ignore this email. Your password will not be changed.</p>
    </div>
    <p style="color:#94a3b8;font-size:13px;margin:0;">For security, this link can only be used once and expires in 10 minutes.</p>
  `;
  await transporter.sendMail({
    from: `"${BRAND_NAME}" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: 'Reset your Ecom. password',
    html: baseEmailWrapper(content, 'A password reset was requested for your Ecom. account'),
  });
};

const buildItemsTable = (items) => {
  const rows = items.map((item) => `
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:12px 8px;font-size:14px;color:#334155;font-weight:500;">${item.name}</td>
      <td style="padding:12px 8px;text-align:center;font-size:14px;color:#64748b;">x ${item.quantity}</td>
      <td style="padding:12px 8px;text-align:right;font-size:14px;font-weight:700;color:#0f172a;">₹${(item.price * item.quantity).toFixed(0)}</td>
    </tr>
  `).join('');
  return `
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">
      <thead>
        <tr style="background:#f8fafc;border-radius:8px;">
          <th style="padding:10px 8px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">Item</th>
          <th style="padding:10px 8px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">Qty</th>
          <th style="padding:10px 8px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">Price</th>
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
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin:0 0 24px;display:flex;align-items:flex-start;gap:12px;">
      <div style="width:36px;height:36px;background:#22c55e;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div>
        <p style="margin:0;font-weight:700;color:#15803d;font-size:15px;">Order Confirmed!</p>
        <p style="margin:4px 0 0;color:#16a34a;font-size:13px;">Order #${orderId}</p>
      </div>
    </div>
    <h2 style="color:#0f172a;font-size:22px;font-weight:800;margin:0 0 8px;">Thanks for your order, ${name}!</h2>
    <p style="color:#64748b;margin:0 0 24px;font-size:15px;line-height:1.6;">We've received your order and are getting it ready. You'll receive another email as your order progresses.</p>
    ${buildItemsTable(order.items)}
    <div style="background:#f8fafc;border-radius:12px;padding:16px 20px;margin:0 0 24px;">
      <div style="display:flex;justify-content:space-between;margin:0 0 8px;"><span style="color:#64748b;font-size:13px;">Subtotal</span><span style="color:#334155;font-size:13px;">₹${order.itemsPrice}</span></div>
      <div style="display:flex;justify-content:space-between;margin:0 0 12px;"><span style="color:#64748b;font-size:13px;">Shipping</span><span style="color:#334155;font-size:13px;">${order.shippingPrice === 0 ? 'Free' : '₹' + order.shippingPrice}</span></div>
      <div style="display:flex;justify-content:space-between;border-top:1px solid #e2e8f0;padding-top:12px;">
        <span style="color:#0f172a;font-size:15px;font-weight:700;">Total</span>
        <span style="color:${BRAND_COLOR};font-size:15px;font-weight:800;">₹${order.totalPrice}</span>
      </div>
    </div>
    <div style="text-align:center;">
      <a href="${process.env.CLIENT_URL}/orders" style="display:inline-block;background:#0f172a;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">Track Your Order</a>
    </div>
  `;
  await transporter.sendMail({
    from: `"${BRAND_NAME}" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: `Order confirmed — #${orderId} | Ecom.`,
    html: baseEmailWrapper(content, `Your Ecom. order #${orderId} has been confirmed`),
  });
};

// Status config covers ALL possible statuses
const STATUS_CONFIG_EMAIL = {
  Processing: {
    iconBg: '#dbeafe',
    iconColor: '#2563eb',
    badgeBg: '#eff6ff',
    badgeBorder: '#bfdbfe',
    badgeText: '#1d4ed8',
    headline: 'Your order is being processed',
    message: (name, orderId) => `Hi <strong>${name}</strong>, we have received your order <strong>#${orderId}</strong> and are now processing it. We will update you once it is ready to ship.`,
    svgPath: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V17a1 1 0 0 1-2 0v-.07A8 8 0 0 1 4.07 9H5a1 1 0 0 1 0 2 6 6 0 0 0 6 6zm0-9.86V7a1 1 0 0 1 2 0v.07A8 8 0 0 1 19.93 15H19a1 1 0 0 1 0-2 6 6 0 0 0-6-6z',
    subject: (orderId) => `Processing your order #${orderId} — Ecom.`,
    showReview: false,
  },
  Shipped: {
    iconBg: '#e0e7ff',
    iconColor: '#4f46e5',
    badgeBg: '#eff6ff',
    badgeBorder: '#bfdbfe',
    badgeText: '#1d4ed8',
    headline: 'Your order has shipped!',
    message: (name, orderId) => `Great news, <strong>${name}</strong>! Your order <strong>#${orderId}</strong> has been picked up by our delivery partner and is on its way to you.`,
    svgPath: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
    subject: (orderId) => `Your order #${orderId} has shipped — Ecom.`,
    showReview: false,
  },
  'Out for Delivery': {
    iconBg: '#d1fae5',
    iconColor: '#059669',
    badgeBg: '#f0fdf4',
    badgeBorder: '#bbf7d0',
    badgeText: '#15803d',
    headline: 'Out for delivery today!',
    message: (name, orderId) => `Your order <strong>#${orderId}</strong> is out for delivery, <strong>${name}</strong>! Please be available to receive it. Our delivery person is on the way.`,
    svgPath: 'M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3M12 17h7a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-7v9zM16 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM3 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z',
    subject: (orderId) => `Out for delivery — Order #${orderId} arriving today!`,
    showReview: false,
  },
  Delivered: {
    iconBg: '#d1fae5',
    iconColor: '#059669',
    badgeBg: '#f0fdf4',
    badgeBorder: '#bbf7d0',
    badgeText: '#15803d',
    headline: 'Your order has been delivered!',
    message: (name, orderId) => `Your order <strong>#${orderId}</strong> has been delivered, <strong>${name}</strong>! We hope you love your purchase. If you have any issues, our support team is here to help 24/7.`,
    svgPath: 'M20 6L9 17L4 12',
    subject: (orderId) => `Delivered — Order #${orderId} | Ecom.`,
    showReview: true,
  },
  Cancelled: {
    iconBg: '#fee2e2',
    iconColor: '#dc2626',
    badgeBg: '#fef2f2',
    badgeBorder: '#fecaca',
    badgeText: '#b91c1c',
    headline: 'Your order has been cancelled',
    message: (name, orderId) => `Hi <strong>${name}</strong>, your order <strong>#${orderId}</strong> has been cancelled as requested. If you didn't request this or have any questions, please contact our support team.`,
    svgPath: 'M18 6L6 18M6 6l12 12',
    subject: (orderId) => `Order #${orderId} cancelled — Ecom.`,
    showReview: false,
  },
};

export const sendOrderStatusEmail = async (email, order, name, status) => {
  const transporter = createTransporter();
  const orderId = order._id.toString().slice(-8).toUpperCase();
  const cfg = STATUS_CONFIG_EMAIL[status];
  if (!cfg) return; // Don't send for unknown statuses

  const content = `
    <div style="text-align:center;margin:0 0 28px;">
      <div style="width:64px;height:64px;background:${cfg.iconBg};border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="${cfg.iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="${cfg.svgPath}"/>
        </svg>
      </div>
      <h2 style="color:#0f172a;font-size:22px;font-weight:800;margin:0 0 10px;letter-spacing:-0.3px;">${cfg.headline}</h2>
      <span style="display:inline-block;background:${cfg.badgeBg};border:1px solid ${cfg.badgeBorder};color:${cfg.badgeText};padding:5px 18px;border-radius:50px;font-size:13px;font-weight:700;">${status}</span>
    </div>
    <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0 0 28px;text-align:center;">${cfg.message(name, orderId)}</p>
    <div style="text-align:center;margin:0 0 28px;">
      <a href="${process.env.CLIENT_URL}/orders" style="display:inline-block;background:#0f172a;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">View Order Details</a>
    </div>
    ${cfg.showReview ? `
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 22px;text-align:center;">
        <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#0f172a;">Loved your purchase?</p>
        <p style="margin:0;color:#64748b;font-size:13px;">Leave a review to help other shoppers and earn reward points.</p>
      </div>
    ` : ''}
  `;

  await transporter.sendMail({
    from: `"${BRAND_NAME}" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: cfg.subject(orderId),
    html: baseEmailWrapper(content, `Your Ecom. order #${orderId} update: ${status}`),
  });
};

// Keep backward compat alias
export const sendShippingUpdateEmail = sendOrderStatusEmail;
