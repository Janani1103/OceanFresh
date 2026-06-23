import { useEffect, useState } from 'react'
import { User, Mail, Phone, MapPin, Calendar, ShoppingBag, Star, Save, Lock, Camera, Award, Medal } from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const CustomerProfilePage = () => {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    address: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [avatar, setAvatar] = useState(null)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
    memberSince: '',
    tier: 'Silver',
    nextTierPoints: 1000
  })

  useEffect(() => {
    fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/customers/profile')
      setProfile(response.data)
      setFormData({
        name: response.data.name,
        email: response.data.email,
        contact: response.data.contact || '',
        address: response.data.address || ''
      })
      setStats(response.data.stats || {
        totalOrders: 0,
        totalSpent: 0,
        loyaltyPoints: 0,
        memberSince: '',
        tier: 'Silver',
        nextTierPoints: 1000
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Set empty state when API fails
      setProfile({
        name: user?.name || '',
        email: user?.email || '',
        contact: '',
        address: '',
        role: 'customer'
      })
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        contact: '',
        address: ''
      })
      setStats({
        totalOrders: 0,
        totalSpent: 0,
        loyaltyPoints: 0,
        memberSince: '',
        tier: 'Silver',
        nextTierPoints: 1000
      })
    } finally {
      setLoading(false)
    }
  }



  const handleSave = async () => {
    try {
      await api.put('/customers/profile', formData)
      setProfile({ ...profile, ...formData })
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
  }

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters!')
      return
    }
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      alert('Password updated successfully!')
    } catch (error) {
      console.error('Error updating password:', error)
      alert('Failed to update password. Please check your current password.')
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatar(URL.createObjectURL(file))
      // Here you would upload the avatar to your backend
      alert('Avatar updated! (In production, this would upload to server)')
    }
  }

  const getTierColor = (tier) => {
    switch(tier) {
      case 'Gold': return 'from-yellow-400 to-yellow-600'
      case 'Silver': return 'from-gray-300 to-gray-500'
      case 'Bronze': return 'from-orange-300 to-orange-500'
      default: return 'from-blue-300 to-blue-500'
    }
  }

  const getTierBenefits = (tier) => {
    switch(tier) {
      case 'Gold': return ['10% off orders', 'Free delivery', 'Priority support', 'Exclusive products']
      case 'Silver': return ['5% off orders', 'Free delivery', 'Priority support']
      case 'Bronze': return ['3% off orders', 'Free delivery on orders over $50']
      default: return ['Standard delivery']
    }
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
              <Link to="/customer-dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <User className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/browse" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <User className="h-5 w-5" />
                <span>Browse</span>
              </Link>
            </li>
            <li>
              <Link to="/orders" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <User className="h-5 w-5" />
                <span>Orders</span>
              </Link>
            </li>
            <li>
              <Link to="/history" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <User className="h-5 w-5" />
                <span>History</span>
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <User className="h-5 w-5" />
                <span>Wishlist</span>
              </Link>
            </li>
            <li>
              <Link to="/profile" className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-ocean-50 text-ocean-600">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center justify-between px-4 py-3 w-full bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Lock className="h-5 w-5" />
              <span>Logout</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ocean-900">⚙️ My Profile & Settings</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Avatar and Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Avatar Section */}
            <div className="card">
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center overflow-hidden">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-16 w-16 text-white" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-ocean-600 text-white p-2 rounded-full cursor-pointer hover:bg-ocean-700 transition">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{profile?.name}</h2>
                  <p className="text-gray-600">{profile?.email}</p>
                  <div className="mt-4 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <span className="font-bold text-gray-900">{stats.loyaltyPoints} pts</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Medal className="h-5 w-5 text-gray-500" />
                      <span className="font-bold text-gray-900">🏅 {stats.tier} Tier</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                    placeholder="+94 77 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                    placeholder="123 Main St, Colombo"
                  />
                </div>

                <button
                  onClick={handleSave}
                  className="w-full bg-ocean-600 text-white py-3 rounded-lg hover:bg-ocean-700 transition font-semibold flex items-center justify-center"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">🔒 Change Password</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                  />
                </div>

                <button
                  onClick={handleUpdatePassword}
                  className="w-full bg-ocean-600 text-white py-3 rounded-lg hover:bg-ocean-700 transition font-semibold"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Loyalty Card */}
          <div className="space-y-6">
            {/* Loyalty Card */}
            <div className={`card bg-gradient-to-br ${getTierColor(stats.tier)} text-white`}>
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🐟</div>
                <h3 className="text-2xl font-bold">OceanFresh Loyalty</h3>
              </div>
              
              <div className="bg-white/20 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 fill-current" />
                    <span className="font-bold">{stats.loyaltyPoints} Points</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Medal className="h-5 w-5" />
                    <span className="font-bold">🏅 {stats.tier} Tier</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm mb-2">Next Tier: {stats.tier === 'Gold' ? 'Platinum' : 'Gold'} ({stats.nextTierPoints} pts)</p>
                <div className="w-full bg-white/30 rounded-full h-3">
                  <div 
                    className="bg-white h-3 rounded-full transition-all"
                    style={{ width: `${(stats.loyaltyPoints / stats.nextTierPoints) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs mt-2">{((stats.loyaltyPoints / stats.nextTierPoints) * 100).toFixed(0)}% to {stats.tier === 'Gold' ? 'Platinum' : 'Gold'}</p>
              </div>

              <div className="border-t border-white/20 pt-4">
                <p className="text-sm font-semibold mb-2">Benefits:</p>
                <ul className="space-y-1 text-sm">
                  {getTierBenefits(stats.tier).map((benefit, index) => (
                    <li key={index} className="flex items-center">
                      <span className="mr-2">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Account Stats */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Account Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-ocean-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ShoppingBag className="h-5 w-5 text-ocean-600" />
                    <span className="text-gray-700">Total Orders</span>
                  </div>
                  <span className="font-bold text-gray-900">{stats.totalOrders}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ShoppingBag className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">Total Spent</span>
                  </div>
                  <span className="font-bold text-gray-900">${stats.totalSpent}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-yellow-600" />
                    <span className="text-gray-700">Loyalty Points</span>
                  </div>
                  <span className="font-bold text-gray-900">{stats.loyaltyPoints}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <span className="text-gray-700">Member Since</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {new Date(stats.memberSince).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerProfilePage
