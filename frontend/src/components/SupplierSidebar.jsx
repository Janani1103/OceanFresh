import { Link, useLocation } from 'react-router-dom'
import { Home, Fish, Plus, BarChart3, User, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const SupplierSidebar = () => {
  const location = useLocation()
  const { user, logout } = useAuth()

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/supplier-dashboard' },
    { icon: Fish, label: 'My Catches', path: '/supplier/catches' },
    { icon: Plus, label: 'Add Catch', path: '/supplier/catch/add' },
    { icon: BarChart3, label: 'My Reports', path: '/supplier/reports' },
    { icon: User, label: 'Profile', path: '/supplier/profile' }
  ]

  return (
    <div className="w-64 bg-white shadow-lg min-h-screen fixed left-0 top-0">
      <div className="p-6 border-b">
        <Link to="/supplier-dashboard" className="flex items-center space-x-2">
          <div className="text-3xl">🐟</div>
          <div>
            <h1 className="font-bold text-gray-900">OceanFresh</h1>
            <p className="text-xs text-gray-500">Supplier Portal</p>
          </div>
        </Link>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-ocean-50 text-ocean-600 border-l-4 border-ocean-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {isActive && <span className="ml-auto">◄</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default SupplierSidebar
