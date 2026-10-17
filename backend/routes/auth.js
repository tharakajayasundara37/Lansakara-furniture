const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const storage = require('../storage');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const admin = await storage.findAdmin(username);
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id || admin.id, username: admin.username, displayName: admin.displayName },
      process.env.JWT_SECRET || 'lansakara_admin_secret_2026_secure',
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      admin: { username: admin.username, displayName: admin.displayName },
      message: 'Login successful' 
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/verify
router.post('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ valid: false });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'lansakara_admin_secret_2026_secure');
    res.json({ valid: true, admin: decoded });
  } catch (err) {
    res.status(401).json({ valid: false, error: 'Token expired or invalid' });
  }
});

module.exports = router;
