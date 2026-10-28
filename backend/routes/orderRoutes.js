const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// POST /api/orders — save a new order for the logged-in user
router.post('/', protect, async (req, res) => {
  try {
    const { productName, price, image, category } = req.body;

    if (!productName || price === undefined) {
      return res.status(400).json({ message: 'productName and price are required.' });
    }

    const order = await Order.create({
      user: req.userId,
      productName,
      price,
      image: image || '',
      category: category || '',
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to save order.', error: error.message });
  }
});

// GET /api/orders — fetch all orders for the logged-in user (newest first)
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders.', error: error.message });
  }
});

module.exports = router;
