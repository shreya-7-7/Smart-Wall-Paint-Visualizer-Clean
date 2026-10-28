const mongoose = require('mongoose');

const ColorSwatchSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  hex: { type: String, required: true },
  family: { type: String, default: 'Studio Curated' },
  description: { type: String, default: '' },
  isCore: { type: Boolean, default: false },
}, { _id: false });

const PaintPaletteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: 'Curated Collection',
  },
  swatches: [ColorSwatchSchema],
  isDefault: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('PaintPalette', PaintPaletteSchema);
