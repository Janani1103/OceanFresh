import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Fish, User, Mail, Phone, Lock, Anchor } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const { confirmPassword, ...registerData } = formData
    const result = await register(registerData)
    
    if (result.success) {
      const userRole = result.user?.role || 'customer'
      
      // Navigate based on user role
      switch (userRole) {
        case 'supplier':
          navigate('/supplier-dashboard')
          break
        case 'customer':
          navigate('/customer-dashboard')
          break
        case 'admin':
          navigate('/dashboard')
          break
        default:
          navigate('/customer-dashboard')
      }
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F8FF] to-[#E0F2FE] flex">
      <div className="hidden lg:flex lg:w-1/2 bg-ocean-600 items-center justify-center p-12">
        <div className="text-center text-white max-w-lg">
          <div className="mb-8 flex justify-center">
            <Fish className="h-24 w-24" />
          </div>
          <h1 className="text-5xl font-bold mb-4">OceanFresh</h1>
          <p className="text-xl mb-8 text-ocean-100">
            Your trusted partner in fresh seafood supply chain management
          </p>
          <div className="bg-ocean-700/30 rounded-xl p-6 backdrop-blur">
            <div className="flex items-center justify-center mb-4">
              <Anchor className="h-16 w-16 text-ocean-200" />
            </div>
            <p className="text-ocean-100 text-sm">
              Connecting fishermen, suppliers, and customers for sustainable seafood trade
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Fish className="h-12 w-12 text-ocean-600" />
            </div>
            <h2 className="text-3xl font-bold text-ocean-900">OceanFresh</h2>
          </div>

          <div className="card shadow-2xl">
            <div className="text-center mb-8">
              <Anchor className="h-12 w-12 text-ocean-600 mx-auto mb-2" />
              <h2 className="text-3xl font-bold text-ocean-900">Join OceanFresh</h2>
              <p className="text-gray-600 mt-2">Create your account</p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-gray-700 font-semibold mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-gray-700 font-semibold mb-2">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-gray-700 font-semibold mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Create a password"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-gray-700 font-semibold mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Confirm your password"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Role</label>
                <div className="flex space-x-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="supplier"
                      checked={formData.role === 'supplier'}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-ocean-600 focus:ring-ocean-500"
                    />
                    <span className="text-gray-700">Supplier</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="customer"
                      checked={formData.role === 'customer'}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-ocean-600 focus:ring-ocean-500"
                    />
                    <span className="text-gray-700">Customer</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-lg py-3 mt-6"
              >
                {loading ? 'Creating account...' : 'CREATE ACCOUNT'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already registered?{' '}
                <Link to="/login" className="text-ocean-600 font-semibold hover:underline">
                  Login here →
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-ocean-600 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage