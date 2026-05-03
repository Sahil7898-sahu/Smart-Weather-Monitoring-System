import { CloudSun, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CloudSun className="w-6 h-6 text-primary-400" />
              <span className="text-lg font-bold text-white">Smart Weather Intelligence</span>
            </div>
            <p className="text-sm text-gray-400">
              Empowering farmers with AI-powered weather insights, predictive analytics, and actionable advisories for sustainable agriculture.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-sm">
              <li>Weather Dashboard</li>
              <li>Smart Farming Advisories</li>
              <li>Sensors Monitoring</li>
              <li>Climate Risk Analytics</li>
              <li>Hindi/English Support</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Technologies</h3>
            <ul className="space-y-2 text-sm">
              <li>React + TypeScript</li>
              <li>Weather API Integration</li>
              <li>ESP32 IoT Sensors</li>
              <li>React Router Navigation</li>
              <li>Tailwind CSS Styling</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © 2026 Smart Weather Intelligence. All rights reserved.
          </p>
          <p className="text-sm text-gray-400 flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for Indian Farmers
          </p>
        </div>
      </div>
    </footer>
  )
}
