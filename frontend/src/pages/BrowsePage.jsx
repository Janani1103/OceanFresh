import { useEffect, useState } from 'react'
import { Search, ShoppingCart, Star, Package, Heart, Grid3x3, List, ChevronDown, Flame, X } from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const BrowsePage = () => {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedFreshness, setSelectedFreshness] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('grid')
  const [wishlist, setWishlist] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [showCartPreview, setShowCartPreview] = useState(false)
  const [quantities, setQuantities] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [showQuickView, setShowQuickView] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [modalQuantity, setModalQuantity] = useState(1)
  const itemsPerPage = 9

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'finfish', label: 'Finfish' },
    { value: 'shellfish', label: 'Shellfish' },
    { value: 'crustaceans', label: 'Crustaceans' },
    { value: 'mollusks', label: 'Mollusks' },
    { value: 'other', label: 'Other' }
  ]

  const freshnessLevels = [
    { value: 'all', label: 'All' },
    { value: 'fresh', label: 'Fresh' },
    { value: 'average', label: 'Average' },
    { value: 'poor', label: 'Poor' }
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Rating' },
    { value: 'name', label: 'Name' }
  ]

  useEffect(() => {
    fetchProducts()
    fetchWishlist()
    fetchCartItems()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery, selectedCategory, selectedFreshness, sortBy])

  const fetchProducts = async () => {
    try {
      const response = await api.get('/inventory')
      setProducts(response.data)
      setFilteredProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
      setFilteredProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/wishlist')
      const items = response.data.items || []
      setWishlist(items.map(item => item.inventoryId || item._id))
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    }
  }

  const fetchCartItems = async () => {
    try {
      const response = await api.get('/cart')
      setCartItems(response.data.items || [])
    } catch (error) {
      console.error('Error fetching cart items:', error)
      setCartItems([])
    }
  }

  const filterProducts = () => {
    let filtered = [...products]

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.fishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.variety.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    if (selectedFreshness !== 'all') {
      filtered = filtered.filter(product => product.freshnessStatus === selectedFreshness)
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.unitPrice - b.unitPrice)
        break
      case 'price-high':
        filtered.sort((a, b) => b.unitPrice - a.unitPrice)
        break
      case 'rating':
        filtered.sort((a, b) => b.averageRating - a.averageRating)
        break
      case 'name':
        filtered.sort((a, b) => a.fishName.localeCompare(b.fishName))
        break
      case 'newest':
      default:
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
        break
    }

    setFilteredProducts(filtered)
  }

  const addToCart = async (productId, quantity = 1) => {
    try {
      await api.post('/cart/add', { itemId: productId, quantity })
      fetchCartItems()
      setQuantities({ ...quantities, [productId]: 0 })
      alert('Added to cart!')
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert(error.response?.data?.message || 'Failed to add to cart')
    }
  }

  const toggleWishlist = async (productId) => {
    try {
      if (wishlist.includes(productId)) {
        await api.delete(`/wishlist/${productId}`)
        setWishlist(wishlist.filter(id => id !== productId))
      } else {
        await api.post('/wishlist/add', { itemId: productId })
        setWishlist([...wishlist, productId])
      }
    } catch (error) {
      console.error('Error updating wishlist:', error)
      alert('Failed to update wishlist')
    }
  }

  const getFreshnessColor = (status) => {
    switch(status) {
      case 'fresh': return 'bg-green-100 text-green-700'
      case 'average': return 'bg-yellow-100 text-yellow-700'
      case 'poor': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
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

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.unitPrice || item.price || 0
      return total + (price * item.quantity)
    }, 0)
  }

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  const handleQuantityChange = (productId, value) => {
    setQuantities({ ...quantities, [productId]: Math.max(1, parseInt(value) || 1) })
  }

  const openQuickView = (product) => {
    setSelectedProduct(product)
    setModalQuantity(1)
    setShowQuickView(true)
  }

  const closeQuickView = () => {
    setShowQuickView(false)
    setSelectedProduct(null)
    setModalQuantity(1)
  }

  const handleModalQuantityChange = (value) => {
    setModalQuantity(Math.max(1, parseInt(value) || 1))
  }

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

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
                <Package className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/browse" className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-ocean-50 text-ocean-600">
                <Search className="h-5 w-5" />
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
                <Package className="h-5 w-5" />
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
                <Package className="h-5 w-5" />
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
                  placeholder="Search tuna, salmon..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowCartPreview(!showCartPreview)}
                  className="flex items-center space-x-2 bg-ocean-600 text-white px-4 py-2 rounded-lg hover:bg-ocean-700 transition"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Cart({getCartItemCount()}) ${getCartTotal().toFixed(2)}</span>
                </button>
                
                {/* Quick Cart Preview Dropdown */}
                {showCartPreview && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold text-gray-900">🛒 Your Cart ({cartItems.length} items)</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-4">
                      {cartItems.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Your cart is empty</p>
                      ) : (
                        cartItems.map((item, index) => {
                          const itemName = item.fishName || item.name
                          const itemPrice = item.unitPrice || item.price
                          return (
                            <div key={index} className="flex items-center justify-between py-2 border-b">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">🐟</span>
                                <div>
                                  <p className="font-medium text-gray-900">{itemName}</p>
                                  <p className="text-sm text-gray-500">{item.quantity}kg × ${itemPrice}</p>
                                </div>
                              </div>
                              <span className="font-semibold">${(item.quantity * itemPrice).toFixed(2)}</span>
                            </div>
                          )
                        })
                      )}
                    </div>
                    {cartItems.length > 0 && (
                      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-semibold">${getCartTotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Delivery:</span>
                          <span className="font-semibold">$10.00</span>
                        </div>
                        <div className="flex justify-between mb-4 pt-2 border-t">
                          <span className="font-semibold">Total:</span>
                          <span className="font-bold text-ocean-600">${(getCartTotal() + 10).toFixed(2)}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            to="/cart"
                            onClick={() => setShowCartPreview(false)}
                            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 text-center transition"
                          >
                            View Full Cart
                          </Link>
                          <Link
                            to="/checkout"
                            onClick={() => setShowCartPreview(false)}
                            className="flex-1 bg-ocean-600 text-white py-2 rounded-lg hover:bg-ocean-700 text-center transition"
                          >
                            Checkout
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-gray-700">
                <span className="font-medium">{user?.name || 'John'}</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-ocean-900">🏪 Browse Fresh Seafood</h1>
                <p className="text-gray-600 mt-1">"Fresh from ocean to you"</p>
              </div>
            </div>
          </div>

          {/* Flash Sale Banner */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-4 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Flame className="h-8 w-8" />
                <div>
                  <h3 className="font-bold text-lg">🔥 Flash Sale! Tuna 15% OFF – Limited Stock!</h3>
                  <p className="text-sm opacity-90">Grab the deal before it's gone</p>
                </div>
              </div>
              <button className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-orange-50 transition">
                Shop Now →
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none text-sm"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Freshness:</span>
                <select
                  value={selectedFreshness}
                  onChange={(e) => setSelectedFreshness(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none text-sm"
                >
                  {freshnessLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none text-sm"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2 ml-auto">
                <span className="text-sm font-medium text-gray-700">View:</span>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-ocean-100 text-ocean-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <Grid3x3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-ocean-100 text-ocean-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProducts.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition cursor-pointer" onClick={() => openQuickView(product)}>
                  <div className="relative p-6 bg-gradient-to-br from-ocean-50 to-blue-50 rounded-t-lg">
                    <div className="text-6xl text-center">{getFishEmoji(product.category)}</div>
                    {product.onSale && (
                      <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
                        -{product.discount}%
                      </div>
                    )}
                    {product.isNew && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                        NEW
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleWishlist(product._id)
                      }}
                      className="absolute bottom-2 right-2 p-2 rounded-full bg-white shadow hover:bg-gray-100 transition"
                    >
                      <Heart
                        className={`h-5 w-5 ${wishlist.includes(product._id) ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                      />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="text-center mb-3">
                      <h3 className="font-bold text-xl text-gray-900 uppercase">{product.fishName}</h3>
                      <p className="text-gray-500 text-sm">{product.variety}</p>
                    </div>
                    <div className="flex items-center justify-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < Math.floor(product.averageRating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">{product.averageRating}</span>
                      <span className="text-sm text-gray-400 ml-1">({product.reviewCount})</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-2xl font-bold text-ocean-600">
                          ${product.onSale ? (product.unitPrice * (1 - product.discount / 100)).toFixed(2) : product.unitPrice}
                          <span className="text-sm font-normal text-gray-500">/kg</span>
                        </p>
                        {product.onSale && (
                          <p className="text-sm text-gray-400 line-through">${product.unitPrice}/kg</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getFreshnessColor(product.freshnessStatus)}`}>
                        {product.freshnessStatus === 'fresh' ? '🟢 Fresh' : product.freshnessStatus === 'average' ? '🟡 Average' : '🔴 Poor'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 text-center">{product.quantity}kg left</p>
                    <div className="flex items-center space-x-2 mb-3" onClick={(e) => e.stopPropagation()}>
                      <span className="text-sm text-gray-700">Qty:</span>
                      <input
                        type="number"
                        min="1"
                        value={quantities[product._id] || 1}
                        onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                        className="w-20 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        addToCart(product._id, quantities[product._id] || 1)
                      }}
                      className="w-full bg-ocean-600 text-white py-2 rounded-lg hover:bg-ocean-700 transition font-semibold flex items-center justify-center"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedProducts.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-4 cursor-pointer" onClick={() => openQuickView(product)}>
                  <div className="flex items-start space-x-4">
                    <div className="text-5xl">{getFishEmoji(product.category)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-xl text-gray-900 uppercase">{product.fishName}</h3>
                          <p className="text-gray-500">{product.variety}</p>
                          <div className="flex items-center mt-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < Math.floor(product.averageRating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600 ml-2">{product.averageRating}</span>
                            <span className="text-sm text-gray-400 ml-1">({product.reviewCount} reviews)</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleWishlist(product._id)
                          }}
                          className="p-2 rounded-full hover:bg-gray-100 transition"
                        >
                          <Heart
                            className={`h-5 w-5 ${wishlist.includes(product._id) ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-2xl font-bold text-ocean-600">
                              ${product.onSale ? (product.unitPrice * (1 - product.discount / 100)).toFixed(2) : product.unitPrice}
                              <span className="text-sm font-normal text-gray-500">/kg</span>
                            </p>
                            {product.onSale && (
                              <p className="text-sm text-gray-400 line-through">${product.unitPrice}/kg</p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getFreshnessColor(product.freshnessStatus)}`}>
                            {product.freshnessStatus === 'fresh' ? '🟢 Fresh' : product.freshnessStatus === 'average' ? '🟡 Average' : '🔴 Poor'}
                          </span>
                          <p className="text-sm text-gray-600">{product.quantity}kg left</p>
                        </div>
                        <div className="flex items-center space-x-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-700">Qty:</span>
                            <input
                              type="number"
                              min="1"
                              value={quantities[product._id] || 1}
                              onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                              className="w-20 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                            />
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              addToCart(product._id, quantities[product._id] || 1)
                            }}
                            className="bg-ocean-600 text-white px-6 py-2 rounded-lg hover:bg-ocean-700 transition font-semibold flex items-center"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms</p>
            </div>
          )}

          {/* Pagination */}
          {filteredProducts.length > itemsPerPage && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-white border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ◀ Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-lg ${currentPage === i + 1 ? 'bg-ocean-600 text-white' : 'bg-white border hover:bg-gray-50'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-white border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next ▶
              </button>
              <span className="text-sm text-gray-600 ml-4">
                Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length}
              </span>
            </div>
          )}
        </div>

        {/* Quick View Modal */}
        {showQuickView && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-3xl font-bold text-gray-900 uppercase">{selectedProduct.fishName}</h2>
                  <button
                    onClick={closeQuickView}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Image */}
                  <div className="bg-gradient-to-br from-ocean-50 to-blue-50 rounded-lg p-8 flex items-center justify-center">
                    <div className="text-9xl">{getFishEmoji(selectedProduct.category)}</div>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{selectedProduct.variety}</h3>
                      <div className="flex items-center mt-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${i < Math.floor(selectedProduct.averageRating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-lg text-gray-600 ml-2">{selectedProduct.averageRating}</span>
                        <span className="text-sm text-gray-400 ml-1">({selectedProduct.reviewCount} reviews)</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-gray-600 w-32">Freshness:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getFreshnessColor(selectedProduct.freshnessStatus)}`}>
                          {selectedProduct.freshnessStatus === 'fresh' ? '🟢 Fresh' : selectedProduct.freshnessStatus === 'average' ? '🟡 Average' : '🔴 Poor'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600 w-32">Available:</span>
                        <span className="font-semibold text-gray-900">{selectedProduct.quantity}kg</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600 w-32">Price:</span>
                        <div>
                          <span className="text-3xl font-bold text-ocean-600">
                            ${selectedProduct.onSale ? (selectedProduct.unitPrice * (1 - selectedProduct.discount / 100)).toFixed(2) : selectedProduct.unitPrice}
                            <span className="text-lg font-normal text-gray-500">/ kg</span>
                          </span>
                          {selectedProduct.onSale && (
                            <span className="text-sm text-gray-400 line-through ml-2">${selectedProduct.unitPrice}/kg</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Description:</h4>
                      <p className="text-gray-600 leading-relaxed">{selectedProduct.description}</p>
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex items-center">
                        <span className="text-gray-600 w-32">Category:</span>
                        <span className="text-gray-900">{selectedProduct.categoryDetail}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600 w-32">Origin:</span>
                        <span className="text-gray-900">{selectedProduct.origin}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600 w-32">Date Caught:</span>
                        <span className="text-gray-900">{selectedProduct.dateCaught}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center space-x-4 mb-4">
                        <span className="text-gray-700 font-medium">Quantity:</span>
                        <input
                          type="number"
                          min="1"
                          max={selectedProduct.quantity}
                          value={modalQuantity}
                          onChange={(e) => handleModalQuantityChange(e.target.value)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                        />
                        <span className="text-gray-600">kg</span>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => toggleWishlist(selectedProduct._id)}
                          className={`flex-1 py-3 px-4 rounded-lg font-semibold flex items-center justify-center transition ${
                            wishlist.includes(selectedProduct._id)
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Heart
                            className={`h-5 w-5 mr-2 ${wishlist.includes(selectedProduct._id) ? 'fill-current' : ''}`}
                          />
                          {wishlist.includes(selectedProduct._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        </button>
                        <button
                          onClick={() => {
                            addToCart(selectedProduct._id, modalQuantity)
                            closeQuickView()
                          }}
                          className="flex-1 bg-ocean-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-ocean-700 transition flex items-center justify-center"
                        >
                          <ShoppingCart className="h-5 w-5 mr-2" />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BrowsePage
