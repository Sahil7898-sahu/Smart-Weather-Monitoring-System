import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Advisories from './pages/Advisories'
import ClimateRisk from './pages/ClimateRisk'
import Sensors from './pages/Sensors'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/advisories" element={<Advisories />} />
          <Route path="/climate-risk" element={<ClimateRisk />} />
          <Route path="/sensors" element={<Sensors />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
