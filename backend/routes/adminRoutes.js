const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const Order = require('../models/Order');


// Enhanced Admin Dashboard Stats
router.get('/dashboard', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // Revenue and Deliveries
    const completedOrders = await Order.find({ status: 'completed' });
    const successfulDeliveries = completedOrders.length;
    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Order Status Stats
    const pendingCount = await Order.countDocuments({ status: 'pending' });
    const cancelledCount = await Order.countDocuments({ status: 'cancelled' });
    
    const orderStatusStats = {
      pending: pendingCount,
      completed: successfulDeliveries,
      cancelled: cancelledCount
    };

    // Analytics for charts (Last 7 Days vs Previous 7 Days for growth)
    const now = Date.now();
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

    const recentOrders = await Order.find({ createdAt: { $gte: oneWeekAgo } });
    const previousOrders = await Order.find({ createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo } });
    
    const recentProducts = await Product.find({ createdAt: { $gte: oneWeekAgo } });
    const previousProducts = await Product.find({ createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo } });

    // Growth Calcs (Changed to total for this week instead of difference)
    const ordersGrowth = recentOrders.length;
    const productsGrowth = recentProducts.length;

    const recentDeliveries = recentOrders.filter(o => o.status === 'completed');
    const deliveriesGrowth = recentDeliveries.length;

    const recentRevenue = recentDeliveries.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const revenueGrowth = recentRevenue;

    const growth = {
      orders: ordersGrowth,
      products: productsGrowth,
      deliveries: deliveriesGrowth,
      revenue: revenueGrowth
    };

    const ordersByDateObj = {};
    const revenueByDateObj = {};
    
    // Initialize last 7 days with 0
    for(let i=6; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      ordersByDateObj[dateStr] = 0;
      revenueByDateObj[dateStr] = 0;
    }

    recentOrders.forEach(order => {
      if(!order.createdAt) return;
      const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
      if(ordersByDateObj[dateStr] !== undefined) {
        ordersByDateObj[dateStr] += 1;
        if(order.status === 'completed') {
          revenueByDateObj[dateStr] += (order.totalPrice || 0);
        }
      }
    });

    const ordersByDate = Object.keys(ordersByDateObj).map(date => ({ date, count: ordersByDateObj[date] }));
    const revenueByDate = Object.keys(revenueByDateObj).map(date => ({ date, revenue: revenueByDateObj[date] }));

    res.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      successfulDeliveries,
      ordersByDate,
      revenueByDate,
      orderStatusStats,
      growth
    });
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
