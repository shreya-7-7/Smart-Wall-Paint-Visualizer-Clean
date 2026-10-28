const mongoose = require('mongoose');

const furnitureSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String }, 
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String }, 
  material: { type: String },   
  modelPath: { type: String, required: true }, 
  imagePath: { type: String, required: true },

  dimensions: {
    width: { type: Number },
    depth: { type: Number },
    height: { type: Number }
  }
});

module.exports = mongoose.model('Furniture', furnitureSchema);