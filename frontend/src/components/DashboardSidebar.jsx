import { Link, useLocation } from 'react-router-dom'
import { Users, Package, ShoppingCart, BarChart3, Home, LogOut, Truck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const DashboardSidebar = () => {
  const location = useLocation()
  const { user, logout } = useAuth()

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Customers', path: '/customers', adminOnly: true },
    { icon: Users, label: 'Suppliers', path: '/suppliers' },
    { icon: Package, label: 'Inventory', path: '/inventory' },
    { icon: ShoppingCart, label: 'Orders', path: '/orders' },
    { icon: Truck, label: 'Delivery Tracking', path: '/delivery-tracking' },
    { icon: BarChart3, label: 'Reports', path: '/reports', adminOnly: true },
  ]

  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || user?.role === 'admin'
  )

  return (
    <div className="w-64 bg-white shadow-lg min-h-screen fixed left-0 top-0">
      <div className="p-6 border-b">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-ocean-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">OF</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900">OceanFresh</h1>
            <p className="text-xs text-gray-500">Supply Chain</p>
          </div>
        </Link>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-ocean-50 text-ocean-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
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

export default DashboardSidebar
