import { useEffect, useState } from 'react'
import { Fish, Users, ShoppingCart, DollarSign, Package, TrendingUp } from 'lucide-react'
import DashboardSidebar from '../components/DashboardSidebar'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalStock: 0,
    totalSuppliers: 0,
    totalCustomers: 0,
    totalOrders: 0,
    monthlySales: 0
  })
  const [monthlySalesData, setMonthlySalesData] = useState([])
  const [categoryDistribution, setCategoryDistribution] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDashboardStats()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchDashboardStats = async () => {
    try {
      setError(null)
      const [statsRes, salesRes, categoryRes, ordersRes] = await Promise.all([
        api.get('/reports/dashboard'),
        api.get('/reports/sales/monthly'),
        api.get('/reports/category-distribution'),
        api.get('/reports/recent-orders')
      ])
      
      setStats(statsRes.data)

      const processedSales = salesRes.data.map(item => ({
        month: `${item._id.month}/${item._id.year}`,
        sales: item.total,
        orders: item.count
      }))
      setMonthlySalesData(processedSales)

      const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
      const processedCategories = categoryRes.data.map((item, index) => ({
        name: item._id || 'Other',
        value: item.totalQuantity,
        color: colors[index % colors.length]
      }))
      setCategoryDistribution(processedCategories)

      const processedOrders = ordersRes.data.map(order => ({
        orderId: order.orderId || `ORD${order._id.toString().slice(-4)}`,
        customer: order.customerId?.name || 'Unknown',
        total: `Rs${order.totalAmount.toLocaleString()}`,
        status: order.status,
        date: new Date(order.orderDate).toLocaleDateString('en-GB')
      }))
      setRecentOrders(processedOrders)
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      setError('Failed to load dashboard data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      icon: Package,
      label: 'Total Stock',
      value: `${stats.totalStock} kg`,
      color: 'bg-blue-500',
      adminOnly: true
    },
    {
      icon: Users,
      label: 'Total Suppliers',
      value: stats.totalSuppliers,
      color: 'bg-green-500',
      adminOnly: true
    },
    {
      icon: Users,
      label: 'Total Customers',
      value: stats.totalCustomers,
      color: 'bg-purple-500',
      adminOnly: true
    },
    {
      icon: ShoppingCart,
      label: 'Total Orders',
      value: stats.totalOrders,
      color: 'bg-orange-500',
      adminOnly: true
    },
    {
      icon: DollarSign,
      label: 'Monthly Sales',
      value: `Rs ${stats.monthlySales.toLocaleString()}`,
      color: 'bg-emerald-500',
      adminOnly: true
    }
  ]

  const filteredStatCards = statCards.filter(card => 
    !card.adminOnly || user?.role === 'admin'
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button 
            onClick={fetchDashboardStats}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <DashboardSidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ocean-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.name}! Here's what's happening today.
            </p>
          </div>
          <button
            onClick={fetchDashboardStats}
            disabled={loading}
            className="btn-secondary disabled:opacity-50"
          >
            Refresh Data
          </button>
        </div>

        {user?.role === 'admin' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredStatCards.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="card hover:shadow-lg transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      </div>
                      <div className={`${stat.color} p-3 rounded-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Monthly Sales</h3>
                  <TrendingUp className="h-5 w-5 text-ocean-600" />
                </div>
                <div className="h-64">
                  {monthlySalesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlySalesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="sales" stroke="#0ea5e9" strokeWidth={2} />
                        <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No sales data available
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Category Distribution</h3>
                  <Fish className="h-5 w-5 text-ocean-600" />
                </div>
                <div className="h-64">
                  {categoryDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No category data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                <ShoppingCart className="h-5 w-5 text-ocean-600" />
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.total}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'dispatched' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                      </tr>
                    ))}
                    {recentOrders.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                          No recent orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="card text-center py-12">
            <Fish className="h-16 w-16 text-ocean-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to OceanFresh</h2>
            <p className="text-gray-600 mb-6">
              {user?.role === 'supplier' 
                ? 'Manage your catch details and track your contributions.'
                : 'Browse seafood products and place orders.'}
            </p>
            <div className="flex justify-center gap-4">
              {user?.role === 'supplier' && (
                <button className="btn-primary">
                  Add Catch Details
                </button>
              )}
              {user?.role === 'customer' && (
                <button className="btn-primary">
                  Browse Products
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard