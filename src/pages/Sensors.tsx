import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Thermometer, 
  Droplets, 
  Cloud, 
  CloudRain, 
  Activity,
  Wifi,
  Battery,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import SensorService from '../services/sensorService'
import { SensorData, SensorStatus } from '../types/sensor'

export default function Sensors() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null)
  const [sensorStatus, setSensorStatus] = useState<SensorStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isRealTime, setIsRealTime] = useState(true)

  const sensorService = SensorService.getInstance()

  const fetchData = async () => {
    try {
      const [data, status] = await Promise.all([
        sensorService.getSensorData(),
        sensorService.getSensorStatus()
      ])
      setSensorData(data)
      setSensorStatus(status)
    } catch (error) {
      console.error('Error fetching sensor data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleToggleRealTime = () => {
    setIsRealTime(!isRealTime)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const handleCalibrate = async () => {
    setRefreshing(true)
    await sensorService.calibrateSensor()
    fetchData()
  }

  useEffect(() => {
    // Initial data fetch
    fetchData()
    
    // Subscribe to real-time updates
    const handleRealTimeUpdate = (data: SensorData) => {
      setSensorData(data)
      setLastUpdate(new Date())
      setLoading(false)
    }
    
    if (isRealTime) {
      sensorService.subscribeToRealTimeData(handleRealTimeUpdate)
    }
    
    // Fetch status updates periodically
    const statusInterval = setInterval(async () => {
      try {
        const status = await sensorService.getSensorStatus()
        setSensorStatus(status)
      } catch (error) {
        console.error('Error fetching sensor status:', error)
      }
    }, 5000)
    
    return () => {
      sensorService.unsubscribeFromRealTimeData(handleRealTimeUpdate)
      clearInterval(statusInterval)
    }
  }, [isRealTime])

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getRainfallIcon = (intensity: string) => {
    switch (intensity) {
      case 'heavy': return <CloudRain className="w-8 h-8 text-blue-600" />
      case 'moderate': return <CloudRain className="w-6 h-6 text-blue-500" />
      case 'light': return <Cloud className="w-6 h-6 text-gray-500" />
      default: return <Cloud className="w-6 h-6 text-gray-300" />
    }
  }

  const getRainfallColor = (intensity: string) => {
    switch (intensity) {
      case 'heavy': return 'text-red-600 bg-red-50 border-red-200'
      case 'moderate': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'light': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading sensor data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Sensor Dashboard</h1>
          <p className="text-gray-600">ESP32 DHT11 Environmental Monitoring</p>
        </motion.div>

        {/* Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-4 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${sensorStatus?.isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                <span className="text-sm font-medium">
                  {sensorStatus?.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Wifi className="w-4 h-4" />
                <span>{sensorStatus?.signalStrength?.toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Battery className="w-4 h-4" />
                <span>{sensorStatus?.batteryLevel?.toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className={`w-2 h-2 rounded-full ${isRealTime ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span>{isRealTime ? 'Live' : 'Manual'}</span>
              </div>
              <div className="text-sm text-gray-600">
                Last update: {formatTime(lastUpdate)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleRealTime}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  isRealTime 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <Activity className="w-4 h-4" />
                {isRealTime ? 'Live Mode' : 'Manual Mode'}
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing || isRealTime}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleCalibrate}
                disabled={refreshing}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                Calibrate
              </button>
            </div>
          </div>
        </motion.div>

        {/* Current Readings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Thermometer className="w-8 h-8 text-red-500" />
              <span className="text-sm text-gray-500">Temperature</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {sensorData?.current.temperature.toFixed(1)}°C
              {isRealTime && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-2 text-sm text-green-500 font-normal"
                >
                  ● Live
                </motion.span>
              )}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Feels like {(sensorData?.current.temperature! - 2).toFixed(1)}°C
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Droplets className="w-8 h-8 text-blue-500" />
              <span className="text-sm text-gray-500">Humidity</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {sensorData?.current.humidity.toFixed(1)}%
              {isRealTime && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-2 text-sm text-green-500 font-normal"
                >
                  ● Live
                </motion.span>
              )}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {sensorData?.current.humidity! > 70 ? 'High' : sensorData?.current.humidity! > 50 ? 'Moderate' : 'Low'}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              {getRainfallIcon(sensorData?.prediction.intensity || 'none')}
              <span className="text-sm text-gray-500">Rain Prediction</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {sensorData?.prediction.probability}%
            </div>
            <div className="text-sm text-gray-600 mt-2 capitalize">
              {sensorData?.prediction.intensity} rain
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-green-500" />
              <span className="text-sm text-gray-500">Device</span>
            </div>
            <div className="text-lg font-bold text-gray-800">
              ESP32-DHT11
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {sensorData?.current.location}
            </div>
          </motion.div>
        </div>

        {/* Rainfall Prediction Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`bg-white rounded-xl shadow-sm p-6 mb-8 border-2 ${getRainfallColor(sensorData?.prediction.intensity || 'none')}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Rainfall Forecast</h3>
            {getRainfallIcon(sensorData?.prediction.intensity || 'none')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Probability</div>
              <div className="text-2xl font-bold">{sensorData?.prediction.probability}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Intensity</div>
              <div className="text-2xl font-bold capitalize">{sensorData?.prediction.intensity}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Expected Amount</div>
              <div className="text-2xl font-bold">{sensorData?.prediction.expectedAmount || 0} mm</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Time Window</div>
              <div className="text-2xl font-bold">{sensorData?.prediction.timeWindow}</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Confidence: {sensorData?.prediction.confidence}% | Based on humidity and temperature trends
            </span>
          </div>
        </motion.div>

        {/* Historical Data Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Temperature Trend (24h)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sensorData?.historical}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  stroke="#888"
                  fontSize={12}
                />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip 
                  labelFormatter={formatTime}
                  formatter={(value: any) => [`${value.toFixed(1)}°C`, 'Temperature']}
                />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Humidity Trend (24h)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={sensorData?.historical}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  stroke="#888"
                  fontSize={12}
                />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip 
                  labelFormatter={formatTime}
                  formatter={(value: any) => [`${value.toFixed(1)}%`, 'Humidity']}
                />
                <Area 
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="#3b82f6" 
                  fill="#93c5fd"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
