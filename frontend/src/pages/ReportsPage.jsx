import { useEffect, useState } from 'react'
import { BarChart, LineChart, PieChart } from 'lucide-react'
import DashboardSidebar from '../components/DashboardSidebar'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts'

const ReportsPage = () => {
  const { user } = useAuth()
  const [monthlySales, setMonthlySales] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [supplierContributions, setSupplierContributions] = useState([])
  const [inventoryReport, setInventoryReport] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchReports()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchReports = async () => {
    try {
      const [salesRes, productsRes, suppliersRes, inventoryRes] = await Promise.all([
        api.get('/reports/sales/monthly'),
        api.get('/reports/sales/top-products'),
        api.get('/reports/suppliers/contributions'),
        api.get('/reports/inventory')
      ])

      const formattedSales = salesRes.data.map(item => ({
        name: `${item._id.month}/${item._id.year}`,
        sales: item.total,
        orders: item.count
      }))

      const formattedProducts = productsRes.data.map(item => ({
        name: item._id,
        quantity: item.totalQuantity,
        revenue: item.totalRevenue
      }))

      const formattedSuppliers = suppliersRes.data.map(item => ({
        name: item.supplierName,
        value: item.totalQuantity
      }))

      const formattedInventory = inventoryRes.data.map(item => ({
        name: item._id,
        quantity: item.totalQuantity,
        value: item.totalValue
      }))

      setMonthlySales(formattedSales)
      setTopProducts(formattedProducts)
      setSupplierContributions(formattedSuppliers)
      setInventoryReport(formattedInventory)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateMonthlySales = async () => {
    try {
      const response = await api.get('/reports/sales/monthly')
      const formattedSales = response.data.map(item => ({
        name: `${item._id.month}/${item._id.year}`,
        sales: item.total,
        orders: item.count
      }))
      setMonthlySales(formattedSales)
    } catch (error) {
      console.error('Error generating monthly sales report:', error)
    }
  }

  const handleGenerateInventoryReport = async () => {
    try {
      const response = await api.get('/reports/inventory')
      const formattedInventory = response.data.map(item => ({
        name: item._id,
        quantity: item.totalQuantity,
        value: item.totalValue
      }))
      setInventoryReport(formattedInventory)
    } catch (error) {
      console.error('Error generating inventory report:', error)
    }
  }

  const handleGenerateSupplierReport = async () => {
    try {
      const response = await api.get('/reports/suppliers/contributions')
      const formattedSuppliers = response.data.map(item => ({
        name: item.supplierName,
        value: item.totalQuantity
      }))
      setSupplierContributions(formattedSuppliers)
    } catch (error) {
      console.error('Error generating supplier report:', error)
    }
  }

  const COLORS = ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe', '#0369a1', '#075985', '#0c4a6e']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
      </div>
    )
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex">
        <DashboardSidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="card text-center py-12">
            <BarChart className="h-16 w-16 text-ocean-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600">Reports are only available to administrators.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <DashboardSidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ocean-900">Reports</h1>
          <p className="text-gray-600 mt-2">Generate and view business reports</p>
        </div>

        {/* Report Generation Buttons */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleGenerateMonthlySales}
              className="btn-primary flex items-center justify-center"
            >
              Generate Monthly Sales
            </button>
            <button
              onClick={handleGenerateInventoryReport}
              className="btn-primary flex items-center justify-center"
            >
              Generate Inventory Report
            </button>
            <button
              onClick={handleGenerateSupplierReport}
              className="btn-primary flex items-center justify-center"
            >
              Generate Supplier Report
            </button>
          </div>
        </div>

        {/* Sales Chart */}
        <div className="card mb-8">
          <div className="flex items-center mb-4">
            <LineChart className="h-6 w-6 text-ocean-600 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">Sales Chart</h3>
          </div>
          <div className="h-96">
            {monthlySales.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#0284c7" strokeWidth={2} name="Sales ($)" />
                  <Line type="monotone" dataKey="orders" stroke="#0ea5e9" strokeWidth={2} name="Orders" />
                </RechartsLineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available. Click "Generate Monthly Sales" to load data.
              </div>
            )}
          </div>
        </div>

        {/* Most Sold Seafood Bar Chart */}
        <div className="card mb-8">
          <div className="flex items-center mb-4">
            <BarChart className="h-6 w-6 text-ocean-600 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">Most Sold Seafood</h3>
          </div>
          <div className="h-96">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantity" fill="#0284c7" name="Quantity (kg)" />
                  <Bar dataKey="revenue" fill="#0ea5e9" name="Revenue ($)" />
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Supplier Contributions Pie Chart */}
        <div className="card">
          <div className="flex items-center mb-4">
            <PieChart className="h-6 w-6 text-ocean-600 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">Supplier Contributions</h3>
          </div>
          <div className="h-96">
            {supplierContributions.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={supplierContributions}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {supplierContributions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available. Click "Generate Supplier Report" to load data.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsPage