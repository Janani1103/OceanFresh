# 🌊 OceanFresh - Fisheries & Seafood Supply Chain Management System

A comprehensive MERN Stack application for managing fisheries and seafood supply chain operations with role-based access control, real-time inventory tracking, and analytics.

## 🎨 Theme

- **Primary Color:** AliceBlue (`#F0F8FF`)
- **Accent Colors:** Dark Blue Ocean Tones
- **Design:** Modern, Responsive, and User-Friendly Interface

---

## 🚀 Features

### 👨‍💼 Admin Features

- Dashboard with real-time analytics
- Supplier management (CRUD operations)
- Inventory management with freshness tracking
- Order management and delivery tracking
- Customer management
- Reports and analytics
- Role-based access control

### 🛥️ Supplier Features

- Profile management
- Catch submission
- Contribution tracking

### 🛒 Customer Features

- Browse seafood products
- Shopping cart functionality
- Place orders
- Track orders
- View purchase history

---

## 🛠️ Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- cors

### Frontend

- React 18
- React Router DOM
- Axios
- Tailwind CSS
- Recharts
- Lucide React

---

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Janani1103/OceanFresh.git

cd OceanFresh
```

### 2. Backend Setup

```bash
cd backend

npm install
```

Create `.env`

```env
PORT=5000

MONGODB_URI=mongodb://localhost:27017/oceanfresh

JWT_SECRET=your_jwt_secret_key_here
```

Start Backend

```bash
npm run dev
```

Backend URL

```text
http://localhost:5000
```

---

### 3. Frontend Setup

```bash
cd frontend

npm install
```

Create `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

Start Frontend

```bash
npm run dev
```

Frontend URL

```text
http://localhost:5173
```

---

## 🌐 API Endpoints

### Authentication

```text
POST /api/auth/register

POST /api/auth/login
```

### Users

```text
GET    /api/users

GET    /api/users/profile

PUT    /api/users/profile

DELETE /api/users/:id
```

### Suppliers

```text
GET    /api/suppliers

GET    /api/suppliers/:id

POST   /api/suppliers

PUT    /api/suppliers/:id

DELETE /api/suppliers/:id

GET    /api/suppliers/search/:query
```

### Inventory

```text
GET    /api/inventory

GET    /api/inventory/:id

POST   /api/inventory

PUT    /api/inventory/:id

DELETE /api/inventory/:id

GET    /api/inventory/search/:query
```

### Orders

```text
GET    /api/orders

GET    /api/orders/:id

POST   /api/orders

PUT    /api/orders/:id/status

DELETE /api/orders/:id
```

### Reports

```text
GET /api/reports/dashboard

GET /api/reports/sales/monthly

GET /api/reports/sales/top-products

GET /api/reports/suppliers/contributions

GET /api/reports/inventory
```

---

## 👥 User Roles

### 👨‍💼 Admin

- Full access to all features
- Manage suppliers
- Manage inventory
- Manage customers
- Manage orders
- View reports

### 🛥️ Supplier

- View profile
- Submit catches
- View contribution statistics

### 🛒 Customer

- Browse products
- Place orders
- Track deliveries
- View purchase history

---

## 📊 Database Collections

```text
users

suppliers

inventory

orders

customers
```

---

## 📁 Project Structure

```text
OceanFresh/

├── backend/

│   ├── models/

│   ├── routes/

│   ├── middleware/

│   ├── server.js

│   └── package.json

│

├── frontend/

│   ├── src/

│   │   ├── components/

│   │   ├── pages/

│   │   ├── context/

│   │   ├── utils/

│   │   ├── App.jsx

│   │   └── main.jsx

│

├── README_Images/

└── README.md
```

---

## 🔐 Security Features

- JWT Authentication
- Password Hashing with bcryptjs
- Role-Based Access Control (RBAC)
- Protected API Routes
- Secure API Access
- CORS Protection

---

## 📱 Responsive Design

Fully optimized for:

- 💻 Desktop
- 📱 Mobile
- 📟 Tablet

---

## ⭐ Features That Impress Lecturers

✅ JWT Authentication

✅ Role-Based Access Control

✅ Dashboard Analytics

✅ Search & Filtering

✅ Responsive UI

✅ Recharts Visualization

✅ REST APIs

✅ MongoDB CRUD Operations

✅ Real-Time Inventory Tracking

✅ Delivery Status Tracking

---

## 📸 Application Screenshots

### Landing & Authentication

| Home | Login | Register |
|------|-------|----------|
| ![](./ReadME_Images/home.jpeg) | ![](./ReadME_Images/login.jpeg) | ![](./ReadME_Images/register.jpeg) |

### Admin Portal

| Dashboard | Suppliers | Inventory |
|-----------|-----------|-----------|
| ![](./ReadME_Images/admin.jpeg) | ![](./ReadME_Images/a-suppliers.jpeg) | ![](./ReadME_Images/a-inventory.jpeg) |

| Customers | Delivery | Reports |
|-----------|----------|---------|
| ![](./ReadME_Images/a-customers.jpeg) | ![](./ReadME_Images/a-delivery.jpeg) | ![](./ReadME_Images/a-reports.jpeg) |

### Customer Portal

| Dashboard | Browse | Cart |
|-----------|--------|------|
| ![](./ReadME_Images/customer.jpeg) | ![](./ReadME_Images/c-browse.jpeg) | ![](./ReadME_Images/c-cart.jpeg) |

| Checkout | Tracking | Orders |
|----------|----------|--------|
| ![](./ReadME_Images/c-checkout.jpeg) | ![](./ReadME_Images/c-liveTrack.jpeg) | ![](./ReadME_Images/c-orders.jpeg) |

### Supplier Portal

| Dashboard | Catches | Add Catch |
|-----------|---------|-----------|
| ![](./ReadME_Images/supplier.jpeg) | ![](./ReadME_Images/s-catches.jpeg) | ![](./ReadME_Images/s-addCatch.jpeg) |

---

## 👤 Default Admin Access

Create an admin account during registration or manually update the user's role inside MongoDB.

---

## 🐛 Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running
- Verify `MONGODB_URI`
- Check MongoDB port

### Frontend Build Error

```bash
rm -rf node_modules package-lock.json

npm install
```

### API Connection Error

- Verify backend server is running
- Verify frontend `.env`
- Check CORS configuration

---

## 📄 License

This project is created for educational purposes.

---

## 👨‍💻 Developed By

Developed as a MERN Stack academic project to digitize fisheries and seafood supply chain management operations.
