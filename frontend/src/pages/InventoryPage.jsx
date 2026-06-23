import { useEffect, useState } from 'react'
import { Plus, Search, Edit, Trash2, Package, Filter } from 'lucide-react'
import DashboardSidebar from '../components/DashboardSidebar'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

const InventoryPage = () => {
  const { user } = useAuth()
  const [inventory, setInventory] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    fishName: '',
    category: 'finfish',
    quantity: '',
    unitPrice: '',
    freshnessStatus: 'fresh',
    supplierId: ''
  })

  useEffect(() => {
    fetchInventory()
    if (user?.role === 'admin') {
      fetchSuppliers()
    }
  }, [user])

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory')
      setInventory(response.data)
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers')
      setSuppliers(response.data)
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        quantity: Number(formData.quantity),
        unitPrice: Number(formData.unitPrice)
      }
      if (editingItem) {
        await api.put(`/inventory/${editingItem._id}`, data)
      } else {
        await api.post('/inventory', data)
      }
      setShowModal(false)
      setEditingItem(null)
      setFormData({
        fishName: '',
        category: 'finfish',
        quantity: '',
        unitPrice: '',
        freshnessStatus: 'fresh',
        supplierId: ''
      })
      fetchInventory()
    } catch (error) {
      console.error('Error saving inventory:', error)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      fishName: item.fishName,
      category: item.category,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      freshnessStatus: item.freshnessStatus,
      supplierId: item.supplierId?._id || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/inventory/${id}`)
        fetchInventory()
      } catch (error) {
        console.error('Error deleting item:', error)
      }
    }
  }

  const getFreshnessColor = (status) => {
    switch(status) {
      case 'fresh': return 'bg-green-100 text-green-700'
      case 'good': return 'bg-blue-100 text-blue-700'
      case 'fair': return 'bg-yellow-100 text-yellow-700'
      case 'poor': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.fishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !filterCategory || item.category === filterCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
      </div>
    )
  }

  return (
    <div className="flex">
      <DashboardSidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ocean-900">Inventory Management</h1>
          <p className="text-gray-600 mt-2">Track and manage your seafood inventory</p>
        </div>

        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
              >
                <option value="">All Categories</option>
                <option value="finfish">Finfish</option>
                <option value="shellfish">Shellfish</option>
                <option value="crustaceans">Crustaceans</option>
                <option value="mollusks">Mollusks</option>
                <option value="other">Other</option>
              </select>
              {user?.role === 'admin' && (
                <button
                  onClick={() => {
                    setEditingItem(null)
                    setFormData({
                      fishName: '',
                      category: 'finfish',
                      quantity: '',
                      unitPrice: '',
                      freshnessStatus: 'fresh',
                      supplierId: ''
                    })
                    setShowModal(true)
                  }}
                  className="btn-primary flex items-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Item
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Fish Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Unit Price</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Freshness</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Supplier</th>
                {user?.role === 'admin' && (
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No inventory items found
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="bg-ocean-100 p-2 rounded-lg mr-3">
                          <Package className="h-5 w-5 text-ocean-600" />
                        </div>
                        <p className="font-semibold text-gray-900">{item.fishName}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700 capitalize">{item.category}</td>
                    <td className="py-3 px-4 text-gray-700">{item.quantity} kg</td>
                    <td className="py-3 px-4 text-gray-700">Rs {item.unitPrice}/kg</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getFreshnessColor(item.freshnessStatus)}`}>
                        {item.freshnessStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {item.supplierId ? item.supplierId.name : 'N/A'}
                    </td>
                    {user?.role === 'admin' && (
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-ocean-600 hover:bg-ocean-50 rounded"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingItem ? 'Edit Inventory Item' : 'Add New Item'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Fish Name</label>
                  <input
                    type="text"
                    value={formData.fishName}
                    onChange={(e) => setFormData({...formData, fishName: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="finfish">Finfish</option>
                    <option value="shellfish">Shellfish</option>
                    <option value="crustaceans">Crustaceans</option>
                    <option value="mollusks">Mollusks</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Quantity (kg)</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="input-field"
                    required
                    min="0"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Unit Price (Rs)</label>
                  <input
                    type="number"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                    className="input-field"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Freshness Status</label>
                  <select
                    value={formData.freshnessStatus}
                    onChange={(e) => setFormData({...formData, freshnessStatus: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="fresh">Fresh</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
                {suppliers.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">Supplier</label>
                    <select
                      value={formData.supplierId}
                      onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
                      className="input-field"
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map(supplier => (
                        <option key={supplier._id} value={supplier._id}>
                          {supplier.name} - {supplier.boatId}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingItem(null)
                      setFormData({
                        fishName: '',
                        category: 'finfish',
                        quantity: '',
                        unitPrice: '',
                        freshnessStatus: 'fresh',
                        supplierId: ''
                      })
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    {editingItem ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InventoryPage