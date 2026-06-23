import { useEffect, useState } from 'react'
import { Search, Bell, User, Settings, Plus, TrendingUp, Package, CheckCircle, DollarSign } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import SupplierSidebar from '../components/SupplierSidebar'

const SupplierDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    totalCatches: 0,
    totalStock: 0,
    acceptedOrders: 0,
    totalEarnings: 0
  })
  const [activityFeed, setActivityFeed] = useState([])
  const [catches, setCatches] = useState([])
  const [earnings, setEarnings] = useState([])
  const [monthlyCatchData, setMonthlyCatchData] = useState([])
  const [catchBreakdown, setCatchBreakdown] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [metricsRes, activityRes, catchesRes, earningsRes] = await Promise.all([
        api.get('/suppliers/dashboard/metrics'),
        api.get('/suppliers/dashboard/activity'),
        api.get('/suppliers/catches'),
        api.get('/suppliers/earnings')
      ])

      setMetrics(metricsRes.data)
      setActivityFeed(activityRes.data)
      setCatches(catchesRes.data)
      setEarnings(earningsRes.data)

      // Build monthly catch trend from catches data
      const monthMap = {}
      catchesRes.data.forEach(item => {
        const month = item.date ? item.date.split(' ')[0] : 'N/A'
        monthMap[month] = (monthMap[month] || 0) + (parseFloat(item.quantity) || 0)
      })
      const monthlyData = Object.entries(monthMap).slice(-6).map(([month, qty]) => ({
        month,
        qty
      }))
      setMonthlyCatchData(monthlyData)

      // Build catch breakdown from catches
      const fishMap = {}
      let totalQty = 0
      catchesRes.data.forEach(item => {
        const qty = parseFloat(item.quantity) || 0
        fishMap[item.fishName] = (fishMap[item.fishName] || 0) + qty
        totalQty += qty
      })
      const colors = ['bg-ocean-600', 'bg-ocean-500', 'bg-ocean-400', 'bg-ocean-300', 'bg-blue-400']
      const breakdown = Object.entries(fishMap).slice(0, 5).map(([fish, qty], i) => ({
        fish,
        percentage: totalQty > 0 ? Math.round((qty / totalQty) * 100) : 0,
        color: colors[i % colors.length]
      }))
      setCatchBreakdown(breakdown)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setMetrics({ totalCatches: 0, totalStock: 0, acceptedOrders: 0, totalEarnings: 0 })
      setActivityFeed([])
      setCatches([])
      setEarnings([])
      setMonthlyCatchData([])
      setCatchBreakdown([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-300'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const filteredCatches = catches.filter(item =>
    (item.fishName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.id?.toString() || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const maxCatchQty = Math.max(...monthlyCatchData.map(d => d.qty), 1)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F0F8FF]">
      <SupplierSidebar />

      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-ocean-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OF</span>
              </div>
              <h1 className="font-bold text-xl text-gray-900">OceanFresh</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none w-64"
                />
              </div>

              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                <div className="h-8 w-8 bg-ocean-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0) || 'S'}
                </div>
                <span className="font-medium text-gray-700">{user?.name || 'Supplier'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-ocean-600 to-ocean-700 rounded-xl p-6 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name || 'Supplier'}! — Supplier Dashboard</h2>
            <p className="text-ocean-100">Here's an overview of your fishing activities and earnings</p>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">Total Catches</h3>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalCatches}</p>
              <p className="text-gray-500 text-sm">total entries</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">Total Stock Submitted</h3>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalStock.toLocaleString()}kg</p>
              <p className="text-gray-500 text-sm">total weight</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">Accepted Orders</h3>
              <p className="text-3xl font-bold text-gray-900">{metrics.acceptedOrders}</p>
              <p className="text-gray-500 text-sm">confirmed + delivered</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">Total Earnings</h3>
              <p className="text-3xl font-bold text-gray-900">Rs {metrics.totalEarnings.toLocaleString()}</p>
              <p className="text-gray-500 text-sm">from orders</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Activity Feed */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Notifications</h3>
              <div className="space-y-3">
                {activityFeed.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No recent activity</p>
                ) : (
                  activityFeed.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className="w-2 h-2 rounded-full bg-ocean-600 mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Charts */}
            <div className="space-y-6">
              {/* Monthly Catch Chart — real data */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Catch Trend</h3>
                {monthlyCatchData.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">No catch data available</p>
                ) : (
                  <div className="h-48 flex items-end justify-between space-x-2 px-4">
                    {monthlyCatchData.map((data, index) => {
                      const height = maxCatchQty > 0 ? (data.qty / maxCatchQty) * 80 : 0
                      return (
                        <div key={index} className="flex flex-col items-center flex-1">
                          <div
                            className="bg-ocean-500 rounded-t-lg transition-all hover:bg-ocean-600 w-8"
                            style={{ height: `${Math.max(height, 4)}%` }}
                            title={`${data.qty}kg`}
                          ></div>
                          <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Catch Breakdown — real data */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Catch Breakdown</h3>
                {catchBreakdown.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No catch data available</p>
                ) : (
                  <div className="space-y-3">
                    {catchBreakdown.map((item) => (
                      <div key={item.fish} className="flex items-center">
                        <span className="w-24 text-sm text-gray-700 truncate">{item.fish}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-4 mx-3">
                          <div
                            className={`${item.color} h-4 rounded-full transition-all`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-10 text-right">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Catch Submissions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Recent Catch Submissions</h3>
              <Link
                to="/supplier/catches"
                className="text-ocean-600 hover:text-ocean-700 font-medium text-sm"
              >
                View All →
              </Link>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search catches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Fish</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Qty</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Price/kg</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCatches.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-500">
                        No catches found
                      </td>
                    </tr>
                  ) : (
                    filteredCatches.map((catchItem) => (
                      <tr key={catchItem.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-700">{catchItem.date}</td>
                        <td className="py-3 px-4 text-gray-700">{catchItem.fishName}</td>
                        <td className="py-3 px-4 text-gray-700">{catchItem.quantity}</td>
                        <td className="py-3 px-4 text-gray-700">
                          Rs {catchItem.pricePerKg?.toFixed(2) || '0.00'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(catchItem.status)}`}>
                            {catchItem.status?.charAt(0).toUpperCase() + catchItem.status?.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Earnings Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Earnings Summary</h3>
            {earnings.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No earnings data available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Fish</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Qty</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Rate</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earnings.map((earning, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-700">{earning.fish}</td>
                        <td className="py-3 px-4 text-gray-700">{earning.quantity}kg</td>
                        <td className="py-3 px-4 text-gray-700">Rs {earning.rate}/kg</td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          Rs {earning.earned.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-b-2 border-gray-300 bg-gray-50">
                      <td className="py-3 px-4 font-bold text-gray-900">TOTAL</td>
                      <td className="py-3 px-4 font-bold text-gray-900">
                        {earnings.reduce((sum, e) => sum + e.quantity, 0)}kg
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">—</td>
                      <td className="py-3 px-4 font-bold text-gray-900">
                        Rs {earnings.reduce((sum, e) => sum + e.earned, 0).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupplierDashboard
