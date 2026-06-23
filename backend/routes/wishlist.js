const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Get user's wishlist
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist.inventoryId');
    
    // Enrich wishlist items with full inventory details
    const enrichedItems = user.wishlist.map(item => {
      if (item.inventoryId) {
        return {
          ...item.toObject(),
          ...item.inventoryId.toObject()
        };
      }
      return item;
    });
    
    res.json({ items: enrichedItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add item to wishlist
router.post('/add', protect, async (req, res) => {
  try {
    const { itemId } = req.body;
    
    // Get inventory item
    const inventory = await Inventory.findById(itemId);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const user = await User.findById(req.user._id);
    
    // Check if item already exists in wishlist
    const existingItem = user.wishlist.find(item => item.inventoryId.toString() === itemId);
    
    if (!existingItem) {
      user.wishlist.push({
        inventoryId: itemId,
        fishName: inventory.fishName,
        variety: inventory.fishName,
        category: inventory.category,
        unitPrice: inventory.unitPrice,
        freshnessStatus: inventory.freshnessStatus,
        addedAt: new Date()
      });
      
      await user.save();
    }
    
    const updatedUser = await User.findById(req.user._id).populate('wishlist.inventoryId');
    const enrichedItems = updatedUser.wishlist.map(item => {
      if (item.inventoryId) {
        return {
          ...item.toObject(),
          ...item.inventoryId.toObject()
        };
      }
      return item;
    });
    
    res.json({ items: enrichedItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove item from wishlist
router.delete('/:itemId', protect, async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(item => item.inventoryId.toString() !== itemId);
    
    await user.save();
    const updatedUser = await User.findById(req.user._id).populate('wishlist.inventoryId');
    const enrichedItems = updatedUser.wishlist.map(item => {
      if (item.inventoryId) {
        return {
          ...item.toObject(),
          ...item.inventoryId.toObject()
        };
      }
      return item;
    });
    
    res.json({ items: enrichedItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear wishlist
router.delete('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = [];
    await user.save();
    res.json({ items: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;