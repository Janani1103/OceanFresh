import { useState, useEffect } from 'react'
import { Search, User, ArrowLeft, Mail, Phone, Calendar, DollarSign } from 'lucide-react'
import DashboardSidebar from '../components/DashboardSidebar'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

const CustomersPage = () => {
  const { user } = useAuth()
  const [customers, setCustomers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerProfile, setCustomerProfile] = useState(null)
  const [viewProfile, setViewProfile] = useState(false)

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchCustomers()
    }
  }, [user, searchQuery])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/users/customers?search=${searchQuery}`)
      setCustomers(response.data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewProfile = async (customerId) => {
    try {
      const response = await api.get(`/users/customers/${customerId}/profile`)
      setCustomerProfile(response.data)
      setSelectedCustomer(customerId)
      setViewProfile(true)
    } catch (error) {
      console.error('Error fetching customer profile:', error)
    }
  }

  const handleBackToList = () => {
    setViewProfile(false)
    setSelectedCustomer(null)
    setCustomerProfile(null)
  }

  if (loading && customers.length === 0) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ocean-900">Customers</h1>
          <p className="text-gray-600 mt-2">Manage your customer base</p>
        </div>

        {!viewProfile ? (
          <>
            <div className="card mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers by name, email, or contact..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="card">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="table-header">Name</th>
                      <th className="table-header">Email</th>
                      <th className="table-header">Contact</th>
                      <th className="table-header">Orders</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customers.map((customer) => (
                      <tr key={customer._id} className="hover:bg-gray-50">
                        <td className="table-cell">
                          <div className="flex items-center">
                            <div className="bg-ocean-100 p-2 rounded-full mr-3">
                              <User className="h-4 w-4 text-ocean-600" />
                            </div>
                            <span className="font-medium text-gray-900">{customer.name}</span>
                          </div>
                        </td>
                        <td className="table-cell">{customer.email}</td>
                        <td className="table-cell">{customer.contact}</td>
                        <td className="table-cell">
                          <span className="bg-ocean-100 text-ocean-800 px-2 py-1 rounded-full text-sm font-semibold">
                            {customer.orderCount || 0}
                          </span>
                        </td>
                        <td className="table-cell">
                          <button
                            onClick={() => handleViewProfile(customer._id)}
                            className="text-ocean-600 hover:text-ocean-800 font-semibold"
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                    {customers.length === 0 && !loading && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                          No customers found
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
              <span className="font-semibold">Back to Customers</span>
            </button>

            {customerProfile && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer Details Card */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Customer Details</h3>
                    <User className="h-5 w-5 text-ocean-600" />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Name</p>
                      <p className="font-semibold text-gray-900">{customerProfile.customer.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-gray-700">{customerProfile.customer.email}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Phone</p>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-gray-700">{customerProfile.customer.contact}</p>
                      </div>
                    </div>
                    
                    {customerProfile.customer.address && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Address</p>
                        <p className="text-gray-700">{customerProfile.customer.address}</p>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Total Orders</p>
                          <p className="text-2xl font-bold text-ocean-600">{customerProfile.customer.orderCount}</p>
                        </div>
                        <User className="h-8 w-8 text-ocean-200" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Purchase History</h3>
                    <Calendar className="h-5 w-5 text-ocean-600" />
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="table-header">Order ID</th>
                          <th className="table-header">Amount</th>
                          <th className="table-header">Date</th>
                          <th className="table-header">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {customerProfile.orders.map((order) => (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="table-cell font-medium text-gray-900">
                              {order.orderId}
                            </td>
                            <td className="table-cell">
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                                <span className="font-semibold">{order.totalAmount.toLocaleString()}</span>
                              </div>
                            </td>
                            <td className="table-cell">
                              {new Date(order.orderDate).toLocaleDateString('en-GB')}
                            </td>
                            <td className="table-cell">
                              <span className={`status-badge status-${order.status}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {customerProfile.orders.length === 0 && (
                          <tr>
                            <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">
                              No purchase history
                            </td>
                          </tr>
                        )}
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

export default CustomersPage