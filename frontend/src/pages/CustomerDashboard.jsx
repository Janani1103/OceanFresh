import { useEffect, useState } from 'react'
import { Home, Store, ShoppingCart, History, Heart, User, Search, MapPin, Calendar, TrendingUp, PieChart as PieChartIcon, Star, Package, Clock, CheckCircle, Truck, ArrowRight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const CustomerDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0
  })
  const [activeOrder, setActiveOrder] = useState(null)
  const [monthlySpending, setMonthlySpending] = useState([])
  const [topBuys, setTopBuys] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [cartItems, setCartItems] = useState([])

  useEffect(() => {
    fetchCustomerData()
    fetchRecommendations()
    fetchCartItems()
  }, [user])

  const fetchCustomerData = async () => {
    try {
      const response = await api.get('/users/customers/dashboard')
      setStats(response.data.stats)
      setActiveOrder(response.data.activeOrder)
      setMonthlySpending(response.data.monthlySpending)
      setTopBuys(response.data.topBuys)
      setRecentOrders(response.data.recentOrders)
    } catch (error) {
      console.error('Error fetching customer data:', error)
      // Set empty state when API fails
      setStats({
        totalOrders: 0,
        activeOrders: 0,
        totalSpent: 0,
        loyaltyPoints: 0
      })
      setActiveOrder(null)
      setMonthlySpending([])
      setTopBuys([])
      setRecentOrders([])
    } finally {
      setLoading(false)
    }
  }

  const fetchRecommendations = async () => {
    try {
      const response = await api.get('/inventory/recommendations')
      setRecommendations(response.data)
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      setRecommendations([])
    }
  }

  const fetchCartItems = async () => {
    try {
      const response = await api.get('/cart')
      setCartItems(response.data.items || [])
    } catch (error) {
      console.error('Error fetching cart:', error)
    }
  }

  const addToCart = async (itemId) => {
    try {
      await api.post('/cart/add', { itemId, quantity: 1 })
      fetchCartItems()
      alert('Added to cart!')
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add to cart')
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'dispatched': return 'bg-indigo-100 text-indigo-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFreshnessColor = (status) => {
    switch(status) {
      case 'fresh': return 'bg-green-100 text-green-700'
      case 'good': return 'bg-blue-100 text-blue-700'
      case 'fair': return 'bg-yellow-100 text-yellow-700'
      case 'poor': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const deliveryStages = [
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'dispatched', label: 'Dispatched', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle }
  ]

  const getCurrentStageIndex = (status) => {
    return deliveryStages.findIndex(stage => stage.key === status)
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
              <Link to="/customer-dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-ocean-50 text-ocean-600">
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
                <ShoppingCart className="h-5 w-5" />
                <span>Orders</span>
              </Link>
            </li>
            <li>
              <Link to="/history" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <History className="h-5 w-5" />
                <span>History</span>
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <Heart className="h-5 w-5" />
                <span>Wishlist</span>
              </Link>
            </li>
            <li>
              <Link to="/profile" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Link to="/cart" className="flex items-center justify-between px-4 py-3 w-full bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="h-5 w-5" />
              <span>Cart</span>
            </div>
            <span className="bg-white text-ocean-600 px-2 py-1 rounded-full text-xs font-bold">{cartItems.length}</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-ocean-900">Customer Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search seafood..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none w-64"
              />
            </div>
            <Link to="/cart" className="flex items-center space-x-2 bg-ocean-600 text-white px-4 py-2 rounded-lg hover:bg-ocean-700">
              <ShoppingCart className="h-5 w-5" />
              <span>Cart({cartItems.length})</span>
            </Link>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600" />
              <span className="font-semibold text-gray-700">{user?.name}</span>
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="card mb-8 bg-gradient-to-r from-ocean-600 to-ocean-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">👋 Welcome back, {user?.name}!</h2>
              <p className="text-ocean-100">Here's your customer dashboard overview</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card text-center">
            <div className="bg-blue-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-gray-500 text-sm mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            <p className="text-gray-400 text-xs">orders</p>
          </div>
          <div className="card text-center">
            <div className="bg-green-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-gray-500 text-sm mb-1">Active Orders</p>
            <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
            <p className="text-gray-400 text-xs">pending</p>
          </div>
          <div className="card text-center">
            <div className="bg-yellow-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-gray-500 text-sm mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900">${stats.totalSpent.toLocaleString()}</p>
            <p className="text-gray-400 text-xs">total</p>
          </div>
          <div className="card text-center">
            <div className="bg-purple-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-gray-500 text-sm mb-1">Loyalty Points</p>
            <p className="text-2xl font-bold text-gray-900">{stats.loyaltyPoints}</p>
            <p className="text-gray-400 text-xs">points</p>
          </div>
        </div>

        {/* Active Order Tracking */}
        {activeOrder && (
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">🚚 Active Order Tracking</h3>
            </div>
            <div className="bg-ocean-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">Order #{activeOrder.orderId}</span>
                <span className="text-gray-600">{activeOrder.items}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">${activeOrder.total.toFixed(2)} | Ordered: {new Date(activeOrder.orderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between relative">
                {deliveryStages.map((stage, index) => {
                  const Icon = stage.icon
                  const currentStageIndex = getCurrentStageIndex(activeOrder.status)
                  const isCompleted = index <= currentStageIndex
                  const isCurrent = index === currentStageIndex
                  
                  return (
                    <div key={stage.key} className="flex-1 flex flex-col items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-3 ${
                        isCompleted ? 'bg-green-500 border-green-500' : isCurrent ? 'bg-blue-500 border-blue-500' : 'bg-gray-200 border-gray-300'
                      }`}>
                        <Icon className={`h-5 w-5 ${isCompleted || isCurrent ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <span className={`text-xs mt-2 ${isCompleted || isCurrent ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
                        {isCompleted && !isCurrent ? '(Done)' : isCurrent ? '(Current)' : '(Next)'}
                      </span>
                      <span className="text-xs text-gray-600 mt-1">{stage.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Estimated Delivery: Tomorrow, {new Date(new Date(activeOrder.orderDate).getTime() + 24*60*60*1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
              <div className="flex space-x-4">
                <button className="text-ocean-600 hover:text-ocean-800 font-semibold flex items-center">
                  <Package className="h-4 w-4 mr-1" />
                  View Details
                </button>
                <button className="text-ocean-600 hover:text-ocean-800 font-semibold flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Track Live
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Spending Chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">📊 My Monthly Spending</h3>
              <TrendingUp className="h-5 w-5 text-ocean-600" />
            </div>
            <div className="h-64">
              {monthlySpending.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySpending}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="spending" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No spending data available
                </div>
              )}
            </div>
          </div>

          {/* Top Buys Pie Chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">🥧 My Top Buys</h3>
              <PieChartIcon className="h-5 w-5 text-ocean-600" />
            </div>
            <div className="h-64">
              {topBuys.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topBuys}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="percentage"
                    >
                      {topBuys.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No purchase data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Recommendations */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">🔥 Recommended For You</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map((item) => (
              <div key={item._id} className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="text-3xl mb-2">🐟</div>
                <h4 className="font-semibold text-gray-900 mb-1">{item.fishName}</h4>
                <p className="text-gray-600 text-sm mb-2">${item.unitPrice}/kg</p>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getFreshnessColor(item.freshnessStatus)}`}>
                  {item.freshnessStatus.charAt(0).toUpperCase() + item.freshnessStatus.slice(1)}
                </span>
                <div className="flex items-center mt-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">{item.averageRating}</span>
                </div>
                <button
                  onClick={() => addToCart(item._id)}
                  className="w-full mt-3 bg-ocean-600 text-white py-2 rounded-lg hover:bg-ocean-700 transition font-semibold"
                >
                  + Cart
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">📋 Recent Orders</h3>
            <Link to="/orders" className="text-ocean-600 hover:text-ocean-800 font-semibold flex items-center">
              View All Orders <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Ord#</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Items</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.orderId} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">#{order.orderId}</td>
                    <td className="py-3 px-4 text-gray-700">{order.items}</td>
                    <td className="py-3 px-4 text-gray-700">${order.total.toFixed(2)}</td>
                    <td className="py-3 px-4 text-gray-700">{order.date}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard
