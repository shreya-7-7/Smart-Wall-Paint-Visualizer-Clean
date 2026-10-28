const express = require('express');
const router = express.Router();
const Design = require('../models/Design');

// @route   POST api/designs
// @desc    Save or Update a layout
router.post('/', async (req, res) => {
  try {
    const { id, name, roomSize, furniture, thumbnail, userId, user: bodyUser } = req.body;
    const finalUserId = userId || bodyUser;

    console.log("Save request received. ID:", id || "(none)", "User:", finalUserId, "Name:", name);

    if (!finalUserId) {
      return res.status(400).json({ message: "User ID is required to save designs." });
    }

    let design;
    if (id && id !== "null" && id !== "undefined") {
      try {
        design = await Design.findById(id);
        if (design) {
          console.log(" Found existing design. Updating ID:", id);
        } else {
          console.log("Design ID provided but not found in database. Creating new design instead.");
        }
      } catch (e) {
        console.error(" Invalid Design ID format:", id, e.message);
      }
    } else {
      console.log("No ID provided. Creating new design.");
    }

    if (design) {
      // Update existing
      design.name = name || design.name;
      design.roomSize = roomSize || design.roomSize;
      design.furniture = furniture || design.furniture;
      // Only update thumbnail if a new one is provided (prevents 3D overwriting 2D preview)
      if (thumbnail) design.thumbnail = thumbnail;
      design.lastEdited = Date.now();
      await design.save();
      console.log("Design updated successfully. ID:", design._id);
    } else {
      // Create new
      design = new Design({
        user: finalUserId,
        name: name || 'Untitled Design',
        roomSize,
        furniture,
        thumbnail
      });
      await design.save();
      console.log("New design created. ID:", design._id);
    }

    res.json(design);
  } catch (err) {
    console.error("DESIGN SAVE ERROR:", err);
    res.status(500).json({
      message: 'Server Error during save',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// @route   PUT api/designs/:id
// @desc    Update a design (REST consistent)
router.put('/:id', async (req, res) => {
  req.body.id = req.params.id;
  // Redirect to the POST handler's logic (which handles updates)
  // or just copy the logic. For simplicity, we'll implement it here or call a helper.
  // We'll just copy the core save logic for robustness.
  try {
    const { name, roomSize, furniture, thumbnail } = req.body;
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ message: "Design not found" });

    design.name = name || design.name;
    if (roomSize) design.roomSize = roomSize;
    if (furniture) design.furniture = furniture;
    if (thumbnail) design.thumbnail = thumbnail;
    design.lastEdited = Date.now();

    await design.save();
    res.json(design);
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

// @route   GET api/designs/user/:userId
// @desc    Get all designs for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const designs = await Design.find({ user: req.params.userId }).sort({ lastEdited: -1 });
    res.json(designs);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   GET api/designs/:id
// @desc    Get a single design by ID
router.get('/:id', async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ msg: 'Design not found' });
    res.json(design);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/designs/:id
// @desc    Delete a design
router.delete('/:id', async (req, res) => {
  try {
    await Design.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Design removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
