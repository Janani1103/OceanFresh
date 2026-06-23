const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const { protect, admin, supplier } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const inventory = await Inventory.find({}).populate('supplierId', 'name boatId');
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id).populate('supplierId', 'name boatId');
    if (inventory) {
      res.json(inventory);
    } else {
      res.status(404).json({ message: 'Inventory item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, admin, async (req, res) => {
  try {
    const inventory = await Inventory.create(req.body);
    res.status(201).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (inventory) {
      inventory.fishName = req.body.fishName || inventory.fishName;
      inventory.category = req.body.category || inventory.category;
      inventory.quantity = req.body.quantity !== undefined ? req.body.quantity : inventory.quantity;
      inventory.unitPrice = req.body.unitPrice !== undefined ? req.body.unitPrice : inventory.unitPrice;
      inventory.freshnessStatus = req.body.freshnessStatus || inventory.freshnessStatus;
      inventory.supplierId = req.body.supplierId || inventory.supplierId;
      
      const updatedInventory = await inventory.save();
      res.json(updatedInventory);
    } else {
      res.status(404).json({ message: 'Inventory item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (inventory) {
      await inventory.deleteOne();
      res.json({ message: 'Inventory item removed' });
    } else {
      res.status(404).json({ message: 'Inventory item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/search/:query', protect, async (req, res) => {
  try {
    const inventory = await Inventory.find({
      $or: [
        { fishName: { $regex: req.params.query, $options: 'i' } },
        { category: { $regex: req.params.query, $options: 'i' } }
      ]
    }).populate('supplierId', 'name boatId');
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get inventory recommendations
router.get('/recommendations', protect, async (req, res) => {
  try {
    // Get random fresh items as recommendations
    const recommendations = await Inventory.find({ freshnessStatus: 'fresh' })
      .limit(8)
      .populate('supplierId', 'name boatId');
    
    // Add rating fields for compatibility with frontend
    const enrichedRecommendations = recommendations.map(item => ({
      ...item.toObject(),
      averageRating: 4 + Math.random(), // Random rating between 4 and 5
      variety: item.fishName // Use fishName as variety for now
    }));
    
    res.json(enrichedRecommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;