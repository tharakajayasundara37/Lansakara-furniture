const express = require('express');
const router = express.Router();
const storage = require('../storage');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer storage for payment receipts / bank slips
const receiptUploadDir = path.join(__dirname, '../../uploads/receipts');
if (!fs.existsSync(receiptUploadDir)) {
  fs.mkdirSync(receiptUploadDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, receiptUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = 'receipt_' + Date.now() + '_' + Math.round(Math.random() * 1e6) + ext;
    cb(null, unique);
  }
});

const upload = multer({
  storage: diskStorage,
  limits: { fileSize: 12 * 1024 * 1024 } // 12MB limit for receipts
});

// POST /api/orders (Public - customer submits order with optional receipt upload)
router.post('/', upload.single('receipt'), async (req, res) => {
  try {
    const body = req.body || {};
    const { 
      customerName, 
      email, 
      phone, 
      address, 
      cityDistrict,
      productName, 
      productId,
      productImage,
      woodSpec, 
      fabricSpec, 
      trimSpec, 
      customMessage,
      subtotal,
      deliveryDistanceKm,
      deliveryRatePerKm,
      deliveryFee,
      paymentMethod,
      cardDiscountPercent,
      discountAmount,
      totalPrice,
      advanceAmount,
      remainingBalance,
      maskedCard
    } = body;
    
    if (!customerName || !email || !phone) {
      return res.status(400).json({ error: 'Customer Name, Email, and Phone number are required' });
    }

    let receiptImage = '';
    if (req.file) {
      receiptImage = '/uploads/receipts/' + req.file.filename;
    } else if (body.receiptImage) {
      receiptImage = body.receiptImage;
    }

    const order = await storage.createOrder({
      customerName,
      email,
      phone,
      address: address || '',
      cityDistrict: cityDistrict || '',
      productName: productName || 'Lansakara Bespoke Furniture',
      productId: productId || null,
      productImage: productImage || '',
      woodSpec: woodSpec || '',
      fabricSpec: fabricSpec || '',
      trimSpec: trimSpec || '',
      customMessage: customMessage || '',
      subtotal: subtotal !== undefined ? parseFloat(subtotal) : undefined,
      deliveryDistanceKm: deliveryDistanceKm !== undefined ? parseFloat(deliveryDistanceKm) : undefined,
      deliveryRatePerKm: deliveryRatePerKm !== undefined ? parseFloat(deliveryRatePerKm) : undefined,
      deliveryFee: deliveryFee !== undefined ? parseFloat(deliveryFee) : undefined,
      paymentMethod: paymentMethod || 'cod',
      cardDiscountPercent: cardDiscountPercent !== undefined ? parseFloat(cardDiscountPercent) : undefined,
      discountAmount: discountAmount !== undefined ? parseFloat(discountAmount) : undefined,
      totalPrice: totalPrice !== undefined ? parseFloat(totalPrice) : undefined,
      advanceAmount: advanceAmount !== undefined ? parseFloat(advanceAmount) : undefined,
      remainingBalance: remainingBalance !== undefined ? parseFloat(remainingBalance) : undefined,
      receiptImage,
      maskedCard: maskedCard || ''
    });

    res.status(201).json({ 
      success: true,
      message: 'Order placed successfully! Our concierge will contact you shortly.',
      orderId: order._id || order.id,
      order
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(400).json({ error: err.message });
  }
});

// GET /api/orders/track/:id (Public - track order status)
router.get('/track/:id', async (req, res) => {
  try {
    const order = await storage.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    // Return sanitized tracking info
    res.json({
      orderId: order._id || order.id,
      customerName: order.customerName,
      productName: order.productName,
      paymentMethod: order.paymentMethod,
      totalPrice: order.totalPrice,
      status: order.status,
      createdAt: order.createdAt,
      acceptedAt: order.acceptedAt,
      deliveredAt: order.deliveredAt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders (Admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { orders, total, statusCounts } = await storage.getOrders(req.query);
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    res.json({ orders, total, statusCounts, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/stats/summary (Admin)
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    const stats = await storage.getOrderStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id (Admin)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await storage.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/orders/:id/status (Admin - accept, delivered, etc.)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const validStatuses = ['pending', 'accepted', 'processing', 'ready', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be: ' + validStatuses.join(', ') });
    }

    const order = await storage.updateOrderStatus(req.params.id, status, adminNote);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    res.json({ message: `Order status updated to: ${status}`, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/orders/:id (Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await storage.deleteOrder(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
