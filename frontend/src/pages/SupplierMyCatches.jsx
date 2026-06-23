import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Filter, Eye } from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import SupplierSidebar from '../components/SupplierSidebar'

const SupplierMyCatches = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [catches, setCatches] = useState([])
  const [selectedCatch, setSelectedCatch] = useState(null)
  const [filters, setFilters] = useState({
    status: 'all',
    fish: 'all',
    date: ''
  })

  useEffect(() => {
    fetchCatches()
  }, [])

  const fetchCatches = async () => {
    try {
      const response = await api.get('/suppliers/catches')
      setCatches(response.data)
    } catch (error) {
      console.error('Error fetching catches:', error)
      setCatches([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusEmoji = (status) => {
    switch(status) {
      case 'accepted': return '✅'
      case 'pending': return '⏳'
      case 'rejected': return '❌'
      default: return '⚪'
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-300'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getFishEmoji = (fishName) => {
    const emojis = {
      'Tuna': '🐟',
      'Salmon': '🐟',
      'Crab': '🦀',
      'Shrimp': '🦐',
      'Sardine': '🐟',
      'Lobster': '🦞',
      'Octopus': '🐙'
    }
    return emojis[fishName] || '🐟'
  }

  const filteredCatches = catches.filter(catchItem => {
    if (filters.status !== 'all' && catchItem.status !== filters.status) return false
    if (filters.fish !== 'all' && catchItem.fishName !== filters.fish) return false
    if (filters.date && !catchItem.date.includes(filters.date)) return false
    return true
  })

  const uniqueFishTypes = [...new Set(catches.map(c => c.fishName))]

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
            <h2 className="text-2xl font-bold text-gray-900">🎣 My Submitted Catches</h2>
            <Link
              to="/supplier/catch/add"
              className="flex items-center space-x-2 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add New</span>
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="text-gray-600 font-medium">Filter:</span>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
              >
                <option value="all">All Status</option>
                <option value="accepted">Accepted</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={filters.fish}
                onChange={(e) => setFilters({ ...filters, fish: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
              >
                <option value="all">All Fish</option>
                {uniqueFishTypes.map(fish => (
                  <option key={fish} value={fish}>{fish}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Date (YYYY-MM-DD)"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Catches Table */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Fish</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Qty</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCatches.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-gray-500">
                          No catches found
                        </td>
                      </tr>
                    ) : (
                      filteredCatches.map((catchItem) => (
                        <tr
                          key={catchItem.id}
                          className={`border-b hover:bg-gray-50 cursor-pointer ${selectedCatch?.id === catchItem.id ? 'bg-ocean-50' : ''}`}
                          onClick={() => setSelectedCatch(catchItem)}
                        >
                          <td className="py-3 px-4 font-medium text-gray-900">{catchItem.id}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <span className="mr-2">{getFishEmoji(catchItem.fishName)}</span>
                              <span className="text-gray-700">{catchItem.fishName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-700">{catchItem.quantity}</td>
                          <td className="py-3 px-4 text-gray-700">${catchItem.pricePerKg}</td>
                          <td className="py-3 px-4 text-gray-700">{catchItem.date}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(catchItem.status)}`}>
                              {getStatusEmoji(catchItem.status)} {catchItem.status.charAt(0).toUpperCase() + catchItem.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Catch Detail Panel */}
            {selectedCatch && (
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Catch #{selectedCatch.id} Detail ({selectedCatch.status.charAt(0).toUpperCase() + selectedCatch.status.slice(1)})</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Fish:</span>
                    <span className="font-medium text-gray-900">{selectedCatch.fishName}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Qty:</span>
                    <span className="font-medium text-gray-900">{selectedCatch.quantity}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium text-gray-900">${selectedCatch.pricePerKg}/kg</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Date Submitted:</span>
                    <span className="font-medium text-gray-900">{selectedCatch.date}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedCatch.status)}`}>
                      {getStatusEmoji(selectedCatch.status)} {selectedCatch.status.charAt(0).toUpperCase() + selectedCatch.status.slice(1)}
                    </span>
                  </div>

                  {selectedCatch.rejectionReason && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700 font-medium">Reason: {selectedCatch.rejectionReason}</p>
                    </div>
                  )}

                  {selectedCatch.adminNote && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-700 font-medium">Admin Note: {selectedCatch.adminNote}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupplierMyCatches
