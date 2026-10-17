const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  authorName: { 
    type: String, 
    required: [true, 'Author name is required'], 
    trim: true,
    maxlength: 100 
  },
  email: { 
    type: String, 
    required: [true, 'Email address is required to ensure one review per patron'], 
    trim: true, 
    lowercase: true,
    index: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5, 
    default: 5 
  },
  quote: { 
    type: String, 
    required: [true, 'Review comment is required'], 
    trim: true,
    maxlength: 1000 
  },
  location: { 
    type: String, 
    trim: true, 
    default: 'Sri Lanka',
    maxlength: 120 
  },
  productPurchased: { 
    type: String, 
    trim: true, 
    default: 'Bespoke Timber Creation',
    maxlength: 150 
  },
  status: { 
    type: String, 
    enum: ['approved', 'hidden'], 
    default: 'approved' 
  },
  ipAddress: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Prevent duplicate email review on database level
reviewSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
