const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const { protect, admin } = require('../middleware/auth');

const generateOrderId = async () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${dateStr}${randomNum}`;
};

router.get('/', protect, async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'admin') {
      orders = await Order.find({}).populate('customerId', 'name email contact');
    } else {
      orders = await Order.find({ customerId: req.user._id }).populate('customerId', 'name email contact');
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/customer/history', protect, async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user._id })
      .populate('customerId', 'name email contact')
      .sort({ orderDate: -1 });

    const transformedOrders = orders.map(order => ({
      _id: order._id,
      orderId: order.orderId,
      items: order.items.map(item => ({
        inventoryId: item.inventoryId,
        fishName: item.fishName,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })),
      totalAmount: order.totalAmount,
      status: order.status,
      orderDate: order.orderDate ? new Date(order.orderDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      deliveryDate: order.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : null,
      deliveryAddress: order.deliveryAddress,
      deliveryFee: 0
    }));

    res.json(transformedOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customerId', 'name email contact');
    if (order) {
      if (order.customerId._id.toString() === req.user._id.toString() || req.user.role === 'admin') {
        res.json(order);
      } else {
        res.status(403).json({ message: 'Not authorized' });
      }
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { items, deliveryAddress } = req.body;

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const inventory = await Inventory.findById(item.inventoryId);
      if (!inventory) {
        return res.status(404).json({ message: `Inventory item ${item.inventoryId} not found` });
      }
      if (inventory.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient quantity for ${inventory.fishName}` });
      }

      const itemTotal = inventory.unitPrice * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        inventoryId: inventory._id,
        fishName: inventory.fishName,
        quantity: item.quantity,
        unitPrice: inventory.unitPrice,
        totalPrice: itemTotal
      });

      inventory.quantity -= item.quantity;
      await inventory.save();
    }

    const orderId = await generateOrderId();
    const order = await Order.create({
      orderId,
      customerId: req.user._id,
      items: orderItems,
      totalAmount,
      deliveryAddress
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = req.body.status || order.status;
      if (req.body.status === 'delivered') {
        order.deliveryDate = Date.now();
      }
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.deleteOne();
      res.json({ message: 'Order removed' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;