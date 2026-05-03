import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CloudSun, Shield, BarChart3, ArrowRight, CheckCircle, Activity } from 'lucide-react'
import CurrentLocationWeather from '../components/CurrentLocationWeather'

const features = [
  {
    icon: BarChart3,
    title: 'Weather Dashboard',
    description: 'Real-time weather monitoring with temperature, humidity, wind, and UV index data for your location.',
    color: 'bg-blue-50 text-blue-600'
  },
  {
    icon: Shield,
    title: 'Smart Farming Advisories',
    description: 'AI-powered crop recommendations with Hindi/English language support for irrigation, pest control, and harvesting.',
    color: 'bg-amber-50 text-amber-600'
  },
  {
    icon: Activity,
    title: 'Sensors Monitoring',
    description: 'Live ESP32 sensor data with temperature, humidity readings and rainfall predictions.',
    color: 'bg-green-50 text-green-600'
  },
  {
    icon: CloudSun,
    title: 'Climate Risk Analytics',
    description: 'Long-term climate risk assessment to help plan crop cycles and mitigate seasonal threats.',
    color: 'bg-rose-50 text-rose-600'
  }
]

const stats = [
  { label: 'Active Farmers', value: '12,500+', suffix: '' },
  { label: 'Villages Covered', value: '850+', suffix: '' },
  { label: 'Alerts Sent Daily', value: '250K+', suffix: '' },
  { label: 'Accuracy Rate', value: '96', suffix: '%' }
]

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-sm font-medium mb-6">
                <CloudSun className="w-4 h-4" />
                AI-Powered Agriculture Intelligence
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Smart Weather Intelligence{' '}
                <span className="text-primary-300">for Farmers</span>
              </h1>
              <p className="text-lg text-primary-100 mb-8 max-w-xl">
                Integrating meteorological data with machine learning to deliver hyperlocal weather insights, 
                smart farming advisories, and climate risk analytics.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
                  Explore Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/sensors" className="btn-secondary inline-flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Sensors Dashboard
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <CurrentLocationWeather />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-3xl lg:text-4xl font-bold gradient-text">{stat.value}{stat.suffix}</p>
                <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Smart Farming Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform provides essential tools for weather monitoring, crop advisories, and climate risk assessment 
              to help farmers make informed decisions.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card hover:shadow-lg transition-shadow duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple, powerful, and accessible. Our system works seamlessly to keep farmers informed and protected.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Data Collection', desc: 'Weather APIs and IoT sensors collect real-time meteorological data from your location.' },
              { step: '02', title: 'AI Processing', desc: 'ML models analyze patterns and predict weather outcomes with high accuracy.' },
              { step: '03', title: 'Smart Insights', desc: 'System generates personalized farming advisories based on current conditions and crop needs.' },
              { step: '04', title: 'Climate Analytics', desc: 'Long-term climate risk assessment helps plan crop cycles and mitigate seasonal threats.' }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="text-5xl font-bold text-green-800 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-primary-200" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Ready to Transform Your Farming?</h2>
          <p className="text-primary-100 mb-8 text-lg">
            Join thousands of farmers who rely on Smart Weather Intelligence for daily decision-making.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2 bg-white text-primary-900 hover:bg-primary-50 shadow-none">
              <CheckCircle className="w-5 h-5" /> Get Started Free
            </Link>
            <Link to="/advisories" className="px-6 py-3 border border-white/30 text-white rounded-xl font-medium hover:bg-white/10 transition-all">
              View Sample Advisories
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
