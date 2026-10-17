require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const storage = require('./backend/storage');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// ─── Static Files (Frontend & Assets) ──────────────────────────
app.use(express.static(path.join(__dirname)));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/models', express.static(path.join(__dirname, 'models')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ────────────────────────────────────────────────
app.use('/api/auth',     require('./backend/routes/auth'));
app.use('/api/products', require('./backend/routes/products'));
app.use('/api/orders',   require('./backend/routes/orders'));
app.use('/api/settings', require('./backend/routes/settings'));
app.use('/api/reviews',  require('./backend/routes/reviews'));

// ─── Checkout Page Route ───────────────────────────────────────
app.get('/checkout', (req, res) => {
  res.sendFile('checkout.html', { root: __dirname });
});

// ─── Admin Panel Route ─────────────────────────────────────────
app.get('/admin', (req, res) => {
  res.sendFile('index.html', { root: path.join(__dirname, 'admin') });
});
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// ─── Frontend SPA fallback ─────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});

// ─── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({ 
    status: 'ok', 
    database: isConnected ? 'MongoDB Atlas (Connected)' : 'Local Storage Mode (Active)',
    mongoReadyState: mongoose.connection.readyState,
    adminCredentials: {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'lansakara2026'
    },
    uptime: Math.round(process.uptime()) + 's'
  });
});

// ─── Start Server ──────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🪑 LANSAKARA FURNITURE — FULL-STACK SERVER ONLINE`);
  console.log(`🌐 Website:    http://localhost:${PORT}`);
  console.log(`🔑 Admin UI:   http://localhost:${PORT}/admin`);
  console.log(`📡 API URL:    http://localhost:${PORT}/api/products`);
  console.log(`🔐 Admin:      ${process.env.ADMIN_USERNAME || 'admin'} / ${process.env.ADMIN_PASSWORD || 'lansakara2026'}`);
  console.log(`======================================================\n`);
  
  // Try connecting to MongoDB Atlas
  connectMongo();
});

async function connectMongo() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri || mongoUri.includes('YOUR_MONGODB')) {
    console.log('ℹ️  MongoDB URI not configured. Running in Local Storage Mode.');
    return;
  }

  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 7000,
      socketTimeoutMS: 30000
    });
    console.log('✅ Connected to MongoDB Atlas successfully!');
    
    // Sync local seed products to MongoDB Atlas
    await storage.syncLocalToMongo();

  } catch (err) {
    console.warn(`⚠️  MongoDB Atlas: ${err.message}`);
    console.log('💡 Running with robust Local Storage Mode (All product CRUD & order features fully functional!).');
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  server.close(() => process.exit(0));
});
