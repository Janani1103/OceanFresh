# OceanFresh - Fisheries & Seafood Supply Chain Management System

A comprehensive MERN stack application for managing fisheries and seafood supply chain operations with role-based access control, real-time inventory tracking, and advanced analytics.

## 🎨 Theme
- **Primary Color**: AliceBlue (#F0F8FF)
- **Accent Colors**: Dark blue ocean tones
- **Design**: Modern, responsive, and user-friendly interface

## 🚀 Features

### For Admins
- ✅ Dashboard with real-time analytics
- ✅ Supplier management (CRUD operations)
- ✅ Inventory management with freshness tracking
- ✅ Order management and status tracking
- ✅ Customer management
- ✅ Comprehensive reports and analytics
- ✅ Role-based access control

### For Suppliers
- ✅ Profile management
- ✅ Catch details submission
- ✅ Contribution tracking

### For Customers
- ✅ Product browsing
- ✅ Shopping cart functionality
- ✅ Order placement
- ✅ Order tracking
- ✅ Purchase history

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **cors** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🚀 Installation

### 1. Clone the repository
```bash
cd OceanFresh
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Configure environment variables in `backend/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/oceanfresh
JWT_SECRET=your_jwt_secret_key_here
```

Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Configure environment variables in `frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/:id` - Delete user (admin only)

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/:id` - Get single supplier
- `POST /api/suppliers` - Create supplier (admin only)
- `PUT /api/suppliers/:id` - Update supplier (admin only)
- `DELETE /api/suppliers/:id` - Delete supplier (admin only)
- `GET /api/suppliers/search/:query` - Search suppliers

### Inventory
- `GET /api/inventory` - Get all inventory
- `GET /api/inventory/:id` - Get single item
- `POST /api/inventory` - Create inventory item (admin only)
- `PUT /api/inventory/:id` - Update inventory item (admin only)
- `DELETE /api/inventory/:id` - Delete inventory item (admin only)
- `GET /api/inventory/search/:query` - Search inventory

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status (admin only)
- `DELETE /api/orders/:id` - Delete order (admin only)

### Reports
- `GET /api/reports/dashboard` - Get dashboard statistics (admin only)
- `GET /api/reports/sales/monthly` - Get monthly sales (admin only)
- `GET /api/reports/sales/top-products` - Get top selling products (admin only)
- `GET /api/reports/suppliers/contributions` - Get supplier contributions (admin only)
- `GET /api/reports/inventory` - Get inventory report (admin only)

## 👥 User Roles

### Admin
- Full access to all features
- Can manage suppliers, inventory, orders, and customers
- Can view comprehensive reports and analytics

### Supplier
- Can view and manage their profile
- Can add catch details
- Can view their contribution statistics

### Customer
- Can browse products
- Can place orders
- Can track their orders
- Can view purchase history

## 📊 Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String ('admin', 'supplier', 'customer'),
  contact: String,
  address: String,
  createdAt: Date
}
```

### Suppliers Collection
```javascript
{
  name: String,
  contactNumber: String,
  fishingArea: String,
  boatId: String (unique),
  userId: ObjectId (ref: User),
  totalCatch: Number,
  active: Boolean,
  createdAt: Date
}
```

### Inventory Collection
```javascript
{
  fishName: String,
  category: String ('finfish', 'shellfish', 'crustaceans', 'mollusks', 'other'),
  quantity: Number (kg),
  unitPrice: Number,
  dateReceived: Date,
  freshnessStatus: String ('fresh', 'good', 'fair', 'poor'),
  supplierId: ObjectId (ref: Supplier),
  createdAt: Date
}
```

### Orders Collection
```javascript
{
  customerId: ObjectId (ref: User),
  items: [{
    inventoryId: ObjectId (ref: Inventory),
    fishName: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  totalAmount: Number,
  status: String ('pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'rejected'),
  deliveryAddress: String,
  orderDate: Date,
  deliveryDate: Date
}
```

## 🎯 Project Structure

```
OceanFresh/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Supplier.js
│   │   ├── Inventory.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── suppliers.js
│   │   ├── inventory.js
│   │   ├── orders.js
│   │   └── reports.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── DashboardSidebar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SuppliersPage.jsx
│   │   │   ├── InventoryPage.jsx
│   │   │   ├── OrdersPage.jsx
│   │   │   └── ReportsPage.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control (RBAC)
- Protected API routes
- CORS enabled for secure cross-origin requests

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile devices

## 🎓 Features That Impress

✅ JWT Authentication
✅ Role-Based Access Control
✅ Dashboard Analytics
✅ Search & Filtering
✅ Responsive UI
✅ Chart.js Reports (Recharts)
✅ REST APIs
✅ MongoDB CRUD Operations
✅ Real-time Inventory Tracking
✅ Delivery Status Tracking
✅ Mobile Responsive Design

## 🚀 Usage

1. **Start MongoDB**: Make sure MongoDB is running on your system
2. **Start Backend**: `cd backend && npm run dev`
3. **Start Frontend**: `cd frontend && npm run dev`
4. **Open Browser**: Navigate to `http://localhost:5173`

## � Application Screenshots

### Landing & Authentication

**Home Page**
![Home Page](ReadME_Images/home.jpeg)

**Login Page**
![Login Page](ReadME_Images/login.jpeg)

**Registration Page**
![Registration Page](ReadME_Images/register.jpeg)

### Admin Dashboard

**Admin Dashboard Overview**
![Admin Dashboard](ReadME_Images/admin.jpeg)

**Supplier Management**
![Supplier Management](ReadME_Images/a-suppliers.jpeg)

**Add New Supplier**
![Add Supplier](ReadME_Images/addSupplier.jpeg)

**Inventory Management**
![Inventory Management](ReadME_Images/a-inventory.jpeg)

**Customer Management**
![Customer Management](ReadME_Images/a-customers.jpeg)

**Order & Delivery Management**
![Delivery Management](ReadME_Images/a-delivery.jpeg)

**Delivery Timeline**
![Delivery Timeline](ReadME_Images/a-deliveryTimeline.jpeg)

**Reports & Analytics**
![Reports](ReadME_Images/a-reports.jpeg)

### Customer Portal

**Customer Dashboard**
![Customer Dashboard](ReadME_Images/customer.jpeg)

**Browse Products**
![Browse Products](ReadME_Images/c-browse.jpeg)

**Shopping Cart**
![Shopping Cart](ReadME_Images/c-cart.jpeg)

**Checkout**
![Checkout](ReadME_Images/c-checkout.jpeg)

**Order Tracking**
![Order Tracking](ReadME_Images/c-liveTrack.jpeg)

**Order History**
![Order History](ReadME_Images/c-orders.jpeg)

### Supplier Portal

**Supplier Dashboard**
![Supplier Dashboard](ReadME_Images/supplier.jpeg)

**View Catches**
![View Catches](ReadME_Images/s-catches.jpeg)

**Add New Catch**
![Add Catch](ReadME_Images/s-addCatch.jpeg)

## �👤 Default Admin Access

After registration, you can create an admin user by selecting "admin" role during registration, or manually update a user's role in the database.

## 📄 License

This project is created for educational purposes.

## 👨‍💻 Development

This project was developed as a comprehensive solution for fisheries and seafood supply chain management, demonstrating full-stack development skills with the MERN stack.

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check the connection string in `.env`
- Verify MongoDB is accessible on the specified port

### Frontend Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version compatibility

### API Connection Errors
- Verify backend is running
- Check API URL in frontend `.env`
- Ensure CORS is properly configured

## 📞 Support

For issues or questions, please refer to the project documentation or contact the development team.#   O c e a n F r e s h 
 
 