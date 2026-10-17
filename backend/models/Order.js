const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Customer Info
  customerName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  address: { type: String, trim: true },
  cityDistrict: { type: String, trim: true },
  
  // Product / Order Info
  productName: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productImage: { type: String },
  
  // Bespoke Chair Configurator options
  woodSpec: { type: String },
  fabricSpec: { type: String },
  trimSpec: { type: String },
  
  // Pricing & Breakdown
  subtotal: { type: Number, default: 0 },
  deliveryDistanceKm: { type: Number, default: 0 },
  deliveryRatePerKm: { type: Number, default: 100 },
  deliveryFee: { type: Number, default: 0 },
  
  // Payment Details
  paymentMethod: { 
    type: String, 
    enum: ['card', 'bank_transfer', 'cod'], 
    default: 'cod' 
  },
  cardDiscountPercent: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },
  advanceAmount: { type: Number, default: 0 },
  remainingBalance: { type: Number, default: 0 },
  
  // Proof of payment
  receiptImage: { type: String },
  maskedCard: { type: String },
  currency: { type: String, default: 'LKR' },
  
  // Message
  customMessage: { type: String },
  
  // Status workflow: pending → accepted → processing → ready → delivered / cancelled
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'processing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  // Admin notes
  adminNote: { type: String },
  
  // Timestamps for each status change
  acceptedAt: { type: Date },
  deliveredAt: { type: Date },
  cancelledAt: { type: Date }
  
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
