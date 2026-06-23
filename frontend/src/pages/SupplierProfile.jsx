import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Save, Upload, Award, Calendar } from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import SupplierSidebar from '../components/SupplierSidebar'

const SupplierProfile = () => {
  const { user, setUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    fishingArea: '',
    boatId: '',
    boatName: '',
    currentPassword: '',
    newPassword: '',
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    language: 'english'
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/suppliers/profile')
      const profileData = response.data
      
      setFormData({
        fullName: profileData.fullName || user?.name || '',
        email: profileData.email || user?.email || '',
        phone: profileData.phone || '',
        fishingArea: profileData.fishingArea || '',
        boatId: profileData.boatId || '',
        boatName: profileData.boatName || '',
        currentPassword: '',
        newPassword: '',
        emailNotifications: profileData.emailNotifications !== false,
        smsNotifications: profileData.smsNotifications !== false,
        pushNotifications: profileData.pushNotifications || false,
        language: profileData.language || 'english'
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Set default empty state
      setFormData({
        fullName: user?.name || '',
        email: user?.email || '',
        phone: '',
        fishingArea: '',
        boatId: '',
        boatName: '',
        currentPassword: '',
        newPassword: '',
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: false,
        language: 'english'
      })
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setSuccess(false)

    try {
      await api.put('/suppliers/profile', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        fishingArea: formData.fishingArea,
        boatId: formData.boatId,
        boatName: formData.boatName,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        emailNotifications: formData.emailNotifications,
        smsNotifications: formData.smsNotifications,
        pushNotifications: formData.pushNotifications,
        language: formData.language
      })

      // Update user context
      setUser({
        ...user,
        name: formData.fullName,
        email: formData.email
      })

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setError(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
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
            <h2 className="text-2xl font-bold text-gray-900">👤 My Profile</h2>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              Profile updated successfully!
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="bg-white rounded-xl p-8 shadow-sm border max-w-4xl">
            <form onSubmit={handleSubmit}>
              {/* Profile Header */}
              <div className="flex items-start space-x-6 mb-8 pb-8 border-b">
                <div className="relative">
                  <div className="w-32 h-32 bg-ocean-100 rounded-full flex items-center justify-center text-5xl">
                    👤
                  </div>
                  <label className="absolute bottom-0 right-0 bg-ocean-600 text-white p-2 rounded-full cursor-pointer hover:bg-ocean-700 transition-colors">
                    <Upload className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => console.log('Photo upload:', e.target.files[0])}
                    />
                  </label>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{formData.fullName}</h3>
                  <div className="flex items-center space-x-2 mt-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span className="text-yellow-600 font-medium">Premium Supplier ⭐</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Member since: Jan 2024</span>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b">─── Personal Information ───</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Fishing Area</label>
                    <input
                      type="text"
                      name="fishingArea"
                      value={formData.fishingArea}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Boat ID</label>
                    <input
                      type="text"
                      name="boatId"
                      value={formData.boatId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Boat Name</label>
                    <input
                      type="text"
                      name="boatName"
                      value={formData.boatName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Account Settings */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b">─── Account Settings ───</h3>
                
                <div className="space-y-6">
                  {/* Change Password */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                        placeholder="Enter new password"
                      />
                    </div>
                  </div>

                  {/* Notifications */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-3">Notification Preferences</label>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="emailNotifications"
                          checked={formData.emailNotifications}
                          onChange={handleChange}
                          className="h-5 w-5 text-ocean-600 focus:ring-ocean-500 rounded"
                        />
                        <span className="text-gray-700">Email Notifications</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="smsNotifications"
                          checked={formData.smsNotifications}
                          onChange={handleChange}
                          className="h-5 w-5 text-ocean-600 focus:ring-ocean-500 rounded"
                        />
                        <span className="text-gray-700">SMS Notifications</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="pushNotifications"
                          checked={formData.pushNotifications}
                          onChange={handleChange}
                          className="h-5 w-5 text-ocean-600 focus:ring-ocean-500 rounded"
                        />
                        <span className="text-gray-700">Push Notifications</span>
                      </label>
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Language</label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                    >
                      <option value="english">English</option>
                      <option value="sinhala">Sinhala</option>
                      <option value="tamil">Tamil</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-5 w-5" />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupplierProfile
