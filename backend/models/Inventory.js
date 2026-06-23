const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  fishName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['finfish', 'shellfish', 'crustaceans', 'mollusks', 'other']
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  dateReceived: {
    type: Date,
    default: Date.now
  },
  freshnessStatus: {
    type: String,
    enum: ['fresh', 'good', 'fair', 'poor'],
    default: 'fresh'
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Inventory', inventorySchema);