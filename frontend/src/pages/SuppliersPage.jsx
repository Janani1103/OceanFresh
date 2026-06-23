import { useEffect, useState } from 'react'
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react'
import DashboardSidebar from '../components/DashboardSidebar'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

const SuppliersPage = () => {
  const { user } = useAuth()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    fishingArea: '',
    boatId: ''
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers')
      setSuppliers(response.data)
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (searchQuery) {
      try {
        const response = await api.get(`/suppliers/search/${searchQuery}`)
        setSuppliers(response.data)
      } catch (error) {
        console.error('Error searching suppliers:', error)
      }
    } else {
      fetchSuppliers()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier._id}`, formData)
      } else {
        await api.post('/suppliers', formData)
      }
      setShowModal(false)
      setEditingSupplier(null)
      setFormData({ name: '', contactNumber: '', fishingArea: '', boatId: '' })
      fetchSuppliers()
    } catch (error) {
      console.error('Error saving supplier:', error)
    }
  }

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      contactNumber: supplier.contactNumber,
      fishingArea: supplier.fishingArea,
      boatId: supplier.boatId
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await api.delete(`/suppliers/${id}`)
        fetchSuppliers()
      } catch (error) {
        console.error('Error deleting supplier:', error)
      }
    }
  }

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.boatId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.fishingArea.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
          <h1 className="text-3xl font-bold text-ocean-900">Supplier Management</h1>
          <p className="text-gray-600 mt-2">Manage your fishing suppliers and their details</p>
        </div>

        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
              />
            </div>
            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  setEditingSupplier(null)
                  setFormData({ name: '', contactNumber: '', fishingArea: '', boatId: '' })
                  setShowModal(true)
                }}
                className="btn-primary flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Supplier
              </button>
            )}
          </div>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Fishing Area</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Boat ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                {user?.role === 'admin' && (
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No suppliers found
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="bg-ocean-100 p-2 rounded-lg mr-3">
                          <Users className="h-5 w-5 text-ocean-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{supplier.name}</p>
                          <p className="text-sm text-gray-500">{supplier.totalCatch} kg total</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{supplier.contactNumber}</td>
                    <td className="py-3 px-4 text-gray-700">{supplier.fishingArea}</td>
                    <td className="py-3 px-4 text-gray-700">{supplier.boatId}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        supplier.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {supplier.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {user?.role === 'admin' && (
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(supplier)}
                            className="p-2 text-ocean-600 hover:bg-ocean-50 rounded"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(supplier._id)}
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
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Contact Number</label>
                  <input
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Fishing Area</label>
                  <input
                    type="text"
                    value={formData.fishingArea}
                    onChange={(e) => setFormData({...formData, fishingArea: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Boat ID</label>
                  <input
                    type="text"
                    value={formData.boatId}
                    onChange={(e) => setFormData({...formData, boatId: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingSupplier(null)
                      setFormData({ name: '', contactNumber: '', fishingArea: '', boatId: '' })
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    {editingSupplier ? 'Update' : 'Add'}
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

export default SuppliersPage