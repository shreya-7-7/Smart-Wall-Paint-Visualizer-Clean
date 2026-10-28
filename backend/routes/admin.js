const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

// GET /api/admin/stats — total revenue, user count for dashboard cards
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const [userCount, orders] = await Promise.all([
      User.countDocuments(),
      Order.find({}, 'price'),
    ]);
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.price) || 0), 0);
    res.json({ totalRevenue, userCount });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats.', error: error.message });
  }
});

// GET /api/admin/orders — fetch all orders for admin order tracking (with user info)
router.get('/orders', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders.', error: error.message });
  }
});

// GET /api/admin/activity — aggregated monthly activity (new users & sales by week)
router.get('/activity', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}, 'createdAt').sort({ createdAt: 1 });
    const orders = await Order.find({}, 'createdAt').sort({ createdAt: 1 });

    const now = new Date();
    const getWeekStart = (d) => {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      date.setDate(diff);
      date.setHours(0, 0, 0, 0);
      return date;
    };

    const weekLabels = {};
    const weekUsers = {};
    const weekSales = {};
    const keys = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const start = getWeekStart(d);
      const key = start.toISOString().slice(0, 10);
      const label = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      weekLabels[key] = label;
      weekUsers[key] = 0;
      weekSales[key] = 0;
      keys.push(key);
    }

    users.forEach((u) => {
      if (!u.createdAt) return;
      const start = getWeekStart(u.createdAt);
      start.setHours(0, 0, 0, 0);
      const key = start.toISOString().slice(0, 10);
      if (weekUsers[key] !== undefined) weekUsers[key]++;
    });

    orders.forEach((o) => {
      if (!o.createdAt) return;
      const start = getWeekStart(o.createdAt);
      start.setHours(0, 0, 0, 0);
      const key = start.toISOString().slice(0, 10);
      if (weekSales[key] !== undefined) weekSales[key]++;
    });

    const data = keys.map((key) => ({
      date: weekLabels[key],
      users: weekUsers[key] || 0,
      sales: weekSales[key] || 0,
    }));

    res.json({ data });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch activity.', error: error.message });
  }
});

module.exports = router;
