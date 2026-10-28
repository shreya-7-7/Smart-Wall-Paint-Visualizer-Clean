const mongoose = require('mongoose');

const CutoutPointSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
}, { _id: false });

const WallSchema = new mongoose.Schema({
  id: { type: String, required: false, default: () => `wall-${Date.now()}-${Math.random().toString(36).substring(2, 6)}` },
  name: { type: String, default: 'Wall' },
  points: [{ x: Number, y: Number }],
  cutouts: [[{ x: Number, y: Number }]],
  color: { type: String, required: true, default: '#FF6B53' },
  colorName: { type: String, default: 'Coral Bloom' },
  pattern: { type: String, default: 'solid' },
  finish: { type: String, default: 'realistic' },
  opacity: { type: Number, default: 70, min: 10, max: 100 },
}, { _id: false });

const PaintDesignSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Allows guest/demo saves
  },
  guestSessionId: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'My Room Makeover',
  },
  roomImage: {
    type: String, // URL or data URI
    required: true,
  },
  thumbnail: {
    type: String, // Lightweight base64 thumbnail
    required: false,
  },
  walls: [WallSchema],
  primaryColor: {
    type: String,
    default: '#FF6B53',
  },
  primaryColorName: {
    type: String,
    default: 'Coral Bloom',
  },
  finish: {
    type: String,
    default: 'realistic',
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('PaintDesign', PaintDesignSchema);
