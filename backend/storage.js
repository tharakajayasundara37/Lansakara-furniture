const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'local_db.json');

// Initial seed products from the website
const INITIAL_PRODUCTS = [
  {
    _id: 'prod_001',
    name: 'Live Edge Dining Table',
    category: 'tables',
    price: 285000,
    originalPrice: 320000,
    description: 'Natural Suar solid slab live edge dining table, seasoned to perfection and finished with botanical oils. Seats 8-10 people.',
    shortDescription: 'Natural Suar Solid Slab • 8-10 Seater',
    images: ['images/wood_09.jpg'],
    badge: 'Exclusive',
    woodType: 'Suar Wood / Teak',
    featured: true,
    inStock: true,
    rating: 5,
    dimensions: '96"L x 40"W x 30"H',
    material: 'Solid Single-Slab Timber',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod_002',
    name: 'Aurelin Organic Sofa',
    category: 'sofas',
    price: 340000,
    originalPrice: 380000,
    description: 'Sculptural organic flowing sofa with hand-carved solid teak wood base and organic linen upholstery.',
    shortDescription: 'Solid Teak Wood Base • 96"W x 24"D x 16"H',
    images: ['images/wood_04.jpg'],
    badge: 'Sculptural',
    woodType: 'Solid Teak',
    featured: true,
    inStock: true,
    rating: 5,
    dimensions: '96"W x 24"D x 16"H',
    material: 'Solid Teak & Belgian Linen',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod_003',
    name: 'Wabi Sabi Timber Table',
    category: 'tables',
    price: 245000,
    originalPrice: 275000,
    description: 'Handcrafted dining table embracing natural imperfections and rich walnut organic grain with mortise & tenon joinery.',
    shortDescription: 'Deep Walnut Finish • 72"W x 40"D x 30"H',
    images: ['images/wood_27.jpg'],
    badge: 'Wabi Sabi',
    woodType: 'Walnut / Teak',
    featured: true,
    inStock: true,
    rating: 5,
    dimensions: '72"W x 40"D x 30"H',
    material: 'Solid Aged Timber',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod_004',
    name: 'Noverra Sculpted Coffee Table',
    category: 'tables',
    price: 165000,
    originalPrice: 190000,
    description: 'Monolithic coffee table hand-sculpted from a single aged teak root block with waterfall edges.',
    shortDescription: 'Solid Teak Monolith • 48"W x 24"D x 16"H',
    images: ['images/wood_19.jpg'],
    badge: 'Artisan',
    woodType: 'Aged Teak',
    featured: false,
    inStock: true,
    rating: 5,
    dimensions: '48"W x 24"D x 16"H',
    material: 'Monolithic Teak Block',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod_005',
    name: 'Solid Wood Artisan Bed',
    category: 'beds',
    price: 389000,
    originalPrice: 425000,
    description: 'Heirloom King size platform bed with custom upholstered linen headboard and integrated floating teak nightstands.',
    shortDescription: 'Upholstered Linen & Solid Teak • King Size',
    images: ['images/wood_14.jpg'],
    badge: 'Signature',
    woodType: 'Plantation Teak',
    featured: true,
    inStock: true,
    rating: 5,
    dimensions: '84"W x 88"L x 48"H (King)',
    material: 'Solid Teak & Natural Linen',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod_006',
    name: 'Royal Carved Vanity Table',
    category: 'accessories',
    price: 219000,
    originalPrice: 250000,
    description: 'Hand-carved dressing table featuring traditional floral motifs, velvet-lined drawers, and solid brass hardware.',
    shortDescription: 'Ornate Floral Carvings • Vintage Warm Finish',
    images: ['images/wood_20.jpg'],
    badge: 'Master Carving',
    woodType: 'Mahogany & Teak',
    featured: false,
    inStock: true,
    rating: 5,
    dimensions: '50"W x 22"D x 32"H',
    material: 'Hand-Carved Mahogany',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod_007',
    name: 'Tharvane Solid Coffee Table',
    category: 'tables',
    price: 115000,
    originalPrice: 130000,
    description: 'Minimalist architectural coffee table with interlocking Japanese-style joinery and hand-rubbed oil finish.',
    shortDescription: 'Solid Teak Architecture • 30"W x 18"D x 16"H',
    images: ['images/wood_23.jpg'],
    badge: 'Minimalist',
    woodType: 'Solid Teak',
    featured: false,
    inStock: true,
    rating: 5,
    dimensions: '30"W x 18"D x 16"H',
    material: 'Solid Teak Wood',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod_008',
    name: 'Rustic Timber Log Sofa',
    category: 'sofas',
    price: 298000,
    originalPrice: 330000,
    description: 'Rustic accent sofa built from substantial natural logs preserving live edges, bark accents, and deep organic character.',
    shortDescription: 'Natural Tree Log Construction • Linen Cushions',
    images: ['images/wood_05.jpg'],
    badge: 'Rustic',
    woodType: 'Wild Timber & Teak',
    featured: false,
    inStock: true,
    rating: 5,
    dimensions: '82"W x 34"D x 32"H',
    material: 'Natural Hardwood Logs',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod_009',
    name: 'Lansakara Royal Bespoke Chair',
    category: 'chairs',
    price: 185000,
    originalPrice: 210000,
    description: 'Signature ergonomic handcrafted dining armchair. Fully customisable via our live 3D configurator with rare woods, plush velvets, and gold accents.',
    shortDescription: 'Configurable in 3D • Rare Woods & Velvets',
    images: ['images/lansakara_royal_chair.jpg'],
    badge: '3D Configurable',
    woodType: 'Royal Teak / Mahogany / Walnut',
    featured: true,
    inStock: true,
    rating: 5,
    dimensions: '26"W x 28"D x 38"H',
    material: 'Solid Hardwood & Premium Fabric',
    createdAt: new Date().toISOString()
  }
];

// Initial seed reviews from esteemed patrons
const INITIAL_REVIEWS = [
  {
    _id: 'rev_001',
    authorName: 'Dilshan & Chamari Senanayake',
    email: 'dilshan.s@architects.lk',
    rating: 5,
    quote: 'The live-edge dining table is the emotional center of our house. Everyone who visits cannot stop tracing their fingers along the smooth organic edge. Truly museum-grade craftsmanship.',
    location: 'Architectural Villa, Colombo 07',
    productPurchased: 'Live Edge Suar Dining Table',
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000 * 24 * 14).toISOString()
  },
  {
    _id: 'rev_002',
    authorName: 'Kavinda Wickramasinghe',
    email: 'kavinda.w@heritageresorts.com',
    rating: 5,
    quote: 'The organic curved sofa and bespoke coffee tables transformed our hotel lounge. The warmth and rich grain of the teak wood created an ambiance that guests consistently rave about.',
    location: 'Boutique Heritage Resort, Kandy',
    productPurchased: 'Aurelin Organic Sofa & Tharvane Table',
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString()
  },
  {
    _id: 'rev_003',
    authorName: 'Eleanor & Marcus Vance',
    email: 'eleanor.vance@vanceloft.co.uk',
    rating: 5,
    quote: 'Working directly with the master carpenter to select the slab and natural finish was a joyful experience. You are not just buying furniture; you are investing in a work of art.',
    location: 'Private Residence, Galle Fort',
    productPurchased: 'Solid Wood Artisan Bed & Nightstands',
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  }
];

function initLocalDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const adminPasswordHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'lansakara2026', 10);
    const initialData = {
      products: INITIAL_PRODUCTS,
      orders: [
        {
          _id: 'ord_demo_001',
          customerName: 'Sampath Perera',
          email: 'sampath.p@gmail.com',
          phone: '+94 77 123 4567',
          address: 'Colombo 07, Sri Lanka',
          productName: 'Live Edge Dining Table',
          totalPrice: 285000,
          customMessage: 'Looking for a 10-seater Suar wood slab table for our new dining area.',
          status: 'pending',
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
        },
        {
          _id: 'ord_demo_002',
          customerName: 'Nadeeka Fernando',
          email: 'nadeeka.f@outlook.com',
          phone: '+94 71 987 6543',
          address: 'Kandy, Sri Lanka',
          productName: 'Lansakara Royal Bespoke Chair',
          woodSpec: 'Royal Teak',
          fabricSpec: 'Emerald Velvet',
          trimSpec: '24K Gold Leaf Accent',
          totalPrice: 195000,
          customMessage: 'Configured through 3D studio. Please confirm delivery lead time.',
          status: 'accepted',
          acceptedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
        }
      ],
      reviews: INITIAL_REVIEWS,
      admins: [
        {
          _id: 'admin_001',
          username: (process.env.ADMIN_USERNAME || 'admin').toLowerCase(),
          passwordHash: adminPasswordHash,
          displayName: 'Lansakara Admin'
        }
      ]
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf8');
  }
}

function readLocalDb() {
  initLocalDb();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const db = JSON.parse(raw);
    if (!db.reviews || db.reviews.length === 0) {
      db.reviews = [...INITIAL_REVIEWS];
      writeLocalDb(db);
    }
    return db;
  } catch (e) {
    console.error('Error reading local_db.json:', e);
    return { products: INITIAL_PRODUCTS, orders: [], admins: [], reviews: [...INITIAL_REVIEWS] };
  }
}

function writeLocalDb(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Error writing local_db.json:', e);
    return false;
  }
}

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

// ─── UNIFIED PRODUCT OPERATIONS ────────────────────────────────
const ProductModel = require('./models/Product');

async function getProducts(query = {}) {
  if (isMongoConnected()) {
    const { category, featured, search, limit = 50, page = 1 } = query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (featured === 'true') filter.featured = true;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await ProductModel.countDocuments(filter);
    const products = await ProductModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    return { products, total };
  } else {
    const db = readLocalDb();
    let prods = [...db.products];
    if (query.category && query.category !== 'all') prods = prods.filter(p => p.category === query.category);
    if (query.featured === 'true') prods = prods.filter(p => p.featured === true);
    if (query.search) {
      const q = query.search.toLowerCase();
      prods = prods.filter(p => (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
    }
    return { products: prods, total: prods.length };
  }
}

async function getProductById(id) {
  if (isMongoConnected()) {
    return await ProductModel.findById(id);
  } else {
    const db = readLocalDb();
    return db.products.find(p => p._id === id || p.id === id);
  }
}

async function createProduct(data) {
  if (isMongoConnected()) {
    const product = new ProductModel(data);
    return await product.save();
  } else {
    const db = readLocalDb();
    const newProduct = {
      _id: 'prod_' + Date.now(),
      ...data,
      createdAt: new Date().toISOString()
    };
    db.products.unshift(newProduct);
    writeLocalDb(db);
    return newProduct;
  }
}

async function updateProduct(id, data) {
  if (isMongoConnected()) {
    return await ProductModel.findByIdAndUpdate(id, data, { new: true });
  } else {
    const db = readLocalDb();
    const idx = db.products.findIndex(p => p._id === id || p.id === id);
    if (idx === -1) return null;
    db.products[idx] = { ...db.products[idx], ...data, updatedAt: new Date().toISOString() };
    writeLocalDb(db);
    return db.products[idx];
  }
}

async function deleteProduct(id) {
  if (isMongoConnected()) {
    return await ProductModel.findByIdAndDelete(id);
  } else {
    const db = readLocalDb();
    const idx = db.products.findIndex(p => p._id === id || p.id === id);
    if (idx === -1) return null;
    const deleted = db.products.splice(idx, 1)[0];
    writeLocalDb(db);
    return deleted;
  }
}

// ─── UNIFIED ORDER OPERATIONS ──────────────────────────────────
const OrderModel = require('./models/Order');

async function getOrders(query = {}) {
  if (isMongoConnected()) {
    const { status, search, limit = 50, page = 1 } = query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) filter.$or = [
      { customerName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { productName: { $regex: search, $options: 'i' } }
    ];
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await OrderModel.countDocuments(filter);
    const orders = await OrderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const counts = await OrderModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const statusCounts = {};
    counts.forEach(c => statusCounts[c._id] = c.count);
    return { orders, total, statusCounts };
  } else {
    const db = readLocalDb();
    let orders = [...db.orders];
    if (query.status && query.status !== 'all') orders = orders.filter(o => o.status === query.status);
    if (query.search) {
      const q = query.search.toLowerCase();
      orders = orders.filter(o => 
        (o.customerName || '').toLowerCase().includes(q) || 
        (o.email || '').toLowerCase().includes(q) || 
        (o.productName || '').toLowerCase().includes(q)
      );
    }
    const statusCounts = {};
    db.orders.forEach(o => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });
    return { orders, total: orders.length, statusCounts };
  }
}

// ─── SETTINGS OPERATIONS ───────────────────────────────────────
const DEFAULT_SETTINGS = {
  cardDiscountPercent: 10,
  deliveryRatePerKm: 100,
  codAdvancePercent: 20,
  workshopLocation: 'Moratuwa Master Workshop, Western Province',
  bankDetails: {
    bankName: 'Commercial Bank of Ceylon',
    accountName: 'Lansakara Furniture (Pvt) Ltd',
    accountNumber: '1000847291',
    branch: 'Moratuwa Premium Branch',
    instructions: 'Please transfer the payment / advance to this official account and upload the deposit slip or screenshot of transfer.'
  }
};

async function getSettings() {
  const db = readLocalDb();
  if (!db.settings) {
    db.settings = { ...DEFAULT_SETTINGS };
    writeLocalDb(db);
  }
  return db.settings;
}

async function updateSettings(data) {
  const db = readLocalDb();
  db.settings = {
    ...DEFAULT_SETTINGS,
    ...(db.settings || {}),
    ...data,
    updatedAt: new Date().toISOString()
  };
  writeLocalDb(db);
  return db.settings;
}

async function getOrderById(id) {
  if (isMongoConnected()) {
    return await OrderModel.findById(id);
  } else {
    const db = readLocalDb();
    return db.orders.find(o => o._id === id || o.id === id);
  }
}

async function createOrder(data) {
  const settings = await getSettings();
  const deliveryRate = (data.deliveryRatePerKm !== undefined && parseFloat(data.deliveryRatePerKm) > 0)
    ? parseFloat(data.deliveryRatePerKm) 
    : (settings.deliveryRatePerKm || 100);

  const distanceKm = parseFloat(data.deliveryDistanceKm) || 0;
  
  const deliveryFee = (data.deliveryFee !== undefined && parseFloat(data.deliveryFee) > 0)
    ? parseFloat(data.deliveryFee)
    : Math.round(distanceKm * deliveryRate);
  
  const subtotal = parseFloat(data.subtotal || data.totalPrice) || 0;
  const paymentMethod = data.paymentMethod || 'cod';
  
  let cardDiscountPercent = 0;
  let discountAmount = 0;
  if (paymentMethod === 'card') {
    cardDiscountPercent = (data.cardDiscountPercent !== undefined && parseFloat(data.cardDiscountPercent) > 0)
      ? parseFloat(data.cardDiscountPercent)
      : (settings.cardDiscountPercent || 10);
    discountAmount = (data.discountAmount !== undefined && parseFloat(data.discountAmount) > 0)
      ? parseFloat(data.discountAmount)
      : Math.round((subtotal * cardDiscountPercent) / 100);
  }

  const finalTotal = (data.totalPrice !== undefined && parseFloat(data.totalPrice) > 0)
    ? parseFloat(data.totalPrice)
    : Math.max(0, subtotal - discountAmount + deliveryFee);
  
  let advanceAmount = 0;
  let remainingBalance = 0;
  if (paymentMethod === 'cod') {
    const codPercent = settings.codAdvancePercent || 20;
    advanceAmount = (data.advanceAmount !== undefined && parseFloat(data.advanceAmount) > 0)
      ? parseFloat(data.advanceAmount)
      : Math.round((finalTotal * codPercent) / 100);
    remainingBalance = Math.max(0, finalTotal - advanceAmount);
  } else if (paymentMethod === 'card') {
    advanceAmount = finalTotal;
    remainingBalance = 0;
  } else if (paymentMethod === 'bank_transfer') {
    advanceAmount = finalTotal;
    remainingBalance = 0;
  }

  const orderData = {
    ...data,
    subtotal,
    deliveryDistanceKm: distanceKm,
    deliveryRatePerKm: deliveryRate,
    deliveryFee,
    paymentMethod,
    cardDiscountPercent,
    discountAmount,
    totalPrice: finalTotal,
    advanceAmount,
    remainingBalance,
    status: 'pending',
    currency: 'LKR',
    createdAt: new Date().toISOString()
  };

  if (isMongoConnected()) {
    const order = new OrderModel(orderData);
    return await order.save();
  } else {
    const db = readLocalDb();
    const newOrder = {
      _id: 'ord_' + Date.now(),
      ...orderData
    };
    db.orders.unshift(newOrder);
    writeLocalDb(db);
    return newOrder;
  }
}

async function updateOrderStatus(id, status, adminNote) {
  const updateData = { status };
  if (adminNote !== undefined) updateData.adminNote = adminNote;
  if (status === 'accepted') updateData.acceptedAt = new Date().toISOString();
  if (status === 'delivered') updateData.deliveredAt = new Date().toISOString();
  if (status === 'cancelled') updateData.cancelledAt = new Date().toISOString();

  if (isMongoConnected()) {
    return await OrderModel.findByIdAndUpdate(id, updateData, { new: true });
  } else {
    const db = readLocalDb();
    const idx = db.orders.findIndex(o => o._id === id || o.id === id);
    if (idx === -1) return null;
    db.orders[idx] = { ...db.orders[idx], ...updateData };
    writeLocalDb(db);
    return db.orders[idx];
  }
}

async function deleteOrder(id) {
  if (isMongoConnected()) {
    return await OrderModel.findByIdAndDelete(id);
  } else {
    const db = readLocalDb();
    const idx = db.orders.findIndex(o => o._id === id || o.id === id);
    if (idx === -1) return null;
    const deleted = db.orders.splice(idx, 1)[0];
    writeLocalDb(db);
    return deleted;
  }
}

async function getOrderStats() {
  if (isMongoConnected()) {
    const [total, pending, accepted, delivered, cancelled, recentOrders] = await Promise.all([
      OrderModel.countDocuments(),
      OrderModel.countDocuments({ status: 'pending' }),
      OrderModel.countDocuments({ status: { $in: ['accepted', 'processing', 'ready'] } }),
      OrderModel.countDocuments({ status: 'delivered' }),
      OrderModel.countDocuments({ status: 'cancelled' }),
      OrderModel.find().sort({ createdAt: -1 }).limit(5)
    ]);
    return { total, pending, accepted, delivered, cancelled, recentOrders };
  } else {
    const db = readLocalDb();
    const orders = db.orders || [];
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      accepted: orders.filter(o => ['accepted', 'processing', 'ready'].includes(o.status)).length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      recentOrders: orders.slice(0, 5)
    };
  }
}

// ─── UNIFIED AUTH OPERATIONS ───────────────────────────────────
const AdminModel = require('./models/Admin');

async function findAdmin(username) {
  if (isMongoConnected()) {
    return await AdminModel.findOne({ username: username.toLowerCase() });
  } else {
    const db = readLocalDb();
    const admin = db.admins.find(a => a.username.toLowerCase() === username.toLowerCase());
    if (admin) {
      return {
        ...admin,
        comparePassword: async function(plain) {
          return await bcrypt.compare(plain, admin.passwordHash);
        }
      };
    }
    return null;
  }
}

// Sync local data to MongoDB once Atlas connects
async function syncLocalToMongo() {
  if (!isMongoConnected()) return;
  try {
    const db = readLocalDb();
    const prodCount = await ProductModel.countDocuments();
    if (prodCount === 0 && db.products && db.products.length > 0) {
      console.log('🔄 Seeding initial products to MongoDB Atlas...');
      const cleanProducts = db.products.map(p => {
        const copy = { ...p };
        delete copy._id;
        delete copy.id;
        return copy;
      });
      await ProductModel.insertMany(cleanProducts);
      console.log(`✅ Seeded ${cleanProducts.length} products to MongoDB Atlas!`);
    }
  } catch (e) {
    console.error('Sync error:', e.message);
  }
}

// ─── UNIFIED REVIEW OPERATIONS ─────────────────────────────────
const ReviewModel = require('./models/Review');

async function getReviews(query = {}) {
  const { status, search, limit = 50, page = 1 } = query;
  
  if (isMongoConnected()) {
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    } else if (!status) {
      filter.status = 'approved';
    }
    if (search) {
      filter.$or = [
        { authorName: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { quote: { $regex: search, $options: 'i' } },
        { productPurchased: { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [reviews, total, allApproved] = await Promise.all([
      ReviewModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      ReviewModel.countDocuments(filter),
      ReviewModel.find({ status: 'approved' })
    ]);

    const avgRating = allApproved.length > 0 
      ? Number((allApproved.reduce((sum, r) => sum + (r.rating || 5), 0) / allApproved.length).toFixed(1))
      : 5.0;

    return { reviews, total, averageRating: avgRating };
  } else {
    const db = readLocalDb();
    let reviews = [...(db.reviews || [])];
    
    // Filter by status (default 'approved' for public view, unless 'all' is passed by admin)
    if (status && status !== 'all') {
      reviews = reviews.filter(r => r.status === status);
    } else if (!status) {
      reviews = reviews.filter(r => r.status === 'approved' || !r.status);
    }

    if (search) {
      const q = search.toLowerCase();
      reviews = reviews.filter(r =>
        (r.authorName || '').toLowerCase().includes(q) ||
        (r.location || '').toLowerCase().includes(q) ||
        (r.quote || '').toLowerCase().includes(q) ||
        (r.productPurchased || '').toLowerCase().includes(q)
      );
    }

    const allApproved = (db.reviews || []).filter(r => r.status === 'approved' || !r.status);
    const avgRating = allApproved.length > 0
      ? Number((allApproved.reduce((sum, r) => sum + (r.rating || 5), 0) / allApproved.length).toFixed(1))
      : 5.0;

    return {
      reviews: reviews.slice(0, parseInt(limit)),
      total: reviews.length,
      averageRating: avgRating
    };
  }
}

async function getReviewByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();

  if (isMongoConnected()) {
    return await ReviewModel.findOne({ email: cleanEmail });
  } else {
    const db = readLocalDb();
    const reviews = db.reviews || [];
    return reviews.find(r => (r.email || '').trim().toLowerCase() === cleanEmail) || null;
  }
}

async function createReview(data) {
  const { authorName, email, rating, quote, location, productPurchased } = data;

  if (!authorName || !email || !quote) {
    throw new Error('Name, email, and review comment are required.');
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = await getReviewByEmail(cleanEmail);
  if (existing) {
    const err = new Error('A review has already been submitted from this email address. Each patron may submit only one review.');
    err.code = 'DUPLICATE_REVIEW';
    throw err;
  }

  const numRating = Math.max(1, Math.min(5, parseInt(rating) || 5));

  const reviewData = {
    authorName: authorName.trim(),
    email: cleanEmail,
    rating: numRating,
    quote: quote.trim(),
    location: (location || 'Sri Lanka').trim(),
    productPurchased: (productPurchased || 'Bespoke Timber Creation').trim(),
    status: 'approved',
    createdAt: new Date().toISOString()
  };

  if (isMongoConnected()) {
    const review = new ReviewModel(reviewData);
    return await review.save();
  } else {
    const db = readLocalDb();
    if (!db.reviews) db.reviews = [...INITIAL_REVIEWS];
    const newRev = {
      _id: 'rev_' + Date.now(),
      ...reviewData
    };
    db.reviews.unshift(newRev);
    writeLocalDb(db);
    return newRev;
  }
}

async function deleteReview(id) {
  if (isMongoConnected()) {
    return await ReviewModel.findByIdAndDelete(id);
  } else {
    const db = readLocalDb();
    const idx = (db.reviews || []).findIndex(r => r._id === id || r.id === id);
    if (idx === -1) return null;
    const deleted = db.reviews.splice(idx, 1)[0];
    writeLocalDb(db);
    return deleted;
  }
}

async function updateReviewStatus(id, status) {
  if (isMongoConnected()) {
    return await ReviewModel.findByIdAndUpdate(id, { status }, { new: true });
  } else {
    const db = readLocalDb();
    const idx = (db.reviews || []).findIndex(r => r._id === id || r.id === id);
    if (idx === -1) return null;
    db.reviews[idx].status = status;
    writeLocalDb(db);
    return db.reviews[idx];
  }
}

initLocalDb();

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getOrderStats,
  findAdmin,
  syncLocalToMongo,
  isMongoConnected,
  getSettings,
  updateSettings,
  getReviews,
  getReviewByEmail,
  createReview,
  deleteReview,
  updateReviewStatus,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS
};
