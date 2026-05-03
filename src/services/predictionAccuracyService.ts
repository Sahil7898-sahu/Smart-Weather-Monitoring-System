import { OfflineWeatherAPI, SensorData } from './offlineWeatherAPI';
import { WeatherPredictionService } from './weatherPredictionService';

export interface PredictionAccuracy {
  timestamp: Date;
  sensorPrediction: {
    temperature: number;
    humidity: number;
    rainProbability: number;
  };
  actualReading: {
    temperature: number;
    humidity: number;
    rainfall: number;
  };
  apiPrediction?: {
    temperature: number;
    humidity: number;
    rainProbability: number;
  };
  accuracy: {
    temperatureAccuracy: number;
    humidityAccuracy: number;
    rainAccuracy: number;
    overallAccuracy: number;
  };
  confidence: number;
}

export interface AccuracyMetrics {
  sensorAccuracy: {
    temperature: number;
    humidity: number;
    rain: number;
    overall: number;
  };
  apiAccuracy: {
    temperature: number;
    humidity: number;
    rain: number;
    overall: number;
  };
  comparison: {
    betterSource: 'sensor' | 'api' | 'equal';
    accuracyDifference: number;
  };
  trendAnalysis: {
    improving: boolean;
    trendPercentage: number;
  };
}

export class PredictionAccuracyService {
  private static instance: PredictionAccuracyService;
  private weatherAPI: OfflineWeatherAPI;
  private predictionService: WeatherPredictionService;
  private accuracyHistory: PredictionAccuracy[] = [];
  private lastPredictions: Map<string, any> = new Map();

  private constructor() {
    this.weatherAPI = OfflineWeatherAPI.getInstance();
    this.predictionService = WeatherPredictionService.getInstance();
  }

  static getInstance(): PredictionAccuracyService {
    if (!PredictionAccuracyService.instance) {
      PredictionAccuracyService.instance = new PredictionAccuracyService();
    }
    return PredictionAccuracyService.instance;
  }

  async initialize(): Promise<void> {
    console.log('📊 Prediction Accuracy Service initialized');
  }

  // Generate predictions based on sensor data and weather patterns
  generateSensorPredictions(currentSensorData: SensorData): {
    temperature: number;
    humidity: number;
    rainProbability: number;
  } {
    const baseTemp = currentSensorData.temperature;
    const baseHumidity = currentSensorData.humidity;
    const pressure = currentSensorData.pressure || 1013;
    const windSpeed = currentSensorData.windSpeed || 0;

    // Enhanced temperature prediction
    let tempPrediction = baseTemp;
    
    // Temperature changes based on atmospheric conditions
    if (baseHumidity > 80 && pressure < 1005) {
      tempPrediction -= 1.5; // Strong cooling before rain
    } else if (baseHumidity > 70 && pressure < 1010) {
      tempPrediction -= 1; // Moderate cooling before rain
    } else if (baseHumidity < 30 && pressure > 1020) {
      tempPrediction += 1.5; // Warming in high pressure, dry conditions
    } else if (baseHumidity < 40 && pressure > 1015) {
      tempPrediction += 1; // Moderate warming in dry conditions
    }

    // Enhanced humidity prediction
    let humidityPrediction = baseHumidity;
    
    // Humidity changes based on pressure and temperature
    if (pressure < 1000) {
      humidityPrediction += 8; // Significant rising humidity before rain
    } else if (pressure < 1010) {
      humidityPrediction += 5; // Moderate rising humidity
    } else if (pressure > 1020) {
      humidityPrediction -= 5; // Falling humidity in high pressure
    } else if (pressure > 1015) {
      humidityPrediction -= 3; // Moderate falling humidity
    }

    // Advanced rain prediction algorithm
    let rainProbability = 0;
    
    // Primary rain indicators (strong weight)
    if (baseHumidity > 90) rainProbability += 40;
    else if (baseHumidity > 85) rainProbability += 30;
    else if (baseHumidity > 80) rainProbability += 20;
    else if (baseHumidity > 75) rainProbability += 10;
    
    // Pressure indicators (medium weight)
    if (pressure < 995) rainProbability += 30;
    else if (pressure < 1005) rainProbability += 20;
    else if (pressure < 1010) rainProbability += 10;
    
    // Temperature-humidity interaction (medium weight)
    if (baseTemp > 25 && baseHumidity > 80) rainProbability += 15;
    else if (baseTemp > 30 && baseHumidity > 70) rainProbability += 10;
    else if (baseTemp > 35 && baseHumidity > 65) rainProbability += 8;
    
    // Wind factor (light weight)
    if (windSpeed > 15 && baseHumidity > 70) rainProbability += 5;
    else if (windSpeed > 10 && baseHumidity > 75) rainProbability += 3;
    
    // Rapid humidity increase indicator
    const recentHumidityTrend = this.getHumidityTrend();
    if (recentHumidityTrend > 5) rainProbability += 15;
    else if (recentHumidityTrend > 3) rainProbability += 8;
    
    // Pressure drop indicator
    const recentPressureTrend = this.getPressureTrend();
    if (recentPressureTrend < -5) rainProbability += 20;
    else if (recentPressureTrend < -3) rainProbability += 10;

    rainProbability = Math.min(100, Math.max(0, rainProbability));

    return {
      temperature: Math.round(tempPrediction * 10) / 10,
      humidity: Math.round(Math.min(100, Math.max(0, humidityPrediction))),
      rainProbability: Math.round(rainProbability)
    };
  }

  // Helper methods for trend analysis
  private getHumidityTrend(): number {
    const recentData = this.weatherAPI.getSensorData(undefined, 5);
    if (recentData.length < 3) return 0;
    
    const oldest = recentData[recentData.length - 1].humidity;
    const newest = recentData[0].humidity;
    return newest - oldest;
  }

  private getPressureTrend(): number {
    const recentData = this.weatherAPI.getSensorData(undefined, 5);
    if (recentData.length < 3) return 0;
    
    const oldest = recentData[recentData.length - 1].pressure || 1013;
    const newest = recentData[0].pressure || 1013;
    return newest - oldest;
  }

  // Calculate accuracy by comparing predictions with actual readings
  calculateAccuracy(
    prediction: { temperature: number; humidity: number; rainProbability: number },
    actual: { temperature: number; humidity: number; rainfall: number }
  ): {
    temperatureAccuracy: number;
    humidityAccuracy: number;
    rainAccuracy: number;
    overallAccuracy: number;
  } {
    // Temperature accuracy (within 2°C is considered accurate)
    const tempDiff = Math.abs(prediction.temperature - actual.temperature);
    const tempAccuracy = Math.max(0, 100 - (tempDiff * 25)); // 2°C = 50% accuracy, 0°C = 100%

    // Humidity accuracy (within 10% is considered accurate)
    const humidityDiff = Math.abs(prediction.humidity - actual.humidity);
    const humidityAccuracy = Math.max(0, 100 - (humidityDiff * 5)); // 10% = 50% accuracy, 0% = 100%

    // Rain accuracy (binary - did it rain or not)
    const predictedRain = prediction.rainProbability > 50;
    const actualRain = actual.rainfall > 0.1;
    const rainAccuracy = predictedRain === actualRain ? 100 : 0;

    // Overall accuracy
    const overallAccuracy = (tempAccuracy + humidityAccuracy + rainAccuracy) / 3;

    return {
      temperatureAccuracy: Math.round(tempAccuracy),
      humidityAccuracy: Math.round(humidityAccuracy),
      rainAccuracy: Math.round(rainAccuracy),
      overallAccuracy: Math.round(overallAccuracy)
    };
  }

  // Record prediction and compare with actual data
  async recordPredictionAccuracy(): Promise<void> {
    const currentSensorData = this.weatherAPI.getSensorData(undefined, 1)[0];
    if (!currentSensorData) return;

    // Generate enhanced sensor predictions with weather integration
    const sensorPrediction = this.generateSensorPredictions(currentSensorData);
    
    // Get current weather data for comparison
    const currentWeather = this.weatherAPI.getCurrentWeather('Nashik, Maharashtra');
    
    // Store current prediction for next comparison
    const predictionKey = currentSensorData.timestamp.toISOString();
    this.lastPredictions.set(predictionKey, {
      sensorPrediction,
      actualReading: {
        temperature: currentSensorData.temperature,
        humidity: currentSensorData.humidity,
        rainfall: 0 // Will be updated when rain occurs
      },
      weatherData: currentWeather
    });

    // Check if we have previous predictions to evaluate
    for (const [key, stored] of this.lastPredictions.entries()) {
      const predictionTime = new Date(key);
      const timeDiff = Date.now() - predictionTime.getTime();

      // Evaluate predictions made 1 hour ago
      if (timeDiff > 3600000 && timeDiff < 7200000) { // 1-2 hours ago
        const accuracy = this.calculateAccuracy(
          stored.sensorPrediction,
          stored.actualReading
        );

        const accuracyRecord: PredictionAccuracy = {
          timestamp: predictionTime,
          sensorPrediction: stored.sensorPrediction,
          actualReading: stored.actualReading,
          accuracy,
          confidence: this.calculatePredictionConfidence(stored.sensorPrediction)
        };

        this.accuracyHistory.push(accuracyRecord);

        // Keep only last 100 records
        if (this.accuracyHistory.length > 100) {
          this.accuracyHistory = this.accuracyHistory.slice(-100);
        }

        console.log('📊 Prediction accuracy recorded:', accuracyRecord);
      }
    }

    // Clean old predictions
    this.cleanupOldPredictions();
  }

  private calculatePredictionConfidence(prediction: {
    temperature: number;
    humidity: number;
    rainProbability: number;
  }): number {
    let confidence = 0.8; // Base confidence

    // Higher confidence for moderate values
    if (prediction.temperature > 10 && prediction.temperature < 35) confidence += 0.1;
    if (prediction.humidity > 30 && prediction.humidity < 90) confidence += 0.1;

    // Lower confidence for extreme predictions
    if (prediction.rainProbability > 80 || prediction.rainProbability < 20) confidence -= 0.1;

    return Math.min(1, Math.max(0, confidence));
  }

  private cleanupOldPredictions(): void {
    const cutoffTime = Date.now() - 24 * 3600000; // 24 hours ago
    for (const [key] of this.lastPredictions.entries()) {
      const predictionTime = new Date(key).getTime();
      if (predictionTime < cutoffTime) {
        this.lastPredictions.delete(key);
      }
    }
  }

  // Get accuracy metrics for dashboard
  getAccuracyMetrics(): AccuracyMetrics {
    if (this.accuracyHistory.length === 0) {
      return {
        sensorAccuracy: { temperature: 0, humidity: 0, rain: 0, overall: 0 },
        apiAccuracy: { temperature: 0, humidity: 0, rain: 0, overall: 0 },
        comparison: { betterSource: 'sensor', accuracyDifference: 0 },
        trendAnalysis: { improving: false, trendPercentage: 0 }
      };
    }

    const recent = this.accuracyHistory.slice(-20); // Last 20 predictions
    const older = this.accuracyHistory.slice(-40, -20); // Previous 20 predictions

    // Calculate sensor accuracy
    const sensorAccuracy = {
      temperature: recent.reduce((sum, r) => sum + r.accuracy.temperatureAccuracy, 0) / recent.length,
      humidity: recent.reduce((sum, r) => sum + r.accuracy.humidityAccuracy, 0) / recent.length,
      rain: recent.reduce((sum, r) => sum + r.accuracy.rainAccuracy, 0) / recent.length,
      overall: recent.reduce((sum, r) => sum + r.accuracy.overallAccuracy, 0) / recent.length
    };

    // Calculate trend
    const olderOverall = older.length > 0 ? 
      older.reduce((sum, r) => sum + r.accuracy.overallAccuracy, 0) / older.length : 0;
    const trendPercentage = sensorAccuracy.overall - olderOverall;
    const improving = trendPercentage > 0;

    return {
      sensorAccuracy: {
        temperature: Math.round(sensorAccuracy.temperature),
        humidity: Math.round(sensorAccuracy.humidity),
        rain: Math.round(sensorAccuracy.rain),
        overall: Math.round(sensorAccuracy.overall)
      },
      apiAccuracy: { temperature: 0, humidity: 0, rain: 0, overall: 0 }, // Placeholder
      comparison: { betterSource: 'sensor' as const, accuracyDifference: 0 },
      trendAnalysis: {
        improving,
        trendPercentage: Math.round(trendPercentage * 10) / 10
      }
    };
  }

  // Get detailed accuracy history
  getAccuracyHistory(limit: number = 10): PredictionAccuracy[] {
    return this.accuracyHistory.slice(-limit);
  }

  // Update actual rainfall when rain occurs
  updateActualRainfall(timestamp: Date, rainfall: number): void {
    const key = timestamp.toISOString();
    const stored = this.lastPredictions.get(key);
    if (stored) {
      stored.actualReading.rainfall = rainfall;
      console.log('🌧️ Updated actual rainfall:', rainfall, 'mm for', timestamp);
    }
  }

  // Get current prediction
  getCurrentPrediction(): {
    temperature: number;
    humidity: number;
    rainProbability: number;
    confidence: number;
  } | null {
    const currentSensorData = this.weatherAPI.getSensorData(undefined, 1)[0];
    if (!currentSensorData) return null;

    const prediction = this.generateSensorPredictions(currentSensorData);
    const confidence = this.calculatePredictionConfidence(prediction);

    return {
      ...prediction,
      confidence: Math.round(confidence * 100)
    };
  }
}
