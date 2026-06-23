import { useState, useEffect } from 'react'
import { ArrowLeft, Truck, Package, CheckCircle, Clock, MapPin } from 'lucide-react'
import DashboardSidebar from '../components/DashboardSidebar'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

const DeliveryTrackingPage = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewTracking, setViewTracking] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

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

  const handleViewTracking = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`)
      setSelectedOrder(response.data)
      setViewTracking(true)
    } catch (error) {
      console.error('Error fetching order details:', error)
    }
  }

  const handleBackToList = () => {
    setViewTracking(false)
    setSelectedOrder(null)
  }

  const deliveryStages = [
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'dispatched', label: 'Dispatched', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
  ]

  const getCurrentStageIndex = (status) => {
    return deliveryStages.findIndex(stage => stage.key === status)
  }

  const formatAmount = (amount) => amount.toLocaleString()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
      </div>
    )
  }

  return (
    <div className="flex">
      <DashboardSidebar />
      <div className="flex-1 ml-64 p-8">
        {!viewTracking ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-ocean-900">Delivery Tracking</h1>
              <p className="text-gray-600 mt-2">Track your order delivery status</p>
            </div>

            <div className="card">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="table-header">Order ID</th>
                      <th className="table-header">Customer</th>
                      <th className="table-header">Amount</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="table-cell font-medium text-gray-900">
                          {order.orderId}
                        </td>
                        <td className="table-cell text-gray-900">
                          {order.customerId?.name || 'N/A'}
                        </td>
                        <td className="table-cell font-semibold text-gray-900">
                          {formatAmount(order.totalAmount)}
                        </td>
                        <td className="table-cell">
                          <span className={`status-badge status-${order.status}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="table-cell">
                          <button
                            onClick={() => handleViewTracking(order._id)}
                            className="text-ocean-600 hover:text-ocean-800 font-semibold"
                          >
                            Track
                          </button>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
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
              <div className="card">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-ocean-900 mb-2">Delivery Tracking</h1>
                  <p className="text-xl text-gray-700 font-mono">Order #{selectedOrder.orderId}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-ocean-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Customer Name</p>
                    <p className="font-semibold text-gray-900">
                      {selectedOrder.customerId?.name || 'N/A'}
                    </p>
                  </div>

                  <div className="bg-ocean-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                    <p className="font-semibold text-ocean-600 text-lg">
                      {formatAmount(selectedOrder.totalAmount)}
                    </p>
                  </div>

                  <div className="bg-ocean-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Delivery Address</p>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700 text-sm">{selectedOrder.deliveryAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Timeline</h2>
                  
                  <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    <div className="space-y-8">
                      {deliveryStages.map((stage, index) => {
                        const Icon = stage.icon
                        const currentStageIndex = getCurrentStageIndex(selectedOrder.status)
                        const isCompleted = index <= currentStageIndex
                        const isCurrent = index === currentStageIndex
                        const isPending = index > currentStageIndex

                        return (
                          <div key={stage.key} className="relative flex items-start">
                            {/* Dot */}
                            <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 ${
                              isCompleted 
                                ? 'bg-ocean-600 border-ocean-600' 
                                : isCurrent 
                                  ? 'bg-ocean-100 border-ocean-600' 
                                  : 'bg-white border-gray-300'
                            }`}>
                              <Icon className={`h-5 w-5 ${
                                isCompleted || isCurrent ? 'text-white' : 'text-gray-400'
                              }`} />
                            </div>

                            {/* Content */}
                            <div className="ml-6 flex-1">
                              <div className={`font-semibold text-lg ${
                                isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                              }`}>
                                {stage.label}
                              </div>
                              {isCurrent && (
                                <div className="mt-1 text-sm text-ocean-600 font-medium">
                                  Current Status
                                </div>
                              )}
                              {isPending && (
                                <div className="mt-1 text-sm text-gray-400">
                                  Pending
                                </div>
                              )}
                              {isCompleted && index < currentStageIndex && (
                                <div className="mt-1 text-sm text-green-600">
                                  Completed
                                </div>
                              )}
                            </div>

                            {index < deliveryStages.length - 1 && (
                              <div className={`ml-4 ${
                                isCompleted ? 'text-ocean-600' : 'text-gray-300'
                              }`}>
                                <svg 
                                  className="w-6 h-6" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M19 14l-7 7m0 0l-7-7m7 7V3" 
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Order Items</h3>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="table-header">Product</th>
                          <th className="table-header">Quantity</th>
                          <th className="table-header">Unit Price</th>
                          <th className="table-header">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedOrder.items.map((item, index) => (
                          <tr key={index}>
                            <td className="table-cell font-medium text-gray-900">
                              {item.fishName}
                            </td>
                            <td className="table-cell">{item.quantity} kg</td>
                            <td className="table-cell">{formatAmount(item.unitPrice)}</td>
                            <td className="table-cell font-semibold text-gray-900">
                              {formatAmount(item.totalPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default DeliveryTrackingPage
