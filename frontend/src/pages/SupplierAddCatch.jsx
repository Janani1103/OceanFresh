import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Upload, Calendar, RotateCcw, Fish } from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import SupplierSidebar from '../components/SupplierSidebar'

const SupplierAddCatch = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    fishName: '',
    category: 'saltwater',
    quantity: '',
    expectedPrice: '',
    dateCaught: new Date().toISOString().split('T')[0],
    freshnessLevel: 'fresh',
    additionalNotes: '',
    photo: null
  })

  const supplierInfo = {
    name: user?.name || 'John Silva',
    boatId: 'B-101',
    fishingArea: 'Negombo',
    contact: user?.contact || '+94 77 123 4567'
  }

  const fishTypes = [
    'Tuna',
    'Salmon', 
    'Shrimp',
    'Crab',
    'Sardine',
    'Lobster',
    'Octopus',
    'Other'
  ]

  const categories = [
    'Saltwater',
    'Freshwater',
    'Shellfish',
    'Mollusk'
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        photo: e.target.files[0]
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const dataToSend = {
        fishName: formData.fishName,
        category: formData.category,
        quantity: formData.quantity,
        expectedPrice: formData.expectedPrice,
        dateCaught: formData.dateCaught,
        freshnessLevel: formData.freshnessLevel,
        additionalNotes: formData.additionalNotes
      }

      console.log('Submitting catch data:', dataToSend)
      console.log('API Base URL:', import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
      console.log('Full URL:', `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/suppliers/catches`)

      const response = await api.post('/suppliers/catches', dataToSend)

      console.log('Catch submission response:', response.data)

      setSuccess(true)
      setTimeout(() => {
        navigate('/supplier/catches')
      }, 2000)
    } catch (error) {
      console.error('Error submitting catch:', error)
      console.error('Error response:', error.response)
      console.error('Error data:', error.response?.data)
      console.error('Error status:', error.response?.status)
      console.error('Error config:', error.config)
      setError(error.response?.data?.message || error.message || 'Failed to submit catch')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      fishName: '',
      category: 'saltwater',
      quantity: '',
      expectedPrice: '',
      dateCaught: new Date().toISOString().split('T')[0],
      freshnessLevel: 'fresh',
      additionalNotes: '',
      photo: null
    })
    setError('')
    setSuccess(false)
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
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">➕ Add New Catch Details</h2>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              Catch submitted successfully! Redirecting to your catches...
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="bg-white rounded-xl p-8 shadow-sm border max-w-4xl">
            <form onSubmit={handleSubmit}>
              {/* Supplier Info Section */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Info (Auto-filled)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">👤</span>
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">{supplierInfo.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🚢</span>
                    <div>
                      <p className="text-sm text-gray-500">Boat ID</p>
                      <p className="font-medium text-gray-900">{supplierInfo.boatId}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📍</span>
                    <div>
                      <p className="text-sm text-gray-500">Fishing Area</p>
                      <p className="font-medium text-gray-900">{supplierInfo.fishingArea}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📱</span>
                    <div>
                      <p className="text-sm text-gray-500">Contact</p>
                      <p className="font-medium text-gray-900">{supplierInfo.contact}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Catch Details Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2">─── Catch Details ───</h3>

                <div className="space-y-6">
                  {/* Fish Name */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Fish Name</label>
                    <select
                      name="fishName"
                      value={formData.fishName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                      required
                    >
                      <option value="">Select Fish Type</option>
                      {fishTypes.map(fish => (
                        <option key={fish} value={fish}>{fish}</option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat.toLowerCase()} value={cat.toLowerCase()}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Quantity (kg)</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                      placeholder="Enter quantity in kilograms"
                      required
                      min="1"
                    />
                  </div>

                  {/* Expected Price */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Expected Price/kg ($)</label>
                    <input
                      type="number"
                      name="expectedPrice"
                      value={formData.expectedPrice}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                      placeholder="Enter expected price per kg"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Date Caught */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Date Caught</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        name="dateCaught"
                        value={formData.dateCaught}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Freshness Level */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-3">Freshness Level</label>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="freshnessLevel"
                          value="fresh"
                          checked={formData.freshnessLevel === 'fresh'}
                          onChange={handleChange}
                          className="h-4 w-4 text-ocean-600 focus:ring-ocean-500"
                        />
                        <span className="text-gray-700">🟢 Fresh</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="freshnessLevel"
                          value="average"
                          checked={formData.freshnessLevel === 'average'}
                          onChange={handleChange}
                          className="h-4 w-4 text-ocean-600 focus:ring-ocean-500"
                        />
                        <span className="text-gray-700">🟡 Average</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="freshnessLevel"
                          value="needs_quick_sale"
                          checked={formData.freshnessLevel === 'needs_quick_sale'}
                          onChange={handleChange}
                          className="h-4 w-4 text-ocean-600 focus:ring-ocean-500"
                        />
                        <span className="text-gray-700">🔴 Needs Quick Sale</span>
                      </label>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Additional Notes</label>
                    <textarea
                      name="additionalNotes"
                      value={formData.additionalNotes}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                      rows="4"
                      placeholder="Any additional information about the catch..."
                    />
                  </div>

                  {/* Upload Photo */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">📸 Upload Catch Photo (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-ocean-500 transition-colors">
                      <input
                        type="file"
                        name="photo"
                        onChange={handleFileChange}
                        accept="image/jpeg,image/png"
                        className="hidden"
                        id="photo-upload"
                      />
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Click or Drag to Upload Image</p>
                        <p className="text-gray-400 text-sm mt-2">(Max 5MB, JPG/PNG)</p>
                      </label>
                      {formData.photo && (
                        <p className="mt-4 text-ocean-600 font-medium">
                          Selected: {formData.photo.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="h-5 w-5" />
                  <span>Reset</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Fish className="h-5 w-5" />
                  <span>{loading ? 'Submitting...' : 'Submit Catch'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupplierAddCatch
