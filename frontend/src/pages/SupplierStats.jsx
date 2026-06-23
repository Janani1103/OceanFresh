import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Download, TrendingUp, Package, Clock, DollarSign, Award } from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import SupplierSidebar from '../components/SupplierSidebar'

const SupplierStats = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('6months')
  const [stats, setStats] = useState({
    acceptanceRate: 0,
    rejectionRate: 0,
    avgResponseTime: 0,
    totalEarned: 0,
    pendingPayment: 0,
    totalCatches: 0,
    acceptedCatches: 0,
    rejectedCatches: 0
  })

  const [earningsData, setEarningsData] = useState([])

  const [volumeData, setVolumeData] = useState([])

  const [topCatches, setTopCatches] = useState([])

  useEffect(() => {
    fetchStats()
  }, [period])

  const fetchStats = async () => {
    try {
      const response = await api.get(`/suppliers/stats?period=${period}`)
      setStats(response.data.stats)
      setEarningsData(response.data.earnings)
      setVolumeData(response.data.volume)
      setTopCatches(response.data.topCatches)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    alert('Export report functionality would download a PDF/CSV report')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
      </div>
    )
  }

  const maxValue = Math.max(...earningsData.map(d => d.value))
  const maxVolume = Math.max(...volumeData.map(d => d.value))

  return (
    <div className="flex min-h-screen bg-[#F0F8FF]">
      <SupplierSidebar />

      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🐟</span>
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
                  {user?.name?.charAt(0) || 'J'}
                </div>
                <span className="font-medium text-gray-700">{user?.name || 'John Silva'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">📈 My Statistics & Performance</h2>
            
            <div className="flex items-center space-x-4">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
              >
                <option value="1month">Last 1 Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last 1 Year</option>
              </select>

              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors"
              >
                <Download className="h-5 w-5" />
                <span>Export Report</span>
              </button>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Total Earnings Trend */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Total Earnings Trend</h3>
              <div className="h-64 flex items-end justify-between space-x-2 px-4">
                {earningsData.map((data, index) => {
                  const height = (data.value / maxValue) * 80
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div
                        className="bg-ocean-500 rounded-t-lg transition-all hover:bg-ocean-600 w-12 relative group"
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          ${data.value.toLocaleString()}
                        </div>
                      </div>
                      <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Catch Volume */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🎣 Catch Volume</h3>
              <div className="h-64 flex items-end justify-between space-x-2 px-4">
                {volumeData.map((data, index) => {
                  const height = (data.value / maxVolume) * 80
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div
                        className="bg-green-500 rounded-t-lg transition-all hover:bg-green-600 w-12 relative group"
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {data.value}kg
                        </div>
                      </div>
                      <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">📊 Summary Statistics</h3>
            
            <div className="space-y-4">
              {/* Acceptance Rate */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Acceptance Rate</span>
                  <span className="text-gray-900 font-bold">{stats.acceptanceRate}% ({stats.acceptedCatches}/{stats.totalCatches})</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: `${stats.acceptanceRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Rejection Rate */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Rejection Rate</span>
                  <span className="text-gray-900 font-bold">{stats.rejectionRate}% ({stats.rejectedCatches}/{stats.totalCatches})</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full"
                    style={{ width: `${stats.rejectionRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Other Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Clock className="h-8 w-8 text-ocean-600" />
                  <div>
                    <p className="text-sm text-gray-500">Avg Response Time</p>
                    <p className="text-lg font-bold text-gray-900">{stats.avgResponseTime} hours</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Total Earned</p>
                    <p className="text-lg font-bold text-gray-900">${stats.totalEarned.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Package className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-500">Pending Payment</p>
                    <p className="text-lg font-bold text-gray-900">${stats.pendingPayment.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">(Shrimp catch)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performing Catches */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 Top Performing Catches</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Fish</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Qty</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Earnings</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {topCatches.map((catchItem) => (
                    <tr key={catchItem.rank} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {catchItem.rank === 1 && <span className="text-2xl">🥇</span>}
                        {catchItem.rank === 2 && <span className="text-2xl">🥈</span>}
                        {catchItem.rank === 3 && <span className="text-2xl">🥉</span>}
                        {catchItem.rank > 3 && <span className="text-lg font-bold text-gray-600">{catchItem.rank}</span>}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">{catchItem.fish}</td>
                      <td className="py-3 px-4 text-gray-700">{catchItem.qty}kg</td>
                      <td className="py-3 px-4 font-medium text-gray-900">${catchItem.earnings.toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-700">{catchItem.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupplierStats
