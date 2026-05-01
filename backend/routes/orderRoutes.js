const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const adminAuth = require('../middleware/adminAuth');
const auth = require('../middleware/auth');
const Razorpay = require("razorpay");
const crypto = require("crypto");

// GET /api/orders (Admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().populate('productId').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/orders/my-orders (Public/User orders)
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).populate('productId').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/orders (Public checkout)
router.post('/', auth, async (req, res) => {
  try {
    const { productId, name, email, phone, address, quantity, totalPrice } = req.body;
    
    if (!productId || !name || !email || !phone || !address || !quantity || !totalPrice) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const newOrder = new Order({
      productId,
      userId: req.user.id,
      name,
      email,
      phone,
      address,
      quantity: parseInt(quantity),
      totalPrice: parseFloat(totalPrice),
      paymentMode: "Cash on delivery"
    });
    
    await newOrder.save();
    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while placing order' });
  }
});

// POST /api/orders/create-razorpay-order
router.post('/create-razorpay-order', auth, async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;

    if (!amount || !currency || !receipt) {
      return res.status(400).json({ error: "Missing order parameters" });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET
    });

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: currency || "INR",
      receipt: receipt,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ error: "Failed to create order" });
    }

    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error("Order error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// POST /api/orders/validate-razorpay-payment
router.post("/validate-razorpay-payment", auth, async(req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails } = req.body;

    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");

    if (digest !== razorpay_signature) {
      return res.status(400).json({ msg: "Transaction is not legit!" });
    }

    // Save the order to the database if payment is legit
    const { productId, name, email, phone, address, quantity, totalPrice } = orderDetails;
    
    const newOrder = new Order({
      productId,
      userId: req.user.id,
      name,
      email,
      phone,
      address,
      quantity: parseInt(quantity),
      totalPrice: parseFloat(totalPrice),
      status: 'completed', // or pending based on your flow
      paymentMode: "UPI payment"
    });
    
    await newOrder.save();

    res.json({ msg: "Transaction is legit!", orderId: razorpay_order_id, paymentId: razorpay_payment_id, savedOrder: newOrder });
  } catch (error) {
    console.error("Validation error:", error);
    res.status(500).json({ error: "Server error during payment validation" });
  }
});

// PUT /api/orders/:id (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    let order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    order.status = status;
    await order.save();
    
    res.json({ message: 'Order status updated', order });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
