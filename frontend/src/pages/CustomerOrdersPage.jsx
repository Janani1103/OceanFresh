import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import LiveTrackingModal from '../components/LiveTrackingModal'

const CustomerOrdersPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('active')
  const [currentPage, setCurrentPage] = useState(1)
  const [trackingOrder, setTrackingOrder] = useState(null)
  const ordersPerPage = 3

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders')
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getFilteredOrders = () => {
    let filtered = orders

    // Filter by tab
    if (activeTab === 'active') {
      filtered = filtered.filter(order => 
        ['pending', 'confirmed', 'processing', 'dispatched'].includes(order.status)
      )
    } else if (activeTab === 'history') {
      filtered = filtered.filter(order => 
        ['delivered', 'cancelled', 'rejected'].includes(order.status)
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => item.fishName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    return filtered
  }

  const paginatedOrders = getFilteredOrders().slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  )

  const totalPages = Math.ceil(getFilteredOrders().length / ordersPerPage)

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'processing': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'dispatched': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'delivered': return 'bg-green-100 text-green-800 border-green-300'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusEmoji = (status) => {
    switch(status) {
      case 'pending': return '🟡'
      case 'confirmed': return '🔵'
      case 'processing': return '🟠'
      case 'dispatched': return '🟣'
      case 'delivered': return '🟢'
      case 'cancelled': return '🔴'
      default: return '⚪'
    }
  }

  const getProgressStages = (status) => {
    const stages = [
      { key: 'pending', label: 'Pending' },
      { key: 'confirmed', label: 'Confirmed' },
      { key: 'processing', label: 'Processing' },
      { key: 'dispatched', label: 'Dispatched' },
      { key: 'delivered', label: 'Delivered' }
    ]
    
    const currentIndex = stages.findIndex(s => s.key === status)
    return stages.map((stage, index) => ({
      ...stage,
      status: index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'next'
    }))
  }

  const getFishEmoji = (fishName) => {
    const emojis = {
      'Tuna': '🐟',
      'Salmon': '🐟',
      'Crab': '🦀',
      'Shrimp': '🦐',
      'Lobster': '🦞',
      'Sardine': '🐟',
      'Octopus': '🐙',
      'Squid': '🦑'
    }
    return emojis[fishName] || '🐟'
  }

  const handleCallDriver = (order) => {
    if (order.driverPhone) {
      window.open(`tel:${order.driverPhone}`)
    } else {
      alert('Driver contact information not available')
    }
  }

  const handleCancelOrder = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/cancel`)
      // Refresh orders
      fetchOrders()
      alert('Order cancelled successfully')
    } catch (error) {
      console.error('Error cancelling order:', error)
      alert('Failed to cancel order')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
                <span>🏠</span>
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/browse" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <span>🏪</span>
                <span>Browse</span>
              </Link>
            </li>
            <li>
              <Link to="/orders" className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-ocean-50 text-ocean-600 border-l-4 border-ocean-600">
                <span>📋</span>
                <span>Orders◄</span>
              </Link>
            </li>
            <li>
              <Link to="/history" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <span>📜</span>
                <span>History</span>
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <span>❤️</span>
                <span>Wishlist</span>
              </Link>
            </li>
            <li>
              <Link to="/profile" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <span>⚙️</span>
                <span>Profile</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🐟</span>
            <span className="font-bold text-gray-900">OceanFresh</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search seafood..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none w-64"
              />
            </div>
            <Link to="/cart" className="flex items-center space-x-2 bg-ocean-600 text-white px-4 py-2 rounded-lg hover:bg-ocean-700 transition">
              <span>🛒</span>
              <span>Cart(0)</span>
            </Link>
            <div className="flex items-center space-x-2">
              <span>👤</span>
              <span className="font-medium text-gray-700">{user?.name || 'John Doe'}</span>
              <span className="text-gray-400">▼</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-8">
          {/* Page Title with Tabs */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-ocean-900">📋 My Orders</h1>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={() => { setActiveTab('active'); setCurrentPage(1) }}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  activeTab === 'active' 
                    ? 'bg-ocean-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => { setActiveTab('history'); setCurrentPage(1) }}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  activeTab === 'history' 
                    ? 'bg-ocean-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                History
              </button>
              <button
                onClick={() => { setActiveTab('all'); setCurrentPage(1) }}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  activeTab === 'all' 
                    ? 'bg-ocean-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                All
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow border p-4 mb-6 flex items-center gap-4">
            <span className="font-medium text-gray-700">🔍 Search Orders:</span>
            <input
              type="text"
              placeholder="Order ID or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
            />
            <span className="font-medium text-gray-700">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
            >
              <option value="all">All Status ▼</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="dispatched">Dispatched</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Orders List */}
          {paginatedOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl text-gray-300 mx-auto mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders found</h3>
              <p className="text-gray-500">Your orders will appear here</p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {paginatedOrders.map((order) => (
                  <div key={order._id} className="bg-white rounded-lg shadow border p-6">
                    {/* Order Header */}
                    <div className={`border-l-4 p-4 mb-4 ${getStatusColor(order.status).split(' ')[0]}`}>
                      <div className="flex items-center justify-between">
                        <h2 className="font-bold text-gray-900">
                          {getStatusEmoji(order.status)} ORDER #{order.orderId} – {order.status.toUpperCase()}
                        </h2>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="border rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">
                          Ordered: {new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                        </span>
                        {order.estimatedDelivery && (
                          <span className="text-gray-600">
                            Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                          </span>
                        )}
                        {order.estimatedArrival && (
                          <span className="text-gray-600 font-semibold">
                            On the way!
                          </span>
                        )}
                      </div>

                      {/* Progress Tracker */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-2">
                          {getProgressStages(order.status).map((stage, index) => (
                            <div key={stage.key} className="flex-1 text-center">
                              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                                stage.status === 'done' ? 'border-green-500 bg-green-500 text-white' :
                                stage.status === 'current' ? 'border-orange-500 bg-orange-500 text-white' :
                                'border-gray-300 bg-white text-gray-400'
                              }`}>
                                {stage.status === 'done' ? '✅' :
                                 stage.status === 'current' ? getStatusEmoji(order.status) :
                                 '⚪'}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center text-xs">
                          {getProgressStages(order.status).map((stage, index) => (
                            <div key={stage.key} className="flex-1 text-center">
                              <span className={
                                stage.status === 'done' ? 'text-green-600 font-semibold' :
                                stage.status === 'current' ? 'text-orange-600 font-semibold' :
                                'text-gray-400'
                              }>
                                {stage.label}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center text-xs mt-1">
                          {getProgressStages(order.status).map((stage, index) => (
                            <div key={stage.key} className="flex-1 text-center">
                              <span className={
                                stage.status === 'done' ? 'text-green-600' :
                                stage.status === 'current' ? 'text-orange-600' :
                                'text-gray-400'
                              }>
                                {stage.status === 'done' ? 'Done' :
                                 stage.status === 'current' ? 'Current' :
                                 stage.status === 'next' ? 'Next' : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Driver Info for dispatched orders */}
                      {order.status === 'dispatched' && (
                        <div className="bg-purple-50 p-3 rounded-lg mb-4">
                          <div className="flex items-center gap-4">
                            <span className="text-gray-700">🚚 Driver: {order.driverName}</span>
                            <span className="text-gray-700">📞 {order.driverPhone}</span>
                            <span className="text-gray-700">🕐 Estimated Arrival: {order.estimatedArrival}</span>
                          </div>
                        </div>
                      )}

                      {/* Order Items Table */}
                      <div className="border rounded-lg overflow-hidden mb-4">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left py-2 px-3 font-semibold text-gray-700">Item</th>
                              <th className="text-left py-2 px-3 font-semibold text-gray-700">Qty</th>
                              <th className="text-left py-2 px-3 font-semibold text-gray-700">Price</th>
                              <th className="text-left py-2 px-3 font-semibold text-gray-700">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item, index) => (
                              <tr key={index} className="border-t">
                                <td className="py-2 px-3 text-gray-900">{getFishEmoji(item.fishName)} {item.fishName}</td>
                                <td className="py-2 px-3 text-gray-900">{item.quantity}kg</td>
                                <td className="py-2 px-3 text-gray-900">${item.unitPrice.toFixed(2)}</td>
                                <td className="py-2 px-3 text-gray-900">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                              </tr>
                            ))}
                            {order.deliveryFee > 0 && (
                              <tr className="border-t">
                                <td className="py-2 px-3 text-gray-900">Delivery</td>
                                <td className="py-2 px-3 text-gray-900">-</td>
                                <td className="py-2 px-3 text-gray-900">-</td>
                                <td className="py-2 px-3 text-gray-900">${order.deliveryFee.toFixed(2)}</td>
                              </tr>
                            )}
                            <tr className="border-t bg-gray-50">
                              <td className="py-2 px-3 font-bold text-gray-900">TOTAL</td>
                              <td className="py-2 px-3"></td>
                              <td className="py-2 px-3"></td>
                              <td className="py-2 px-3 font-bold text-gray-900">${order.totalAmount.toFixed(2)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Delivery and Payment Info */}
                      {order.deliveryAddress && (
                        <div className="mb-4 text-sm text-gray-600">
                          📍 Delivering to: {order.deliveryAddress}
                        </div>
                      )}
                      {order.paymentMethod && (
                        <div className="mb-4 text-sm text-gray-600">
                          💳 Payment: {order.paymentMethod}
                        </div>
                      )}

                      {/* Pending Order Message */}
                      {order.status === 'pending' && (
                        <div className="bg-yellow-50 p-3 rounded-lg mb-4 text-sm">
                          <p className="text-gray-700">⏳ Your order is being reviewed by the admin.</p>
                          <p className="text-gray-700">You'll be notified once confirmed.</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <button 
                          onClick={() => navigate(`/order/${order.orderId}`)}
                          className="flex items-center space-x-2 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition text-sm font-semibold"
                        >
                          <span>📋</span>
                          <span>View Details</span>
                        </button>
                        <button 
                          onClick={() => setTrackingOrder(order)}
                          className="flex items-center space-x-2 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition text-sm font-semibold"
                        >
                          <span>📍</span>
                          <span>Track Live</span>
                        </button>
                        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-semibold">
                          <span>📄</span>
                          <span>Invoice</span>
                        </button>
                        {order.status === 'dispatched' && (
                          <button 
                            onClick={() => handleCallDriver(order)}
                            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-semibold"
                          >
                            <span>📞</span>
                            <span>Call Driver</span>
                          </button>
                        )}
                        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-semibold">
                          <span>📞</span>
                          <span>Contact Support</span>
                        </button>
                        {['pending', 'confirmed'].includes(order.status) && (
                          <button 
                            onClick={() => handleCancelOrder(order._id)}
                            className="flex items-center space-x-2 px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-semibold"
                          >
                            <span>❌</span>
                            <span>Cancel</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ◀ Previous
                </button>
                
                <div className="flex items-center space-x-2">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === index + 1
                          ? 'bg-ocean-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next ▶
                </button>
              </div>

              <div className="text-center text-gray-600 mt-4">
                Showing {paginatedOrders.length} {activeTab} orders
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Live Tracking Modal */}
      {trackingOrder && (
        <LiveTrackingModal 
          order={trackingOrder} 
          onClose={() => setTrackingOrder(null)}
          onCallDriver={handleCallDriver}
        />
      )}
    </div>
  )
}

export default CustomerOrdersPage
