require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const History = require('./models/History');
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Stat = require('./models/Stat');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 9000;
const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:9000/predict';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

app.use(cors());
app.use(express.json());

// --- Email Utility ---
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: `"Sleep AI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log("Email sent:", info.response);
  } catch (error) {
    console.log("Email Error:", error);
    throw error;
  }
};


// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sleep_predictor')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// --- Auth Routes ---

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });

    user = new User({ email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, email: user.email } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login (Role-Based)
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('password', 10);

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    if (role === 'admin') {
      if (email !== ADMIN_EMAIL) {
        return res.status(401).json({ error: 'Invalid admin credentials' });
      }
      const isMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid admin credentials' });
      }
      
      const payload = { user: { id: 'admin_id', role: 'admin' } };
      jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
        if (err) throw err;
        res.json({ token, role: 'admin', user: { email: ADMIN_EMAIL, role: 'admin' } });
      });
    } else {
      // User login
      let user = await User.findOne({ email });
      if (!user) return res.status(400).json({ error: 'Invalid Credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: 'Invalid Credentials' });

      const payload = { user: { id: user.id, role: 'user' } };
      jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
        if (err) throw err;
        res.json({ token, role: 'user', user: { id: user.id, email: user.email, role: 'user' } });
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Forgot Password (Send OTP)
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User with this email does not exist.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP and expiration (e.g., 10 mins)
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    
    console.log("Sending OTP to:", user.email);

    await sendEmail(
      user.email,
      "OTP for Password Reset",
      `<h2>Password Reset Request</h2>
<p>Your OTP is:</p>
<h1 style="color:blue;">${otp}</h1>
<p>This OTP will expire in 10 minutes.</p>`
    );

    res.json({ message: 'OTP sent successfully to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while sending OTP' });
  }
});

// Test Email Route
app.get('/api/test-email', async (req, res) => {
  try {
    await sendEmail(
      "karanjadhav4065@gmail.com",
      "Test Email",
      "<h3>Email working successfully</h3>"
    );
    res.json({ message: 'Test email sent successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

// Reset Password (Verify OTP and change password)
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.resetPasswordOtp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while resetting password' });
  }
});

// Get current user
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get global stats
app.get('/api/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.json({ totalVisits: totalUsers });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Admin Routes ---
app.use('/api/admin', require('./routes/adminRoutes'));

// --- E-Commerce Routes ---
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/suggestions', require('./routes/suggestionRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));

// Get user cart
app.get('/api/cart', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id }).populate('products.productId');
    if (!cart) cart = await Cart.create({ userId: req.user.id, products: [] });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add to cart
app.post('/api/cart/add', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) cart = await Cart.create({ userId: req.user.id, products: [] });
    
    const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
    if (productIndex > -1) {
      cart.products[productIndex].quantity += 1;
    } else {
      cart.products.push({ productId, quantity: 1 });
    }
    await cart.save();
    
    cart = await Cart.findOne({ userId: req.user.id }).populate('products.productId');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Remove from cart
app.delete('/api/cart/remove/:productId', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id });
    if (cart) {
      cart.products = cart.products.filter(p => p.productId.toString() !== req.params.productId);
      await cart.save();
    }
    cart = await Cart.findOne({ userId: req.user.id }).populate('products.productId');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

// --- Protected API Routes ---

// Route to get prediction and save to history
app.post('/api/sleep-predict', auth, async (req, res) => {
  try {
    const { screen_time, sleep_time, physical_activity } = req.body;

    // Call Flask ML API
    const flaskResponse = await axios.post(FLASK_API_URL, {
      screen_time,
      sleep_time,
      physical_activity
    });

    const { score, category, suggestions } = flaskResponse.data;

    // Save to MongoDB with user ID
    const newHistory = new History({
      user: req.user.id,
      screen_time,
      sleep_time,
      physical_activity,
      score,
      category,
      suggestions
    });
    await newHistory.save();

    res.json(newHistory);
  } catch (error) {
    console.error('Error in /api/sleep-predict:', error.message);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Route to fetch history
app.get('/api/history', auth, async (req, res) => {
  try {
    const history = await History.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(10);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Route to delete a single history record
app.delete('/api/history/:id', auth, async (req, res) => {
  try {
    const record = await History.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    if (record.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this record' });
    }
    await History.findByIdAndDelete(req.params.id);
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

app.listen(PORT, () => {
  console.log(`Node backend running on port ${PORT}`);
});
