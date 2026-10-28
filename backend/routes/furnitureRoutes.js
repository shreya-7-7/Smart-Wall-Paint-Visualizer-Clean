const express = require('express');
const router = express.Router();
const Furniture = require('../models/Furniture');

// GET all furniture (This is what your Catalog will call)
router.get('/', async (req, res) => {
  try {
    const items = await Furniture.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single item by ID (For your Product Details page)
router.get('/:id', async (req, res) => {
  try {
    const item = await Furniture.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a NEW furniture item
router.post('/', async (req, res) => {
  try {
    const newFurniture = new Furniture(req.body);
    const savedItem = await newFurniture.save();
    res.status(201).json(savedItem);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE a furniture item
router.delete('/:id', async (req, res) => {
  try {
    await Furniture.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted successfully" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// UPDATE a furniture item
router.put('/:id', async (req, res) => {
  try {
    const updated = await Furniture.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;