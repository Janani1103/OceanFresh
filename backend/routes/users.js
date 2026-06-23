const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.contact = req.body.contact || user.contact;
      if (req.body.address) {
        user.address = {
          street: req.body.address.street || user.address?.street,
          city: req.body.address.city || user.address?.city,
          zip: req.body.address.zip || user.address?.zip
        };
      }
      if (req.body.password) {
        user.password = req.body.password;
      }
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all customers (admin only)
router.get('/customers', protect, admin, async (req, res) => {
  try {
    const { search } = req.query;
    let query = { role: 'customer' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } }
      ];
    }
    
    const customers = await User.find(query).select('-password').sort({ createdAt: -1 });
    
    // Add order count to each customer
    const customersWithOrderCount = await Promise.all(
      customers.map(async (customer) => {
        const orderCount = await Order.countDocuments({ customerId: customer._id });
        return {
          ...customer.toObject(),
          orderCount
        };
      })
    );
    
    res.json(customersWithOrderCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get customer profile with order history (admin only)
router.get('/customers/:id/profile', protect, admin, async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    if (customer.role !== 'customer') {
      return res.status(400).json({ message: 'User is not a customer' });
    }
    
    // Get order count
    const orderCount = await Order.countDocuments({ customerId: customer._id });
    
    // Get order history
    const orders = await Order.find({ customerId: customer._id })
      .sort({ orderDate: -1 })
      .select('orderId totalAmount orderDate status');
    
    res.json({
      customer: {
        ...customer.toObject(),
        orderCount
      },
      orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Customer-specific endpoints
router.get('/customers/dashboard', protect, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get customer's orders
    const orders = await Order.find({ customerId: req.user._id })
      .sort({ orderDate: -1 });

    const totalOrders = orders.length;
    const activeOrders = orders.filter(order => 
      ['pending', 'confirmed', 'processing', 'dispatched'].includes(order.status)
    ).length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Get most recent active order
    const activeOrder = orders.find(order => 
      ['pending', 'confirmed', 'processing', 'dispatched'].includes(order.status)
    );

    // Calculate monthly spending (last 6 months)
    const monthlySpending = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthDate.toLocaleString('default', { month: 'short' });
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate.getMonth() === monthDate.getMonth() && 
               orderDate.getFullYear() === monthDate.getFullYear();
      });
      const spending = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      monthlySpending.push({ month: monthName, spending });
    }

    // Calculate top buys by fish type
    const fishCounts = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!fishCounts[item.fishName]) {
          fishCounts[item.fishName] = 0;
        }
        fishCounts[item.fishName] += item.quantity;
      });
    });

    const totalQuantity = Object.values(fishCounts).reduce((sum, qty) => sum + qty, 0);
    const topBuys = Object.entries(fishCounts)
      .map(([name, quantity]) => ({
        name,
        percentage: (quantity / totalQuantity) * 100,
        color: '#0ea5e9' // Default color
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);

    // Assign different colors to top buys
    const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    topBuys.forEach((buy, index) => {
      buy.color = colors[index % colors.length];
    });

    // Get recent orders
    const recentOrders = orders.slice(0, 4).map(order => ({
      orderId: order.orderId,
      items: order.items.map(item => item.fishName).join(','),
      total: order.totalAmount,
      date: new Date(order.orderDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      status: order.status
    }));

    res.json({
      stats: {
        totalOrders,
        activeOrders,
        totalSpent,
        loyaltyPoints: Math.floor(totalSpent / 10) // Simple loyalty calculation
      },
      activeOrder: activeOrder ? {
        orderId: activeOrder.orderId,
        items: activeOrder.items.map(item => `${item.fishName}(${item.quantity}kg)`).join(','),
        total: activeOrder.totalAmount,
        status: activeOrder.status,
        orderDate: new Date(activeOrder.orderDate).toISOString().split('T')[0]
      } : null,
      monthlySpending,
      topBuys,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/customers/profile', protect, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findById(req.user._id).select('-password');
    
    // Get customer's orders for stats
    const orders = await Order.find({ customerId: req.user._id });
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({
      name: user.name,
      email: user.email,
      contact: user.contact,
      address: user.address || {
        street: '',
        city: '',
        zip: ''
      },
      stats: {
        totalOrders,
        totalSpent,
        loyaltyPoints: Math.floor(totalSpent / 10),
        memberSince: new Date(user.createdAt).toISOString().split('T')[0]
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/customers/addresses', protect, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findById(req.user._id).select('-password');
    
    // For now, return the user's address as a single address
    // In a full implementation, you might want to add an addresses array to the User model
    const addresses = user.address ? [{
      _id: user._id,
      street: user.address.street || '',
      city: user.address.city || '',
      zip: user.address.zip || '',
      phone: user.contact || '',
      isDefault: true
    }] : [];

    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/customers/profile', protect, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.contact = req.body.contact || user.contact;
      if (req.body.address) {
        user.address = {
          street: req.body.address.street || user.address?.street,
          city: req.body.address.city || user.address?.city,
          zip: req.body.address.zip || user.address?.zip
        };
      }
      
      if (req.body.currentPassword && req.body.newPassword) {
        // In production, you should verify the current password before changing
        user.password = req.body.newPassword;
      }
      
      const updatedUser = await user.save();
      res.json({
        name: updatedUser.name,
        email: updatedUser.email,
        contact: updatedUser.contact,
        address: updatedUser.address
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/customers/addresses', protect, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findById(req.user._id).select('-password');
    
    // For now, return the user's address as a single saved address
    // In production, you might want to add an addresses array to the User schema
    const addresses = [];
    if (user.address) {
      addresses.push({
        _id: user._id,
        street: user.address,
        city: 'Unknown', // Parse from address if needed
        zip: 'Unknown', // Parse from address if needed
        phone: user.contact || '',
        isDefault: true
      });
    }
    
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;