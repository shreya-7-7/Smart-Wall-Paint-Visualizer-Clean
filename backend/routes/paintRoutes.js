const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const PaintDesign = require('../models/PaintDesign');
const PaintPalette = require('../models/PaintPalette');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

// Middleware: Optional JWT authentication (extracts user info if valid token is provided; handles guest callers safely)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;
      const user = await User.findById(decoded.id).select('role');
      if (user) {
        req.userRole = user.role;
        req.isAdmin = user.role === 'admin';
      }
    } catch {
      req.invalidToken = true;
    }
  }
  next();
};

// Default Fallback Collections (Always available even if DB connection is offline)
const DEFAULT_PALETTES = [
  {
    name: 'Studio Signatures',
    slug: 'studio-signatures',
    category: 'Core Collection',
    isDefault: true,
    swatches: [
      { id: 'coral', name: 'Coral Bloom', hex: '#FF6B53', family: 'Signatures', isCore: true, description: 'Vibrant, warm terracotta coral' },
      { id: 'ochre', name: 'Sunshine Ochre', hex: '#F7B731', family: 'Signatures', isCore: true, description: 'Warm golden sunlight' },
      { id: 'teal', name: 'Coastal Teal', hex: '#1E8C96', family: 'Signatures', isCore: true, description: 'Deep Mediterranean sea water' },
      { id: 'sage', name: 'Leafy Sage', hex: '#48A279', family: 'Signatures', isCore: true, description: 'Subtle organic botanical green' },
      { id: 'cerulean', name: 'Sky Cerulean', hex: '#4EA8DE', family: 'Signatures', isCore: true, description: 'Crisp morning open sky' },
    ],
  },
  {
    name: 'Warm Earth & Terracotta',
    slug: 'warm-earth',
    category: 'Designer Collection',
    isDefault: false,
    swatches: [
      { id: 'terracotta', name: 'Raw Terracotta', hex: '#C77965', family: 'Warm Earth' },
      { id: 'clay', name: 'Tuscan Clay', hex: '#D9A38F', family: 'Warm Earth' },
      { id: 'sandstone', name: 'Desert Sandstone', hex: '#E5D0B8', family: 'Warm Earth' },
      { id: 'linen', name: 'Natural Linen', hex: '#F4EDE1', family: 'Warm Earth' },
      { id: 'cinnamon', name: 'Warm Cinnamon', hex: '#A85D48', family: 'Warm Earth' },
    ],
  },
  {
    name: 'Ocean & Atmospheric Blues',
    slug: 'ocean-air',
    category: 'Designer Collection',
    isDefault: false,
    swatches: [
      { id: 'mist', name: 'Coastal Mist', hex: '#9EBBCB', family: 'Ocean' },
      { id: 'slate', name: 'Deep Slate', hex: '#5F7D95', family: 'Ocean' },
      { id: 'cobalt', name: 'Studio Cobalt', hex: '#2B5CE6', family: 'Ocean' },
      { id: 'marine', name: 'Aegean Sea', hex: '#1B4965', family: 'Ocean' },
      { id: 'midnight', name: 'Midnight Navy', hex: '#0F2537', family: 'Ocean' },
    ],
  },
  {
    name: 'Botanical & Organic Greens',
    slug: 'botanical-greens',
    category: 'Designer Collection',
    isDefault: false,
    swatches: [
      { id: 'celadon', name: 'Celadon Leaf', hex: '#B7C9A8', family: 'Botanical' },
      { id: 'olive', name: 'Spanish Olive', hex: '#839B76', family: 'Botanical' },
      { id: 'forest', name: 'Pine Forest', hex: '#4D6A42', family: 'Botanical' },
      { id: 'eucalyptus', name: 'Eucalyptus', hex: '#6B8E7D', family: 'Botanical' },
      { id: 'moss', name: 'Deep Moss', hex: '#2D4739', family: 'Botanical' },
    ],
  },
  {
    name: 'Nordic & Mineral Neutrals',
    slug: 'nordic-neutrals',
    category: 'Designer Collection',
    isDefault: false,
    swatches: [
      { id: 'chalk', name: 'Chalk White', hex: '#FAF8F5', family: 'Nordic' },
      { id: 'parchment', name: 'Warm Parchment', hex: '#EFECE6', family: 'Nordic' },
      { id: 'limestone', name: 'Limestone Grey', hex: '#D4CEC5', family: 'Nordic' },
      { id: 'pebble', name: 'River Pebble', hex: '#B7B7B7', family: 'Nordic' },
      { id: 'graphite', name: 'Soft Graphite', hex: '#4A453E', family: 'Nordic' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 1. PALETTES API
// ─────────────────────────────────────────────────────────────────────────────

// Helper to find a palette by ObjectId or slug, with fallback auto-persistence of default collections
const findPaletteByIdOrSlug = async (idOrSlug) => {
  let palette = null;
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    palette = await PaintPalette.findById(idOrSlug);
  }
  if (!palette) {
    palette = await PaintPalette.findOne({ slug: idOrSlug });
  }
  if (!palette) {
    const defaultMatch = DEFAULT_PALETTES.find(
      (p) => p.slug === idOrSlug || p.name.toLowerCase() === idOrSlug.toLowerCase()
    );
    if (defaultMatch) {
      try {
        palette = new PaintPalette(defaultMatch);
        await palette.save();
      } catch {
        palette = await PaintPalette.findOne({ slug: defaultMatch.slug });
      }
    }
  }
  return palette;
};

// @route   GET /api/paint/palettes
// @desc    Retrieve all active paint palettes and color swatches
router.get('/palettes', async (req, res) => {
  try {
    let palettes = [];
    try {
      palettes = await PaintPalette.find().sort({ isDefault: -1, createdAt: 1 });
      if ((!palettes || palettes.length === 0) && mongoose.connection.readyState === 1) {
        // Auto-seed default collections into MongoDB so they persist with permanent IDs
        try {
          palettes = await PaintPalette.insertMany(DEFAULT_PALETTES);
        } catch {
          palettes = await PaintPalette.find().sort({ isDefault: -1, createdAt: 1 });
        }
      }
    } catch (dbErr) {
      console.warn('DB query for paint palettes skipped (using built-in catalog):', dbErr.message);
    }

    if (!palettes || palettes.length === 0) {
      return res.json({ palettes: DEFAULT_PALETTES, source: 'fallback' });
    }

    res.json({ palettes, source: 'database' });
  } catch (err) {
    console.error('Error fetching paint palettes:', err);
    res.json({ palettes: DEFAULT_PALETTES, source: 'fallback' });
  }
});

// @route   POST /api/paint/palettes
// @desc    Admin: Create or update a paint palette
router.post('/palettes', protect, admin, async (req, res) => {
  try {
    const { name, slug, description, category, swatches, isDefault } = req.body;

    if (!name || !slug || !swatches || swatches.length === 0) {
      return res.status(400).json({ message: 'Palette name, slug, and at least one swatch are required.' });
    }

    let palette = await PaintPalette.findOne({ slug });
    if (palette) {
      palette.name = name;
      palette.description = description || palette.description;
      palette.category = category || palette.category;
      palette.swatches = swatches;
      if (typeof isDefault === 'boolean') palette.isDefault = isDefault;
      await palette.save();
    } else {
      palette = new PaintPalette({
        name,
        slug,
        description,
        category,
        swatches,
        isDefault: !!isDefault,
      });
      await palette.save();
    }

    res.json({ message: 'Palette saved successfully', palette });
  } catch (err) {
    console.error('Error saving paint palette:', err);
    res.status(500).json({ message: 'Server error saving paint palette', error: err.message });
  }
});

// @route   DELETE /api/paint/palettes/:id
// @desc    Admin: Delete a custom paint palette
router.delete('/palettes/:id', protect, admin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid palette ID format' });
    }

    const palette = await PaintPalette.findByIdAndDelete(req.params.id);
    if (!palette) {
      return res.status(404).json({ message: 'Palette not found' });
    }
    res.json({ message: 'Palette deleted successfully' });
  } catch (err) {
    console.error('Error deleting paint palette:', err);
    res.status(500).json({ message: 'Server error deleting paint palette', error: err.message });
  }
});

// @route   POST /api/paint/palettes/:id/swatches
// @desc    Admin: Add a new individual color swatch to a palette
router.post('/palettes/:id/swatches', protect, admin, async (req, res) => {
  try {
    const palette = await findPaletteByIdOrSlug(req.params.id);
    if (!palette) {
      return res.status(404).json({ message: 'Palette not found' });
    }

    const { name, hex, family, description, isCore, id } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Swatch name is required.' });
    }

    const trimmedHex = (hex || '').trim();
    const formattedHex = trimmedHex.startsWith('#') ? trimmedHex : `#${trimmedHex}`;
    if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(formattedHex)) {
      return res.status(400).json({ message: 'Valid hex color code is required (e.g. #FF6B53).' });
    }

    let swatchId = (id || name)
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!swatchId) swatchId = `swatch-${Date.now().toString(36)}`;

    // Avoid duplicate IDs within the same palette
    if (palette.swatches.some((s) => s.id === swatchId)) {
      swatchId = `${swatchId}-${Date.now().toString(36).slice(-4)}`;
    }

    const newSwatch = {
      id: swatchId,
      name: name.trim(),
      hex: formattedHex.toUpperCase(),
      family: (family && family.trim()) || palette.name,
      description: description ? description.trim() : '',
      isCore: Boolean(isCore),
    };

    palette.swatches.push(newSwatch);
    palette.markModified('swatches');
    await palette.save();

    res.status(201).json({
      message: `Color swatch "${newSwatch.name}" added successfully to ${palette.name}.`,
      swatch: newSwatch,
      palette,
    });
  } catch (err) {
    console.error('Error adding swatch to palette:', err);
    res.status(500).json({ message: 'Server error adding swatch', error: err.message });
  }
});

// @route   PUT /api/paint/palettes/:id/swatches/:swatchId
// @desc    Admin: Edit an individual color swatch in a palette
router.put('/palettes/:id/swatches/:swatchId', protect, admin, async (req, res) => {
  try {
    const palette = await findPaletteByIdOrSlug(req.params.id);
    if (!palette) {
      return res.status(404).json({ message: 'Palette not found' });
    }

    const swatchIndex = palette.swatches.findIndex((s) => s.id === req.params.swatchId);
    if (swatchIndex === -1) {
      return res.status(404).json({ message: 'Swatch not found in this palette.' });
    }

    const { name, hex, family, description, isCore } = req.body;
    const existing = palette.swatches[swatchIndex];

    if (name !== undefined) {
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ message: 'Swatch name cannot be empty.' });
      }
      existing.name = name.trim();
    }

    if (hex !== undefined) {
      const trimmedHex = (hex || '').trim();
      const formattedHex = trimmedHex.startsWith('#') ? trimmedHex : `#${trimmedHex}`;
      if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(formattedHex)) {
        return res.status(400).json({ message: 'Valid hex color code is required (e.g. #FF6B53).' });
      }
      existing.hex = formattedHex.toUpperCase();
    }

    if (family !== undefined) {
      existing.family = family.trim();
    }

    if (description !== undefined) {
      existing.description = description.trim();
    }

    if (isCore !== undefined) {
      existing.isCore = Boolean(isCore);
    }

    palette.swatches[swatchIndex] = existing;
    palette.markModified('swatches');
    await palette.save();

    res.json({
      message: `Color swatch "${existing.name}" updated successfully.`,
      swatch: existing,
      palette,
    });
  } catch (err) {
    console.error('Error updating swatch:', err);
    res.status(500).json({ message: 'Server error updating swatch', error: err.message });
  }
});

// @route   DELETE /api/paint/palettes/:id/swatches/:swatchId
// @desc    Admin: Delete an individual color swatch from a palette
router.delete('/palettes/:id/swatches/:swatchId', protect, admin, async (req, res) => {
  try {
    const palette = await findPaletteByIdOrSlug(req.params.id);
    if (!palette) {
      return res.status(404).json({ message: 'Palette not found' });
    }

    const swatchIndex = palette.swatches.findIndex((s) => s.id === req.params.swatchId);
    if (swatchIndex === -1) {
      return res.status(404).json({ message: 'Swatch not found in this palette.' });
    }

    const deletedSwatch = palette.swatches[swatchIndex];
    palette.swatches.splice(swatchIndex, 1);
    palette.markModified('swatches');
    await palette.save();

    res.json({
      message: `Color swatch "${deletedSwatch.name}" deleted successfully from ${palette.name}.`,
      deletedSwatchId: req.params.swatchId,
      palette,
    });
  } catch (err) {
    console.error('Error deleting swatch:', err);
    res.status(500).json({ message: 'Server error deleting swatch', error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. SAVED PAINT DESIGNS API
// ─────────────────────────────────────────────────────────────────────────────

// @route   GET /api/paint/designs
// @desc    Retrieve saved paint designs (by user or guest session)
router.get('/designs', optionalAuth, async (req, res) => {
  try {
    if (req.invalidToken) {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }

    const query = {};

    if (req.userId) {
      // Authenticated user: Admin can query all if requested, otherwise scope to user
      if (req.isAdmin && (req.query.all === 'true' || req.query.admin === 'true')) {
        // Query all designs across users
      } else {
        query.user = req.userId;
      }
    } else {
      // Guest session access
      const guestSessionId = req.headers['x-guest-session'] || req.query.guestSession;
      if (guestSessionId) {
        query.guestSessionId = guestSessionId;
        query.user = null;
      } else {
        // Unauthenticated visitor with no guest session: return empty list to protect private designs
        return res.json({ designs: [] });
      }
    }

    const designs = await PaintDesign.find(query).sort({ updatedAt: -1 }).limit(20);
    res.json({ designs });
  } catch (err) {
    console.error('Error retrieving paint designs:', err);
    res.status(500).json({ message: 'Failed to retrieve paint designs', error: err.message });
  }
});

// @route   POST /api/paint/designs/claim
// @desc    Claim guest designs matching the caller's guest session to their authenticated user account
router.post('/designs/claim', protect, async (req, res) => {
  try {
    const guestSessionId = req.headers['x-guest-session'] || req.body.guestSessionId;
    if (!guestSessionId) {
      return res.status(400).json({ message: 'Guest session ID is required to claim designs' });
    }

    const result = await PaintDesign.updateMany(
      { guestSessionId, user: null },
      { $set: { user: req.userId } }
    );

    res.json({
      message: `Successfully claimed ${result.modifiedCount} guest design(s).`,
      claimedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error('Error claiming guest designs:', err);
    res.status(500).json({ message: 'Failed to claim designs', error: err.message });
  }
});

// Helper function to update an existing paint design with strict ownership checks
const updatePaintDesign = async (designId, payload, req, res) => {
  if (!mongoose.Types.ObjectId.isValid(designId)) {
    return res.status(400).json({ message: 'Invalid design ID format' });
  }

  const design = await PaintDesign.findById(designId);
  if (!design) {
    return res.status(404).json({ message: 'Design not found' });
  }

  // Enforce ownership check on update:
  if (design.user) {
    const isOwner = req.userId && design.user.toString() === req.userId.toString();
    const isAdmin = req.isAdmin === true;
    if (!isOwner && !isAdmin) {
      if (!req.userId) {
        return res.status(401).json({ message: 'Authentication required to modify this private design' });
      }
      return res.status(403).json({ message: 'Access denied: You cannot modify another user\'s private design' });
    }
  } else if (design.guestSessionId) {
    const clientGuestSession = req.headers['x-guest-session'] || req.query.guestSession || payload.guestSessionId;
    const isSessionMatch = clientGuestSession && design.guestSessionId === clientGuestSession;
    const isAdmin = req.isAdmin === true;
    const isClaimingUser = Boolean(req.userId);

    if (!isAdmin && !isClaimingUser && !isSessionMatch) {
      return res.status(403).json({ message: 'Access denied: Guest session mismatch for this design' });
    }

    // If a logged-in user updates a guest design, assign ownership safely
    if (req.userId) {
      if (clientGuestSession && design.guestSessionId !== clientGuestSession && !isAdmin) {
        return res.status(403).json({ message: 'Access denied: Cannot claim guest design from another session' });
      }
      design.user = req.userId;
    }
  }

  const { name, roomImage, thumbnail, walls, primaryColor, primaryColorName, finish, notes } = payload;
  if (name) design.name = name;
  if (roomImage) design.roomImage = roomImage;
  if (thumbnail) design.thumbnail = thumbnail;
  if (walls) design.walls = walls;
  if (primaryColor) design.primaryColor = primaryColor;
  if (primaryColorName) design.primaryColorName = primaryColorName;
  if (finish) design.finish = finish;
  if (notes !== undefined) design.notes = notes;
  design.updatedAt = Date.now();

  await design.save();
  return res.json({ message: 'Design updated successfully', design });
};

// @route   PUT /api/paint/designs/:id
// @desc    Update an existing paint makeover design
router.put('/designs/:id', optionalAuth, async (req, res) => {
  try {
    if (req.invalidToken) {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
    return await updatePaintDesign(req.params.id, req.body, req, res);
  } catch (err) {
    console.error('Error updating paint design:', err);
    res.status(500).json({ message: 'Server error updating design', error: err.message });
  }
});

// @route   POST /api/paint/designs
// @desc    Save or update a paint makeover design
router.post('/designs', optionalAuth, async (req, res) => {
  try {
    if (req.invalidToken) {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }

    const {
      id,
      name,
      roomImage,
      thumbnail,
      walls,
      primaryColor,
      primaryColorName,
      finish,
      notes,
      guestSessionId: bodyGuestSessionId,
    } = req.body;

    if (!roomImage && !thumbnail && !id) {
      return res.status(400).json({ message: 'A room image or thumbnail is required to save a makeover.' });
    }

    if (id) {
      return await updatePaintDesign(id, req.body, req, res);
    }

    // Create new design
    const clientGuestSession = req.headers['x-guest-session'] || req.query.guestSession || bodyGuestSessionId;
    const design = new PaintDesign({
      name: name || 'My Room Makeover',
      roomImage: roomImage || thumbnail,
      thumbnail: thumbnail || roomImage,
      walls: walls || [],
      primaryColor: primaryColor || '#FF6B53',
      primaryColorName: primaryColorName || 'Coral Bloom',
      finish: finish || 'realistic',
      notes: notes || '',
      user: req.userId || undefined,
      guestSessionId: req.userId ? undefined : (clientGuestSession || `guest-${Date.now()}`),
    });
    await design.save();

    res.json({ message: 'Design saved successfully', design });
  } catch (err) {
    console.error('Error saving paint design:', err);
    res.status(500).json({ message: 'Server error saving design', error: err.message });
  }
});

// @route   GET /api/paint/designs/:id
// @desc    Retrieve a specific saved design by ID
router.get('/designs/:id', optionalAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid design ID format' });
    }

    const design = await PaintDesign.findById(req.params.id);
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Ownership & Access check:
    if (design.user) {
      const isOwner = req.userId && design.user.toString() === req.userId.toString();
      const isAdmin = req.isAdmin === true;
      if (!isOwner && !isAdmin) {
        if (!req.userId) {
          return res.status(401).json({ message: 'Authentication required to access this private design' });
        }
        return res.status(403).json({ message: 'Access denied: You do not have permission to view this design' });
      }
    } else if (design.guestSessionId) {
      const clientGuestSession = req.headers['x-guest-session'] || req.query.guestSession;
      const isAdmin = req.isAdmin === true;
      const isClaimingUser = Boolean(req.userId);
      if (!isAdmin && !isClaimingUser && (!clientGuestSession || clientGuestSession !== design.guestSessionId)) {
        return res.status(403).json({ message: 'Access denied: Guest session mismatch for this design' });
      }
    }

    res.json({ design });
  } catch (err) {
    console.error('Error fetching design by ID:', err);
    res.status(500).json({ message: 'Error retrieving design', error: err.message });
  }
});

// @route   DELETE /api/paint/designs/:id
// @desc    Delete a saved paint design
router.delete('/designs/:id', optionalAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid design ID format' });
    }

    const design = await PaintDesign.findById(req.params.id);
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Enforce ownership check on delete:
    if (design.user) {
      const isOwner = req.userId && design.user.toString() === req.userId.toString();
      const isAdmin = req.isAdmin === true;
      if (!isOwner && !isAdmin) {
        if (!req.userId) {
          return res.status(401).json({ message: 'Authentication required to delete this private design' });
        }
        return res.status(403).json({ message: 'Access denied: You cannot delete another user\'s private design' });
      }
    } else if (design.guestSessionId) {
      const clientGuestSession = req.headers['x-guest-session'] || req.query.guestSession || req.body?.guestSessionId;
      const isAdmin = req.isAdmin === true;
      if (!isAdmin && (!clientGuestSession || design.guestSessionId !== clientGuestSession)) {
        return res.status(403).json({ message: 'Access denied: Guest session mismatch for this design' });
      }
    }

    await PaintDesign.findByIdAndDelete(req.params.id);
    res.json({ message: 'Design deleted successfully' });
  } catch (err) {
    console.error('Error deleting design:', err);
    res.status(500).json({ message: 'Error deleting design', error: err.message });
  }
});

module.exports = router;
