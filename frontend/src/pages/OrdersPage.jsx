import { useEffect, useState } from 'react'
import { ShoppingCart, ArrowLeft, Search, XCircle, MapPin, Package, Phone, CheckCircle, ChevronDown, ChevronUp, User, Clock, DollarSign, Truck, Circle } from 'lucide-react'
import DashboardSidebar from '../components/DashboardSidebar'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

const OrdersPage = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState([])
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [viewDetails, setViewDetails] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedRows, setExpandedRows] = useState({})

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    fetchOrders()
    if (!isAdmin) {
      fetchInventory()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders')
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory')
      setInventory(response.data.filter(item => item.quantity > 0))
    } catch (error) {
      console.error('Error fetching inventory:', error)
    }
  }

  const handleViewOrder = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`)
      setSelectedOrder(response.data)
      setViewDetails(true)
    } catch (error) {
      console.error('Error fetching order details:', error)
    }
  }

  const handleBackToList = () => {
    setViewDetails(false)
    setSelectedOrder(null)
  }

  const handleAddToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.inventoryId === item._id)
    if (existingItem) {
      if (existingItem.quantity < item.quantity) {
        setCart(cart.map(cartItem =>
          cartItem.inventoryId === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        ))
      }
    } else {
      setCart([...cart, {
        inventoryId: item._id,
        fishName: item.fishName,
        quantity: 1,
        unitPrice: item.unitPrice,
        maxQuantity: item.quantity
      }])
    }
  }

  const handleRemoveFromCart = (inventoryId) => {
    setCart(cart.filter(item => item.inventoryId !== inventoryId))
  }

  const handleUpdateCartQuantity = (inventoryId, newQuantity) => {
    const item = cart.find(cartItem => cartItem.inventoryId === inventoryId)
    if (item && newQuantity > 0 && newQuantity <= item.maxQuantity) {
      setCart(cart.map(cartItem =>
        cartItem.inventoryId === inventoryId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      ))
    }
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (cart.length === 0) return

    try {
      const orderData = {
        items: cart.map(item => ({
          inventoryId: item.inventoryId,
          quantity: item.quantity
        })),
        deliveryAddress
      }
      await api.post('/orders', orderData)
      setShowModal(false)
      setCart([])
      setDeliveryAddress('')
      fetchOrders()
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order. Please try again.')
    }
  }

  const handleUpdateStatus = async (orderId, status) => {
    if (status === 'rejected' && !window.confirm('Are you sure you want to reject this order?')) {
      return
    }

    try {
      await api.put(`/orders/${orderId}/status`, { status })
      await fetchOrders()
      if (viewDetails && selectedOrder?._id === orderId) {
        const response = await api.get(`/orders/${orderId}`)
        setSelectedOrder(response.data)
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status. Please try again.')
    }
  }

  const formatAmount = (amount) => amount.toLocaleString()

  const formatStatus = (status) =>
    status.charAt(0).toUpperCase() + status.slice(1)

  const formatItemsSummary = (items) => {
    if (!items || items.length === 0) return 'N/A'
    return items.map(item => `${item.fishName}(${item.quantity}kg)`).join(', ')
  }

  const toggleRowExpansion = (orderId) => {
    setExpandedRows(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }))
  }

  const filteredOrders = orders.filter(order => {
    if (!searchQuery && statusFilter === 'all') return true
    const query = searchQuery.toLowerCase()
    const matchesSearch = [
      order.orderId,
      order.customerId?.name,
      order.customerId?.email,
      order._id
    ].some(field => field?.toLowerCase().includes(query))
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const cartTotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)

  const canMarkDelivered = (status) =>
    ['confirmed', 'processing', 'dispatched'].includes(status)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
      </div>
    )
  }

  if (isAdmin) {
    return (
      <div className="flex">
        <DashboardSidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ocean-900">Order Management</h1>
            <p className="text-gray-600 mt-2">Manage and process customer orders</p>
          </div>

          {!viewDetails ? (
            <>
              <div className="card mb-6">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders by ID, customer name, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      statusFilter === 'all'
                        ? 'bg-ocean-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter('pending')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      statusFilter === 'pending'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setStatusFilter('confirmed')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      statusFilter === 'confirmed'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Confirmed
                  </button>
                  <button
                    onClick={() => setStatusFilter('processing')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      statusFilter === 'processing'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Processing
                  </button>
                  <button
                    onClick={() => setStatusFilter('dispatched')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      statusFilter === 'dispatched'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Dispatched
                  </button>
                  <button
                    onClick={() => setStatusFilter('delivered')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      statusFilter === 'delivered'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Delivered
                  </button>
                </div>
              </div>

              <div className="card">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="table-header">ID</th>
                        <th className="table-header">Customer</th>
                        <th className="table-header">Items</th>
                        <th className="table-header">Total</th>
                        <th className="table-header">Status</th>
                        <th className="table-header">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.map((order) => (
                        <>
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="table-cell font-medium text-gray-900">
                              {order.orderId}
                            </td>
                            <td className="table-cell text-gray-900">
                              {order.customerId?.name || 'N/A'}
                            </td>
                            <td className="table-cell text-gray-700">
                              {formatItemsSummary(order.items)}
                            </td>
                            <td className="table-cell font-semibold text-gray-900">
                              Rs {formatAmount(order.totalAmount)}
                            </td>
                            <td className="table-cell">
                              <span className={`status-badge status-${order.status}`}>
                                {formatStatus(order.status)}
                              </span>
                            </td>
                            <td className="table-cell">
                              <div className="flex items-center gap-2">
                                {order.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateStatus(order._id, 'confirmed')}
                                      className="bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-green-700"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => handleUpdateStatus(order._id, 'rejected')}
                                      className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-red-700"
                                    >
                                      ✕
                                    </button>
                                  </>
                                )}
                                {order.status === 'confirmed' && (
                                  <button
                                    onClick={() => handleUpdateStatus(order._id, 'processing')}
                                    className="btn-primary text-sm px-3 py-1"
                                  >
                                    Process
                                  </button>
                                )}
                                {order.status === 'processing' && (
                                  <button
                                    onClick={() => handleUpdateStatus(order._id, 'dispatched')}
                                    className="btn-primary text-sm px-3 py-1"
                                  >
                                    Dispatch
                                  </button>
                                )}
                                {order.status === 'dispatched' && (
                                  <button
                                    onClick={() => handleUpdateStatus(order._id, 'delivered')}
                                    className="btn-primary text-sm px-3 py-1"
                                  >
                                    Deliver
                                  </button>
                                )}
                                {order.status === 'delivered' && (
                                  <span className="text-green-600 font-semibold text-sm">
                                    ✓ Done
                                  </span>
                                )}
                                <button
                                  onClick={() => toggleRowExpansion(order._id)}
                                  className="text-ocean-600 hover:text-ocean-800 ml-2"
                                >
                                  {expandedRows[order._id] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedRows[order._id] && (
                            <tr>
                              <td colSpan="6" className="px-6 py-6 bg-gradient-to-r from-ocean-50 to-blue-50">
                                <div className="space-y-4">
                                  {/* Header */}
                                  <div className="flex items-center justify-between border-b border-ocean-200 pb-3">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-ocean-600 rounded-lg">
                                        <Package className="h-5 w-5 text-white" />
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-gray-900 text-lg">Order #{order.orderId}</h4>
                                        <p className="text-sm text-gray-500">Order Details</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="h-5 w-5 text-green-600" />
                                      <span className="font-bold text-green-600 text-lg">Rs {formatAmount(order.totalAmount)}</span>
                                    </div>
                                  </div>

                                  {/* Customer & Delivery Info */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                      <div className="flex items-center gap-2 mb-2">
                                        <User className="h-4 w-4 text-ocean-600" />
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Customer</p>
                                      </div>
                                      <p className="font-semibold text-gray-900">{order.customerId?.name || 'N/A'}</p>
                                      {order.customerId?.phone && (
                                        <p className="text-sm text-gray-600 flex items-center mt-1">
                                          <Phone className="h-3 w-3 mr-1" />
                                          {order.customerId.phone}
                                        </p>
                                      )}
                                    </div>
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                      <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="h-4 w-4 text-ocean-600" />
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Delivery Address</p>
                                      </div>
                                      <p className="text-sm text-gray-900 font-medium">{order.deliveryAddress}</p>
                                    </div>
                                  </div>

                                  {/* Items */}
                                  <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                      <Package className="h-4 w-4 text-ocean-600" />
                                      <p className="text-xs text-gray-500 uppercase tracking-wider">Items Ordered</p>
                                    </div>
                                    <div className="space-y-2">
                                      {order.items.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                          <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-ocean-100 rounded-lg flex items-center justify-center">
                                              <Package className="h-4 w-4 text-ocean-600" />
                                            </div>
                                            <span className="font-medium text-gray-900">{item.fishName}</span>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-sm text-gray-600">{item.quantity}kg × Rs {formatAmount(item.unitPrice)}</p>
                                            <p className="font-semibold text-ocean-600">Rs {formatAmount(item.totalPrice)}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Status Flow */}
                                  <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                      <Clock className="h-4 w-4 text-ocean-600" />
                                      <p className="text-xs text-gray-500 uppercase tracking-wider">Order Progress</p>
                                    </div>
                                    <div className="relative">
                                      {/* Progress line background */}
                                      <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>
                                      {/* Progress line fill */}
                                      <div 
                                        className="absolute top-5 left-0 h-1 bg-green-500 rounded-full transition-all duration-500"
                                        style={{ 
                                          width: `${(['pending', 'confirmed', 'processing', 'dispatched', 'delivered'].indexOf(order.status) / 4) * 100}%` 
                                        }}
                                      ></div>
                                      
                                      <div className="flex items-center justify-between relative">
                                        {['pending', 'confirmed', 'processing', 'dispatched', 'delivered'].map((status, index) => {
                                          const statusIndex = ['pending', 'confirmed', 'processing', 'dispatched', 'delivered'].indexOf(order.status)
                                          const isCompleted = index <= statusIndex
                                          const isCurrent = index === statusIndex

                                          return (
                                            <div key={status} className="flex flex-col items-center flex-1">
                                              <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all z-10 ${
                                                isCompleted 
                                                  ? isCurrent 
                                                    ? 'bg-ocean-600 text-white shadow-lg shadow-ocean-300 scale-110' 
                                                    : 'bg-green-500 text-white shadow-lg shadow-green-200' 
                                                  : 'bg-gray-200 text-gray-400'
                                              }`}>
                                                {isCompleted ? (
                                                  <CheckCircle className="h-5 w-5" />
                                                ) : (
                                                  <Circle className="h-5 w-5" />
                                                )}
                                                {isCurrent && (
                                                  <div className="absolute inset-0 rounded-full bg-ocean-600 animate-ping opacity-30"></div>
                                                )}
                                              </div>
                                              <p className={`text-xs font-semibold mt-3 text-center transition-all ${
                                                isCompleted 
                                                  ? isCurrent 
                                                    ? 'text-ocean-600 font-bold' 
                                                    : 'text-green-600' 
                                                  : 'text-gray-400'
                                              }`}>
                                                {formatStatus(status)}
                                              </p>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                      {filteredOrders.length === 0 && (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                            No orders found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={handleBackToList}
                className="flex items-center space-x-2 text-ocean-600 hover:text-ocean-800 mb-6"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-semibold">Back to Orders</span>
              </button>

              {selectedOrder && (
                <div className="space-y-6">
                  {/* Order Header Card */}
                  <div className="card bg-gradient-to-r from-ocean-50 to-blue-50 border-l-4 border-l-ocean-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                        <p className="text-sm text-gray-500 mt-1">
                          Order ID: <span className="font-mono font-semibold text-ocean-600">{selectedOrder.orderId}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`status-badge status-${selectedOrder.status} text-sm px-4 py-2 rounded-full`}>
                          {formatStatus(selectedOrder.status)}
                        </span>
                        {selectedOrder.createdAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-GB', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Customer Information Card */}
                  <div className="card">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-ocean-100 rounded-lg">
                        <Package className="h-5 w-5 text-ocean-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Customer Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Customer Name</p>
                        <p className="font-semibold text-gray-900 text-lg">
                          {selectedOrder.customerId?.name || 'N/A'}
                        </p>
                        {selectedOrder.customerId?.email && (
                          <p className="text-sm text-gray-600 mt-1">{selectedOrder.customerId.email}</p>
                        )}
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Contact</p>
                        {selectedOrder.customerId?.phone ? (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            <p className="font-semibold text-gray-900">{selectedOrder.customerId.phone}</p>
                          </div>
                        ) : (
                          <p className="text-gray-400">Not provided</p>
                        )}
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Delivery Address</p>
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-ocean-600 mr-3 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-900 font-medium">{selectedOrder.deliveryAddress}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary Card */}
                  <div className="card">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Order Summary</h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="table-header">Product</th>
                            <th className="table-header text-center">Quantity</th>
                            <th className="table-header text-right">Unit Price</th>
                            <th className="table-header text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selectedOrder.items.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition">
                              <td className="table-cell">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-ocean-100 rounded-lg flex items-center justify-center mr-3">
                                    <Package className="h-5 w-5 text-ocean-600" />
                                  </div>
                                  <span className="font-semibold text-gray-900">{item.fishName}</span>
                                </div>
                              </td>
                              <td className="table-cell text-center">
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-ocean-50 text-ocean-700 font-semibold text-sm">
                                  {item.quantity} kg
                                </span>
                              </td>
                              <td className="table-cell text-right text-gray-600">
                                Rs {formatAmount(item.unitPrice)}
                              </td>
                              <td className="table-cell text-right font-bold text-gray-900">
                                Rs {formatAmount(item.totalPrice)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-ocean-50">
                            <td colSpan="3" className="table-cell font-bold text-gray-900 text-right">
                              Total Amount:
                            </td>
                            <td className="table-cell text-right">
                              <span className="text-2xl font-bold text-ocean-600">
                                Rs {formatAmount(selectedOrder.totalAmount)}
                              </span>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Status Timeline Card */}
                  <div className="card">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Package className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Order Status Timeline</h3>
                    </div>
                    
                    <div className="flex items-center justify-between px-4">
                      {['pending', 'confirmed', 'processing', 'dispatched', 'delivered'].map((status, index) => {
                        const statusIndex = ['pending', 'confirmed', 'processing', 'dispatched', 'delivered'].indexOf(selectedOrder.status)
                        const isActive = index <= statusIndex
                        const isCurrent = index === statusIndex
                        
                        return (
                          <div key={status} className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isActive 
                                ? isCurrent 
                                  ? 'bg-ocean-600 text-white ring-4 ring-ocean-100' 
                                  : 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-400'
                            }`}>
                              {isActive ? <CheckCircle className="h-5 w-5" /> : <span className="text-xs">{index + 1}</span>}
                            </div>
                            <p className={`text-xs font-semibold mt-2 ${
                              isActive ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                              {formatStatus(status)}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="card bg-white">
                    <div className="flex flex-wrap items-center gap-4">
                      {selectedOrder.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(selectedOrder._id, 'confirmed')}
                            className="btn-primary flex items-center px-6 py-3 rounded-lg font-semibold"
                          >
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Accept Order
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(selectedOrder._id, 'rejected')}
                            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center"
                          >
                            <XCircle className="h-5 w-5 mr-2" />
                            Reject Order
                          </button>
                        </>
                      )}
                      {canMarkDelivered(selectedOrder.status) && (
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder._id, 'delivered')}
                          className="btn-secondary flex items-center px-6 py-3 rounded-lg font-semibold"
                        >
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Mark as Delivered
                        </button>
                      )}
                      {selectedOrder.status === 'delivered' && (
                        <div className="flex items-center gap-3 bg-green-50 text-green-700 px-6 py-3 rounded-lg">
                          <CheckCircle className="h-6 w-6" />
                          <div>
                            <p className="font-semibold">Order Delivered Successfully</p>
                            {selectedOrder.deliveryDate && (
                              <p className="text-sm">
                                on {new Date(selectedOrder.deliveryDate).toLocaleDateString('en-GB', { 
                                  day: 'numeric', 
                                  month: 'short', 
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      {selectedOrder.status === 'rejected' && (
                        <div className="flex items-center gap-3 bg-red-50 text-red-700 px-6 py-3 rounded-lg">
                          <XCircle className="h-6 w-6" />
                          <p className="font-semibold">This order was rejected</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <DashboardSidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ocean-900">Order Management</h1>
          <p className="text-gray-600 mt-2">Browse products and place your orders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Available Products</h3>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-primary flex items-center"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  View Cart ({cart.length})
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {inventory.length === 0 ? (
                  <p className="text-gray-500 col-span-2 text-center py-8">No products available</p>
                ) : (
                  inventory.map(item => (
                    <div key={item._id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{item.fishName}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.freshnessStatus === 'fresh' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {item.freshnessStatus}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-lg font-bold text-ocean-600">{formatAmount(item.unitPrice)}/kg</p>
                        <p className="text-sm text-gray-500">{item.quantity} kg available</p>
                      </div>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-full bg-ocean-50 text-ocean-600 py-2 rounded-lg hover:bg-ocean-100 transition font-semibold"
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">My Orders</h3>
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No orders yet</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {orders.map(order => (
                    <div key={order._id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-gray-900 text-sm">{order.orderId}</span>
                        <span className={`status-badge status-${order.status}`}>
                          {formatStatus(order.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{order.items.length} items</p>
                      <p className="font-semibold text-ocean-600">{formatAmount(order.totalAmount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Shopping Cart</h2>
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.inventoryId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-900">{item.fishName}</p>
                          <p className="text-sm text-gray-600">{formatAmount(item.unitPrice)}/kg</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateCartQuantity(item.inventoryId, item.quantity - 1)}
                            className="p-1 bg-gray-200 rounded"
                          >
                            -
                          </button>
                          <span className="font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateCartQuantity(item.inventoryId, item.quantity + 1)}
                            className="p-1 bg-gray-200 rounded"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleRemoveFromCart(item.inventoryId)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-ocean-600">{formatAmount(cartTotal)}</span>
                    </div>
                  </div>
                  <form onSubmit={handlePlaceOrder}>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">Delivery Address</label>
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="input-field"
                        rows="3"
                        required
                        placeholder="Enter your delivery address"
                      />
                    </div>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 btn-primary"
                      >
                        Place Order
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersPage
