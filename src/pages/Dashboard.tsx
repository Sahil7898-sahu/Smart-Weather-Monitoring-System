import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CloudSun, Droplets, Wind, Eye, Sun, Thermometer, Gauge,
  TrendingUp, TrendingDown, Minus, MapPin, Clock, AlertTriangle,
  Loader2, RefreshCw, Activity, Zap, CloudRain, Navigation
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, LineChart, Line
} from 'recharts'
import { cropData } from '../data/mockData'
import { WifiLocationService, WifiLocationData } from '../services/wifiLocationService'
import { WeatherForecastComponent } from '../components/WeatherForecast'

interface WeatherMetric {
  label: string
  value: string
  sub: string
  icon: any
  color: string
  bg: string
  trend?: 'up' | 'down' | 'stable'
  change?: string
}

interface DailyForecast {
  day: string
  high: number
  low: number
  rainProb: number
  condition: string
  icon: string
}

function getRainIcon(prob: number) {
  if (prob >= 60) return <TrendingUp className="w-4 h-4 text-blue-600" />
  if (prob <= 30) return <TrendingDown className="w-4 h-4 text-orange-600" />
  return <Minus className="w-4 h-4 text-gray-500" />
}

function getTrendIcon(trend?: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up': return <TrendingUp className="w-3 h-3 text-green-600" />
    case 'down': return <TrendingDown className="w-3 h-3 text-red-600" />
    default: return <Minus className="w-3 h-3 text-gray-500" />
  }
}

export default function Dashboard() {
  const [chartView, setChartView] = useState<'temp' | 'rain'>('temp')
  const [weatherData, setWeatherData] = useState<WifiLocationData | null>(null)
  const [weatherMetrics, setWeatherMetrics] = useState<WeatherMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const wifiLocationService = WifiLocationService.getInstance();
    
    const fetchWeatherData = async () => {
      try {
        setIsLoading(true)
        // Default to Bhopal weather data
        const bhopalCoords = { lat: 23.2599, lon: 77.4126 }; // Bhopal city center coordinates
        const data = await wifiLocationService.getWeatherByCoordinates(bhopalCoords.lat, bhopalCoords.lon);
        setWeatherData(data);
        
        // Enhanced weather metrics with better colors
        setWeatherMetrics([
          { 
            label: 'Temperature', 
            value: `${data.current.temp_c}°C`, 
            sub: `Feels ${data.current.feelslike_c}°C`, 
            icon: Thermometer, 
            color: 'text-red-600', 
            bg: 'bg-red-100',
            trend: 'up',
            change: '+2° from yesterday'
          },
          { 
            label: 'Humidity', 
            value: `${data.current.humidity}%`, 
            sub: `Dew point 24°C`, 
            icon: Droplets, 
            color: 'text-blue-600', 
            bg: 'bg-blue-100',
            trend: 'stable',
            change: 'Normal range'
          },
          { 
            label: 'Wind', 
            value: `${data.current.wind_kph} km/h`, 
            sub: `From ${data.current.wind_dir}`, 
            icon: Wind, 
            color: 'text-teal-600', 
            bg: 'bg-teal-100',
            trend: 'down',
            change: '-5 km/h from avg'
          },
          { 
            label: 'Pressure', 
            value: `${data.current.pressure_mb} hPa`, 
            sub: 'Rising slowly', 
            icon: Gauge, 
            color: 'text-purple-600', 
            bg: 'bg-purple-100',
            trend: 'up',
            change: '+2 hPa'
          },
          { 
            label: 'UV Index', 
            value: `${data.current.uv}`, 
            sub: data.current.uv > 7 ? 'Very High' : data.current.uv > 4 ? 'High' : 'Moderate', 
            icon: Sun, 
            color: 'text-yellow-600', 
            bg: 'bg-yellow-100',
            trend: 'stable',
            change: 'Peak at noon'
          },
          { 
            label: 'Visibility', 
            value: `${data.current.vis_km} km`, 
            sub: 'Clear conditions', 
            icon: Eye, 
            color: 'text-green-600', 
            bg: 'bg-green-100',
            trend: 'stable',
            change: 'Excellent'
          },
        ]);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      } finally {
        setIsLoading(false)
      }
    };

    fetchWeatherData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchWeatherData, 300000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Generate enhanced hourly data
  const getHourlyData = () => {
    if (!weatherData) return [];
    const baseTemp = weatherData.current.temp_c;
    const baseRain = weatherData.current.precip_mm * 10;
    
    return Array.from({ length: 12 }, (_, i) => {
      const hour = (new Date().getHours() + i) % 24;
      return {
        time: hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`,
        temp: baseTemp + Math.sin(i * 0.5) * 3 + (hour >= 12 && hour <= 16 ? 2 : -1),
        rain: Math.max(0, Math.min(100, baseRain + Math.random() * 20 - 10)),
        humidity: weatherData.current.humidity + Math.random() * 10 - 5,
        wind: weatherData.current.wind_kph + Math.random() * 5 - 2.5
      };
    });
  };

  // Generate enhanced daily data
  const getDailyData = (): DailyForecast[] => {
    if (!weatherData) return [];
    const baseTemp = weatherData.current.temp_c;
    const baseRain = weatherData.current.precip_mm * 10;
    // Fixed days array to match getDay() return values (0=Sunday, 1=Monday, etc.)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    
    return Array.from({ length: 7 }, (_, i) => {
      const dayIndex = (today + i) % 7;
      const rainProb = Math.max(0, Math.min(100, baseRain + Math.random() * 30 - 15));
      return {
        day: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[dayIndex],
        high: Math.round(baseTemp + Math.random() * 8 - 2),
        low: Math.round(baseTemp - 8 + Math.random() * 4),
        rainProb: Math.round(rainProb),
        condition: rainProb > 60 ? 'Rainy' : rainProb > 30 ? 'Cloudy' : 'Sunny',
        icon: rainProb > 60 ? 'cloud-rain' : rainProb > 30 ? 'cloud' : 'sun'
      };
    });
  };

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'bg-green-500';
    if (health >= 80) return 'bg-yellow-500';
    if (health >= 70) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getHealthBgColor = (health: number) => {
    if (health >= 90) return 'bg-green-100 text-green-800';
    if (health >= 80) return 'bg-yellow-100 text-yellow-800';
    if (health >= 70) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  if (isLoading && !weatherData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-6" />
          <p className="text-xl text-gray-700 font-medium">Loading Weather Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                  <CloudSun className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">Bhopal Weather Dashboard</h1>
                  <p className="text-lg text-gray-600 mt-1">Real-time weather monitoring for Bhopal, Madhya Pradesh</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-base text-gray-600">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">{weatherData ? `${weatherData.location.name}, ${weatherData.location.region}` : 'Loading...'}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-6 py-3 bg-red-100 border-2 border-red-300 rounded-xl shadow-md">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm font-bold text-red-800">2 Active Alerts</p>
                    <p className="text-xs text-red-600">Weather warnings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Current Weather Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-950 rounded-3xl shadow-2xl p-12 text-white relative overflow-hidden border-2 border-green-700">
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="relative z-10">
              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-yellow-500/20 rounded-xl border-2 border-yellow-500/50">
                      <CloudSun className="w-8 h-8 text-yellow-400" />
                    </div>
                    <p className="text-2xl font-bold text-yellow-400">Current Conditions</p>
                  </div>
                  <div className="flex items-center gap-10 mb-8">
                    <div className="p-6 bg-white/10 backdrop-blur rounded-3xl border-2 border-white/20 shadow-xl">
                      <CloudSun className="w-32 h-32 text-yellow-300 drop-shadow-lg" />
                    </div>
                    <div>
                      <p className="text-8xl font-black mb-4 text-white drop-shadow-lg">{weatherData ? `${weatherData.current.temp_c}°` : '--°'}</p>
                      <p className="text-3xl text-gray-200 font-bold drop-shadow-md">{weatherData ? weatherData.current.condition.text : 'Loading...'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-8">
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur rounded-2xl p-6 border-2 border-white/20 shadow-xl hover:shadow-2xl transition-all">
                      <div className="flex items-center gap-2 mb-3">
                        <Thermometer className="w-5 h-5 text-red-400" />
                        <p className="text-gray-300 text-sm font-bold">Feels Like</p>
                      </div>
                      <p className="text-4xl font-black text-white">{weatherData ? `${weatherData.current.feelslike_c}°` : '--°'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur rounded-2xl p-6 border-2 border-white/20 shadow-xl hover:shadow-2xl transition-all">
                      <div className="flex items-center gap-2 mb-3">
                        <Droplets className="w-5 h-5 text-blue-400" />
                        <p className="text-gray-300 text-sm font-bold">Humidity</p>
                      </div>
                      <p className="text-4xl font-black text-white">{weatherData ? `${weatherData.current.humidity}%` : '--%'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur rounded-2xl p-6 border-2 border-white/20 shadow-xl hover:shadow-2xl transition-all">
                      <div className="flex items-center gap-2 mb-3">
                        <Wind className="w-5 h-5 text-teal-400" />
                        <p className="text-gray-300 text-sm font-bold">Wind</p>
                      </div>
                      <p className="text-4xl font-black text-white">{weatherData ? `${weatherData.current.wind_kph}` : '--'}</p>
                      <p className="text-sm text-gray-400 mt-1">km/h</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 backdrop-blur rounded-2xl p-6 border-2 border-yellow-500/30 shadow-xl hover:shadow-2xl transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <Sun className="w-7 h-7 text-yellow-400" />
                      <p className="text-yellow-300 text-lg font-bold">UV Index</p>
                    </div>
                    <p className="text-5xl font-black text-white mb-3">{weatherData ? weatherData.current.uv : '--'}</p>
                    <p className="text-yellow-200 text-sm font-bold">{weatherData && weatherData.current.uv > 7 ? 'Very High' : 'Moderate'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 backdrop-blur rounded-2xl p-6 border-2 border-blue-500/30 shadow-xl hover:shadow-2xl transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <Eye className="w-7 h-7 text-blue-400" />
                      <p className="text-blue-300 text-lg font-bold">Visibility</p>
                    </div>
                    <p className="text-5xl font-black text-white mb-3">{weatherData ? `${weatherData.current.vis_km}` : '--'}</p>
                    <p className="text-blue-200 text-sm font-bold">km</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 backdrop-blur rounded-2xl p-6 border-2 border-green-500/30 shadow-xl hover:shadow-2xl transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <Gauge className="w-7 h-7 text-green-400" />
                      <p className="text-green-300 text-lg font-bold">Pressure</p>
                    </div>
                    <p className="text-5xl font-black text-white mb-3">{weatherData ? weatherData.current.pressure_mb : '--'}</p>
                    <p className="text-green-200 text-sm font-bold">hPa</p>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 backdrop-blur rounded-2xl p-6 border-2 border-cyan-500/30 shadow-xl hover:shadow-2xl transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <Droplets className="w-7 h-7 text-cyan-400" />
                      <p className="text-cyan-300 text-lg font-bold">Precipitation</p>
                    </div>
                    <p className="text-5xl font-black text-white mb-3">{weatherData ? weatherData.current.precip_mm : '--'}</p>
                    <p className="text-cyan-200 text-sm font-bold">mm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
          {weatherMetrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.08 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 cursor-pointer transition-all hover:shadow-xl hover:border-blue-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${metric.bg} flex items-center justify-center shadow-md`}>
                    <Icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                  {metric.trend && getTrendIcon(metric.trend)}
                </div>
                <p className="text-gray-600 text-sm font-semibold mb-2 uppercase tracking-wide">{metric.label}</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</p>
                <p className="text-gray-500 text-sm mb-2">{metric.sub}</p>
                {metric.change && (
                  <p className="text-xs text-gray-400 font-medium">{metric.change}</p>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          {/* Enhanced Hourly Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Hourly Forecast</h3>
                <p className="text-base text-gray-600">Next 12 hours</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setChartView('temp')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    chartView === 'temp' 
                      ? 'bg-orange-500 text-white shadow-lg border-2 border-orange-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border-2 border-gray-300'
                  }`}
                >
                  Temperature
                </button>
                <button
                  onClick={() => setChartView('rain')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    chartView === 'rain' 
                      ? 'bg-blue-500 text-white shadow-lg border-2 border-blue-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border-2 border-gray-300'
                  }`}
                >
                  Rain %
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={getHourlyData()}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12, fontWeight: 500 }} 
                  stroke="#6b7280"
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fontWeight: 500 }} 
                  stroke="#6b7280"
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: '2px solid #e5e7eb', 
                    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                />
                {chartView === 'temp' ? (
                  <Area 
                    type="monotone" 
                    dataKey="temp" 
                    stroke="#f97316" 
                    fill="url(#tempGrad)" 
                    strokeWidth={3}
                    name="Temperature (°C)"
                  />
                ) : (
                  <Area 
                    type="monotone" 
                    dataKey="rain" 
                    stroke="#3b82f6" 
                    fill="url(#rainGrad)" 
                    strokeWidth={3}
                    name="Rain Probability (%)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Enhanced 7-Day Forecast */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">7-Day Forecast</h3>
              <p className="text-base text-gray-600">Weather outlook</p>
            </div>
            <div className="space-y-4">
              {getDailyData().map((day, index) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.06 }}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border-2 border-transparent hover:border-gray-300"
                >
                  <div className="flex items-center gap-4 w-32">
                    <span className="font-bold text-base text-gray-900">{day.day}</span>
                    {day.icon === 'cloud-rain' && <CloudRain className="w-5 h-5 text-blue-600" />}
                    {day.icon === 'cloud' && <CloudSun className="w-5 h-5 text-gray-500" />}
                    {day.icon === 'sun' && <Sun className="w-5 h-5 text-yellow-500" />}
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    {getRainIcon(day.rainProb)}
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          day.rainProb > 60 ? 'bg-blue-600' : day.rainProb > 30 ? 'bg-blue-400' : 'bg-gray-400'
                        }`}
                        style={{ width: `${day.rainProb}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-700 w-10 text-right">{day.rainProb}%</span>
                  </div>
                  <div className="flex items-center gap-2 w-28 justify-end">
                    <span className="text-lg font-bold text-gray-900">{day.high}°</span>
                    <span className="text-lg text-gray-400">/</span>
                    <span className="text-lg text-gray-600">{day.low}°</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Weather Forecast Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-10"
        >
          <WeatherForecastComponent />
        </motion.div>

        {/* Enhanced Crop Health Monitor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8"
        >
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Crop Health Monitor</h3>
            <p className="text-base text-gray-600">Real-time crop status and recommendations</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cropData.map((crop, index) => (
              <motion.div
                key={crop.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-300 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-lg text-gray-900">{crop.name}</span>
                  <span className={`text-sm px-3 py-1 rounded-full font-bold ${getHealthBgColor(crop.health)}`}>
                    {crop.health}%
                  </span>
                </div>
                <div className="mb-6">
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getHealthColor(crop.health)}`}
                      style={{ width: `${crop.health}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Stage:</span>
                    <span className="text-gray-900 font-bold">{crop.stage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Water Need:</span>
                    <span className="text-gray-900 font-bold">{crop.waterNeed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Pest Risk:</span>
                    <span className={`font-bold ${
                      crop.pestRisk === 'Low' ? 'text-green-700' : 
                      crop.pestRisk === 'Medium' ? 'text-yellow-700' : 'text-red-700'
                    }`}>
                      {crop.pestRisk}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Harvest:</span>
                    <span className="text-gray-900 font-bold">{crop.daysToHarvest} days</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
