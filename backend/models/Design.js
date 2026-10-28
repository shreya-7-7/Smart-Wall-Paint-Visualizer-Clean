const mongoose = require('mongoose');

const FurnitureSchema = new mongoose.Schema({
  clientId: String,
  name: String,
  type: String,
  category: String,
  image: String,
  x: Number,
  y: Number,
  width: Number,
  height: Number,
  rotation: Number,
  modelHeight: Number,
  isStructural: { type: Boolean, default: false },
  swingLeft: { type: Boolean, default: false },
  swingOut: { type: Boolean, default: false },
  modelPath: String,
  color: String,
  shading: Number
}, { _id: false });

const DesignSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    default: 'Untitled Design'
  },
  roomSize: {
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    wallThickness: Number,
    floorColor: { type: String, default: '#f3efe8' },
    wallColor: { type: String, default: '#e5e7eb' },
    isPoly: { type: Boolean, default: false },
    points: [{ x: Number, y: Number }],
    roomName: String
  },
  furniture: [FurnitureSchema],
  thumbnail: String,
  lastEdited: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Design', DesignSchema);
