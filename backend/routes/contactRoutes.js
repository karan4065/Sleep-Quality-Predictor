const express = require('express');
const router = express.Router();
const ContactRequest = require('../models/ContactRequest');
const adminAuth = require('../middleware/adminAuth');

// POST /api/contact - Create a new contact request (public)
router.post('/', async (req, res) => {
  try {
    const { name, email, contactNumber, message } = req.body;
    
    if (!name || !email || !contactNumber || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const newRequest = new ContactRequest({
      name,
      email,
      contactNumber,
      message
    });
    
    await newRequest.save();
    res.status(201).json({ message: 'Request submitted successfully', request: newRequest });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/contact - Get all contact requests (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const requests = await ContactRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/contact/:id - Delete a contact request (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await ContactRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
