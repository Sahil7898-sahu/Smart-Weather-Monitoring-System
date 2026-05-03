export const weatherData = {
  current: {
    temperature: 32,
    feelsLike: 36,
    humidity: 68,
    windSpeed: 14,
    windDirection: 'SW',
    pressure: 1012,
    uvIndex: 8,
    visibility: 10,
    condition: 'Partly Cloudy',
    icon: 'cloud-sun',
    location: 'Nashik, Maharashtra',
    updatedAt: new Date()
  },
  hourly: [
    { time: '06:00', temp: 26, rain: 0 },
    { time: '07:00', temp: 27, rain: 0 },
    { time: '08:00', temp: 29, rain: 5 },
    { time: '09:00', temp: 31, rain: 10 },
    { time: '10:00', temp: 33, rain: 15 },
    { time: '11:00', temp: 34, rain: 20 },
    { time: '12:00', temp: 35, rain: 25 },
    { time: '13:00', temp: 36, rain: 30 },
    { time: '14:00', temp: 35, rain: 35 },
    { time: '15:00', temp: 34, rain: 40 },
    { time: '16:00', temp: 33, rain: 45 },
    { time: '17:00', temp: 31, rain: 50 },
    { time: '18:00', temp: 29, rain: 55 },
    { time: '19:00', temp: 28, rain: 60 },
    { time: '20:00', temp: 27, rain: 65 },
    { time: '21:00', temp: 26, rain: 70 },
  ],
  daily: [
    { day: 'Mon', high: 36, low: 26, rainProb: 70, condition: 'Rainy', icon: 'cloud-rain' },
    { day: 'Tue', high: 34, low: 25, rainProb: 60, condition: 'Cloudy', icon: 'cloud' },
    { day: 'Wed', high: 35, low: 26, rainProb: 40, condition: 'Partly Cloudy', icon: 'cloud-sun' },
    { day: 'Thu', high: 37, low: 27, rainProb: 20, condition: 'Sunny', icon: 'sun' },
    { day: 'Fri', high: 38, low: 28, rainProb: 10, condition: 'Sunny', icon: 'sun' },
    { day: 'Sat', high: 36, low: 27, rainProb: 30, condition: 'Partly Cloudy', icon: 'cloud-sun' },
    { day: 'Sun', high: 34, low: 26, rainProb: 50, condition: 'Cloudy', icon: 'cloud' },
  ]
}

export const farmingAdvisories = [
  {
    id: 1,
    category: 'Irrigation',
    title: 'Reduce Watering Today',
    message: 'High probability of rainfall (70%) expected this evening. Delay irrigation to prevent waterlogging and save water.',
    priority: 'high',
    time: '2 hours ago',
    icon: 'droplets'
  },
  {
    id: 2,
    category: 'Pest Control',
    title: 'Monitor for Fungal Infections',
    message: 'Humidity levels rising to 85% tonight. Check grape vineyards for downy mildew symptoms. Apply preventive fungicide if needed.',
    priority: 'medium',
    time: '4 hours ago',
    icon: 'bug'
  },
  {
    id: 3,
    category: 'Harvest Planning',
    title: 'Safe Window for Harvesting',
    message: 'Clear weather expected Thursday to Friday. Ideal conditions for onion harvesting and field drying.',
    priority: 'medium',
    time: '6 hours ago',
    icon: 'wheat'
  },
  {
    id: 4,
    category: 'Soil Health',
    title: 'Avoid Heavy Machinery',
    message: 'Soil moisture content will be high tomorrow. Postpone plowing operations to prevent soil compaction.',
    priority: 'low',
    time: '8 hours ago',
    icon: 'shovel'
  },
  {
    id: 5,
    category: 'Crop Protection',
    title: 'Secure Young Saplings',
    message: 'Strong winds (25 km/h) predicted Wednesday. Stake and secure newly planted tomato seedlings.',
    priority: 'high',
    time: '10 hours ago',
    icon: 'shield'
  }
]

export const alerts = [
  {
    id: 1,
    type: 'extreme',
    title: 'Heavy Rainfall Warning',
    message: 'IMD predicts 120mm rainfall in next 24 hours. Risk of localized flooding in low-lying areas. Move livestock to higher ground.',
    time: '30 minutes ago',
    active: true,
    severity: 'critical'
  },
  {
    id: 2,
    type: 'weather',
    title: 'Hailstorm Alert',
    message: 'Radar indicates possible hail formation between 3-5 PM. Deploy hail nets over vulnerable crops immediately.',
    time: '1 hour ago',
    active: true,
    severity: 'high'
  },
  {
    id: 3,
    type: 'advisory',
    title: 'Heat Wave Advisory',
    message: 'Temperature expected to reach 42°C next week. Ensure adequate shade and water for cattle. Schedule field work for early morning.',
    time: '3 hours ago',
    active: false,
    severity: 'medium'
  }
]

export const irrigationSchedule = [
  { id: 1, field: 'Field A - Grapes', area: '2.5 acres', nextIrrigation: 'Tomorrow, 6:00 AM', duration: '45 min', method: 'Drip', status: 'scheduled', waterNeeded: 1200 },
  { id: 2, field: 'Field B - Onions', area: '1.8 acres', nextIrrigation: 'Today, 5:00 PM', duration: '30 min', method: 'Sprinkler', status: 'delayed', waterNeeded: 800, reason: 'Rain expected' },
  { id: 3, field: 'Field C - Tomatoes', area: '3.0 acres', nextIrrigation: 'Thu, 7:00 AM', duration: '50 min', method: 'Drip', status: 'scheduled', waterNeeded: 1500 },
  { id: 4, field: 'Field D - Wheat', area: '4.5 acres', nextIrrigation: 'Fri, 6:30 AM', duration: '60 min', method: 'Flood', status: 'scheduled', waterNeeded: 2500 },
]

export const cropData = [
  { name: 'Grapes', health: 85, stage: 'Fruit Development', waterNeed: 'High', pestRisk: 'Low', daysToHarvest: 45 },
  { name: 'Onions', health: 92, stage: 'Bulb Formation', waterNeed: 'Medium', pestRisk: 'Low', daysToHarvest: 30 },
  { name: 'Tomatoes', health: 78, stage: 'Flowering', waterNeed: 'High', pestRisk: 'Medium', daysToHarvest: 60 },
  { name: 'Wheat', health: 95, stage: 'Grain Filling', waterNeed: 'Medium', pestRisk: 'Low', daysToHarvest: 20 },
]

export const climateRiskData = [
  { month: 'Jan', drought: 20, flood: 5, heat: 10, pest: 15 },
  { month: 'Feb', drought: 25, flood: 5, heat: 15, pest: 20 },
  { month: 'Mar', drought: 35, flood: 10, heat: 25, pest: 30 },
  { month: 'Apr', drought: 45, flood: 15, heat: 40, pest: 45 },
  { month: 'May', drought: 55, flood: 20, heat: 60, pest: 55 },
  { month: 'Jun', drought: 30, flood: 65, heat: 35, pest: 50 },
  { month: 'Jul', drought: 15, flood: 80, heat: 20, pest: 40 },
  { month: 'Aug', drought: 15, flood: 75, heat: 15, pest: 35 },
  { month: 'Sep', drought: 20, flood: 55, heat: 20, pest: 30 },
  { month: 'Oct', drought: 25, flood: 30, heat: 25, pest: 25 },
  { month: 'Nov', drought: 20, flood: 10, heat: 15, pest: 20 },
  { month: 'Dec', drought: 15, flood: 5, heat: 10, pest: 15 },
]

export const voiceLanguages = [
  { code: 'hi', name: 'Hindi', sample: 'नमस्ते, मैं आपका मौसम सहायक हूं' },
  { code: 'mr', name: 'Marathi', sample: 'नमस्कार, मी तुमचा हवामान सहाय्यक आहे' },
  { code: 'ta', name: 'Tamil', sample: 'வணக்கம், நான் உங்கள் வானிலை உதவியாளர்' },
  { code: 'te', name: 'Telugu', sample: 'నమస్తే, నేను మీ వాతావరణ సహాయకుడిని' },
  { code: 'kn', name: 'Kannada', sample: 'ನಮಸ್ಕಾರ, ನಾನು ನಿಮ್ಮ ಹವಾಮಾನ ಸಹಾಯಕ' },
  { code: 'bn', name: 'Bengali', sample: 'নমস্কার, আমি আপনার আবহাওয়া সহায়ক' },
  { code: 'pa', name: 'Punjabi', sample: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਂ ਤੁਹਾਡਾ ਮੌਸਮ ਸਹਾਇਕ ਹਾਂ' },
  { code: 'gu', name: 'Gujarati', sample: 'નમસ્તે, હું તમારું હવામાન સહાયક છું' },
]

export const chatbotMessages = [
  { id: 1, sender: 'bot', text: 'Namaste! I am your Smart Weather Assistant. How can I help you today?', time: '10:00 AM', type: 'text' },
  { id: 2, sender: 'user', text: 'What is the weather today?', time: '10:01 AM', type: 'text' },
  { id: 3, sender: 'bot', text: 'Today in Nashik: Partly cloudy with 70% chance of rain in the evening. Temperature: 32°C (feels like 36°C). Humidity: 68%. Wind: 14 km/h from SW.', time: '10:01 AM', type: 'weather' },
  { id: 4, sender: 'user', text: 'Should I irrigate my grapes today?', time: '10:02 AM', type: 'text' },
  { id: 5, sender: 'bot', text: 'I recommend delaying irrigation for your grapes today. There is 70% probability of 25-40mm rainfall this evening. Drip irrigation scheduled for tomorrow 6 AM (45 min) is optimal. Soil moisture sensors show adequate levels.', time: '10:02 AM', type: 'advisory' },
]
