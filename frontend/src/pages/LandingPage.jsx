import { Link } from 'react-router-dom'
import { Fish, Package, ShoppingCart, BarChart3, Shield, Clock, Smartphone, TrendingUp, CheckCircle } from 'lucide-react'
import heroImage from '../images/hero.png'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#F0F8FF]">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Fish className="h-8 w-8 text-ocean-600 mr-2" />
              <span className="text-2xl font-bold text-ocean-900">OceanFresh</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="#" className="text-gray-700 hover:text-ocean-600 transition">Home</Link>
              <Link to="#features" className="text-gray-700 hover:text-ocean-600 transition">Features</Link>
              <Link to="#modules" className="text-gray-700 hover:text-ocean-600 transition">Modules</Link>
              <Link to="#" className="text-gray-700 hover:text-ocean-600 transition">About</Link>
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-ocean-600 hover:text-ocean-700 font-semibold">Login</Link>
                <Link to="/register" className="bg-ocean-600 text-white px-4 py-2 rounded-lg hover:bg-ocean-700 transition">Register</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <section
        className="py-20 px-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl max-w-4xl mx-auto">
            <div className="text-6xl mb-4">🌊</div>
            <h1 className="text-5xl md:text-6xl font-bold text-ocean-900 mb-4">
              OCEANFRESH
            </h1>
            <h2 className="text-2xl md:text-3xl text-ocean-700 mb-6">
              Fisheries & Seafood Supply Chain Management System
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              From Ocean to Table — Freshness Tracked, Trust Delivered
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/register" className="bg-ocean-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-ocean-700 transition flex items-center">
                Get Started
              </Link>
              <button className="bg-white text-ocean-600 border-2 border-ocean-600 px-8 py-4 rounded-lg font-semibold hover:bg-ocean-50 transition flex items-center">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card text-center hover:shadow-xl transition">
              <div className="bg-ocean-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Fish className="h-8 w-8 text-ocean-600" />
              </div>
              <h3 className="text-xl font-bold text-ocean-900 mb-2">Supplier Management</h3>
              <p className="text-gray-600">Manage fishermen & catch details efficiently</p>
            </div>
            <div className="card text-center hover:shadow-xl transition">
              <div className="bg-ocean-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-ocean-600" />
              </div>
              <h3 className="text-xl font-bold text-ocean-900 mb-2">Inventory Management</h3>
              <p className="text-gray-600">Track fresh seafood stock & quality</p>
            </div>
            <div className="card text-center hover:shadow-xl transition">
              <div className="bg-ocean-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-ocean-600" />
              </div>
              <h3 className="text-xl font-bold text-ocean-900 mb-2">Order Management</h3>
              <p className="text-gray-600">Seamless order flow & delivery tracking</p>
            </div>
            <div className="card text-center hover:shadow-xl transition">
              <div className="bg-ocean-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-ocean-600" />
              </div>
              <h3 className="text-xl font-bold text-ocean-900 mb-2">Reports & Analytics</h3>
              <p className="text-gray-600">Real-time dashboards & insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badge */}
      <section className="py-12 px-4 bg-ocean-50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-ocean-700 font-semibold text-lg">
            Trusted by 200+ Fisheries Across the Coast
          </p>
        </div>
      </section>

      {/* Why OceanFresh */}
      <section id="modules" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-ocean-900 text-center mb-12">
            Why OceanFresh?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-ocean-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-ocean-900">Real-time Inventory Tracking</h3>
                <p className="text-gray-600 text-sm">Monitor stock levels instantly</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Shield className="h-6 w-6 text-ocean-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-ocean-900">Role-Based Access Control</h3>
                <p className="text-gray-600 text-sm">Secure user permissions</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Clock className="h-6 w-6 text-ocean-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-ocean-900">Delivery Status Tracking</h3>
                <p className="text-gray-600 text-sm">Track orders from start to finish</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <TrendingUp className="h-6 w-6 text-ocean-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-ocean-900">Advanced Analytics & Reports</h3>
                <p className="text-gray-600 text-sm">Data-driven business insights</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Smartphone className="h-6 w-6 text-ocean-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-ocean-900">Mobile Responsive Design</h3>
                <p className="text-gray-600 text-sm">Access from anywhere, anytime</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Package className="h-6 w-6 text-ocean-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-ocean-900">Seamless Order Management</h3>
                <p className="text-gray-600 text-sm">Streamlined ordering process</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-ocean-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Digitalize Your Seafood Business?
          </h2>
          <Link to="/register" className="inline-block bg-white text-ocean-600 px-8 py-4 rounded-lg font-semibold hover:bg-ocean-50 transition mt-4">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ocean-900 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Fish className="h-6 w-6 mr-2" />
              <span className="text-xl font-bold">OceanFresh</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="#" className="hover:text-ocean-300 transition">Privacy</Link>
              <Link to="#" className="hover:text-ocean-300 transition">Terms</Link>
              <Link to="#" className="hover:text-ocean-300 transition">Contact</Link>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <span className="text-2xl cursor-pointer hover:text-ocean-300">🌐</span>
              <span className="text-2xl cursor-pointer hover:text-ocean-300">🐦</span>
              <span className="text-2xl cursor-pointer hover:text-ocean-300">📘</span>
            </div>
          </div>
          <div className="text-center mt-8 text-ocean-300 text-sm">
            © 2025 OceanFresh. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage