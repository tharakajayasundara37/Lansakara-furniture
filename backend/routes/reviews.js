const express = require('express');
const router = express.Router();
const storage = require('../storage');
const authMiddleware = require('../middleware/authMiddleware');

// ─── GET /api/reviews (Public - List approved reviews + rating summary) ───
router.get('/', async (req, res) => {
  try {
    const data = await storage.getReviews(req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/reviews/check (Public - Check if email has already submitted) ───
router.get('/check', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }
    const existing = await storage.getReviewByEmail(email);
    res.json({
      alreadyReviewed: !!existing,
      review: existing || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/reviews (Public - Submit a new review; 1 review per user) ───
router.post('/', async (req, res) => {
  try {
    const { authorName, email, rating, quote, location, productPurchased } = req.body || {};

    if (!authorName || !authorName.trim()) {
      return res.status(400).json({ error: 'Please enter your name.' });
    }
    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (!quote || !quote.trim()) {
      return res.status(400).json({ error: 'Please enter your review comments.' });
    }

    const review = await storage.createReview({
      authorName,
      email,
      rating: parseInt(rating) || 5,
      quote,
      location,
      productPurchased
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your valuable feedback! Your review has been published.',
      review
    });
  } catch (err) {
    if (err.code === 'DUPLICATE_REVIEW' || err.message.includes('already been submitted') || err.code === 11000) {
      return res.status(409).json({
        error: 'A review has already been submitted with this email address. Each customer can submit only one review.'
      });
    }
    res.status(400).json({ error: err.message });
  }
});

// ─── DELETE /api/reviews/:id (Admin only) ───
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await storage.deleteReview(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ message: 'Review deleted successfully', review: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /api/reviews/:id/status (Admin only - toggle approved/hidden) ───
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'hidden'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be approved or hidden.' });
    }
    const updated = await storage.updateReviewStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ message: 'Review status updated', review: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
