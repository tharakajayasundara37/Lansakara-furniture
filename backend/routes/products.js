const express = require('express');
const router = express.Router();
const storage = require('../storage');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer config for image uploads
const uploadDir = path.join(__dirname, '../../images/products');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage: diskStorage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { products, total } = await storage.getProducts(req.query);
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    res.json({ products, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await storage.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products (Admin)
router.post('/', authMiddleware, upload.array('images', 10), async (req, res) => {
  try {
    const data = { ...req.body };
    
    // Handle images
    if (req.files && req.files.length > 0) {
      data.images = req.files.map(f => '/images/products/' + f.filename);
    } else if (typeof data.existingImages === 'string' && data.existingImages.trim()) {
      data.images = data.existingImages.split(',').map(s => s.trim()).filter(Boolean);
    } else if (typeof data.images === 'string' && data.images.trim()) {
      data.images = data.images.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (data.featured !== undefined) data.featured = data.featured === 'true' || data.featured === true;
    if (data.inStock !== undefined) data.inStock = data.inStock === 'true' || data.inStock === true;
    if (data.price) data.price = parseFloat(data.price);
    if (data.originalPrice) data.originalPrice = parseFloat(data.originalPrice);

    delete data.existingImages;

    const product = await storage.createProduct(data);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/products/:id (Admin)
router.put('/:id', authMiddleware, upload.array('images', 10), async (req, res) => {
  try {
    const data = { ...req.body };
    
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => '/images/products/' + f.filename);
      const existing = typeof data.existingImages === 'string'
        ? data.existingImages.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      data.images = [...existing, ...newImages];
    } else if (typeof data.existingImages === 'string') {
      data.images = data.existingImages.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (data.featured !== undefined) data.featured = data.featured === 'true' || data.featured === true;
    if (data.inStock !== undefined) data.inStock = data.inStock === 'true' || data.inStock === true;
    if (data.price) data.price = parseFloat(data.price);
    if (data.originalPrice) data.originalPrice = parseFloat(data.originalPrice);

    delete data.existingImages;

    const updated = await storage.updateProduct(req.params.id, data);
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/products/:id (Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await storage.deleteProduct(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
