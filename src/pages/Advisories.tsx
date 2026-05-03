import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, AlertTriangle, Droplets, Bug, Wheat, Shovel, Bell,
  CheckCircle, Clock, Filter, MessageSquare, Phone, Thermometer,
  Wind, TrendingUp, TrendingDown, Activity, CloudRain, Sun,
  AlertCircle, Info, Sprout, Gauge, Globe
} from 'lucide-react'
import SensorService from '../services/sensorService'
import { WifiLocationService, WifiLocationData } from '../services/wifiLocationService'

interface SmartAdvisory {
  id: string
  type: 'irrigation' | 'pest_control' | 'harvest' | 'planting' | 'fertilizer' | 'protection'
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  message: string
  recommendation: string
  actionItems: string[]
  basedOn: string[]
  timeGenerated: Date
  validUntil: Date
  confidence: number
}

interface WeatherAlert {
  id: string
  type: 'extreme' | 'weather' | 'sensor'
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  message: string
  impact: string
  precautions: string[]
  timeGenerated: Date
  active: boolean
}

const categoryIcons: Record<string, any> = {
  irrigation: Droplets,
  pest_control: Bug,
  harvest: Wheat,
  planting: Sprout,
  fertilizer: Gauge,
  protection: Shield
}

const priorityColors: Record<string, string> = {
  critical: 'bg-red-50 text-red-700 border-red-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  low: 'bg-blue-50 text-blue-700 border-blue-200'
}

const severityColors: Record<string, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-white',
  low: 'bg-blue-500 text-white'
}

// Hindi translations
const translations = {
  en: {
    title: "AI Farming Advisories",
    subtitle: "Smart recommendations based on sensor data & weather predictions",
    temp: "Temp",
    humidity: "Humidity",
    rainRisk: "Rain Risk",
    activeAdvisories: "Active Advisories",
    criticalAlerts: "Critical Alerts",
    smartRecommendations: "Smart Farming Recommendations",
    weatherAlerts: "Weather & System Alerts",
    basedOn: "Based on",
    validUntil: "Valid until",
    recommendation: "Recommendation",
    actionItems: "Action Items",
    impact: "Impact",
    precautions: "Precautions",
    confidence: "confidence",
    irrigation: "Irrigation",
    pest_control: "Pest Control",
    harvest: "Harvest",
    planting: "Planting",
    fertilizer: "Fertilizer",
    protection: "Protection",
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    all: "All",
    active: "ACTIVE",
    loading: "Generating Smart Advisories...",
    immediateIrrigation: "Immediate Irrigation Required",
    immediateIrrigationMsg: "Soil moisture is critically low with high rain probability expected.",
    immediateIrrigationRec: "Irrigate your fields immediately to prevent crop stress. Consider drip irrigation for water efficiency.",
    highPestRisk: "High Pest Risk Alert",
    highPestRiskMsg: "Current conditions favor pest proliferation.",
    highPestRiskRec: "Implement preventive pest control measures immediately.",
    urgentHarvest: "Urgent Harvest Recommendation",
    urgentHarvestMsg: "Heavy rainfall predicted with high probability.",
    urgentHarvestRec: "Harvest mature crops immediately to prevent damage and loss.",
    delayPlanting: "Delay Planting Activities",
    delayPlantingMsg: "Low temperature detected.",
    delayPlantingRec: "Postpone planting until soil temperatures improve for better germination.",
    extremeHeat: "Extreme Heat Warning",
    extremeHeatMsg: "Temperature reached dangerous levels - dangerous for crops and livestock.",
    highUV: "High UV Index Alert",
    highUVMsg: "UV Index is very high - very high radiation levels.",
    sensorOffline: "Sensor Connection Lost",
    sensorOfflineMsg: "ESP32 sensor is currently offline. Data may be outdated."
  },
  hi: {
    title: "AI कृषि सलाह",
    subtitle: "सेंसर डेटा और मौसम पूर्वानुमान के आधार पर स्मार्ट अनुशंसाएं",
    temp: "तापमान",
    humidity: "नमी",
    rainRisk: "वर्षा जोखिम",
    activeAdvisories: "सक्रिय सलाह",
    criticalAlerts: "नाजुक चेतावनियां",
    smartRecommendations: "स्मार्ट कृषि अनुशंसाएं",
    weatherAlerts: "मौसम और सिस्टम चेतावनियां",
    basedOn: "आधार",
    validUntil: "तब तक मान्य",
    recommendation: "अनुशंसा",
    actionItems: "कार्य वस्तुएं",
    impact: "प्रभाव",
    precautions: "सावधानियां",
    confidence: "विश्वास",
    irrigation: "सिंचाई",
    pest_control: "कीट नियंत्रण",
    harvest: "फसल कटाई",
    planting: "रोपण",
    fertilizer: "उर्वरक",
    protection: "सुरक्षा",
    critical: "नाजुक",
    high: "उच्च",
    medium: "मध्यम",
    low: "कम",
    all: "सभी",
    active: "सक्रिय",
    loading: "स्मार्ट सलाह उत्पन्न हो रही हैं...",
    immediateIrrigation: "तत्काल सिंचाई आवश्यक",
    immediateIrrigationMsg: "आपके खेत की मिट्टी में पानी बहुत कम है और अगले 24 घंटों में भारी बारिश होने की संभावना है।",
    immediateIrrigationRec: "अपनी फसलों को मरने से बचाने के लिए आज ही सिंचाई करें। ड्रिप सिंचाई का उपयोग करें ताकि पानी की बचत हो और फसलों को ठीक से पानी मिले।",
    highPestRisk: "कीट प्रकोप का खतरा",
    highPestRiskMsg: "गर्मी और नमी का स्तर बहुत ज्यादा है, जिससे कीट प्रकोप फैलने का खतरा बढ़ गया है।",
    highPestRiskRec: "अपनी फसलों को कीटों से बचाने के लिए तुरंत दवाई का छिड़काव करें। जैविक कीटनाशक का उपयोग करें ताकि फसल और जमीन दोनों सुरक्षित रहें।",
    urgentHarvest: "तुरंत फसल काटने की सलाह",
    urgentHarvestMsg: "अगले 24 घंटों में भारी बारिश होने की 80% संभावना है, जिससे आपकी तैयार फसलें खराब हो सकती हैं।",
    urgentHarvestRec: "अपनी सभी तैयार फसलों को आज ही काट लें और उन्हें सूखी जगह पर सुरक्षित रखें। खेत में पानी निकासने की व्यवस्था करें।",
    delayPlanting: "बीज बोना टालें",
    delayPlantingMsg: "मौसम का तापमान बहुत कम है, जिससे बीज ठीक से अंकुरित नहीं होंगे।",
    delayPlantingRec: "3-5 दिन इंतजार करें जब तक मौसम गर्म न हो जाए। ठंड सहने वाले बीज चुनें और मिट्टी को अच्छी तरह तैयार करें।",
    extremeHeat: "अत्यधिक गर्मी चेतावनी",
    extremeHeatMsg: "तापमान खतरनाक स्तर तक पहुंच गया है - फसलों और पशुओं के लिए खतरनाक।",
    highUV: "उच्च UV इंडेक्स चेतावनी",
    highUVMsg: "UV इंडेक्स बहुत अधिक है - बहुत उच्च विकिरण स्तर।",
    sensorOffline: "सेंसर कनेक्शन टूट गया",
    sensorOfflineMsg: "ESP32 सेंसर वर्तमान में ऑफलाइन है। डेटा पुराना हो सकता है।"
  }
}

export default function Advisories() {
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all')
  const [language, setLanguage] = useState<'en' | 'hi'>(() => {
    // Load language preference from localStorage, default to Hindi
    const saved = localStorage.getItem('advisory-language')
    return saved === 'en' ? 'en' : 'hi'
  })
  const [smartAdvisories, setSmartAdvisories] = useState<SmartAdvisory[]>([])
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([])
  const [sensorData, setSensorData] = useState<any>(null)
  const [weatherData, setWeatherData] = useState<WifiLocationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const t = translations[language]

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('advisory-language', language)
  }, [language])

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Load sensor data
        const sensorService = SensorService.getInstance()
        const currentSensorData = await sensorService.getSensorData()
        setSensorData(currentSensorData)

        // Load weather data
        const wifiService = WifiLocationService.getInstance()
        const currentWeatherData = await wifiService.getCurrentLocationWeather()
        setWeatherData(currentWeatherData)

        // Generate smart advisories based on sensor and weather data
        const advisories = generateSmartAdvisories(currentSensorData, currentWeatherData)
        setSmartAdvisories(advisories)

        // Generate weather alerts
        const alerts = generateWeatherAlerts(currentSensorData, currentWeatherData)
        setWeatherAlerts(alerts)

      } catch (error) {
        console.error('Error loading advisory data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
    
    // Refresh every 10 minutes
    const interval = setInterval(loadData, 600000)
    return () => clearInterval(interval)
  }, [])

  const generateSmartAdvisories = (sensorData: any, weatherData: WifiLocationData | null): SmartAdvisory[] => {
    const advisories: SmartAdvisory[] = []
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    // Irrigation advisories based on sensor data
    if (sensorData?.current?.humidity < 40 && sensorData?.prediction?.probability > 60) {
      advisories.push({
        id: 'irrigation-urgent',
        type: 'irrigation',
        priority: 'critical',
        title: t.immediateIrrigation,
        message: language === 'en' 
          ? `Soil moisture is critically low at ${sensorData.current.humidity}% with high rain probability expected.`
          : `मिट्टी की नमी ${sensorData.current.humidity}% पर बहुत कम है और उच्च वर्षा संभावना है।`,
        recommendation: t.immediateIrrigationRec,
        actionItems: language === 'en' ? [
          'Start irrigation within 2 hours',
          'Check soil moisture at root depth',
          'Monitor for signs of water stress',
          'Adjust irrigation schedule based on rain forecast'
        ] : [
          'अगले 2 घंटे के अंदर अपने खेत में पानी देना शुरू कर दें',
          'फसल की जड़ों तक मिट्टी गीली है या नहीं, यह जांच लें',
          'पौधों के पत्ते सूखे तो नहीं, इस पर ध्यान रखें',
          'अगर बारिश होने वाली है तो सिंचाई कम कर दें'
        ],
        basedOn: language === 'en' ? ['Low soil humidity', 'High rainfall probability'] : ['कम मिट्टी नमी', 'उच्च वर्षा संभावना'],
        timeGenerated: now,
        validUntil: tomorrow,
        confidence: 85
      })
    } else if (sensorData?.current?.humidity < 50) {
      advisories.push({
        id: 'irrigation-moderate',
        type: 'irrigation',
        priority: 'medium',
        title: language === 'en' ? 'Moderate Irrigation Needed' : 'मध्यम सिंचाई आवश्यक',
        message: language === 'en' 
          ? `Soil moisture is below optimal at ${sensorData.current.humidity}%.`
          : `मिट्टी की नमी ${sensorData.current.humidity}% पर इष्टतम से कम है।`,
        recommendation: language === 'en' 
          ? 'Plan irrigation within the next 12-24 hours to maintain crop health.'
          : 'फसल स्वास्थ्य बनाए रखने के लिए अगले 12-24 घंटों के भीतर सिंचाई की योजना बनाएं।',
        actionItems: language === 'en' ? [
          'Schedule irrigation for tomorrow morning',
          'Check irrigation system functionality',
          'Monitor weather conditions before irrigation'
        ] : [
          'कल सुबह के लिए सिंचाई निर्धारित करें',
          'सिंचाई प्रणाली की कार्यक्षमता जांचें',
          'सिंचाई से पहले मौसम की स्थितियां जांचें'
        ],
        basedOn: language === 'en' ? ['Moderate soil humidity'] : ['मध्यम मिट्टी नमी'],
        timeGenerated: now,
        validUntil: tomorrow,
        confidence: 75
      })
    }

    // Pest control advisories
    if (sensorData?.current?.temperature > 28 && sensorData?.current?.humidity > 70) {
      advisories.push({
        id: 'pest-alert',
        type: 'pest_control',
        priority: 'high',
        title: t.highPestRisk,
        message: language === 'en' 
          ? `Current conditions (${sensorData.current.temperature}°C, ${sensorData.current.humidity}% humidity) favor pest proliferation.`
          : `वर्तमान परिस्थितियां (${sensorData.current.temperature}°C, ${sensorData.current.humidity}% नमी) कीट प्रसार के अनुकूल हैं।`,
        recommendation: t.highPestRiskRec,
        actionItems: language === 'en' ? [
          'Inspect crops for pest activity',
          'Apply preventive organic pesticides',
          'Increase field monitoring frequency',
          'Consider biological control methods'
        ] : [
          'अपनी फसलों में कीट हैं या नहीं, अच्छी तरह जांच करें',
          'जैविक दवाई का छिड़काव करें ताकि कीट न लगें',
          'हर दिन खेत में जाकर फसलों को देखें',
          'अच्छे कीट जैसे लेडीबग और तेंगे का उपयोग करें'
        ],
        basedOn: language === 'en' ? ['High temperature', 'High humidity'] : ['उच्च तापमान', 'उच्च नमी'],
        timeGenerated: now,
        validUntil: new Date(now.getTime() + 48 * 60 * 60 * 1000),
        confidence: 80
      })
    }

    // Harvest advisories
    if (sensorData?.prediction?.probability > 80 && sensorData?.prediction?.intensity === 'heavy') {
      advisories.push({
        id: 'harvest-urgent',
        type: 'harvest',
        priority: 'critical',
        title: t.urgentHarvest,
        message: language === 'en' 
          ? `Heavy rainfall predicted with ${sensorData.prediction.probability}% probability.`
          : `भारी वर्षा ${sensorData.prediction.probability}% संभावना के साथ भविष्यवाणी की गई है।`,
        recommendation: t.urgentHarvestRec,
        actionItems: language === 'en' ? [
          'Harvest all ready crops within 24 hours',
          'Secure harvested produce in dry storage',
          'Prepare drainage systems in fields',
          'Postpone any field operations'
        ] : [
          'जो फसलें तैयार हैं, उन्हें अगले 24 घंटों में काट लें',
          'कटी हुई फसल को छत के नीचे सूखी जगह रखें',
          'खेत में पानी निकालने के लिए नालियां बनाएं',
          'खेत में कोई भी काम अभी न करें'
        ],
        basedOn: language === 'en' ? ['Heavy rainfall prediction'] : ['भारी वर्षा पूर्वानुमान'],
        timeGenerated: now,
        validUntil: new Date(now.getTime() + 12 * 60 * 60 * 1000),
        confidence: 88
      })
    }

    // Planting advisories
    if (weatherData && weatherData.current.temp_c < 15) {
      advisories.push({
        id: 'planting-delay',
        type: 'planting',
        priority: 'medium',
        title: t.delayPlanting,
        message: language === 'en' 
          ? `Low temperature detected (${weatherData.current.temp_c}°C).`
          : `कम तापमान का पता चला (${weatherData.current.temp_c}°C)।`,
        recommendation: t.delayPlantingRec,
        actionItems: language === 'en' ? [
          'Delay planting by 3-5 days',
          'Monitor soil temperature daily',
          'Prepare seeds for immediate planting when conditions improve',
          'Consider cold-resistant crop varieties'
        ] : [
          'अभी बीज मत बोएं, 3-5 दिन इंतजार करें',
          'हर दिन मिट्टी का तापमान जांचते रहें',
          'मौसम ठीक होते ही बीज बोने के लिए तैयार रहें',
          'ठंड झेलने वाली फसलें जैसे गेहूं, चना चुनें'
        ],
        basedOn: language === 'en' ? ['Low temperature'] : ['कम तापमान'],
        timeGenerated: now,
        validUntil: new Date(now.getTime() + 72 * 60 * 60 * 1000),
        confidence: 82
      })
    }

    return advisories
  }

  const generateWeatherAlerts = (sensorData: any, weatherData: WifiLocationData | null): WeatherAlert[] => {
    const alerts: WeatherAlert[] = []
    const now = new Date()

    // Extreme temperature alerts
    if (weatherData && weatherData.current.temp_c > 35) {
      alerts.push({
        id: 'heat-alert',
        type: 'extreme',
        severity: 'critical',
        title: t.extremeHeat,
        message: language === 'en' 
          ? `Temperature reached ${weatherData.current.temp_c}°C - dangerous for crops and livestock.`
          : `तापमान ${weatherData.current.temp_c}°C तक पहुंच गया है - फसलों और पशुओं के लिए खतरनाक।`,
        impact: language === 'en' 
          ? 'Risk of heat stress, reduced pollination, increased water requirements'
          : 'गर्मी तनाव का जोखिम, परागण में कमी, बढ़ी हुई पानी की आवश्यकता',
        precautions: language === 'en' ? [
          'Increase irrigation frequency',
          'Provide shade for sensitive crops',
          'Monitor livestock for heat stress',
          'Avoid field work during peak heat hours'
        ] : [
          'फसलों को अधिक बार पानी दें',
          'नाजुक पौधों को छाया में रखें',
          'पशुओं को ठंडी जगह पर रखें और उन्हें पानी दें',
          'दोपहर 12 से 3 बजे के बीच खेत में काम न करें'
        ],
        timeGenerated: now,
        active: true
      })
    }

    // High UV index alerts
    if (weatherData && weatherData.current.uv > 8) {
      alerts.push({
        id: 'uv-alert',
        type: 'weather',
        severity: 'medium',
        title: t.highUV,
        message: language === 'en' 
          ? `UV Index is ${weatherData.current.uv} - very high radiation levels.`
          : `UV इंडेक्स ${weatherData.current.uv} है - बहुत उच्च विकिरण स्तर।`,
        impact: language === 'en' 
          ? 'Potential sunburn damage to crops, increased water evaporation'
          : 'फसलों में सनबर्न क्षति की संभावना, बढ़ी हुई जल वाष्पीकरण',
        precautions: language === 'en' ? [
          'Apply UV protective sprays if available',
          'Ensure adequate irrigation',
          'Monitor for sunburn symptoms',
          'Provide additional shade if possible'
        ] : [
          'अगर धूप से बचाने वाली दवाई है तो छिड़काव करें',
          'फसलों को समय पर पानी दें',
          'पत्तों पर पीले धब्बे तो नहीं, इसे देखें',
          'पौधों को छाया में रखने का इंतजाम करें'
        ],
        timeGenerated: now,
        active: true
      })
    }

    // Sensor malfunction alerts
    if (sensorData && !sensorData.status.isConnected) {
      alerts.push({
        id: 'sensor-offline',
        type: 'sensor',
        severity: 'high',
        title: t.sensorOffline,
        message: t.sensorOfflineMsg,
        impact: language === 'en' 
          ? 'Reduced accuracy of weather predictions and irrigation recommendations'
          : 'मौसम पूर्वानुमान और सिंचाई अनुशंसाओं की कम सटीकता',
        precautions: language === 'en' ? [
          'Check sensor power supply',
          'Verify WiFi connection',
          'Inspect sensor hardware',
          'Use manual observations as backup'
        ] : [
          'सेंसर को बिजली दे रहा है या नहीं, जांच लें',
          'WiFi चल रहा है या नहीं, देखें',
          'सेंसर मशीन ठीक है या टूटी है, जांचें',
          'खुद खेत में जाकर मौसम देखें और फैसला करें'
        ],
        timeGenerated: now,
        active: true
      })
    }

    return alerts
  }

  const allAlerts = [...weatherAlerts, ...smartAdvisories.map(advisory => ({
    id: advisory.id,
    type: advisory.type as any,
    severity: advisory.priority as any,
    title: advisory.title,
    message: advisory.message,
    time: advisory.timeGenerated.toLocaleString(),
    active: true
  }))]

  const filteredAlerts = allAlerts.filter(a => filter === 'all' || a.type === filter)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-16 h-16 animate-pulse text-blue-600 mx-auto mb-4" />
          <p className="text-xl text-gray-700 font-medium">Generating Smart Advisories...</p>
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
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">{t.title}</h1>
                  <p className="text-lg text-gray-600">{t.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4" />
                  <span>{t.temp}: {sensorData?.current?.temperature || '--'}°C</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4" />
                  <span>{t.humidity}: {sensorData?.current?.humidity || '--'}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>{t.rainRisk}: {sensorData?.prediction?.probability || '--'}%</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-green-100 border-2 border-green-300 rounded-xl">
                <p className="text-sm font-bold text-green-800">
                  {smartAdvisories.length} {t.activeAdvisories}
                </p>
              </div>
              <button
                onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 border-2 border-blue-300 rounded-xl hover:bg-blue-200 transition-colors"
              >
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-800">
                  {language === 'en' ? 'हिन्दी' : 'English'}
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Alert Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 border-2 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {t[f as keyof typeof t]}
              {f === 'all' && <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">{allAlerts.length}</span>}
            </button>
          ))}
        </div>

        {/* Critical Alerts First */}
        {weatherAlerts.filter(alert => alert.severity === 'critical').length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-red-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Critical Alerts
            </h2>
            <div className="grid gap-4">
              {weatherAlerts.filter(alert => alert.severity === 'critical').map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-red-50 border-2 border-red-200 rounded-2xl p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${severityColors[alert.severity]}`}>
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-red-900">{alert.title}</h3>
                        {alert.active && (
                          <span className="px-3 py-1 bg-red-600 text-white text-xs rounded-full font-bold animate-pulse">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-red-800 font-medium mb-3">{alert.message}</p>
                      <div className="bg-red-100 rounded-xl p-4 mb-3">
                        <p className="text-sm font-bold text-red-900 mb-2">Impact:</p>
                        <p className="text-sm text-red-700">{alert.impact}</p>
                      </div>
                      <div className="bg-white rounded-xl p-4">
                        <p className="text-sm font-bold text-gray-900 mb-2">Precautions:</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {alert.precautions.map((precaution, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                              {precaution}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Smart Farming Advisories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              {t.smartRecommendations}
            </h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {smartAdvisories.map((advisory, index) => {
              const Icon = categoryIcons[advisory.type] || Shield
              return (
                <motion.div
                  key={advisory.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      advisory.priority === 'critical' ? 'bg-red-100 text-red-600' :
                      advisory.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                      advisory.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{advisory.type.replace('_', ' ')}</span>
                        <span className={`text-xs px-2 py-1 rounded-full border-2 font-bold ${priorityColors[advisory.priority]}`}>
                          {advisory.priority}
                        </span>
                        <span className="text-xs text-gray-500">{advisory.confidence}% confidence</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{advisory.title}</h3>
                      <p className="text-gray-700 font-medium mb-3">{advisory.message}</p>
                      
                      <div className="bg-blue-50 rounded-xl p-4 mb-3">
                        <p className="text-sm font-bold text-blue-900 mb-1">Recommendation:</p>
                        <p className="text-sm text-blue-800">{advisory.recommendation}</p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 mb-3">
                        <p className="text-sm font-bold text-gray-900 mb-2">Action Items:</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {advisory.actionItems.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Info className="w-3 h-3" /> {t.basedOn}: {advisory.basedOn.join(', ')}
                          </span>
                          <span>{t.validUntil}: {advisory.validUntil.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Regular Alerts */}
        {weatherAlerts.filter(alert => alert.severity !== 'critical').length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Weather & System Alerts</h2>
            <div className="grid gap-4">
              {weatherAlerts.filter(alert => alert.severity !== 'critical').map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className={`card p-5 border-l-4 ${
                    alert.severity === 'high' ? 'border-l-orange-500' :
                    alert.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${severityColors[alert.severity]}`}>
                      {alert.type === 'extreme' ? <AlertTriangle className="w-5 h-5" /> :
                       alert.type === 'sensor' ? <Activity className="w-5 h-5" /> :
                       <Bell className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{alert.title}</h3>
                        {alert.active && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium animate-pulse">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{alert.message}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {alert.timeGenerated.toLocaleString()}
                        </span>
                        <span className="capitalize">{alert.severity} severity</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
