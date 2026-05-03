import { WeatherDataProcessor, ProcessedWeatherData, WeatherRecord } from '../data/weatherDataProcessor';

export interface APIConfig {
  apiKey?: string;
  baseUrl: string;
  useOfflineMode: boolean;
  fallbackToOffline: boolean;
  updateInterval: number;
}

export interface SensorData {
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  rainfall: number;
  timestamp: Date;
  sensorId: string;
  location: string;
}

export interface PredictionComparison {
  actual: WeatherRecord;
  predicted: ProcessedWeatherData['current'];
  accuracy: {
    temperatureAccuracy: number;
    humidityAccuracy: number;
    rainAccuracy: number;
    overallAccuracy: number;
  };
  timestamp: Date;
}

export class OfflineWeatherAPI {
  private static instance: OfflineWeatherAPI;
  private config: APIConfig;
  private dataProcessor: WeatherDataProcessor;
  private sensorData: SensorData[] = [];
  private predictionHistory: PredictionComparison[] = [];
  private updateTimer: number | null = null;

  private constructor() {
    this.config = {
      apiKey: undefined, // Will be configured later
      baseUrl: 'https://api.openweathermap.org/data/2.5',
      useOfflineMode: true,
      fallbackToOffline: true,
      updateInterval: 30000 // 30 seconds
    };
    this.dataProcessor = WeatherDataProcessor.getInstance();
  }

  static getInstance(): OfflineWeatherAPI {
    if (!OfflineWeatherAPI.instance) {
      OfflineWeatherAPI.instance = new OfflineWeatherAPI();
    }
    return OfflineWeatherAPI.instance;
  }

  async initialize(): Promise<void> {
    try {
      await this.dataProcessor.loadWeatherData();
      this.startRealTimeUpdates();
      this.initializeSensorSimulation();
      console.log('Offline Weather API initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Offline Weather API:', error);
      throw error;
    }
  }

  async getCurrentWeather(location: string = 'Nashik, Maharashtra'): Promise<ProcessedWeatherData['current']> {
    if (this.config.useOfflineMode || !this.config.apiKey) {
      return this.dataProcessor.getCurrentWeather(location);
    }

    try {
      // Try online API first
      const onlineData = await this.fetchOnlineWeather(location);
      const offlineData = this.dataProcessor.getCurrentWeather(location);
      
      // Compare and store for accuracy tracking
      this.compareAndStore(offlineData, onlineData);
      
      return onlineData;
    } catch (error) {
      if (this.config.fallbackToOffline) {
        console.warn('Online API failed, falling back to offline data:', error);
        return this.dataProcessor.getCurrentWeather(location);
      }
      throw error;
    }
  }

  async getWeatherForecast(location: string = 'Nashik, Maharashtra'): Promise<{
    hourly: ProcessedWeatherData['hourly'];
    daily: ProcessedWeatherData['daily'];
  }> {
    if (this.config.useOfflineMode || !this.config.apiKey) {
      return {
        hourly: this.dataProcessor.getHourlyForecast(),
        daily: this.dataProcessor.getDailyForecast()
      };
    }

    try {
      // Try online API first
      const onlineForecast = await this.fetchOnlineForecast(location);
      const offlineForecast = {
        hourly: this.dataProcessor.getHourlyForecast(),
        daily: this.dataProcessor.getDailyForecast()
      };
      
      return onlineForecast || offlineForecast;
    } catch (error) {
      if (this.config.fallbackToOffline) {
        console.warn('Online forecast failed, falling back to offline data:', error);
        return {
          hourly: this.dataProcessor.getHourlyForecast(),
          daily: this.dataProcessor.getDailyForecast()
        };
      }
      throw error;
    }
  }

  getSensorData(sensorId?: string, hours: number = 24): SensorData[] {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    let filtered = this.sensorData.filter(data => data.timestamp >= cutoffTime);
    
    if (sensorId) {
      filtered = filtered.filter(data => data.sensorId === sensorId);
    }
    
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getPredictionHistory(hours: number = 24): PredictionComparison[] {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.predictionHistory
      .filter(comparison => comparison.timestamp >= cutoffTime)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getAccuracyMetrics(hours: number = 24): {
    avgTemperatureAccuracy: number;
    avgHumidityAccuracy: number;
    avgRainAccuracy: number;
    avgOverallAccuracy: number;
    totalPredictions: number;
  } {
    const history = this.getPredictionHistory(hours);
    
    if (history.length === 0) {
      return {
        avgTemperatureAccuracy: 0,
        avgHumidityAccuracy: 0,
        avgRainAccuracy: 0,
        avgOverallAccuracy: 0,
        totalPredictions: 0
      };
    }

    const totals = history.reduce((acc, comparison) => ({
      temperatureAccuracy: acc.temperatureAccuracy + comparison.accuracy.temperatureAccuracy,
      humidityAccuracy: acc.humidityAccuracy + comparison.accuracy.humidityAccuracy,
      rainAccuracy: acc.rainAccuracy + comparison.accuracy.rainAccuracy,
      overallAccuracy: acc.overallAccuracy + comparison.accuracy.overallAccuracy
    }), { temperatureAccuracy: 0, humidityAccuracy: 0, rainAccuracy: 0, overallAccuracy: 0 });

    const count = history.length;
    return {
      avgTemperatureAccuracy: totals.temperatureAccuracy / count,
      avgHumidityAccuracy: totals.humidityAccuracy / count,
      avgRainAccuracy: totals.rainAccuracy / count,
      avgOverallAccuracy: totals.overallAccuracy / count,
      totalPredictions: count
    };
  }

  updateConfig(newConfig: Partial<APIConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
    
    if (this.config.updateInterval > 0) {
      this.startRealTimeUpdates();
    }
  }

  private async fetchOnlineWeather(location: string): Promise<ProcessedWeatherData['current']> {
    // Simulate online API call - replace with actual API implementation
    throw new Error('Online API not implemented');
  }

  private async fetchOnlineForecast(location: string): Promise<{
    hourly: ProcessedWeatherData['hourly'];
    daily: ProcessedWeatherData['daily'];
  }> {
    // Simulate online API call - replace with actual API implementation
    throw new Error('Online forecast API not implemented');
  }

  private compareAndStore(offlineData: ProcessedWeatherData['current'], onlineData: any): void {
    // Create a mock WeatherRecord from offline data for comparison
    const mockRecord: WeatherRecord = {
      precipitation: 0,
      date: new Date().toISOString().split('T')[0],
      month: new Date().getMonth() + 1,
      week: Math.ceil(new Date().getDate() / 7),
      year: new Date().getFullYear(),
      city: 'Nashik',
      code: 'NASHIK',
      location: 'Nashik, Maharashtra',
      state: 'Maharashtra',
      avgTemp: offlineData.temperature,
      maxTemp: offlineData.temperature + 5,
      minTemp: offlineData.temperature - 5,
      windDirection: 0,
      windSpeed: offlineData.windSpeed
    };

    const accuracy = this.dataProcessor.comparePrediction(mockRecord, onlineData);
    
    this.predictionHistory.push({
      actual: mockRecord,
      predicted: offlineData,
      accuracy,
      timestamp: new Date()
    });

    // Keep only last 1000 predictions
    if (this.predictionHistory.length > 1000) {
      this.predictionHistory = this.predictionHistory.slice(-1000);
    }
  }

  private startRealTimeUpdates(): void {
    this.updateTimer = setInterval(() => {
      this.fetchRealSensorData();
    }, 5000); // Update every 5 seconds for real-time data
  }

  private initializeSensorSimulation(): void {
    // Create initial DHT11 sensor readings
    for (let i = 0; i < 10; i++) {
      this.simulateSensorReading();
    }
  }

  private async fetchRealSensorData(): Promise<void> {
    // Check if real sensors are enabled
    if (!import.meta.env.VITE_ENABLE_REAL_SENSORS || import.meta.env.VITE_ENABLE_REAL_SENSORS === 'false') {
      console.log('Real sensors disabled, using simulation only');
      this.simulateSensorReading();
      return;
    }

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch('http://10.16.200.17/data', {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Parse ESP32 DHT11 data
      const sensorReading: SensorData = {
        temperature: parseFloat(data.temperature) || 0,
        humidity: parseFloat(data.humidity) || 0,
        pressure: parseFloat(data.pressure) || 1013,
        windSpeed: 0, // Not available in DHT11
        windDirection: 0, // Not available in DHT11
        rainfall: 0, // Not available in DHT11
        timestamp: new Date(),
        sensorId: data.sensorId || 'DHT11_001',
        location: data.location || 'Nashik, Maharashtra'
      };
      
      // Validate sensor data
      if (sensorReading.temperature < -50 || sensorReading.temperature > 80) {
        throw new Error('Invalid temperature reading');
      }
      if (sensorReading.humidity < 0 || sensorReading.humidity > 100) {
        throw new Error('Invalid humidity reading');
      }
      
      this.sensorData.push(sensorReading);
      console.log('✅ Real sensor data received:', sensorReading);
      
      // Keep only last 100 readings
      if (this.sensorData.length > 100) {
        this.sensorData = this.sensorData.slice(-100);
      }
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('⏰ ESP32 connection timeout (5s), using simulation');
      } else {
        console.warn('❌ Failed to fetch real sensor data, using simulation:', error);
      }
      // Fallback to simulation if ESP32 is not available
      this.simulateSensorReading();
    }
  }

  private simulateSensorReading(): void {
    const sensorIds = ['DHT11_001', 'DHT11_002'];
    const locations = ['Nashik, Maharashtra', 'Field A'];
    
    // Get current weather data from dataset for more realistic simulation
    const currentWeather = this.dataProcessor.getCurrentWeather();
    const historicalData = this.dataProcessor.getHistoricalData(30);
    const currentTime = new Date();
    
    sensorIds.forEach((sensorId, index) => {
      // Use realistic temperature based on time of day and historical patterns
      const hour = currentTime.getHours();
      const minute = currentTime.getMinutes();
      const isDaytime = hour >= 6 && hour <= 18;
      
      // Base temperature from current weather with realistic variations
      let baseTemp = currentWeather.temperature;
      
      // Add time-based variations (more realistic than random)
      const timeVariation = Math.sin((hour * Math.PI) / 12) * 3; // Daily temperature cycle
      baseTemp += timeVariation;
      
      // Add historical data influence
      const historicalAvg = historicalData.length > 0 
        ? historicalData.reduce((sum, record) => sum + record.avgTemp, 0) / historicalData.length
        : 25;
      
      baseTemp = baseTemp * 0.6 + historicalAvg * 0.4; // Weighted blend
      
      // Realistic humidity calculation based on temperature and historical data
      let baseHumidity = 70;
      
      // Humidity inversely related to temperature (realistic physics)
      if (baseTemp > 35) baseHumidity = 45; // Low humidity when very hot
      else if (baseTemp > 25) baseHumidity = 60; // Moderate humidity when warm
      else if (baseTemp < 15) baseHumidity = 85; // High humidity when cold
      
      // Add recent precipitation influence
      const recentPrecip = historicalData.slice(-7).reduce((sum, record) => sum + record.precipitation, 0);
      if (recentPrecip > 5) {
        baseHumidity += 20; // Higher humidity after recent rain
      }
      
      // Add minute-level variations for real-time feel
      const minuteVariation = Math.sin((minute * Math.PI) / 30) * 1;
      baseHumidity += minuteVariation;
      
      const sensorReading: SensorData = {
        temperature: Math.round(baseTemp * 10) / 10,
        humidity: Math.round(Math.max(30, Math.min(95, baseHumidity))),
        pressure: Math.round(1013 + Math.sin((minute * Math.PI) / 60) * 10),
        windSpeed: 0, // Not available in DHT11
        windDirection: 0, // Not available in DHT11
        rainfall: 0, // Not available in DHT11
        timestamp: new Date(currentTime.getTime() - Math.random() * 5000), // Very recent timestamps
        sensorId,
        location: locations[index]
      };
      
      this.sensorData.push(sensorReading);
    });
    
    // Keep only last 100 readings
    if (this.sensorData.length > 100) {
      this.sensorData = this.sensorData.slice(-100);
    }
  }

  destroy(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }
}
