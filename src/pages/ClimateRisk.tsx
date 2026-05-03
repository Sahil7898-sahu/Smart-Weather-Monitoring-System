import { motion } from 'framer-motion'
import {
  AlertTriangle, TrendingUp, Droplets, Sun, Bug, Shield,
  BarChart3, ArrowUpRight, ArrowDownRight, Wind
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar
} from 'recharts'
import { climateRiskData } from '../data/mockData'

const riskCategories = [
  { name: 'Drought Risk', value: 45, trend: '+12%', icon: Sun, color: '#f59e0b', trendUp: true },
  { name: 'Flood Risk', value: 75, trend: '+28%', icon: Droplets, color: '#3b82f6', trendUp: true },
  { name: 'Heat Wave Risk', value: 60, trend: '+15%', icon: TrendingUp, color: '#ef4444', trendUp: true },
  { name: 'Pest Outbreak', value: 35, trend: '-8%', icon: Bug, color: '#8b5cf6', trendUp: false },
  { name: 'Wind Damage', value: 40, trend: '+5%', icon: Wind, color: '#06b6d4', trendUp: true },
  { name: 'Crop Yield Risk', value: 30, trend: '-12%', icon: Shield, color: '#10b981', trendUp: false },
]

const radarData = [
  { subject: 'Drought', A: 45, B: 30, fullMark: 100 },
  { subject: 'Flood', A: 75, B: 50, fullMark: 100 },
  { subject: 'Heat Wave', A: 60, B: 40, fullMark: 100 },
  { subject: 'Pest', A: 35, B: 55, fullMark: 100 },
  { subject: 'Wind', A: 40, B: 25, fullMark: 100 },
  { subject: 'Yield', A: 30, B: 20, fullMark: 100 },
]

export default function ClimateRisk() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Climate Risk Prediction</h1>
        <p className="text-gray-500 text-sm mt-1">AI-powered seasonal risk analysis and long-term climate insights</p>
      </div>

      {/* Risk Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {riskCategories.map((risk, index) => {
          const Icon = risk.icon
          const TrendIcon = risk.trendUp ? ArrowUpRight : ArrowDownRight
          return (
            <motion.div
              key={risk.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card p-4 text-center"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: `${risk.color}15` }}
              >
                <Icon className="w-5 h-5" style={{ color: risk.color }} />
              </div>
              <p className="text-gray-500 text-xs mb-1">{risk.name}</p>
              <p className="text-xl font-bold" style={{ color: risk.color }}>{risk.value}%</p>
              <div className={`flex items-center justify-center gap-0.5 text-xs mt-1 ${risk.trendUp ? 'text-red-500' : 'text-green-500'}`}>
                <TrendIcon className="w-3 h-3" /> {risk.trend}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Risk Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h3 className="font-semibold mb-6">Monthly Climate Risk Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={climateRiskData}>
              <defs>
                <linearGradient id="droughtGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="floodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="heatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pestGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="drought" stackId="1" stroke="#f59e0b" fill="url(#droughtGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="flood" stackId="1" stroke="#3b82f6" fill="url(#floodGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="heat" stackId="1" stroke="#ef4444" fill="url(#heatGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="pest" stackId="1" stroke="#8b5cf6" fill="url(#pestGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h3 className="font-semibold mb-6">Risk Comparison: Current vs Historical</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Radar name="Current Season" dataKey="A" stroke="#16a34a" fill="#16a34a" fillOpacity={0.2} strokeWidth={2} />
              <Radar name="Historical Avg" dataKey="B" stroke="#6b7280" fill="#6b7280" fillOpacity={0.1} strokeWidth={2} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Risk Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h3 className="font-semibold">AI-Generated Risk Insights</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-red-50 rounded-xl border border-red-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                <Droplets className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-red-800 text-sm">Monsoon Flooding - High Risk</h4>
                <p className="text-red-600 text-sm mt-1">
                  Historical data + current SST anomalies indicate 75% probability of above-average rainfall 
                  in July-August. Recommend elevated planting beds and improved drainage for low-lying fields.
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                <Sun className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-800 text-sm">Pre-Monsoon Heat Stress</h4>
                <p className="text-amber-600 text-sm mt-1">
                  Extended dry spell predicted for May with 3-4 consecutive days above 40°C. 
                  Increase irrigation frequency for fruit crops and consider shade nets for vegetables.
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                <Bug className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-purple-800 text-sm">Pest Pressure Forecast</h4>
                <p className="text-purple-600 text-sm mt-1">
                  Model predicts lower than average whitefly and aphid pressure this season (-8%). 
                  However, fungal pathogen risk increases with monsoon humidity. Adjust pesticide schedules.
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-800 text-sm">Crop Yield Outlook</h4>
                <p className="text-green-600 text-sm mt-1">
                  Overall yield risk remains low (30%) with proper mitigation. AI model recommends 
                  drought-resistant onion varieties and early grape harvest scheduling for optimal outcomes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
