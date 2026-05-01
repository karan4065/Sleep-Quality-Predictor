const express = require('express');
const router = express.Router();
const Suggestion = require('../models/Suggestion');
const adminAuth = require('../middleware/adminAuth');

// POST /api/suggestions (Public)
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const newSuggestion = new Suggestion({
      name,
      email,
      message
    });
    
    await newSuggestion.save();
    res.status(201).json({ message: 'Suggestion sent successfully', suggestion: newSuggestion });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while sending suggestion' });
  }
});

// GET /api/suggestions (Admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const suggestions = await Suggestion.find().sort({ createdAt: -1 });
    res.json(suggestions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
