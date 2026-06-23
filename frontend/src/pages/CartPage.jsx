import { useEffect, useState } from 'react'
import { ShoppingCart, Search, Package, Heart, X, ChevronDown, Plus, Store, Home, History, User, Minus } from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

const CartPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [loading, setLoading] = useState(true)
  const deliveryFee = 10.00

  useEffect(() => {
    fetchCartItems()
    fetchRecommendations()
  }, [])

  const fetchCartItems = async () => {
    try {
      const response = await api.get('/cart')
      setCartItems(response.data.items || [])
    } catch (error) {
      console.error('Error fetching cart:', error)
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  const fetchRecommendations = async () => {
    try {
      const response = await api.get('/inventory/recommendations')
      setRecommendations(response.data || [])
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      setRecommendations([])
    }
  }

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return
    try {
      await api.put('/cart/update', { itemId, quantity: newQuantity })
      setCartItems(cartItems.map(item => 
        (item._id === itemId || item.inventoryId === itemId) ? { ...item, quantity: newQuantity } : item
      ))
    } catch (error) {
      console.error('Error updating quantity:', error)
      alert(error.response?.data?.message || 'Failed to update quantity')
    }
  }

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`)
      setCartItems(cartItems.filter(item => item._id !== itemId && item.inventoryId !== itemId))
    } catch (error) {
      console.error('Error removing item:', error)
      alert(error.response?.data?.message || 'Failed to remove item')
    }
  }

  const addToCart = async (productId) => {
    try {
      await api.post('/cart/add', { itemId: productId, quantity: 1 })
      fetchCartItems()
      alert('Added to cart!')
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert(error.response?.data?.message || 'Failed to add to cart')
    }
  }

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
  }

  const getTotalWeight = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  const getTotal = () => {
    return getSubtotal() + deliveryFee
  }

  const getFishEmoji = (category) => {
    const emojis = {
      finfish: '🐟',
      shellfish: '🦐',
      crustaceans: '🦞',
      mollusks: '🐙',
      other: '🦀'
    }
    return emojis[category] || '🐟'
  }

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty')
      return
    }
    // Navigate to checkout page
    navigate('/checkout', { 
      state: { 
        specialInstructions,
        deliveryFee 
      } 
    })
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
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/browse" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <Store className="h-5 w-5" />
                <span>Browse</span>
              </Link>
            </li>
            <li>
              <Link to="/orders" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <ShoppingCart className="h-5 w-5" />
                <span>Orders</span>
              </Link>
            </li>
            <li>
              <Link to="/history" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <History className="h-5 w-5" />
                <span>History</span>
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <Heart className="h-5 w-5" />
                <span>Wishlist</span>
              </Link>
            </li>
            <li>
              <Link to="/profile" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Header */}
        <div className="bg-white shadow-md border-b sticky top-0 z-40">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center space-x-8">
              <div className="flex-1 relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search seafood..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/cart" className="flex items-center space-x-2 bg-ocean-600 text-white px-4 py-2 rounded-lg hover:bg-ocean-700 transition">
                <ShoppingCart className="h-5 w-5" />
                <span>Cart({cartItems.length})</span>
              </Link>
              
              <div className="flex items-center space-x-2 text-gray-700">
                <span className="font-medium">{user?.name || 'John Doe'}</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-ocean-900">🛒 My Shopping Cart ({cartItems.length} items)</h1>
          </div>

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-4">Add some fresh seafood to get started!</p>
              <Link to="/browse" className="inline-block bg-ocean-600 text-white px-6 py-2 rounded-lg hover:bg-ocean-700 transition">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cart Items Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700"></th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Item</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Qty</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item._id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="text-3xl">{getFishEmoji(item.category)}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-bold text-gray-900">{item.fishName}</p>
                            <p className="text-sm text-gray-500">{item.variety}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-semibold text-gray-900">${item.unitPrice.toFixed(2)}/kg</p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-gray-900">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                            <button
                              onClick={() => removeItem(item._id)}
                              className="text-gray-400 hover:text-red-500 transition"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Special Instructions */}
              <div className="bg-white rounded-lg shadow p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">📝 Special Instructions:</label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Please clean and gut the fish, remove heads, etc."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({getTotalWeight()}kg):</span>
                    <span className="font-semibold">${getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee:</span>
                    <span className="font-semibold">${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total:</span>
                      <span>${getTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-4 mt-6">
                  <Link
                    to="/browse"
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold flex items-center justify-center"
                  >
                    <Store className="h-5 w-5 mr-2" />
                    Continue Shopping
                  </Link>
                  <button
                    onClick={handlePlaceOrder}
                    className="flex-1 bg-ocean-600 text-white py-3 rounded-lg hover:bg-ocean-700 transition font-semibold flex items-center justify-center"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Place Order
                  </button>
                </div>
              </div>

              {/* You May Also Like */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🔥 You May Also Like</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {recommendations.map((product) => (
                    <div key={product._id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <div className="text-4xl text-center mb-2">{getFishEmoji(product.category)}</div>
                      <h4 className="font-semibold text-gray-900 text-center mb-1">{product.fishName}</h4>
                      <p className="text-sm text-gray-500 text-center mb-2">{product.variety}</p>
                      <p className="text-center font-bold text-ocean-600">${product.unitPrice}/{product.category === 'mollusks' && product.fishName === 'Oyster' ? 'doz' : 'kg'}</p>
                      <button
                        onClick={() => addToCart(product._id)}
                        className="w-full mt-3 bg-ocean-100 text-ocean-600 py-2 rounded-lg hover:bg-ocean-200 transition font-semibold flex items-center justify-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CartPage