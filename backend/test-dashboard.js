const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('./models/Order');
const Inventory = require('./models/Inventory');
const Supplier = require('./models/Supplier');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/oceanfresh')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.log('MongoDB Connection Error:', err);
    process.exit(1);
  });

const testDashboardData = async () => {
  try {
    console.log('\n=== Testing Dashboard Data ===\n');

    // Test 1: Total Stock
    const totalStock = await Inventory.aggregate([
      { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } }
    ]);
    console.log('Total Stock:', totalStock[0]?.totalQuantity || 0, 'kg');

    // Test 2: Total Suppliers
    const totalSuppliers = await Supplier.countDocuments();
    console.log('Total Suppliers:', totalSuppliers);

    // Test 3: Total Customers
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    console.log('Total Customers:', totalCustomers);

    // Test 4: Total Orders
    const totalOrders = await Order.countDocuments();
    console.log('Total Orders:', totalOrders);

    // Test 5: Monthly Sales
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
    console.log('Monthly Sales (delivered/dispatched): Rs', monthlySales[0]?.total || 0);

    // Test 6: Monthly Sales Data
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
    console.log('\nMonthly Sales Data:');
    salesByMonth.forEach(item => {
      console.log(`  ${item._id.month}/${item._id.year}: Rs ${item.total} (${item.count} orders)`);
    });

    // Test 7: Category Distribution
    const categoryDistribution = await Inventory.aggregate([
      {
        $group: {
          _id: '$category',
          totalQuantity: { $sum: '$quantity' }
        }
      },
      { $sort: { totalQuantity: -1 } }
    ]);
    console.log('\nCategory Distribution:');
    categoryDistribution.forEach(item => {
      console.log(`  ${item._id}: ${item.totalQuantity} kg`);
    });

    // Test 8: Recent Orders
    const recentOrders = await Order.find()
      .sort({ orderDate: -1 })
      .limit(5)
      .populate('customerId', 'name email')
      .select('orderId customerId totalAmount status orderDate');
    console.log('\nRecent Orders:');
    recentOrders.forEach(order => {
      console.log(`  ${order.orderId}: ${order.customerId?.name} - Rs ${order.totalAmount} (${order.status})`);
    });

    console.log('\n=== Dashboard Data Test Complete ===\n');
    process.exit(0);
  } catch (error) {
    console.error('Error testing dashboard data:', error);
    process.exit(1);
  }
};

testDashboardData();