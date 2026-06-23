const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const Inventory = require('../models/Inventory');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// Specific routes must come before parameterized routes

// Get supplier dashboard metrics
router.get('/dashboard/metrics', protect, async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ userId: req.user._id });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier profile not found' });
    }

    const inventoryItems = await Inventory.find({ supplierId: supplier._id });
    
    const totalCatches = inventoryItems.length;
    const totalStock = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
    
    const orders = await Order.find({
      'items.inventoryId': { $in: inventoryItems.map(item => item._id) }
    });
    
    const acceptedOrders = orders.filter(order => 
      ['confirmed', 'processing', 'dispatched', 'delivered'].includes(order.status)
    ).length;
    
    const totalEarnings = orders.reduce((sum, order) => {
      const supplierItems = order.items.filter(item => {
        const inventoryItem = inventoryItems.find(inv => inv._id.toString() === item.inventoryId.toString());
        return inventoryItem !== undefined;
      });
      return sum + supplierItems.reduce((itemSum, item) => itemSum + item.totalPrice, 0);
    }, 0);

    res.json({
      totalCatches,
      totalStock,
      acceptedOrders,
      totalEarnings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get supplier dashboard activity feed
router.get('/dashboard/activity', protect, async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ userId: req.user._id });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier profile not found' });
    }

    const inventoryItems = await Inventory.find({ supplierId: supplier._id });
    
    const recentOrders = await Order.find({
      'items.inventoryId': { $in: inventoryItems.map(item => item._id) }
    })
    .sort({ orderDate: -1 })
    .limit(10);

    const activityFeed = recentOrders.map(order => {
      const supplierItems = order.items.filter(item => {
        const inventoryItem = inventoryItems.find(inv => inv._id.toString() === item.inventoryId.toString());
        return inventoryItem !== undefined;
      });
      
      const firstItem = supplierItems[0];
      const statusEmoji = order.status === 'delivered' ? 'accepted' : 
                         order.status === 'rejected' ? 'rejected' : 'info';
      
      return {
        id: order._id,
        type: statusEmoji,
        fish: firstItem ? firstItem.fishName : 'Mixed',
        quantity: firstItem ? `${firstItem.quantity}kg` : null,
        date: new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        message: `Your ${firstItem ? firstItem.fishName : 'order'} (${firstItem ? firstItem.quantity : 0}kg) was ${order.status.toUpperCase()}`
      };
    });

    res.json(activityFeed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get supplier catches
router.get('/catches', protect, async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ userId: req.user._id });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier profile not found' });
    }

    const inventoryItems = await Inventory.find({ supplierId: supplier._id })
      .sort({ dateReceived: -1 })
      .limit(10);

    const catches = inventoryItems.map(item => ({
      id: item._id,
      fishName: item.fishName,
      quantity: `${item.quantity}kg`,
      date: new Date(item.dateReceived).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      status: item.freshnessStatus === 'fresh' ? 'accepted' : 
              item.freshnessStatus === 'good' ? 'accepted' : 
              item.freshnessStatus === 'fair' ? 'pending' : 'rejected',
      pricePerKg: item.unitPrice
    }));

    res.json(catches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit new catch (supplier only)
router.post('/catches', protect, async (req, res) => {
  console.log('POST /suppliers/catches called');
  console.log('Request body:', req.body);
  console.log('User:', req.user);
  
  try {
    let supplier = await Supplier.findOne({ userId: req.user._id });
    
    if (!supplier) {
      console.log('Creating supplier profile for user:', req.user._id);
      supplier = await Supplier.create({
        name: req.user.name,
        contactNumber: req.user.contact || 'Not provided',
        fishingArea: 'Default Area',
        boatId: `B-${Date.now().toString().slice(-6)}`,
        userId: req.user._id
      });
    }

    const { fishName, category, quantity, expectedPrice, dateCaught, freshnessLevel, additionalNotes } = req.body;

    if (!fishName || !quantity || !expectedPrice) {
      return res.status(400).json({ message: 'Fish name, quantity, and price are required' });
    }

    const inventoryItem = await Inventory.create({
      fishName,
      category,
      quantity: parseFloat(quantity),
      unitPrice: parseFloat(expectedPrice),
      freshnessStatus: freshnessLevel,
      dateReceived: new Date(dateCaught),
      supplierId: supplier._id,
      description: additionalNotes || ''
    });

    console.log('Inventory item created:', inventoryItem);
    res.status(201).json(inventoryItem);
  } catch (error) {
    console.error('Error creating catch:', error);
    res.status(500).json({ message: error.message || 'Failed to submit catch' });
  }
});

// Get supplier earnings
router.get('/earnings', protect, async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ userId: req.user._id });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier profile not found' });
    }

    const inventoryItems = await Inventory.find({ supplierId: supplier._id });
    
    const orders = await Order.find({
      'items.inventoryId': { $in: inventoryItems.map(item => item._id) }
    });

    const earningsByFish = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const inventoryItem = inventoryItems.find(inv => inv._id.toString() === item.inventoryId.toString());
        if (inventoryItem) {
          const fishName = inventoryItem.fishName;
          if (!earningsByFish[fishName]) {
            earningsByFish[fishName] = { fish: fishName, quantity: 0, rate: inventoryItem.unitPrice, earned: 0 };
          }
          earningsByFish[fishName].quantity += item.quantity;
          earningsByFish[fishName].earned += item.totalPrice;
        }
      });
    });

    res.json(Object.values(earningsByFish));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get supplier profile
router.get('/profile', protect, async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ userId: req.user._id }).populate('userId', 'name email contact');
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier profile not found' });
    }

    const user = await User.findById(req.user._id).select('-password');

    res.json({
      fullName: user.name,
      email: user.email,
      phone: user.contact,
      fishingArea: supplier.fishingArea,
      boatId: supplier.boatId,
      boatName: supplier.boatId,
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: false,
      language: 'english'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update supplier profile
router.put('/profile', protect, async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ userId: req.user._id });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier profile not found' });
    }

    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.fullName || user.name;
      user.email = req.body.email || user.email;
      user.contact = req.body.phone || user.contact;
      await user.save();
    }

    supplier.fishingArea = req.body.fishingArea || supplier.fishingArea;
    supplier.boatId = req.body.boatId || supplier.boatId;
    supplier.boatId = req.body.boatName || supplier.boatId;
    await supplier.save();

    res.json({
      fullName: user.name,
      email: user.email,
      phone: user.contact,
      fishingArea: supplier.fishingArea,
      boatId: supplier.boatId,
      boatName: supplier.boatId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get supplier statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ userId: req.user._id });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier profile not found' });
    }

    const inventoryItems = await Inventory.find({ supplierId: supplier._id });
    
    const orders = await Order.find({
      'items.inventoryId': { $in: inventoryItems.map(item => item._id) }
    });

    const totalCatches = inventoryItems.length;
    const acceptedCatches = inventoryItems.filter(item => item.freshnessStatus === 'fresh').length;
    const rejectedCatches = inventoryItems.filter(item => item.freshnessStatus === 'poor').length;
    const totalEarned = orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => {
        const inventoryItem = inventoryItems.find(inv => inv._id.toString() === item.inventoryId.toString());
        return inventoryItem ? itemSum + item.totalPrice : itemSum;
      }, 0);
    }, 0);

    const stats = {
      acceptanceRate: totalCatches > 0 ? Math.round((acceptedCatches / totalCatches) * 100) : 0,
      rejectionRate: totalCatches > 0 ? Math.round((rejectedCatches / totalCatches) * 100) : 0,
      avgResponseTime: 4.2,
      totalEarned,
      pendingPayment: 0,
      totalCatches,
      acceptedCatches,
      rejectedCatches
    };

    const earnings = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthDate.toLocaleString('default', { month: 'short' });
      earnings.push({ month: monthName, value: Math.floor(totalEarned / 6) });
    }

    const volume = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthDate.toLocaleString('default', { month: 'short' });
      const monthlyQuantity = inventoryItems.reduce((sum, item) => sum + item.quantity, 0) / 6;
      volume.push({ month: monthName, value: Math.floor(monthlyQuantity) });
    }

    const topCatches = inventoryItems
      .map(item => ({
        fish: item.fishName,
        qty: item.quantity,
        earnings: item.quantity * item.unitPrice,
        status: item.freshnessStatus === 'fresh' ? 'All Accepted' : 
                item.freshnessStatus === 'good' ? 'Mostly Accepted' : 'Mixed'
      }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 4)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    res.json({
      stats,
      earnings,
      volume,
      topCatches
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search suppliers
router.get('/search/:query', protect, async (req, res) => {
  try {
    const suppliers = await Supplier.find({
      $or: [
        { name: { $regex: req.params.query, $options: 'i' } },
        { boatId: { $regex: req.params.query, $options: 'i' } },
        { fishingArea: { $regex: req.params.query, $options: 'i' } }
      ]
    });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Parameterized routes (must come after specific routes)

// Get all suppliers
router.get('/', protect, async (req, res) => {
  try {
    const suppliers = await Supplier.find({}).populate('userId', 'name email contact');
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single supplier
router.get('/:id', protect, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id).populate('userId', 'name email contact');
    if (supplier) {
      res.json(supplier);
    } else {
      res.status(404).json({ message: 'Supplier not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create supplier
router.post('/', protect, admin, async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update supplier
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (supplier) {
      supplier.name = req.body.name || supplier.name;
      supplier.contactNumber = req.body.contactNumber || supplier.contactNumber;
      supplier.fishingArea = req.body.fishingArea || supplier.fishingArea;
      supplier.boatId = req.body.boatId || supplier.boatId;
      supplier.active = req.body.active !== undefined ? req.body.active : supplier.active;
      
      const updatedSupplier = await supplier.save();
      res.json(updatedSupplier);
    } else {
      res.status(404).json({ message: 'Supplier not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete supplier
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (supplier) {
      await supplier.deleteOne();
      res.json({ message: 'Supplier removed' });
    } else {
      res.status(404).json({ message: 'Supplier not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
