import { useEffect, useState } from 'react'
import { Search, ShoppingCart } from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

const WishlistPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [wishlistItems, setWishlistItems] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlist()
    fetchCartItems()
  }, [])

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/wishlist')
      setWishlistItems(response.data.items || [])
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      setWishlistItems([])
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (itemId) => {
    try {
      await api.delete(`/wishlist/${itemId}`)
      setWishlistItems(wishlistItems.filter(item => item._id !== itemId))
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      alert('Failed to remove from wishlist')
    }
  }

  const fetchCartItems = async () => {
    try {
      const response = await api.get('/cart')
      setCartItems(response.data.items || [])
    } catch (error) {
      console.error('Error fetching cart:', error)
      setCartItems([])
    }
  }

  const addToCart = async (itemId) => {
    try {
      await api.post('/cart/add', { itemId, quantity: 1 })
      fetchCartItems()
      alert('Added to cart!')
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert(error.response?.data?.message || 'Failed to add to cart')
    }
  }

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  const moveAllToCart = async () => {
    try {
      for (const item of wishlistItems) {
        await api.post('/cart/add', { itemId: item._id, quantity: 1 })
      }
      fetchCartItems()
      alert('All items added to cart!')
    } catch (error) {
      console.error('Error moving items to cart:', error)
      alert(error.response?.data?.message || 'Failed to move items to cart')
    }
  }

  const clearWishlist = async () => {
    try {
      await api.delete('/wishlist/clear')
      setWishlistItems([])
      alert('Wishlist cleared!')
    } catch (error) {
      console.error('Error clearing wishlist:', error)
      alert('Failed to clear wishlist')
    }
  }

  const getFreshnessColor = (status) => {
    switch(status) {
      case 'fresh': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-yellow-100 text-yellow-800'
      case 'fair': return 'bg-yellow-100 text-yellow-800'
      case 'poor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFishEmoji = (fishName) => {
    const emojis = {
      'Tuna': '🐟',
      'Lobster': '�',
      'Octopus': '🐙',
      'Squid': '�',
      'Shrimp': '🦐',
      'Crab': '🦀'
    }
    return emojis[fishName] || '🐟'
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
                <span>🏠</span>
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/browse" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <span>🏪</span>
                <span>Browse</span>
              </Link>
            </li>
            <li>
              <Link to="/orders" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <span>📋</span>
                <span>Orders</span>
              </Link>
            </li>
            <li>
              <Link to="/history" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <span>📜</span>
                <span>History</span>
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-ocean-50 text-ocean-600 border-l-4 border-ocean-600">
                <span>❤️</span>
                <span>Wish◄</span>
              </Link>
            </li>
            <li>
              <Link to="/profile" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <span>⚙️</span>
                <span>Profile</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🐟</span>
            <span className="font-bold text-gray-900">OceanFresh</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search seafood..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none w-64"
              />
            </div>
            <Link to="/cart" className="flex items-center space-x-2 bg-ocean-600 text-white px-4 py-2 rounded-lg hover:bg-ocean-700 transition">
              <ShoppingCart className="h-5 w-5" />
              <span>Cart({getCartItemCount()})</span>
            </Link>
            <div className="flex items-center space-x-2">
              <span>👤</span>
              <span className="font-medium text-gray-700">{user?.name || 'John Doe'}</span>
              <span className="text-gray-400">▼</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-ocean-900">❤️ My Wishlist ({wishlistItems.length} items)</h1>
          </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-300 mx-auto mb-4">❤️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500">Start adding items you love to your wishlist</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {wishlistItems.map((item) => (
                <div key={item._id} className="bg-white rounded-lg shadow border p-4 hover:shadow-lg transition">
                  <div className="text-center mb-3">
                    <div className="text-5xl mb-2">{getFishEmoji(item.fishName)}</div>
                    <h3 className="font-bold text-gray-900">{item.fishName}</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Rs {item.unitPrice}/kg</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getFreshnessColor(item.freshnessStatus)}`}>
                        {item.freshnessStatus === 'fresh' ? '🟢 Fresh' : '🟡 Average'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">⭐ {item.averageRating}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => addToCart(item._id)}
                        className="flex-1 bg-ocean-600 text-white py-2 rounded-lg hover:bg-ocean-700 transition font-semibold text-sm"
                      >
                        🛒 Add
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item._id)}
                        className="flex-1 border border-red-500 text-red-600 py-2 rounded-lg hover:bg-red-50 transition font-semibold text-sm"
                      >
                        ❤️ Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bulk Actions */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={moveAllToCart}
                className="bg-ocean-600 text-white px-6 py-3 rounded-lg hover:bg-ocean-700 transition font-semibold"
              >
                Add All to Cart
              </button>
              <button
                onClick={clearWishlist}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Clear Wishlist
              </button>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  )
}

export default WishlistPage
