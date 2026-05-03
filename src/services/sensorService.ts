import { SensorReading, RainfallPrediction, SensorData, SensorStatus } from '../types/sensor';

// ESP32 Configuration from environment variables
const ESP32_IP = import.meta.env.VITE_ESP32_IP_ADDRESS || '10.16.200.17';
const ESP32_PORT = import.meta.env.VITE_ESP32_PORT || '80';
const ESP32_ENDPOINT = import.meta.env.VITE_ESP32_TEMP_ENDPOINT || `http://${ESP32_IP}/data`;
const ENABLE_REAL_SENSORS = import.meta.env.VITE_ENABLE_REAL_SENSORS === 'true';
const UPDATE_INTERVAL = parseInt(import.meta.env.VITE_SENSOR_UPDATE_INTERVAL || '5000');
const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';

class SensorService {
  private static instance: SensorService;
  private sensorData: SensorData;
  private status: SensorStatus;
  private realTimeInterval: ReturnType<typeof setInterval> | null = null;
  private callbacks: ((data: SensorData) => void)[] = [];

  private constructor() {
    this.status = {
      isConnected: false,
      lastUpdate: new Date(),
      batteryLevel: 85,
      signalStrength: 92
    };

    // Initialize with real or mock data based on configuration
    if (ENABLE_REAL_SENSORS) {
      this.sensorData = this.generateInitialData();
      this.startRealTimeSimulation();
    } else {
      this.sensorData = this.generateRealisticDHT11Data();
      this.startRealTimeSimulation();
    }
  }

  static getInstance(): SensorService {
    if (!SensorService.instance) {
      SensorService.instance = new SensorService();
    }
    return SensorService.instance;
  }

  private async fetchRealSensorData(): Promise<SensorReading | null> {
    try {
      if (DEBUG_MODE) {
        console.log(`Fetching sensor data from: ${ESP32_ENDPOINT}`);
      }

      const response = await fetch(ESP32_ENDPOINT, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (DEBUG_MODE) {
        console.log('Received sensor data:', data);
      }

      // Parse the ESP32 response - adjust based on your actual API response format
      const sensorReading: SensorReading = {
        id: `esp32-${Date.now()}`,
        timestamp: new Date(),
        temperature: parseFloat(data.temperature) || parseFloat(data.temp) || 0,
        humidity: parseFloat(data.humidity) || parseFloat(data.humid) || 0,
        deviceId: 'ESP32-DHT11-REAL',
        location: data.location || 'Field A'
      };

      // Validate sensor readings
      if (sensorReading.temperature < -40 || sensorReading.temperature > 80 ||
          sensorReading.humidity < 0 || sensorReading.humidity > 100) {
        throw new Error('Invalid sensor readings - out of DHT11 range');
      }

      this.status.isConnected = true;
      return sensorReading;

    } catch (error) {
      console.error('Error fetching real sensor data:', error);
      this.status.isConnected = false;
      return null;
    }
  }

  private generateInitialData(): SensorData {
    const now = new Date();
    const current: SensorReading = {
      id: 'sensor-initial',
      timestamp: now,
      temperature: 25.0,
      humidity: 60.0,
      deviceId: 'ESP32-DHT11-REAL',
      location: 'Field A'
    };

    return {
      current,
      historical: [current],
      prediction: this.predictRainfall(current, [current])
    };
  }

  private generateRealisticDHT11Data(): SensorData {
    const now = new Date();
    const baseTemp = 25 + Math.sin(now.getHours() * Math.PI / 12) * 8; // Daily temperature cycle
    const baseHumidity = 70 + Math.sin((now.getHours() - 6) * Math.PI / 12) * 15; // Humidity cycle
    
    const current: SensorReading = {
      id: 'sensor-001',
      timestamp: now,
      temperature: baseTemp + (Math.random() - 0.5) * 2, // DHT11 accuracy ±2°C
      humidity: baseHumidity + (Math.random() - 0.5) * 5, // DHT11 accuracy ±5%
      deviceId: 'ESP32-DHT11-001',
      location: 'Field A'
    };

    const historical: SensorReading[] = [];
    for (let i = 47; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 30 * 60 * 1000); // 30-minute intervals
      const hour = timestamp.getHours();
      const tempCycle = 25 + Math.sin(hour * Math.PI / 12) * 8;
      const humidityCycle = 70 + Math.sin((hour - 6) * Math.PI / 12) * 15;
      
      historical.push({
        id: `sensor-${i}`,
        timestamp,
        temperature: tempCycle + (Math.random() - 0.5) * 2,
        humidity: humidityCycle + (Math.random() - 0.5) * 5,
        deviceId: 'ESP32-DHT11-001',
        location: 'Field A'
      });
    }

    const prediction = this.predictRainfall(current, historical);

    return { current, historical, prediction };
  }

  private predictRainfall(current: SensorReading, historical: SensorReading[]): RainfallPrediction {
    const recentHumidity = historical.slice(-12).map(h => h.humidity); // Last 6 hours
    const recentTemp = historical.slice(-12).map(h => h.temperature);
    
    const avgHumidity = recentHumidity.reduce((a, b) => a + b, 0) / recentHumidity.length;
    const avgTemp = recentTemp.reduce((a, b) => a + b, 0) / recentTemp.length;
    
    const humidityTrend = current.humidity - avgHumidity;
    const tempTrend = avgTemp - current.temperature;
    
    // Calculate rate of change
    const humidityRate = this.calculateTrendRate(recentHumidity);
    const tempRate = this.calculateTrendRate(recentTemp);

    let probability = 0;
    let intensity: 'none' | 'light' | 'moderate' | 'heavy' = 'none';
    let expectedAmount = 0;

    // Enhanced rainfall prediction based on real DHT11 patterns
    if (current.humidity > 85 && humidityTrend > 8 && humidityRate > 1.5) {
      // High humidity with rapid increase - strong rain indicator
      probability = Math.min(95, 70 + humidityTrend * 1.5 + humidityRate * 10);
      intensity = current.humidity > 92 ? 'heavy' : 'moderate';
      expectedAmount = intensity === 'heavy' ? 20 : 12;
    } else if (current.humidity > 75 && humidityTrend > 5 && tempTrend > 3) {
      // Moderate humidity rising with cooling - good rain indicator
      probability = Math.min(80, 50 + humidityTrend * 2 + tempTrend * 3);
      intensity = 'moderate';
      expectedAmount = 8;
    } else if (current.humidity > 70 && (humidityTrend > 3 || tempRate < -1)) {
      // Humidity increasing or temperature dropping rapidly
      probability = Math.min(65, 35 + humidityTrend * 4 + Math.abs(tempRate) * 5);
      intensity = 'light';
      expectedAmount = 4;
    } else if (current.humidity > 65 && tempTrend > 2) {
      // Slight conditions for light rain
      probability = Math.min(45, 25 + tempTrend * 5 + (current.humidity - 65) * 2);
      intensity = 'light';
      expectedAmount = 2;
    } else {
      // Low probability based on current conditions
      probability = Math.max(5, 15 - current.humidity / 10);
      intensity = 'none';
      expectedAmount = 0;
    }

    // Adjust confidence based on data consistency and DHT11 accuracy
    const humidityVariance = this.calculateVariance(recentHumidity);
    const tempVariance = this.calculateVariance(recentTemp);
    const consistency = 1 / (1 + humidityVariance/100 + tempVariance/50);
    const confidence = Math.max(55, Math.min(98, 85 * consistency + 10));

    return {
      probability: Math.round(probability),
      intensity,
      expectedAmount,
      timeWindow: 'next 2 hours',
      confidence: Math.round(confidence)
    };
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  private calculateTrendRate(values: number[]): number {
    if (values.length < 2) return 0;
    const recent = values.slice(-4); // Last 4 readings
    if (recent.length < 2) return 0;
    
    // Simple linear regression to find trend rate
    const n = recent.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = recent.reduce((a, b) => a + b, 0);
    const sumXY = recent.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  async getSensorData(): Promise<SensorData> {
    if (ENABLE_REAL_SENSORS) {
      // Fetch latest real data
      await this.updateSensorData();
    } else {
      // Use simulated data
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return this.sensorData;
  }

  async getSensorStatus(): Promise<SensorStatus> {
    // Simulate occasional status changes
    this.status.lastUpdate = new Date();
    this.status.batteryLevel = Math.max(20, this.status.batteryLevel! - Math.random() * 0.1);
    this.status.signalStrength = 85 + Math.random() * 15;
    
    return this.status;
  }

  private async updateSensorData(): Promise<void> {
    let newReading: SensorReading | null = null;

    if (ENABLE_REAL_SENSORS) {
      // Try to fetch real sensor data
      newReading = await this.fetchRealSensorData();
      
      if (!newReading) {
        // Fallback to simulated data if real sensor fails
        if (DEBUG_MODE) {
          console.log('Using fallback simulated data');
        }
        newReading = this.generateSimulatedReading();
      }
    } else {
      // Use simulated data
      newReading = this.generateSimulatedReading();
    }

    if (newReading) {
      // Update historical data (keep last 48 readings = 24 hours at 30-min intervals)
      this.sensorData.historical = [...this.sensorData.historical.slice(-47), newReading];
      this.sensorData.current = newReading;
      
      // Recalculate prediction with real-time data
      this.sensorData.prediction = this.predictRainfall(newReading, this.sensorData.historical);
      
      // Update status
      this.status.lastUpdate = new Date();
      this.status.batteryLevel = Math.max(20, this.status.batteryLevel! - Math.random() * 0.05);
      this.status.signalStrength = 85 + Math.random() * 15;
      
      // Notify all subscribers
      this.callbacks.forEach(callback => callback(this.sensorData));
    }
  }

  private generateSimulatedReading(): SensorReading {
    const now = new Date();
    const hour = now.getHours();
    
    // Simulate realistic DHT11 readings with daily patterns
    const baseTemp = 25 + Math.sin(hour * Math.PI / 12) * 8;
    const baseHumidity = 70 + Math.sin((hour - 6) * Math.PI / 12) * 15;
    
    return {
      id: `sensor-${now.getTime()}`,
      timestamp: now,
      temperature: baseTemp + (Math.random() - 0.5) * 2, // ±2°C accuracy
      humidity: baseHumidity + (Math.random() - 0.5) * 5, // ±5% accuracy
      deviceId: 'ESP32-DHT11-SIM',
      location: 'Field A'
    };
  }

  private startRealTimeSimulation(): void {
    // Clear existing interval if any
    if (this.realTimeInterval) {
      clearInterval(this.realTimeInterval);
    }

    // Start real-time sensor data updates
    this.realTimeInterval = setInterval(async () => {
      await this.updateSensorData();
      
      // Simulate occasional connection issues (1% chance) only for simulated data
      if (!ENABLE_REAL_SENSORS && Math.random() < 0.01) {
        this.status.isConnected = false;
        setTimeout(() => {
          this.status.isConnected = true;
        }, 2000);
      }
    }, UPDATE_INTERVAL);

    if (DEBUG_MODE) {
      console.log(`Real-time sensor updates started with interval: ${UPDATE_INTERVAL}ms`);
      console.log(`Real sensors enabled: ${ENABLE_REAL_SENSORS}`);
      console.log(`ESP32 endpoint: ${ESP32_ENDPOINT}`);
    }
  }

  public subscribeToRealTimeData(callback: (data: SensorData) => void): void {
    this.callbacks.push(callback);
  }

  public unsubscribeFromRealTimeData(callback: (data: SensorData) => void): void {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  public stopRealTimeSimulation(): void {
    if (this.realTimeInterval) {
      clearInterval(this.realTimeInterval);
      this.realTimeInterval = null;
    }
  }

  async calibrateSensor(): Promise<boolean> {
    try {
      if (ENABLE_REAL_SENSORS) {
        // Send calibration command to ESP32 if API supports it
        const calibrateEndpoint = `http://${ESP32_IP}/calibrate`;
        await fetch(calibrateEndpoint, { method: 'POST' });
      }
      
      // Simulate calibration delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.status.isConnected = true;
      this.status.lastUpdate = new Date();
      this.status.batteryLevel = 100; // Reset battery after calibration
      
      return true;
    } catch (error) {
      console.error('Calibration failed:', error);
      return false;
    }
  }

  // Method to test ESP32 connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(ESP32_ENDPOINT, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(3000)
      });
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // Cleanup method
  public destroy(): void {
    this.stopRealTimeSimulation();
    this.callbacks = [];
  }
}

export default SensorService;
