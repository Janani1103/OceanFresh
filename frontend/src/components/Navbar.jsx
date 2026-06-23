import { Link, useNavigate } from 'react-router-dom'
import { Fish, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const Navbar = ({ isAuthenticated }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Fish className="h-8 w-8 text-ocean-600" />
              <span className="text-2xl font-bold text-ocean-600">OceanFresh</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-ocean-600 transition-colors">Home</Link>
            <Link to="/#features" className="text-gray-700 hover:text-ocean-600 transition-colors">Features</Link>
            <Link to="/#modules" className="text-gray-700 hover:text-ocean-600 transition-colors">Modules</Link>
            <Link to="/#about" className="text-gray-700 hover:text-ocean-600 transition-colors">About</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-ocean-600 transition-colors">Dashboard</Link>
                <button
                  onClick={handleLogout}
                  className="bg-ocean-600 text-white px-4 py-2 rounded-lg hover:bg-ocean-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-ocean-600 font-semibold hover:text-ocean-700 transition-colors">Login</Link>
                <Link to="/register" className="bg-ocean-600 text-white px-4 py-2 rounded-lg hover:bg-ocean-700 transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-ocean-600"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <Link to="/" className="block py-2 text-gray-700 hover:text-ocean-600" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/#features" className="block py-2 text-gray-700 hover:text-ocean-600" onClick={() => setIsOpen(false)}>Features</Link>
            <Link to="/#modules" className="block py-2 text-gray-700 hover:text-ocean-600" onClick={() => setIsOpen(false)}>Modules</Link>
            <Link to="/#about" className="block py-2 text-gray-700 hover:text-ocean-600" onClick={() => setIsOpen(false)}>About</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block py-2 text-gray-700 hover:text-ocean-600" onClick={() => setIsOpen(false)}>Dashboard</Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }}
                  className="w-full text-left py-2 text-ocean-600 font-semibold"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-ocean-600 font-semibold" onClick={() => setIsOpen(false)}>Login</Link>
                <Link to="/register" className="block py-2 bg-ocean-600 text-white text-center rounded-lg" onClick={() => setIsOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
