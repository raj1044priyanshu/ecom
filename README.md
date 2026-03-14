A full-stack e-commerce application built with the MERN stack (MongoDB, Express, React, Node.js), featuring completely automated AI product recommendations using Google Gemini and secure authentication.

## Project Structure

This is a monorepo containing both the frontend and backend applications.

- `/client` - React frontend application (Vite + Tailwind CSS + Redux Toolkit)
- `/server` - Node.js backend API (Express + MongoDB + Mongoose)

## Prerequisites

Before running the application, you must set up the following external services:

1. **MongoDB Atlas Database** (Free Tier available)
2. **Google OAuth** Client ID & Secret
3. **Cloudinary** Account (for image uploads)
4. **Google Gemini API Key** (Free Tier available from Google AI Studio)
5. App password for a **Gmail account** (for Nodemailer)

> **Important:** Detailed setup instructions for these prerequisites are documented in the `implementation_plan.md` artifact included in your `.gemini` folder directory.

## Environment Variables

You need to create `.env` files in both the `client` and `server` directories.
Templates for these files are provided as `.env.example`.

### Server Setup

```bash
cd server
cp .env.example .env
# Open server/.env and fill in all the required credentials
npm install
npm run dev
```
The backend server will start on `http://localhost:5000`.

### Client Setup

```bash
cd client
cp .env.example .env
# Open client/.env and fill in your API URL
npm install
npm run dev
```
The frontend development server will start on `http://localhost:5173`.

## Architecture Details

- **Authentication:** JWT stored in HTTP-only secure cookies + Google OAuth integration.
- **State Management:** Redux Toolkit for global user/cart state, React Query for server-side state (caching product lists, handling pagination).
- **Styling:** Tailwind CSS v4 featuring modern glassmorphism UI elements, microinteractions, and fully responsive layouts.
- **Performance:** Backend implements Redis/node-cache for API responses, rate-limiting, Helmet security headers, compression, and request validation.

Enjoy shopping intelligently!
# ecom
# ecom
