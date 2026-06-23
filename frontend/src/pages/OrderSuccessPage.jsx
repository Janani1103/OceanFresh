import { useEffect, useState } from 'react'
import { Search, ShoppingCart, Home, Store, Package, CheckCircle, Clock, Truck, ChevronDown, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../utils/api'

const OrderSuccessPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { state } = location
  const [orderDetails, setOrderDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  const deliveryStages = [
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, status: 'confirmed' },
    { key: 'processing', label: 'Processing', icon: Package, status: 'processing' },
    { key: 'dispatched', label: 'Dispatched', icon: Truck, status: 'dispatched' },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle, status: 'delivered' }
  ]

  useEffect(() => {
    if (state && state.orderId) {
      setOrderDetails({
        orderId: state.orderId,
        totalAmount: state.totalAmount,
        deliveryType: state.deliveryType || 'express',
        deliveryTime: state.deliveryTime || 'Today, 4:00 PM - 6:00 PM',
        orderDate: state.orderDate || new Date().toISOString(),
        status: state.status || 'confirmed'
      })
      setLoading(false)
    } else {
      fetchLatestOrder()
    }
  }, [state])

  const fetchLatestOrder = async () => {
    try {
      const response = await api.get('/orders')
      const orders = response.data || []
      if (orders.length > 0) {
        // Sort by orderDate/createdAt descending to get latest
        orders.sort((a, b) => new Date(b.orderDate || b.createdAt || 0) - new Date(a.orderDate || a.createdAt || 0))
        const latest = orders[0]
        
        const isExpress = latest.deliveryFee > 10
        const date = new Date(latest.orderDate || latest.createdAt || Date.now())
        const tomorrow = new Date(date)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const deliveryTime = `Tomorrow, ${tomorrow.toLocaleDateString('en-US', { weekday: 'long' })}`

        setOrderDetails({
          orderId: latest.orderId,
          totalAmount: latest.totalAmount,
          deliveryType: isExpress ? 'express' : 'standard',
          deliveryTime: deliveryTime,
          orderDate: latest.orderDate || latest.createdAt || new Date().toISOString(),
          status: latest.status || 'confirmed'
        })
      } else {
        setOrderDetails({
          orderId: 'Unknown',
          totalAmount: 0.00,
          deliveryType: 'standard',
          deliveryTime: 'N/A',
          orderDate: new Date().toISOString(),
          status: 'confirmed'
        })
      }
    } catch (error) {
      console.error('Error fetching latest order:', error)
      setOrderDetails({
        orderId: 'Unknown',
        totalAmount: 0.00,
        deliveryType: 'standard',
        deliveryTime: 'N/A',
        orderDate: new Date().toISOString(),
        status: 'confirmed'
      })
    } finally {
      setLoading(false)
    }
  }

  const getCurrentStageIndex = () => {
    const status = orderDetails?.status || 'confirmed'
    switch (status) {
      case 'pending':
      case 'confirmed':
        return 0
      case 'processing':
        return 1
      case 'dispatched':
        return 2
      case 'delivered':
        return 3
      default:
        return 0
    }
  }

  const currentStageIndex = getCurrentStageIndex()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F0F8FF]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F0F8FF]">
      {/* Customer Sidebar */}
      <div className="w-64 bg-white shadow-lg min-h-screen fixed left-0 top-0">
        <div className="p-6 border-b">
          <Link to="/customer-dashboard" className="flex items-center space-x-2">
            <div className="text-3xl">🐟</div>
            <div>
              <h1 className="font-bold text-gray-900">OceanFresh</h1>
              <p className="text-xs text-gray-500">Customer Portal</p>
            </div>
          </Link>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link to="/customer-dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/browse" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <Store className="h-5 w-5" />
                <span>Browse</span>
              </Link>
            </li>
            <li>
              <Link to="/orders" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <Package className="h-5 w-5" />
                <span>Orders</span>
              </Link>
            </li>
            <li>
              <Link to="/history" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <Clock className="h-5 w-5" />
                <span>History</span>
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <Package className="h-5 w-5" />
                <span>Wishlist</span>
              </Link>
            </li>
            <li>
              <Link to="/profile" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <Package className="h-5 w-5" />
                <span>Profile</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Header */}
        <div className="bg-white shadow-md border-b sticky top-0 z-40">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center space-x-8">
              <div className="flex-1 relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/cart" className="flex items-center space-x-2 bg-ocean-600 text-white px-4 py-2 rounded-lg hover:bg-ocean-700 transition">
                <ShoppingCart className="h-5 w-5" />
                <span>Cart(0)</span>
              </Link>
              
              <div className="flex items-center space-x-2 text-gray-700">
                <span className="font-medium">{user?.name || 'John Doe'}</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 flex items-center justify-center min-h-[calc(100vh-73px)]">
          {/* Success Card */}
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-8">
            {/* Success Message */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">✅</div>
              <div className="text-4xl mb-2">🎉</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">ORDER PLACED SUCCESSFULLY!</h1>
              <p className="text-gray-600">Thank you for your order</p>
            </div>

            {/* Order Details */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">Your Order #</span>
                <span className="font-bold text-gray-900">{orderDetails.orderId}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">Total</span>
                <span className="font-bold text-gray-900">${orderDetails.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">Estimated Delivery</span>
                <span className="font-bold text-ocean-600">{orderDetails.deliveryTime}</span>
              </div>
            </div>

            {/* Order Status Tracker */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Order Status</h3>
              <div className="flex items-center justify-between">
                {deliveryStages.map((stage, index) => {
                  const isCompleted = index <= currentStageIndex
                  const isCurrent = index === currentStageIndex
                  const Icon = stage.icon
                  
                  return (
                    <div key={stage.key} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isCurrent
                            ? 'bg-ocean-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`text-xs font-medium ${
                        isCompleted ? 'text-green-600' : isCurrent ? 'text-ocean-600' : 'text-gray-400'
                      }`}>
                        {stage.label}
                      </span>
                      {index < deliveryStages.length - 1 && (
                        <div className={`h-0.5 w-full -mt-6 mb-4 ${
                          index < currentStageIndex ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Link
                to={`/orders`}
                state={{ focusOrderId: orderDetails.orderId }}
                className="flex-1 bg-ocean-600 text-white py-3 rounded-lg hover:bg-ocean-700 transition font-semibold flex items-center justify-center"
              >
                📋 View Order
              </Link>
              <Link
                to="/browse"
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold flex items-center justify-center"
              >
                🏪 Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccessPage