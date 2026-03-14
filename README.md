# Ecom.

A full-stack e-commerce web application built with the **MERN stack** (MongoDB, Express, React, Node.js).

## Features

- 🛍️ Product catalog with category filters, search, and pagination
- 🔐 JWT authentication + Google OAuth 2.0
- 🤳 User profile management with saved addresses
- 🛒 Persistent cart with real-time updates
- 📦 Order management with live tracking status
- 📩 Transactional emails (Order confirmed, Shipped, Delivered)
- 🧑‍💼 Full admin dashboard (products, orders, users)
- ☁️ Cloudinary image uploads
- 💬 24/7 Customer support chat

## Tech Stack

### Frontend
- **React 18** + **Vite**
- **Redux Toolkit** (global state)
- **React Query** (server state & caching)
- **Tailwind CSS v4**
- **React Hook Form** + **Zod** (form validation)

### Backend
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** (access + refresh tokens, HTTP-only cookies)
- **Nodemailer** (transactional emails via Gmail SMTP)
- **Cloudinary** (image hosting)
- **Helmet, CORS, Rate-limiting** (security)

## Project Structure

```
/
├── client/     # React frontend (Vite)
└── server/     # Node.js backend (Express)
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Google OAuth credentials
- Cloudinary account
- Gmail account (for email sending)

### Server

```bash
cd server
cp .env.example .env
# Fill in .env with your credentials
npm install
npm run dev
```

### Client

```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173`, API at `http://localhost:5000`.