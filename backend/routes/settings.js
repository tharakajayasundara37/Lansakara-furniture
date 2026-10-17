const express = require('express');
const router = express.Router();
const storage = require('../storage');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/settings (Public - used by Checkout page & Admin)
router.get('/', async (req, res) => {
  try {
    const settings = await storage.getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings (Admin only - update discount %, delivery rate, bank details)
router.put('/', authMiddleware, async (req, res) => {
  try {
    const updated = await storage.updateSettings(req.body);
    res.json({ message: 'Settings updated successfully', settings: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
