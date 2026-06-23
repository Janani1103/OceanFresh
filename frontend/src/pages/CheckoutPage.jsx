import { useEffect, useState } from 'react'
import { ShoppingCart, Search, Package, Heart, ChevronDown, Store, Home, History, User, ArrowLeft, CreditCard, Smartphone, DollarSign } from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate, useLocation } from 'react-router-dom'

const CheckoutPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { state } = location
  const [cartItems, setCartItems] = useState([])
  const [specialInstructions, setSpecialInstructions] = useState(state?.specialInstructions || '')
  const [loading, setLoading] = useState(true)
  
  // Step 1: Delivery Address
  const [addressType, setAddressType] = useState('new') // 'saved' or 'new'
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedSavedAddress, setSelectedSavedAddress] = useState('')
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    zip: '',
    phone: ''
  })

  // Step 2: Delivery Time
  const [deliveryType, setDeliveryType] = useState('standard') // 'standard' or 'express'
  const standardDeliveryFee = 10.00
  const expressDeliveryFee = 25.00

  // Step 3: Payment Method
  const [paymentMethod, setPaymentMethod] = useState('card') // 'cash', 'card', 'mobile'

  useEffect(() => {
    fetchCartItems()
    fetchSavedAddresses()
    // Pre-fill user data if available
    if (user) {
      setNewAddress({
        street: user.address?.street || '',
        city: user.address?.city || '',
        zip: user.address?.zip || '',
        phone: user.phone || ''
      })
    }
  }, [user])

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

  const fetchSavedAddresses = async () => {
    try {
      const response = await api.get('/customers/addresses')
      setSavedAddresses(response.data || [])
      if (response.data && response.data.length > 0) {
        setSelectedSavedAddress(response.data[0]._id)
        setAddressType('saved')
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
      setSavedAddresses([])
    }
  }

  const handleAddressChange = (e) => {
    setNewAddress({
      ...newAddress,
      [e.target.name]: e.target.value
    })
  }

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
  }

  const getDeliveryFee = () => {
    return deliveryType === 'express' ? expressDeliveryFee : standardDeliveryFee
  }

  const getTotal = () => {
    return getSubtotal() + getDeliveryFee()
  }

  const validateForm = () => {
    if (addressType === 'new') {
      if (!newAddress.street || !newAddress.city || !newAddress.zip || !newAddress.phone) {
        alert('Please fill in all address fields')
        return false
      }
    } else if (addressType === 'saved' && !selectedSavedAddress) {
      alert('Please select a saved address')
      return false
    }
    return true
  }

  const handleConfirmOrder = async () => {
    if (!validateForm()) return

    if (cartItems.length === 0) {
      alert('Your cart is empty')
      navigate('/browse')
      return
    }

    try {
      const addressObj = addressType === 'saved' 
        ? savedAddresses.find(addr => addr._id === selectedSavedAddress)
        : newAddress

      const formattedAddress = typeof addressObj === 'object' && addressObj !== null
        ? `${addressObj.street || ''}, ${addressObj.city || ''}, ${addressObj.zip || ''} (Phone: ${addressObj.phone || ''})`
        : addressObj || ''

      const orderData = {
        items: cartItems.map(item => ({
          inventoryId: item.inventoryId || item._id,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        deliveryAddress: formattedAddress,
        deliveryType,
        deliveryFee: getDeliveryFee(),
        paymentMethod,
        specialInstructions,
        totalAmount: getTotal(),
        orderDate: new Date().toISOString()
      }

      const response = await api.post('/orders', orderData)
      
      // Calculate delivery time based on delivery type
      let deliveryTime
      if (deliveryType === 'express') {
        const now = new Date()
        const startHour = 16 // 4 PM
        const endHour = 18 // 6 PM
        deliveryTime = `Today, ${startHour}:00 PM - ${endHour}:00 PM`
      } else {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        deliveryTime = `Tomorrow, ${tomorrow.toLocaleDateString('en-US', { weekday: 'long' })}`
      }
      
      // Clear cart after successful order
      await api.delete('/cart/clear')
      
      // Navigate to success page with order details
      navigate('/order-success', { 
        state: { 
          orderId: response.data.orderId,
          totalAmount: response.data.totalAmount,
          deliveryType,
          deliveryTime,
          orderDate: response.data.orderDate || new Date().toISOString()
        } 
      })
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order. Please try again later.')
    }
  }

  const getFishEmoji = (fishName) => {
    const emojis = {
      'Tuna': '🐟',
      'Salmon': '🐟',
      'Shrimp': '🦐',
      'Crab': '🦀',
      'Lobster': '🦞',
      'Octopus': '🐙',
      'Squid': '🦑',
      'Oyster': '🦪',
      'Sardine': '🐟'
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
                  placeholder="Search..."
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
            <h1 className="text-2xl font-bold text-ocean-900">💳 Checkout – Place Your Order</h1>
          </div>

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-4">Add items to your cart before checkout</p>
              <Link to="/browse" className="inline-block bg-ocean-600 text-white px-6 py-2 rounded-lg hover:bg-ocean-700 transition">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Checkout Steps */}
              <div className="lg:col-span-2 space-y-6">
                {/* STEP 1: Delivery Address */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">STEP 1: Delivery Address</h3>
                  
                  <div className="space-y-4 mb-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="addressType"
                        value="saved"
                        checked={addressType === 'saved'}
                        onChange={(e) => setAddressType(e.target.value)}
                        className="w-4 h-4 text-ocean-600 focus:ring-ocean-500"
                      />
                      <span className="text-gray-700">Use Saved Address</span>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="addressType"
                        value="new"
                        checked={addressType === 'new'}
                        onChange={(e) => setAddressType(e.target.value)}
                        className="w-4 h-4 text-ocean-600 focus:ring-ocean-500"
                      />
                      <span className="text-gray-700">Deliver to New Address</span>
                    </label>
                  </div>

                  {addressType === 'saved' && savedAddresses.length > 0 ? (
                    <div className="space-y-3">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr._id}
                          className={`p-4 border rounded-lg cursor-pointer transition ${
                            selectedSavedAddress === addr._id ? 'border-ocean-500 bg-ocean-50' : 'border-gray-300 hover:border-ocean-300'
                          }`}
                          onClick={() => setSelectedSavedAddress(addr._id)}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              checked={selectedSavedAddress === addr._id}
                              onChange={() => setSelectedSavedAddress(addr._id)}
                              className="w-4 h-4 text-ocean-600 focus:ring-ocean-500"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{addr.street}</p>
                              <p className="text-sm text-gray-600">{addr.city}, {addr.zip}</p>
                              <p className="text-sm text-gray-600">{addr.phone}</p>
                              {addr.isDefault && <span className="text-xs bg-ocean-100 text-ocean-600 px-2 py-1 rounded mt-1 inline-block">Default</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : addressType === 'saved' ? (
                    <p className="text-gray-500 text-center py-4">No saved addresses found</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                        <input
                          type="text"
                          name="street"
                          value={newAddress.street}
                          onChange={handleAddressChange}
                          placeholder="123 Main Street"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          name="city"
                          value={newAddress.city}
                          onChange={handleAddressChange}
                          placeholder="Colombo"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div className="flex space-x-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                          <input
                            type="text"
                            name="zip"
                            value={newAddress.zip}
                            onChange={handleAddressChange}
                            placeholder="00100"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            type="text"
                            name="phone"
                            value={newAddress.phone}
                            onChange={handleAddressChange}
                            placeholder="+94 77..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* STEP 2: Delivery Time */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">STEP 2: Delivery Time</h3>
                  
                  <div className="space-y-3">
                    <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${
                      deliveryType === 'standard' ? 'border-ocean-500 bg-ocean-50' : 'border-gray-300 hover:border-ocean-300'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="deliveryType"
                          value="standard"
                          checked={deliveryType === 'standard'}
                          onChange={(e) => setDeliveryType(e.target.value)}
                          className="w-4 h-4 text-ocean-600 focus:ring-ocean-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">Standard Delivery</p>
                          <p className="text-sm text-gray-600">Tomorrow, Jan 16</p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900">${standardDeliveryFee.toFixed(2)}</span>
                    </label>
                    
                    <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${
                      deliveryType === 'express' ? 'border-ocean-500 bg-ocean-50' : 'border-gray-300 hover:border-ocean-300'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="deliveryType"
                          value="express"
                          checked={deliveryType === 'express'}
                          onChange={(e) => setDeliveryType(e.target.value)}
                          className="w-4 h-4 text-ocean-600 focus:ring-ocean-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">Express Delivery</p>
                          <p className="text-sm text-gray-600">Today, 4-6 PM</p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900">${expressDeliveryFee.toFixed(2)}</span>
                    </label>
                  </div>
                </div>

                {/* STEP 3: Payment Method */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">STEP 3: Payment Method</h3>
                  
                  <div className="space-y-3">
                    <label className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition ${
                      paymentMethod === 'cash' ? 'border-ocean-500 bg-ocean-50' : 'border-gray-300 hover:border-ocean-300'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-ocean-600 focus:ring-ocean-500"
                      />
                      <DollarSign className="h-5 w-5 text-gray-600" />
                      <span className="text-gray-700">Cash on Delivery</span>
                    </label>
                    
                    <label className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition ${
                      paymentMethod === 'card' ? 'border-ocean-500 bg-ocean-50' : 'border-gray-300 hover:border-ocean-300'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-ocean-600 focus:ring-ocean-500"
                      />
                      <CreditCard className="h-5 w-5 text-gray-600" />
                      <span className="text-gray-700">Credit/Debit Card</span>
                    </label>
                    
                    <label className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition ${
                      paymentMethod === 'mobile' ? 'border-ocean-500 bg-ocean-50' : 'border-gray-300 hover:border-ocean-300'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="mobile"
                        checked={paymentMethod === 'mobile'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-ocean-600 focus:ring-ocean-500"
                      />
                      <Smartphone className="h-5 w-5 text-gray-600" />
                      <span className="text-gray-700">Mobile Payment</span>
                    </label>
                  </div>
                </div>

                {/* Special Instructions */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">📝 Special Instructions</h3>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Please clean and gut the fish, remove heads, etc."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none resize-none"
                  />
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Order Summary</h3>
                  
                  <div className="space-y-3 mb-4">
                    {cartItems.map((item) => (
                      <div key={item._id} className="flex justify-between items-center py-2 border-b">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{getFishEmoji(item.fishName)}</span>
                          <div>
                            <p className="font-medium text-gray-900">{item.fishName} ({item.quantity}kg)</p>
                            <p className="text-xs text-gray-500">{item.variety}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-gray-900">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span className="font-semibold">${getSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery ({deliveryType === 'express' ? 'Express' : 'Standard'}):</span>
                      <span className="font-semibold">${getDeliveryFee().toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>TOTAL:</span>
                        <span>${getTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <Link
                      to="/cart"
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold flex items-center justify-center"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Back to Cart
                    </Link>
                    <button
                      onClick={handleConfirmOrder}
                      className="flex-1 bg-ocean-600 text-white py-3 rounded-lg hover:bg-ocean-700 transition font-semibold flex items-center justify-center"
                    >
                      ✅ Confirm Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage