const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Supplier = require('./models/Supplier');
const Inventory = require('./models/Inventory');
const Order = require('./models/Order');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/oceanfresh')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.log('MongoDB Connection Error:', err);
    process.exit(1);
  });

const seedDatabase = async () => {
  try {
    await User.deleteMany({});
    await Supplier.deleteMany({});
    await Inventory.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing data');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@ocean.com',
      password: 'admin123',
      role: 'admin',
      contact: '0771234567',
      address: 'Colombo, Sri Lanka'
    });
    console.log('✅ Admin user created');

    const supplier1 = await Supplier.create({
      name: "John's Fishing Co.",
      contactNumber: '0772345678',
      fishingArea: 'Negombo, Sri Lanka',
      boatId: 'BOAT001'
    });

    const supplier2 = await Supplier.create({
      name: 'Ocean Harvest Ltd',
      contactNumber: '0773456789',
      fishingArea: 'Trincomalee, Sri Lanka',
      boatId: 'BOAT002'
    });

    const supplier3 = await Supplier.create({
      name: 'Bay Catchers',
      contactNumber: '0774567890',
      fishingArea: 'Galle, Sri Lanka',
      boatId: 'BOAT003'
    });
    console.log('✅ 3 suppliers created');

    const inventory1 = await Inventory.create({
      fishName: 'Yellowfin Tuna',
      category: 'finfish',
      quantity: 500,
      unitPrice: 1500,
      supplierId: supplier1._id,
      dateReceived: new Date('2026-06-08'),
      freshnessStatus: 'fresh'
    });

    const inventory2 = await Inventory.create({
      fishName: 'Indian Mackerel',
      category: 'finfish',
      quantity: 800,
      unitPrice: 400,
      supplierId: supplier1._id,
      dateReceived: new Date('2026-06-09'),
      freshnessStatus: 'fresh'
    });

    const inventory3 = await Inventory.create({
      fishName: 'Tiger Prawns',
      category: 'crustaceans',
      quantity: 300,
      unitPrice: 2500,
      supplierId: supplier2._id,
      dateReceived: new Date('2026-06-08'),
      freshnessStatus: 'fresh'
    });

    const inventory4 = await Inventory.create({
      fishName: 'Mud Crab',
      category: 'crustaceans',
      quantity: 150,
      unitPrice: 3000,
      supplierId: supplier2._id,
      dateReceived: new Date('2026-06-09'),
      freshnessStatus: 'fresh'
    });

    const inventory5 = await Inventory.create({
      fishName: 'Swordfish',
      category: 'finfish',
      quantity: 200,
      unitPrice: 3500,
      supplierId: supplier3._id,
      dateReceived: new Date('2026-06-07'),
      freshnessStatus: 'good'
    });
    console.log('✅ 5 inventory items created');

    const customer1 = await User.create({
      name: 'Nimal Perera',
      email: 'nimal@gmail.com',
      password: 'customer123',
      role: 'customer',
      contact: '0712345678',
      address: 'Kandy, Sri Lanka'
    });

    const customer2 = await User.create({
      name: 'Kamala Silva',
      email: 'kamala@gmail.com',
      password: 'customer123',
      role: 'customer',
      contact: '0713456789',
      address: 'Gampaha, Sri Lanka'
    });

    const customer3 = await User.create({
      name: 'Kasun Perera',
      email: 'kasun@gmail.com',
      password: 'customer123',
      role: 'customer',
      contact: '0771234567',
      address: 'Colombo, Sri Lanka'
    });

    const customer4 = await User.create({
      name: 'Priyanka Jayasinghe',
      email: 'priyanka@gmail.com',
      password: 'customer123',
      role: 'customer',
      contact: '0772345678',
      address: 'Moratuwa, Sri Lanka'
    });

    const customer5 = await User.create({
      name: 'Ruwan Fernando',
      email: 'ruwan@gmail.com',
      password: 'customer123',
      role: 'customer',
      contact: '0773456789',
      address: 'Negombo, Sri Lanka'
    });
    console.log('✅ 5 customers created');

    const order1 = await Order.create({
      orderId: 'ORD202606100001',
      customerId: customer1._id,
      items: [
        {
          inventoryId: inventory1._id,
          fishName: 'Yellowfin Tuna',
          quantity: 10,
          unitPrice: 1500,
          totalPrice: 15000
        },
        {
          inventoryId: inventory3._id,
          fishName: 'Tiger Prawns',
          quantity: 5,
          unitPrice: 2500,
          totalPrice: 12500
        }
      ],
      totalAmount: 27500,
      status: 'delivered',
      deliveryAddress: 'Kandy, Sri Lanka',
      orderDate: new Date('2026-06-01'),
      deliveryDate: new Date('2026-06-03')
    });

    const order2 = await Order.create({
      orderId: 'ORD202606100002',
      customerId: customer2._id,
      items: [
        {
          inventoryId: inventory2._id,
          fishName: 'Indian Mackerel',
          quantity: 20,
          unitPrice: 400,
          totalPrice: 8000
        }
      ],
      totalAmount: 8000,
      status: 'pending',
      deliveryAddress: 'Gampaha, Sri Lanka',
      orderDate: new Date('2026-06-10')
    });

    const order3 = await Order.create({
      orderId: 'ORD202606100003',
      customerId: customer1._id,
      items: [
        {
          inventoryId: inventory4._id,
          fishName: 'Mud Crab',
          quantity: 8,
          unitPrice: 3000,
          totalPrice: 24000
        }
      ],
      totalAmount: 24000,
      status: 'confirmed',
      deliveryAddress: 'Kandy, Sri Lanka',
      orderDate: new Date('2026-06-09')
    });

    const order4 = await Order.create({
      orderId: 'ORD202606100004',
      customerId: customer3._id,
      items: [
        {
          inventoryId: inventory1._id,
          fishName: 'Yellowfin Tuna',
          quantity: 15,
          unitPrice: 1500,
          totalPrice: 22500
        }
      ],
      totalAmount: 22500,
      status: 'delivered',
      deliveryAddress: 'Colombo, Sri Lanka',
      orderDate: new Date('2026-06-05'),
      deliveryDate: new Date('2026-06-07')
    });

    const order5 = await Order.create({
      orderId: 'ORD202606100005',
      customerId: customer3._id,
      items: [
        {
          inventoryId: inventory3._id,
          fishName: 'Tiger Prawns',
          quantity: 10,
          unitPrice: 2500,
          totalPrice: 25000
        },
        {
          inventoryId: inventory4._id,
          fishName: 'Mud Crab',
          quantity: 5,
          unitPrice: 3000,
          totalPrice: 15000
        }
      ],
      totalAmount: 40000,
      status: 'delivered',
      deliveryAddress: 'Colombo, Sri Lanka',
      orderDate: new Date('2026-06-02'),
      deliveryDate: new Date('2026-06-04')
    });

    const order6 = await Order.create({
      orderId: 'ORD202606100006',
      customerId: customer4._id,
      items: [
        {
          inventoryId: inventory5._id,
          fishName: 'Swordfish',
          quantity: 6,
          unitPrice: 3500,
          totalPrice: 21000
        }
      ],
      totalAmount: 21000,
      status: 'processing',
      deliveryAddress: 'Moratuwa, Sri Lanka',
      orderDate: new Date('2026-06-08')
    });
    console.log('✅ 6 orders created');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Admin credentials:');
    console.log('Email: admin@ocean.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    
    console.log('\n📋 Customer credentials:');
    console.log('Email: nimal@gmail.com');
    console.log('Password: customer123');
    console.log('Role: customer');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
