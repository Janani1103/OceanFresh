import { useState, useEffect } from 'react'

const LiveTrackingModal = ({ order, onClose, onCallDriver }) => {
  const [progress, setProgress] = useState(75)

  useEffect(() => {
    // Simulate live progress updates
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev
        return prev + 1
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  if (!order) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full mx-4">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center">
              <span className="mr-2">📍</span>
              LIVE TRACKING – Order #{order.orderId}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Map View */}
          <div className="bg-gray-100 rounded-lg p-4 mb-4 relative">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <div className="flex items-center justify-center space-x-2 text-2xl">
                <span>🏪</span>
                <span className="text-gray-400">────</span>
                <span className="animate-bounce">🚚</span>
                <span className="text-gray-400">────</span>
                <span>📍</span>
                <span className="text-gray-400">────</span>
                <span>🏠</span>
              </div>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 mt-2">
                <span>Store</span>
                <span>Truck</span>
                <span>You</span>
                <span>Home</span>
              </div>
              <div className="mt-3 text-xs text-gray-500 italic">
                [Live truck location updating...]
              </div>
            </div>
          </div>

          {/* Driver Information */}
          <div className="bg-ocean-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center">
                <span className="mr-2">🚚</span>
                <span className="text-gray-700">Driver: {order.driverName || 'Ravi Perera'}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">📞</span>
                <span className="text-gray-700">{order.driverPhone || '+94 77 987 6543'}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">🕐</span>
                <span className="text-gray-700">ETA: {order.estimatedArrival || '25 minutes'}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">📍</span>
                <span className="text-gray-700">Distance: 3.2 km away</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-purple-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-purple-800 flex items-center">
                <span className="mr-1">🟣</span>
                Dispatched – On the way!
              </span>
              <span className="text-sm font-bold text-purple-800">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-purple-600 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button 
              onClick={() => onCallDriver && onCallDriver(order)}
              className="flex-1 bg-ocean-600 text-white py-3 rounded-lg hover:bg-ocean-700 transition font-semibold flex items-center justify-center"
            >
              <span className="mr-2">📞</span>
              Call Driver
            </button>
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition font-semibold flex items-center justify-center"
            >
              <span className="mr-2">✕</span>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveTrackingModal
