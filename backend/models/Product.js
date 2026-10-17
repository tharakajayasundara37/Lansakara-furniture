const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['chairs', 'tables', 'sofas', 'beds', 'storage', 'accessories', 'wall-art', 'custom']
  },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number },
  description: { type: String, required: true },
  shortDescription: { type: String },
  images: [{ type: String }],
  badge: { 
    type: String, 
    enum: ['New Arrival', 'Best Seller', 'Limited Edition', 'Custom Order', 'Featured', ''],
    default: ''
  },
  woodType: { type: String },
  featured: { type: Boolean, default: false },
  inStock: { type: Boolean, default: true },
  rating: { type: Number, default: 5, min: 1, max: 5 },
  reviewCount: { type: Number, default: 0 },
  dimensions: { type: String },
  weight: { type: String },
  material: { type: String },
  tags: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
