import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import SuppliersPage from './pages/SuppliersPage'
import InventoryPage from './pages/InventoryPage'
import OrdersPage from './pages/OrdersPage'
import ReportsPage from './pages/ReportsPage'
import CustomersPage from './pages/CustomersPage'
import DeliveryTrackingPage from './pages/DeliveryTrackingPage'
import CustomerDashboard from './pages/CustomerDashboard'
import BrowsePage from './pages/BrowsePage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import CustomerOrdersPage from './pages/CustomerOrdersPage'
import CustomerHistoryPage from './pages/CustomerHistoryPage'
import WishlistPage from './pages/WishlistPage'
import CustomerProfilePage from './pages/CustomerProfilePage'
import OrderDetailPage from './pages/OrderDetailPage'
import SupplierDashboard from './pages/SupplierDashboard'
import SupplierMyCatches from './pages/SupplierMyCatches'
import SupplierAddCatch from './pages/SupplierAddCatch'
import SupplierStats from './pages/SupplierStats'
import SupplierProfile from './pages/SupplierProfile'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/customer-dashboard" element={
          <ProtectedRoute>
            <CustomerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/browse" element={
          <ProtectedRoute>
            <BrowsePage />
          </ProtectedRoute>
        } />
        <Route path="/cart" element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        } />
        <Route path="/order-success" element={
          <ProtectedRoute>
            <OrderSuccessPage />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <CustomerOrdersPage />
          </ProtectedRoute>
        } />
        <Route path="/order/:orderId" element={
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <CustomerHistoryPage />
          </ProtectedRoute>
        } />
        <Route path="/wishlist" element={
          <ProtectedRoute>
            <WishlistPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <CustomerProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/customers" element={
          <ProtectedRoute>
            <CustomersPage />
          </ProtectedRoute>
        } />
        <Route path="/suppliers" element={
          <ProtectedRoute>
            <SuppliersPage />
          </ProtectedRoute>
        } />
        <Route path="/inventory" element={
          <ProtectedRoute>
            <InventoryPage />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        } />
        <Route path="/delivery-tracking" element={
          <ProtectedRoute>
            <DeliveryTrackingPage />
          </ProtectedRoute>
        } />
        <Route path="/supplier-dashboard" element={
          <ProtectedRoute>
            <SupplierDashboard />
          </ProtectedRoute>
        } />
        <Route path="/supplier/catches" element={
          <ProtectedRoute>
            <SupplierMyCatches />
          </ProtectedRoute>
        } />
        <Route path="/supplier/catch/add" element={
          <ProtectedRoute>
            <SupplierAddCatch />
          </ProtectedRoute>
        } />
        <Route path="/supplier/reports" element={
          <ProtectedRoute>
            <SupplierStats />
          </ProtectedRoute>
        } />
        <Route path="/supplier/profile" element={
          <ProtectedRoute>
            <SupplierProfile />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App
