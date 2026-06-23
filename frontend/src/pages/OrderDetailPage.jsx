import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Link, useParams, useNavigate } from 'react-router-dom'

const OrderDetailPage = () => {
  const { user } = useAuth
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrderDetail()
  }, [orderId])

  const fetchOrderDetail = async () => {
    try {
      const response = await api.get(`/orders/${orderId}`)
      setOrder(response.data)
    } catch (error) {
      console.error('Error fetching order detail:', error)
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-orange-100 text-orange-800'
      case 'dispatched': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusEmoji = (status) => {
    switch(status) {
      case 'pending': return '🟡'
      case 'confirmed': return '🔵'
      case 'processing': return '🟠'
      case 'dispatched': return '🟣'
      case 'delivered': return '🟢'
      default: return '⚪'
    }
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

  const calculateTotal = () => {
    if (!order) return 0
    const subtotal = order.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const total = subtotal + order.deliveryFee - (order.discount || 0)
    return {
      subtotal,
      deliveryFee: order.deliveryFee,
      discount: order.discount || 0,
      total
    }
  }

  const handleReorder = () => {
    alert('Items added to cart for reorder!')
    navigate('/browse')
  }

  const handleDownloadInvoice = () => {
    alert(`Downloading invoice for order #${order.orderId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl text-gray-300 mx-auto mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Order not found</h3>
          <button
            onClick={() => navigate('/orders')}
            className="text-ocean-600 hover:text-ocean-800 font-semibold"
          >
            Back to Orders
          </button>
        </div>
      </div>
    )
  }

  const totals = calculateTotal()

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
              <Link to="/orders" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <span>📋</span>
                <span>Orders</span>
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
                placeholder="Search..."
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
          {/* Page Header */}
          <div className="bg-white rounded-lg shadow border p-4 mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-ocean-900">
              📋 Order #{order.orderId} – Detailed View
            </h1>
            <button
              onClick={() => navigate('/orders')}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              <span>←</span>
              <span>Back to Orders</span>
            </button>
          </div>

          {/* Order Info Header */}
          <div className="bg-white rounded-lg shadow border p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">📋 ORDER #{order.orderId}</h2>
                <div className="text-sm text-gray-600 mt-1">
                  Date: {new Date(order.orderDate).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })} | 
                  Time: {order.orderTime || '10:30 AM'}
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg font-semibold ${getStatusColor(order.status)}`}>
                {getStatusEmoji(order.status)} {order.status.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Delivery and Payment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📍</span>
                DELIVERY ADDRESS
              </h3>
              <div className="space-y-2 text-gray-700 whitespace-pre-line">
                {typeof order.deliveryAddress === 'string' ? (
                  <div>{order.deliveryAddress}</div>
                ) : (
                  <>
                    {order.deliveryAddress?.name && <div>{order.deliveryAddress.name}</div>}
                    <div>{order.deliveryAddress?.street}</div>
                    <div>
                      {order.deliveryAddress?.city} {order.deliveryAddress?.postalCode || order.deliveryAddress?.zip}
                    </div>
                    {order.deliveryAddress?.country && <div>{order.deliveryAddress.country}</div>}
                    {order.deliveryAddress?.phone && <div>📞 {order.deliveryAddress.phone}</div>}
                  </>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">💳</span>
                PAYMENT INFO
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="text-gray-900 font-medium">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-gray-900 font-medium">{order.paymentStatus}</span>
                </div>
                <div className="text-sm text-gray-500">(Pay on receipt)</div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow border p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📦</span>
              ORDER ITEMS
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Item</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Qty</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={item.id || index} className="border-b">
                      <td className="py-3 px-4 text-gray-900 font-medium">{index + 1}</td>
                      <td className="py-3 px-4 text-gray-900">
                        <div>{getFishEmoji(item.fishName)} {item.fishName}</div>
                        <div className="text-sm text-gray-500">{item.variety || ''}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{item.quantity}kg</td>
                      <td className="py-3 px-4 text-gray-900">${item.unitPrice.toFixed(2)}/kg</td>
                      <td className="py-3 px-4 text-gray-900 font-semibold">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-white rounded-lg shadow border p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">💰</span>
              PRICE BREAKDOWN
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal ({order.items.length} items, {order.items.reduce((sum, item) => sum + item.quantity, 0)}kg)</span>
                <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Delivery Fee (Standard)</span>
                <span className="font-medium">${totals.deliveryFee.toFixed(2)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount (Loyalty 5%)</span>
                  <span className="font-medium">-${totals.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-900">
                <span>TOTAL</span>
                <span>${totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <div className="bg-white rounded-lg shadow border p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📝</span>
                SPECIAL INSTRUCTIONS
              </h3>
              <div className="text-gray-700 italic">
                "{order.specialInstructions}"
              </div>
            </div>
          )}

          {/* Order Timeline */}
          <div className="bg-white rounded-lg shadow border p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📅</span>
              ORDER TIMELINE
            </h3>
            <div className="space-y-3">
              {order.timeline && order.timeline.map((event, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    event.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {event.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className={`font-medium ${event.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                        {event.status}
                      </span>
                      <span className="text-sm text-gray-500">{event.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleReorder}
              className="flex items-center space-x-2 px-6 py-3 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition font-semibold"
            >
              <span>🔄</span>
              <span>Reorder</span>
            </button>
            <button
              onClick={handleDownloadInvoice}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              <span>📄</span>
              <span>Download Invoice</span>
            </button>
            <button className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold">
              <span>💬</span>
              <span>Need Help?</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailPage