const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  displayName: { type: String, default: 'Admin' },
  lastLogin: { type: Date }
}, { timestamps: true });

// Compare password method
adminSchema.methods.comparePassword = async function(plainPassword) {
  return await bcrypt.compare(plainPassword, this.passwordHash);
};

module.exports = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
