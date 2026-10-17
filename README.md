# Lansakara Furniture — Luxury Royal Ceylon Woodcraft

A state-of-the-art e-commerce and interactive 3D furniture studio web application built with **Next.js 14**, **React 18**, **Three.js**, and **MongoDB / Dual-Storage Engine**.

---

## 🌟 Key Features

1. **Interactive 3D Bespoke Chair Configurator Studio**
   - Real-time 3D WebGL rendering with Three.js & OrbitControls.
   - Live procedural timber options (*Ceylon Teak, Dark Walnut, Ebony Ash, Red Mahogany, Nordic Oak*).
   - High-end upholstery textures (*Oat Linen, Crimson Velvet, Emerald Velvet, Sapphire Velvet, Cognac Leather, Noir Velvet*).
   - Carving trim customization (*24K Gold Leaf, Matching Timber, Antique Bronze*).
   - 360° auto-spin, camera view presets (*Hero, Front, Carved Back, Side, Cushion*).
   - Direct bespoke order creation syncing with checkout.

2. **Luxury Sri Lankan Catalog**
   - All prices formatted strictly in Sri Lankan Rupees (`Rs.` / LKR).
   - Filter by categories: Dining, Living, Coffee & Accent Tables, Bedroom Suites.
   - Real-time synchronization with Admin Catalog management.

3. **Bespoke Checkout & Payment Suite**
   - **Distance-Based Delivery Calculation**: Automatic calculation from Moratuwa atelier at **Rs. 100 per km** across all districts.
   - **Card Payment**: Instant **10% discount privilege** applied to the total order investment.
   - **Direct Bank Transfer**: Bank details displayed with receipt/transfer slip upload.
   - **Cash on Delivery (COD)**: **20% transport commitment advance** with slip upload + balance on delivery.
   - WhatsApp concierge integration with pre-filled order specifications.

4. **Patron Reflections & Authentic Reviews**
   - Strictly enforced **1 review per verified customer**.
   - Star rating picker (1-5 stars), customer name, email, location, and piece commissioned.
   - Dynamic real-time testimonial carousel with average rating metrics.

5. **Master Artisan Admin Panel (`/admin`)**
   - Secure JWT & session authentication (`admin` / `lansakara2026`).
   - Executive Dashboard with real-time order statistics, revenue tracking, and status monitoring.
   - Full Product Catalog CRUD with multipart image file upload.
   - Orders Management: status updates (*Pending, In Production, Ready for Delivery, Delivered*), slip preview, and WhatsApp direct messaging.
   - Settings & Pricing: Adjust Card Discount %, Delivery Rate per km, and COD Advance % on the fly.
   - Patron Reviews Moderation & Management.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **UI & Components**: React 18, FontAwesome 6, Google Fonts (Playfair Display, Cormorant Garamond, Inter)
- **3D Graphics Engine**: Three.js (WebGL) + OrbitControls
- **Database & Storage**: MongoDB Atlas + Dual-Storage Local DB fallback (`backend/storage.js`)
- **Authentication**: JWT token verification (`backend/authHelper.js`)
- **File Uploads**: Native Next.js FormData multipart handling

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
MONGO_URI=mongodb+srv://furniture:admin123@cluster0.z60yzpx.mongodb.net/lansakara_furniture?retryWrites=true&w=majority
JWT_SECRET=lansakara_admin_secret_2026_secure
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=lansakara2026
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the website.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🛡️ Admin Access

- **URL**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Username**: `admin`
- **Password**: `lansakara2026`

---

## 👥 Authors & Heritage

Crafted for **Lansakara Royal Ceylon Woodcraft** (Established 1974, Moratuwa, Sri Lanka).
GitHub: [https://github.com/tharakajayasundara37](https://github.com/tharakajayasundara37)
