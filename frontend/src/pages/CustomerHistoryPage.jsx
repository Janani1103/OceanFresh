import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

const CustomerHistoryPage = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [orderFilter, setOrderFilter] = useState('all')
  const [dateRangeFilter, setDateRangeFilter] = useState('all')
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [cartItems, setCartItems] = useState([])
  const ordersPerPage = 6

  useEffect(() => {
    fetchOrderHistory()
    fetchCartItems()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchQuery, orderFilter, dateRangeFilter])

  const fetchOrderHistory = async () => {
    try {
      const response = await api.get('/orders/customer/history')
      setOrders(response.data)
      setFilteredOrders(response.data)
    } catch (error) {
      console.error('Error fetching order history:', error)
      setOrders([])
      setFilteredOrders([])
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = [...orders]

    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => item.fishName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (orderFilter !== 'all') {
      filtered = filtered.filter(order => order.status === orderFilter)
    }

    if (dateRangeFilter !== 'all') {
      const now = new Date()
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate)
        const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24))
        
        switch(dateRangeFilter) {
          case '7days': return daysDiff <= 7
          case '30days': return daysDiff <= 30
          case '90days': return daysDiff <= 90
          case '2025': return orderDate.getFullYear() === 2025
          case '2024': return orderDate.getFullYear() === 2024
          default: return true
        }
      })
    }

    setFilteredOrders(filtered)
    setCurrentPage(1)
  }

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  )

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  const fetchCartItems = async () => {
    try {
      const response = await api.get('/cart')
      setCartItems(response.data.items || [])
    } catch (error) {
      console.error('Error fetching cart:', error)
      setCartItems([])
    }
  }

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  const handleReorder = async (order) => {
    try {
      for (const item of order.items) {
        await api.post('/cart/add', { itemId: item.inventoryId || item.itemId || item._id, quantity: item.quantity })
      }
      fetchCartItems()
      alert('Items added to cart successfully!')
    } catch (error) {
      console.error('Error reordering:', error)
      alert('Failed to add items to cart')
    }
  }

  const handleDownloadInvoice = (orderId) => {
    alert(`Downloading invoice for order #${orderId}`)
  }

  const handleLeaveReview = (orderId) => {
    alert(`Opening review form for order #${orderId}`)
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'dispatched': return 'bg-indigo-100 text-indigo-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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
            <Link to="/orders" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
              <span>📋</span>
              <span>Orders</span>
            </Link>
          </li>
          <li>
            <Link to="/history" className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-ocean-50 text-ocean-600 border-l-4 border-ocean-600">
              <span>📜</span>
              <span>History◄</span>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none w-64" />
            </div>
            <Link to="/cart" className="flex items-center space-x-2 bg-ocean-600 text-white px-4 py-2 rounded-lg hover:bg-ocean-700 transition">
              <span>🛒</span>
              <span>Cart({getCartItemCount()})</span>
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-ocean-900">📜 Order History</h1>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="font-medium text-gray-700">Filter:</span>
              <select
                value={orderFilter}
                onChange={(e) => setOrderFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
              >
                <option value="all">All Orders ▼</option>
                <option value="delivered">Delivered</option>
                <option value="processing">Processing</option>
                <option value="rejected">Rejected</option>
              </select>
              <span className="font-medium text-gray-700">Date Range:</span>
              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
              >
                <option value="all">All Time ▼</option>
                <option value="2025">Jan 2025 ▼</option>
                <option value="2024">Dec 2024 ▼</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow border mb-6 overflow-x-auto">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Ord#</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Items</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <>
                      <tr key={order._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">#{order.orderId}</td>
                        <td className="py-3 px-4 text-gray-700">
                          {order.items.map((item, index) => (
                            <span key={index}>
                              {item.fishName}({item.quantity}kg)
                              {index < order.items.length - 1 && ', '}
                            </span>
                          ))}
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-900">Rs {order.totalAmount.toFixed(2)}</td>
                        <td className="py-3 px-4 text-gray-700">{order.orderDate}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                            {order.status === 'processing' ? '🔵 Proc' :
                              order.status === 'delivered' ? '🟢 Del' :
                                order.status === 'rejected' ? '🔴 Rej' :
                                  order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleExpand(order._id)}
                            className="text-ocean-600 hover:text-ocean-800 font-semibold"
                          >
                            📋
                          </button>
                        </td>
                      </tr>
                      {expandedOrder === order._id && (
                        <tr>
                          <td colSpan="6" className="p-4 bg-gray-50">
                            <div className="bg-white rounded-lg p-4 border">
                              <h4 className="font-bold text-gray-900 mb-4">📋 Order #{order.orderId} Detail (Expanded View)</h4>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <span className="text-gray-600">Order Date: {new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                                </div>
                                {order.deliveryDate && (
                                  <div>
                                    <span className="text-gray-600">Delivered: {new Date(order.deliveryDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                                  </div>
                                )}
                              </div>

                              <div className="mb-4">
                                <p className="font-semibold text-gray-900 mb-2">Items:</p>
                                <div className="border rounded-lg overflow-hidden">
                                  <table className="w-full">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Item</th>
                                        <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Qty</th>
                                        <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Price</th>
                                        <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Subtotal</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {order.items.map((item, index) => (
                                        <tr key={index} className="border-t">
                                          <td className="py-2 px-3 text-gray-900">{item.fishName}</td>
                                          <td className="py-2 px-3 text-gray-900">{item.quantity}kg</td>
                                          <td className="py-2 px-3 text-gray-900">Rs {item.unitPrice}</td>
                                          <td className="py-2 px-3 text-gray-900">Rs {(item.quantity * item.unitPrice).toFixed(2)}</td>
                                        </tr>
                                      ))}
                                      {order.deliveryFee > 0 && (
                                        <tr className="border-t">
                                          <td className="py-2 px-3 text-gray-900">Delivery</td>
                                          <td className="py-2 px-3 text-gray-900">-</td>
                                          <td className="py-2 px-3 text-gray-900">-</td>
                                          <td className="py-2 px-3 text-gray-900">Rs {order.deliveryFee.toFixed(2)}</td>
                                        </tr>
                                      )}
                                      <tr className="border-t bg-gray-50">
                                        <td className="py-2 px-3 font-bold text-gray-900">Total</td>
                                        <td className="py-2 px-3"></td>
                                        <td className="py-2 px-3"></td>
                                        <td className="py-2 px-3 font-bold text-gray-900">Rs {order.totalAmount.toFixed(2)}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-3">
                                <button
                                  onClick={() => handleReorder(order)}
                                  className="flex items-center space-x-2 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition"
                                >
                                  <span>🔄</span>
                                  <span>Reorder</span>
                                </button>
                                <button
                                  onClick={() => handleDownloadInvoice(order.orderId)}
                                  className="flex items-center space-x-2 px-4 py-2 border border-ocean-600 text-ocean-600 rounded-lg hover:bg-ocean-50 transition"
                                >
                                  <span>📄</span>
                                  <span>Download Invoice</span>
                                </button>
                                {order.status === 'delivered' && (
                                  <button
                                    onClick={() => handleLeaveReview(order.orderId)}
                                    className="flex items-center space-x-2 px-4 py-2 border border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50 transition"
                                  >
                                    <span>⭐</span>
                                    <span>Leave Review</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {filteredOrders.length > 0 && (
            <div className="flex items-center justify-between mb-4">
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
                    className={`px-4 py-2 rounded-lg ${currentPage === index + 1
                        ? 'bg-ocean-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'}`}
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
          )}

          {filteredOrders.length > 0 && (
            <div className="text-center text-gray-600 mb-4">
              Showing {((currentPage - 1) * ordersPerPage) + 1}-{Math.min(currentPage * ordersPerPage, filteredOrders.length)} of {filteredOrders.length} orders
            </div>
          )}

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl text-gray-300 mx-auto mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No order history found</h3>
              <p className="text-gray-500">Your past orders will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomerHistoryPage
