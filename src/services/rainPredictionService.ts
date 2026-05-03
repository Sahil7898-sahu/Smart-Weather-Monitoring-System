import { WeatherDataProcessor, WeatherRecord } from '../data/weatherDataProcessor';

export interface RainPrediction {
  predictedRain: boolean;
  rainProbability: number;
  expectedPrecipitation: number;
  confidence: number;
  factors: {
    historicalPattern: number;
    currentConditions: number;
    seasonalTrend: number;
  };
  recommendation: string;
}

export interface RainPredictionFactors {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  season: string;
  recentRain: number[];
  historicalPattern: number;
}

export class RainPredictionService {
  private static instance: RainPredictionService;
  private weatherProcessor: WeatherDataProcessor;
  private historicalData: WeatherRecord[] = [];

  private constructor() {
    this.weatherProcessor = WeatherDataProcessor.getInstance();
  }

  static getInstance(): RainPredictionService {
    if (!RainPredictionService.instance) {
      RainPredictionService.instance = new RainPredictionService();
    }
    return RainPredictionService.instance;
  }

  async initialize(): Promise<void> {
    try {
      await this.weatherProcessor.loadWeatherData();
      this.historicalData = this.weatherProcessor.getHistoricalData(365); // Last year of data
      console.log(`Rain prediction service initialized with ${this.historicalData.length} historical records`);
    } catch (error) {
      console.error('Failed to initialize rain prediction service:', error);
      throw error;
    }
  }

  predictRain(currentConditions: Partial<WeatherRecord> & { humidity?: number; pressure?: number }): RainPrediction {
    const factors = this.analyzePredictionFactors(currentConditions);
    const rainProbability = this.calculateRainProbability(factors);
    const predictedRain = rainProbability > 60; // 60% threshold
    const expectedPrecipitation = this.estimatePrecipitation(rainProbability, factors);
    const confidence = this.calculateConfidence(factors);
    const recommendation = this.generateRecommendation(predictedRain, rainProbability, factors);

    return {
      predictedRain,
      rainProbability,
      expectedPrecipitation,
      confidence,
      factors: {
        historicalPattern: factors.historicalPattern,
        currentConditions: this.analyzeCurrentConditions(currentConditions),
        seasonalTrend: this.analyzeSeasonalTrend(factors.season)
      },
      recommendation
    };
  }

  private analyzePredictionFactors(current: Partial<WeatherRecord> & { humidity?: number; pressure?: number }): RainPredictionFactors {
    const season = this.getCurrentSeason();
    const recentRain = this.getRecentRainTrend();
    const historicalPattern = this.analyzeHistoricalRainPattern(current, season);

    return {
      temperature: current.avgTemp || 25,
      humidity: current.humidity || 70,
      windSpeed: current.windSpeed || 10,
      windDirection: current.windDirection || 180,
      pressure: current.pressure || 1013,
      season,
      recentRain,
      historicalPattern
    };
  }

  private calculateRainProbability(factors: RainPredictionFactors): number {
    let probability = 50; // Base probability

    // Historical pattern influence (30% weight)
    probability += (factors.historicalPattern - 50) * 0.3;

    // Current conditions influence (40% weight)
    const currentScore = this.analyzeCurrentConditions(factors);
    probability += (currentScore - 50) * 0.4;

    // Seasonal trend influence (20% weight)
    const seasonalScore = this.analyzeSeasonalTrend(factors.season);
    probability += (seasonalScore - 50) * 0.2;

    // Recent rain trend influence (10% weight)
    const recentScore = this.analyzeRecentRainTrend(factors.recentRain);
    probability += (recentScore - 50) * 0.1;

    // Ensure probability is within bounds
    return Math.max(0, Math.min(100, probability));
  }

  private analyzeCurrentConditions(current: Partial<WeatherRecord> & { humidity?: number; pressure?: number }): number {
    let score = 50;

    // High humidity increases rain chance
    if (current.humidity) {
      if (current.humidity > 80) score += 20;
      else if (current.humidity > 70) score += 10;
      else if (current.humidity < 40) score -= 15;
    }

    // Low pressure increases rain chance
    if (current.pressure) {
      if (current.pressure < 1000) score += 15;
      else if (current.pressure > 1020) score -= 10;
    }

    // Temperature affects rain probability
    if (current.avgTemp) {
      if (current.avgTemp > 30) score += 10; // Hot weather can cause rain
      else if (current.avgTemp < 15) score -= 5; // Cold weather less likely
    }

    // Wind direction (in India, certain directions bring rain)
    if (current.windDirection) {
      if ((current.windDirection >= 135 && current.windDirection <= 225) || // SE to SW (monsoon winds)
          (current.windDirection >= 45 && current.windDirection <= 90)) {   // NE to E
        score += 10;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  private analyzeSeasonalTrend(season: string): number {
    const seasonalPatterns = {
      'monsoon': 85,  // June-September: High rain probability
      'post-monsoon': 40,  // October-November: Moderate
      'winter': 15,   // December-February: Low
      'pre-monsoon': 55, // March-May: Increasing
      'summer': 25    // May-June: Low to moderate
    };

    return seasonalPatterns[season as keyof typeof seasonalPatterns] || 50;
  }

  private analyzeHistoricalRainPattern(current: Partial<WeatherRecord>, season: string): number {
    if (this.historicalData.length === 0) return 50;

    // Filter historical data for similar conditions
    const similarConditions = this.historicalData.filter(record => {
      const tempDiff = Math.abs(record.avgTemp - (current.avgTemp || 25));
      const windDiff = Math.abs(record.windSpeed - (current.windSpeed || 10));
      
      return tempDiff < 5 && windDiff < 5;
    });

    if (similarConditions.length === 0) return 50;

    // Calculate rain probability from similar historical conditions
    const rainyDays = similarConditions.filter(record => record.precipitation > 0).length;
    return (rainyDays / similarConditions.length) * 100;
  }

  private getRecentRainTrend(): number[] {
    if (this.historicalData.length === 0) return [0, 0, 0, 0, 0];

    // Get last 5 days of precipitation data
    return this.historicalData.slice(-5).map(record => record.precipitation);
  }

  private analyzeRecentRainTrend(recentRain: number[]): number {
    if (recentRain.length === 0) return 50;

    const totalRecentRain = recentRain.reduce((sum, rain) => sum + rain, 0);
    const averageRecentRain = totalRecentRain / recentRain.length;

    // If there was recent rain, slightly higher chance of more rain
    if (averageRecentRain > 0) {
      return Math.min(70, 50 + averageRecentRain * 2);
    }

    return 45; // Slightly lower chance if no recent rain
  }

  private estimatePrecipitation(rainProbability: number, factors: RainPredictionFactors): number {
    if (rainProbability < 30) return 0;

    // Base precipitation estimate
    let precipitation = (rainProbability / 100) * 10; // Max 10mm base

    // Adjust based on factors
    if (factors.humidity > 85) precipitation *= 1.5;
    if (factors.pressure < 1000) precipitation *= 1.3;
    if (factors.season === 'monsoon') precipitation *= 2;

    return Math.round(precipitation * 10) / 10; // Round to 1 decimal
  }

  private calculateConfidence(factors: RainPredictionFactors): number {
    let confidence = 70; // Base confidence

    // More historical data = higher confidence
    if (this.historicalData.length > 300) confidence += 10;
    else if (this.historicalData.length < 100) confidence -= 15;

    // Strong indicators increase confidence
    if (factors.humidity > 85 || factors.humidity < 30) confidence += 5;
    if (factors.pressure < 1000 || factors.pressure > 1020) confidence += 5;

    // Seasonal patterns are more reliable
    if (factors.season === 'monsoon' || factors.season === 'winter') confidence += 10;

    return Math.max(30, Math.min(95, confidence));
  }

  private generateRecommendation(predictedRain: boolean, rainProbability: number, factors: RainPredictionFactors): string {
    if (predictedRain) {
      if (rainProbability > 80) {
        return `High rain probability (${rainProbability}%). Heavy rainfall expected. Postpone irrigation and outdoor farming activities. Ensure proper drainage in fields.`;
      } else if (rainProbability > 60) {
        return `Moderate rain probability (${rainProbability}%). Light to moderate rain expected. Consider delaying irrigation and protect sensitive crops.`;
      } else {
        return `Low to moderate rain chance (${rainProbability}%). Light drizzle possible. Monitor weather conditions closely.`;
      }
    } else {
      if (rainProbability < 20) {
        return `Very low rain chance (${rainProbability}%). Clear conditions expected. Good time for irrigation and field activities.`;
      } else if (rainProbability < 40) {
        return `Low rain probability (${rainProbability}%). Mostly dry conditions. Normal irrigation schedule recommended.`;
      } else {
        return `Moderate rain probability but unlikely (${rainProbability}%). Monitor weather updates before irrigation.`;
      }
    }
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    
    if (month >= 6 && month <= 9) return 'monsoon';      // July-October
    if (month >= 10 && month <= 11) return 'post-monsoon'; // November-December
    if (month >= 0 && month <= 2) return 'winter';         // January-March
    if (month >= 3 && month <= 4) return 'pre-monsoon';    // April-May
    return 'summer';                                       // June
  }

  getRainForecast(days: number = 7): Array<{ date: string; probability: number; expectedRain: number }> {
    const forecast = [];
    const currentDate = new Date();

    for (let i = 0; i < days; i++) {
      const forecastDate = new Date(currentDate);
      forecastDate.setDate(currentDate.getDate() + i);

      // Simulate future conditions (in real app, would use weather forecast)
      const simulatedConditions = {
        avgTemp: 25 + Math.random() * 10,
        humidity: 60 + Math.random() * 30,
        windSpeed: 5 + Math.random() * 15,
        pressure: 1000 + Math.random() * 30
      };

      const prediction = this.predictRain(simulatedConditions);
      
      forecast.push({
        date: forecastDate.toISOString().split('T')[0],
        probability: prediction.rainProbability,
        expectedRain: prediction.expectedPrecipitation
      });
    }

    return forecast;
  }

  getHistoricalRainAccuracy(): { accuracy: number; totalPredictions: number; correctPredictions: number } {
    if (this.historicalData.length === 0) return { accuracy: 0, totalPredictions: 0, correctPredictions: 0 };

    let correctPredictions = 0;
    let totalPredictions = 0;

    // Test prediction accuracy on historical data
    for (let i = 10; i < this.historicalData.length; i++) {
      const previousData = this.historicalData.slice(i - 10, i);
      const currentData = this.historicalData[i];
      
      // Simulate prediction based on previous 10 days
      const avgHumidity = 70; // Simulated
      const avgPressure = 1013; // Simulated
      
      const prediction = this.predictRain({
        ...currentData,
        humidity: avgHumidity,
        pressure: avgPressure
      });

      const actualRain = currentData.precipitation > 0;
      const predictedRain = prediction.predictedRain;

      if (actualRain === predictedRain) {
        correctPredictions++;
      }
      totalPredictions++;
    }

    const accuracy = totalPredictions > 0 ? (correctPredictions / totalPredictions) * 100 : 0;
    
    return { accuracy, totalPredictions, correctPredictions };
  }
}
