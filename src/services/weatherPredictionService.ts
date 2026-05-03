import { OfflineWeatherAPI, SensorData } from './offlineWeatherAPI';
import { WeatherDataProcessor, WeatherRecord } from '../data/weatherDataProcessor';
import { RainPredictionService } from './rainPredictionService';

export interface WeatherForecast {
  date: Date;
  day: string;
  temperature: {
    high: number;
    low: number;
    average: number;
  };
  humidity: {
    average: number;
    range: { min: number; max: number };
  };
  precipitation: {
    probability: number;
    amount: number; // in mm
    type: 'none' | 'light' | 'moderate' | 'heavy';
  };
  conditions: string;
  confidence: number;
  dataSource: 'sensor' | 'api' | 'combined';
  factors: {
    sensorInfluence: number;
    apiInfluence: number;
    historicalPattern: number;
  };
}

export interface PredictionFactors {
  temperatureTrend: 'rising' | 'falling' | 'stable';
  humidityTrend: 'rising' | 'falling' | 'stable';
  pressureTrend: 'rising' | 'falling' | 'stable';
  sensorConsistency: number; // 0-1
  apiAccuracy: number; // 0-1
  seasonalPattern: number; // 0-1
}

export class WeatherPredictionService {
  private static instance: WeatherPredictionService;
  private weatherAPI: OfflineWeatherAPI;
  private rainPredictionService: RainPredictionService;
  private dataProcessor: WeatherDataProcessor;
  private historicalData: WeatherRecord[] = [];
  private sensorData: SensorData[] = [];

  private constructor() {
    this.weatherAPI = OfflineWeatherAPI.getInstance();
    this.rainPredictionService = RainPredictionService.getInstance();
    this.dataProcessor = WeatherDataProcessor.getInstance();
  }

  static getInstance(): WeatherPredictionService {
    if (!WeatherPredictionService.instance) {
      WeatherPredictionService.instance = new WeatherPredictionService();
    }
    return WeatherPredictionService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Load historical data from data processor
      this.historicalData = this.dataProcessor.getHistoricalData();
      this.sensorData = this.weatherAPI.getSensorData(undefined, 50); // Last 50 readings
      
      console.log('🌤️ Weather Prediction Service initialized');
      console.log(`📊 Historical data: ${this.historicalData.length} records`);
      console.log(`🌡️ Sensor data: ${this.sensorData.length} readings`);
    } catch (error) {
      console.error('❌ Failed to initialize Weather Prediction Service:', error);
      throw error;
    }
  }

  async generate7DayForecast(): Promise<WeatherForecast[]> {
    console.log('🔮 Generating 7-day weather forecast...');
    
    // Get current sensor and API data
    const currentSensorData = this.weatherAPI.getSensorData(undefined, 1)[0];
    const currentWeatherData = this.weatherAPI.getCurrentWeather();
    
    // Analyze current conditions and trends
    const factors = this.analyzePredictionFactors();
    console.log('📈 Prediction factors:', factors);

    const forecast: WeatherForecast[] = [];
    
    for (let day = 0; day < 7; day++) {
      const forecastDate = new Date();
      forecastDate.setDate(forecastDate.getDate() + day);
      
      const dayForecast = await this.generateDayForecast(
        forecastDate,
        day,
        currentSensorData,
        currentWeatherData,
        factors
      );
      
      forecast.push(dayForecast);
    }

    console.log('✅ 7-day forecast generated');
    return forecast;
  }

  private analyzePredictionFactors(): PredictionFactors {
    if (this.sensorData.length < 5) {
      return {
        temperatureTrend: 'stable',
        humidityTrend: 'stable',
        pressureTrend: 'stable',
        sensorConsistency: 0.5,
        apiAccuracy: 0.7,
        seasonalPattern: 0.6
      };
    }

    const recent = this.sensorData.slice(0, 10);
    const older = this.sensorData.slice(10, 20);

    // Analyze trends
    const tempTrend = this.analyzeTrend(recent.map(s => s.temperature), older.map(s => s.temperature));
    const humidityTrend = this.analyzeTrend(recent.map(s => s.humidity), older.map(s => s.humidity));
    const pressureTrend = this.analyzeTrend(recent.map(s => s.pressure || 1013), older.map(s => s.pressure || 1013));

    // Calculate sensor consistency
    const sensorConsistency = this.calculateSensorConsistency(recent);

    // API accuracy based on historical comparison
    const apiAccuracy = this.calculateAPIAccuracy();

    // Seasonal pattern
    const seasonalPattern = this.calculateSeasonalPattern();

    return {
      temperatureTrend: tempTrend,
      humidityTrend: humidityTrend,
      pressureTrend: pressureTrend,
      sensorConsistency,
      apiAccuracy,
      seasonalPattern
    };
  }

  private analyzeTrend(recent: number[], older: number[]): 'rising' | 'falling' | 'stable' {
    if (recent.length === 0 || older.length === 0) return 'stable';

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    const difference = recentAvg - olderAvg;
    const threshold = Math.abs(olderAvg) * 0.05; // 5% threshold

    if (difference > threshold) return 'rising';
    if (difference < -threshold) return 'falling';
    return 'stable';
  }

  private calculateSensorConsistency(recentData: SensorData[]): number {
    if (recentData.length < 3) return 0.5;

    // Calculate standard deviation for temperature and humidity
    const temps = recentData.map(s => s.temperature);
    const humidities = recentData.map(s => s.humidity);

    const tempStdDev = this.calculateStandardDeviation(temps);
    const humidityStdDev = this.calculateStandardDeviation(humidities);

    // Lower standard deviation = higher consistency
    const tempConsistency = Math.max(0, 1 - (tempStdDev / 10)); // Normalize to 0-1
    const humidityConsistency = Math.max(0, 1 - (humidityStdDev / 20)); // Normalize to 0-1

    return (tempConsistency + humidityConsistency) / 2;
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  private calculateAPIAccuracy(): number {
    // Compare sensor data with API data for recent readings
    // This is a simplified version - in practice, you'd compare with actual API responses
    return 0.75; // Placeholder value
  }

  private calculateSeasonalPattern(): number {
    const currentMonth = new Date().getMonth();
    
    // Seasonal patterns for monsoon/seasonal weather
    const seasonalPatterns = {
      // Jun-Aug: Monsoon season - high rain probability
      5: 0.9, 6: 0.95, 7: 0.9, // May-Jul
      // Sep-Nov: Post-monsoon - moderate rain
      8: 0.6, 9: 0.4, 10: 0.2, // Aug-Oct
      // Dec-Feb: Winter - low rain
      11: 0.1, 0: 0.1, 1: 0.1, // Nov-Jan
      // Mar-May: Pre-monsoon - increasing rain
      2: 0.2, 3: 0.4, 4: 0.6  // Feb-Apr
    };

    return seasonalPatterns[currentMonth as keyof typeof seasonalPatterns] || 0.5;
  }

  private async generateDayForecast(
    date: Date,
    dayOffset: number,
    currentSensorData: SensorData | undefined,
    currentWeatherData: any,
    factors: PredictionFactors
  ): Promise<WeatherForecast> {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Base predictions on current data and trends
    const baseTemp = currentSensorData?.temperature || 25;
    const baseHumidity = currentSensorData?.humidity || 60;
    const basePressure = currentSensorData?.pressure || 1013;

    // Apply trends for future days
    const tempAdjustment = this.applyTemperatureTrend(factors.temperatureTrend, dayOffset);
    const humidityAdjustment = this.applyHumidityTrend(factors.humidityTrend, dayOffset);

    const predictedHigh = baseTemp + tempAdjustment + 5; // Daytime variation
    const predictedLow = baseTemp + tempAdjustment - 3; // Nighttime variation
    const predictedHumidity = baseHumidity + humidityAdjustment;

    // Rain prediction using enhanced algorithm
    const rainPrediction = this.predictRainProbability(
      dayOffset,
      factors,
      predictedHumidity,
      basePressure
    );

    // Determine weather conditions
    const conditions = this.determineWeatherConditions(rainPrediction.probability, predictedHigh);

    // Calculate confidence based on data sources
    const confidence = this.calculatePredictionConfidence(dayOffset, factors);

    // Determine data source influence
    const dataSource = this.determineDataSource(factors, dayOffset);

    return {
      date,
      day: dayName,
      temperature: {
        high: Math.round(predictedHigh),
        low: Math.round(predictedLow),
        average: Math.round((predictedHigh + predictedLow) / 2)
      },
      humidity: {
        average: Math.round(predictedHumidity),
        range: {
          min: Math.round(predictedHumidity - 10),
          max: Math.round(predictedHumidity + 10)
        }
      },
      precipitation: rainPrediction,
      conditions,
      confidence,
      dataSource,
      factors: {
        sensorInfluence: factors.sensorConsistency,
        apiInfluence: factors.apiAccuracy,
        historicalPattern: factors.seasonalPattern
      }
    };
  }

  private applyTemperatureTrend(trend: 'rising' | 'falling' | 'stable', dayOffset: number): number {
    const trendMultiplier = trend === 'rising' ? 1 : trend === 'falling' ? -1 : 0;
    return trendMultiplier * (dayOffset * 0.5); // 0.5°C per day trend
  }

  private applyHumidityTrend(trend: 'rising' | 'falling' | 'stable', dayOffset: number): number {
    const trendMultiplier = trend === 'rising' ? 1 : trend === 'falling' ? -1 : 0;
    return trendMultiplier * (dayOffset * 2); // 2% per day trend
  }

  private predictRainProbability(
    dayOffset: number,
    factors: PredictionFactors,
    humidity: number,
    pressure: number
  ): { probability: number; amount: number; type: 'none' | 'light' | 'moderate' | 'heavy' } {
    // Base probability from seasonal patterns
    let probability = factors.seasonalPattern * 100;

    // Adjust based on humidity (higher humidity = higher rain chance)
    if (humidity > 80) probability += 20;
    else if (humidity > 70) probability += 10;
    else if (humidity < 40) probability -= 15;

    // Adjust based on pressure (lower pressure = higher rain chance)
    if (pressure < 1000) probability += 15;
    else if (pressure > 1020) probability -= 10;

    // Adjust based on trends
    if (factors.humidityTrend === 'rising') probability += 10;
    if (factors.pressureTrend === 'falling') probability += 10;

    // Factor in sensor consistency
    probability *= (0.5 + factors.sensorConsistency * 0.5);

    // Reduce confidence for further days
    const confidenceReduction = dayOffset * 5;
    probability = Math.max(0, Math.min(100, probability));

    // Determine rain type and amount
    let type: 'none' | 'light' | 'moderate' | 'heavy' = 'none';
    let amount = 0;

    if (probability > 70) {
      type = 'heavy';
      amount = Math.random() * 20 + 10; // 10-30mm
    } else if (probability > 50) {
      type = 'moderate';
      amount = Math.random() * 10 + 5; // 5-15mm
    } else if (probability > 30) {
      type = 'light';
      amount = Math.random() * 5 + 1; // 1-6mm
    }

    return { probability: Math.round(probability), amount: Math.round(amount), type };
  }

  private determineWeatherConditions(rainProbability: number, temperature: number): string {
    if (rainProbability > 70) return 'Heavy Rain';
    if (rainProbability > 50) return 'Moderate Rain';
    if (rainProbability > 30) return 'Light Rain';
    
    if (temperature > 35) return 'Hot and Sunny';
    if (temperature > 25) return 'Partly Cloudy';
    if (temperature > 15) return 'Cloudy';
    return 'Cool and Overcast';
  }

  private calculatePredictionConfidence(dayOffset: number, factors: PredictionFactors): number {
    let baseConfidence = 0.9;
    
    // Reduce confidence for further days
    baseConfidence -= (dayOffset * 0.1);
    
    // Adjust based on data quality
    baseConfidence *= (0.5 + factors.sensorConsistency * 0.3 + factors.apiAccuracy * 0.2);
    
    return Math.max(0.3, Math.min(0.95, baseConfidence));
  }

  private determineDataSource(factors: PredictionFactors, dayOffset: number): 'sensor' | 'api' | 'combined' {
    if (dayOffset === 0 && factors.sensorConsistency > 0.7) return 'sensor';
    if (factors.apiAccuracy > factors.sensorConsistency) return 'api';
    return 'combined';
  }

  // Method to compare sensor vs API accuracy
  async compareDataSources(): Promise<{
    sensorAccuracy: number;
    apiAccuracy: number;
    recommendedSource: 'sensor' | 'api' | 'combined';
    confidence: number;
  }> {
    // This would compare recent sensor readings with API data
    // For now, return based on our factors
    const sensorConsistency = this.calculateSensorConsistency(this.sensorData.slice(0, 10));
    const apiAccuracy = this.calculateAPIAccuracy();
    
    let recommendedSource: 'sensor' | 'api' | 'combined';
    if (sensorConsistency > apiAccuracy + 0.1) {
      recommendedSource = 'sensor';
    } else if (apiAccuracy > sensorConsistency + 0.1) {
      recommendedSource = 'api';
    } else {
      recommendedSource = 'combined';
    }

    const confidence = Math.max(sensorConsistency, apiAccuracy);

    return {
      sensorAccuracy: sensorConsistency,
      apiAccuracy,
      recommendedSource,
      confidence
    };
  }

  // Enhanced rain prediction using existing service
  async predictRainWithSensors(): Promise<{
    predictedRain: boolean;
    probability: number;
    expectedAmount: number;
    confidence: number;
    factors: any;
  }> {
    const currentSensorData = this.weatherAPI.getSensorData(undefined, 1)[0];
    
    if (!currentSensorData) {
      return {
        predictedRain: false,
        probability: 0,
        expectedAmount: 0,
        confidence: 0,
        factors: {}
      };
    }

    // Use the existing rain prediction service
    const rainPrediction = this.rainPredictionService.predictRain({
      humidity: currentSensorData.humidity,
      pressure: currentSensorData.pressure || 1013,
      rainfall: 0,
      windSpeed: 0,
      windDirection: 0,
      timestamp: currentSensorData.timestamp
    } as any);

    // Enhance with sensor data consistency
    const sensorConsistency = this.calculateSensorConsistency(this.sensorData.slice(0, 5));
    const enhancedConfidence = rainPrediction.confidence * (0.7 + sensorConsistency * 0.3);

    return {
      predictedRain: rainPrediction.predictedRain,
      probability: rainPrediction.rainProbability,
      expectedAmount: rainPrediction.expectedPrecipitation,
      confidence: enhancedConfidence,
      factors: rainPrediction.factors
    };
  }
}
