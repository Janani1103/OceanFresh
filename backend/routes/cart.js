const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const { protect } = require('../middleware/auth');

const userCarts = new Map();

router.get('/', protect, async (req, res) => {
  try {
    const userCart = userCarts.get(req.user._id.toString()) || [];
    res.json({ items: userCart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/add', protect, async (req, res) => {
  try {
    const { itemId, quantity } = req.body;

    const inventory = await Inventory.findById(itemId);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    let cart = userCarts.get(req.user._id.toString()) || [];

    const existingItemIndex = cart.findIndex(item => item.inventoryId === itemId);

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push({
        inventoryId: itemId,
        fishName: inventory.fishName,
        variety: inventory.fishName,
        category: inventory.category,
        quantity: quantity,
        unitPrice: inventory.unitPrice,
        freshnessStatus: inventory.freshnessStatus
      });
    }

    userCarts.set(req.user._id.toString(), cart);
    res.json({ items: cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/update', protect, async (req, res) => {
  try {
    const { itemId, quantity } = req.body;

    let cart = userCarts.get(req.user._id.toString()) || [];

    const itemIndex = cart.findIndex(item => item.inventoryId === itemId);
    if (itemIndex > -1) {
      cart[itemIndex].quantity = quantity;
      userCarts.set(req.user._id.toString(), cart);
      res.json({ items: cart });
    } else {
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:itemId', protect, async (req, res) => {
  try {
    const { itemId } = req.params;

    let cart = userCarts.get(req.user._id.toString()) || [];
    cart = cart.filter(item => item.inventoryId !== itemId);

    userCarts.set(req.user._id.toString(), cart);
    res.json({ items: cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/', protect, async (req, res) => {
  try {
    userCarts.delete(req.user._id.toString());
    res.json({ items: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;