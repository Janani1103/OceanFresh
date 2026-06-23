const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const Supplier = require('../models/Supplier');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

router.get('/dashboard', protect, admin, async (req, res) => {
  try {
    const totalStock = await Inventory.aggregate([
      { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } }
    ]);

    const totalSuppliers = await Supplier.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalOrders = await Order.countDocuments();

    const monthlySales = await Order.aggregate([
      {
        $match: {
          status: { $in: ['delivered', 'dispatched'] },
          orderDate: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      totalStock: totalStock[0]?.totalQuantity || 0,
      totalSuppliers,
      totalCustomers,
      totalOrders,
      monthlySales: monthlySales[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/sales/monthly', protect, admin, async (req, res) => {
  try {
    const salesByMonth = await Order.aggregate([
      {
        $match: {
          status: { $in: ['delivered', 'dispatched'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$orderDate' },
            month: { $month: '$orderDate' }
          },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json(salesByMonth);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/sales/top-products', protect, admin, async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      {
        $match: {
          status: { $in: ['delivered', 'dispatched'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.fishName',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/suppliers/contributions', protect, admin, async (req, res) => {
  try {
    const supplierContributions = await Inventory.aggregate([
      {
        $group: {
          _id: '$supplierId',
          totalQuantity: { $sum: '$quantity' },
          itemCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'suppliers',
          localField: '_id',
          foreignField: '_id',
          as: 'supplier'
        }
      },
      { $unwind: '$supplier' },
      {
        $project: {
          supplierName: '$supplier.name',
          boatId: '$supplier.boatId',
          totalQuantity: 1,
          itemCount: 1
        }
      },
      { $sort: { totalQuantity: -1 } }
    ]);

    res.json(supplierContributions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/inventory', protect, admin, async (req, res) => {
  try {
    const inventoryReport = await Inventory.aggregate([
      {
        $group: {
          _id: '$category',
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$unitPrice'] } },
          itemCount: { $sum: 1 }
        }
      }
    ]);

    res.json(inventoryReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/recent-orders', protect, admin, async (req, res) => {
  try {
    const recentOrders = await Order.find()
      .sort({ orderDate: -1 })
      .limit(10)
      .populate('customerId', 'name email')
      .select('orderId customerId totalAmount status orderDate');
    
    res.json(recentOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/category-distribution', protect, admin, async (req, res) => {
  try {
    const categoryDistribution = await Inventory.aggregate([
      {
        $group: {
          _id: '$category',
          totalQuantity: { $sum: '$quantity' }
        }
      },
      { $sort: { totalQuantity: -1 } }
    ]);

    res.json(categoryDistribution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;