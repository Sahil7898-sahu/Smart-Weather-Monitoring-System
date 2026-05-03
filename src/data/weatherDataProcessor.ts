export interface WeatherRecord {
  precipitation: number;
  date: string;
  month: number;
  week: number;
  year: number;
  city: string;
  code: string;
  location: string;
  state: string;
  avgTemp: number;
  maxTemp: number;
  minTemp: number;
  windDirection: number;
  windSpeed: number;
}

export interface ProcessedWeatherData {
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    pressure: number;
    uvIndex: number;
    visibility: number;
    condition: string;
    icon: string;
    location: string;
    updatedAt: Date;
  };
  hourly: Array<{ time: string; temp: number; rain: number }>;
  daily: Array<{ day: string; high: number; low: number; rainProb: number; condition: string; icon: string }>;
  historical: WeatherRecord[];
}

export class WeatherDataProcessor {
  private static instance: WeatherDataProcessor;
  private weatherData: WeatherRecord[] = [];
  private currentIndex = 0;

  static getInstance(): WeatherDataProcessor {
    if (!WeatherDataProcessor.instance) {
      WeatherDataProcessor.instance = new WeatherDataProcessor();
    }
    return WeatherDataProcessor.instance;
  }

  async loadWeatherData(): Promise<void> {
    try {
      const response = await fetch('/src/data/weather.csv');
      const csvText = await response.text();
      this.weatherData = this.parseCSV(csvText);
      console.log(`Loaded ${this.weatherData.length} weather records`);
    } catch (error) {
      console.error('Failed to load weather data:', error);
      throw error;
    }
  }

  private parseCSV(csvText: string): WeatherRecord[] {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
    
    return lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',').map(v => v.replace(/"/g, ''));
        return {
          precipitation: parseFloat(values[0]) || 0,
          date: values[1],
          month: parseInt(values[2]) || 0,
          week: parseInt(values[3]) || 0,
          year: parseInt(values[4]) || 0,
          city: values[5],
          code: values[6],
          location: values[7],
          state: values[8],
          avgTemp: parseFloat(values[9]) || 0,
          maxTemp: parseFloat(values[10]) || 0,
          minTemp: parseFloat(values[11]) || 0,
          windDirection: parseInt(values[12]) || 0,
          windSpeed: parseFloat(values[13]) || 0
        };
      });
  }

  getCurrentWeather(location: string = 'Nashik, Maharashtra'): ProcessedWeatherData['current'] {
    // Check if weather data is loaded, if not use fallback values
    if (this.weatherData.length === 0) {
      console.warn('Weather data not loaded, using fallback values');
      const fallbackTemp = 25 + Math.floor(Math.random() * 10) - 5;
      const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Stormy'];
      const icons = ['sun', 'cloud-sun', 'cloud', 'cloud-rain', 'cloud-lightning'];
      const conditionIndex = Math.floor(Math.random() * conditions.length);

      return {
        temperature: fallbackTemp,
        feelsLike: fallbackTemp + Math.floor(Math.random() * 5) - 2,
        humidity: 60 + Math.floor(Math.random() * 30),
        windSpeed: 5 + Math.floor(Math.random() * 15),
        windDirection: this.getWindDirection(Math.floor(Math.random() * 360)),
        pressure: 1000 + Math.floor(Math.random() * 30),
        uvIndex: Math.floor(Math.random() * 11),
        visibility: 5 + Math.floor(Math.random() * 10),
        condition: conditions[conditionIndex],
        icon: icons[conditionIndex],
        location,
        updatedAt: new Date()
      };
    }

    const record = this.weatherData[this.currentIndex % this.weatherData.length];
    this.currentIndex++;

    // Additional safety check for the record
    if (!record || record.avgTemp === undefined) {
      console.warn('Invalid weather record, using fallback values');
      const fallbackTemp = 25 + Math.floor(Math.random() * 10) - 5;
      const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Stormy'];
      const icons = ['sun', 'cloud-sun', 'cloud', 'cloud-rain', 'cloud-lightning'];
      const conditionIndex = Math.floor(Math.random() * conditions.length);

      return {
        temperature: fallbackTemp,
        feelsLike: fallbackTemp + Math.floor(Math.random() * 5) - 2,
        humidity: 60 + Math.floor(Math.random() * 30),
        windSpeed: 5 + Math.floor(Math.random() * 15),
        windDirection: this.getWindDirection(Math.floor(Math.random() * 360)),
        pressure: 1000 + Math.floor(Math.random() * 30),
        uvIndex: Math.floor(Math.random() * 11),
        visibility: 5 + Math.floor(Math.random() * 10),
        condition: conditions[conditionIndex],
        icon: icons[conditionIndex],
        location,
        updatedAt: new Date()
      };
    }

    const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Stormy'];
    const icons = ['sun', 'cloud-sun', 'cloud', 'cloud-rain', 'cloud-lightning'];
    const conditionIndex = Math.floor(Math.random() * conditions.length);

    return {
      temperature: record.avgTemp,
      feelsLike: record.avgTemp + Math.floor(Math.random() * 5) - 2,
      humidity: 60 + Math.floor(Math.random() * 30),
      windSpeed: record.windSpeed,
      windDirection: this.getWindDirection(record.windDirection),
      pressure: 1000 + Math.floor(Math.random() * 30),
      uvIndex: Math.floor(Math.random() * 11),
      visibility: 5 + Math.floor(Math.random() * 10),
      condition: conditions[conditionIndex],
      icon: icons[conditionIndex],
      location,
      updatedAt: new Date()
    };
  }

  getHourlyForecast(): ProcessedWeatherData['hourly'] {
    const baseTemp = 20 + Math.floor(Math.random() * 15);
    return Array.from({ length: 16 }, (_, i) => ({
      time: `${String(6 + i).padStart(2, '0')}:00`,
      temp: baseTemp + Math.floor(Math.random() * 10) - 5,
      rain: Math.floor(Math.random() * 100)
    }));
  }

  getDailyForecast(): ProcessedWeatherData['daily'] {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'];
    const icons = ['sun', 'cloud-sun', 'cloud', 'cloud-rain'];
    
    return days.map((day, i) => {
      const conditionIndex = Math.floor(Math.random() * conditions.length);
      const baseTemp = 25 + Math.floor(Math.random() * 10);
      
      return {
        day,
        high: baseTemp + Math.floor(Math.random() * 8),
        low: baseTemp - Math.floor(Math.random() * 8),
        rainProb: Math.floor(Math.random() * 100),
        condition: conditions[conditionIndex],
        icon: icons[conditionIndex]
      };
    });
  }

  getHistoricalData(days: number = 30): WeatherRecord[] {
    const endIndex = this.currentIndex;
    const startIndex = Math.max(0, endIndex - days);
    return this.weatherData.slice(startIndex, endIndex);
  }

  comparePrediction(actual: WeatherRecord, predicted: ProcessedWeatherData['current']) {
    const tempDiff = Math.abs(actual.avgTemp - predicted.temperature);
    const humidityDiff = Math.abs((60 + Math.floor(Math.random() * 30)) - predicted.humidity); // Simulated actual humidity
    
    // Rain accuracy based on precipitation vs predicted rain probability
    const actualRain = actual.precipitation > 0.1;
    const predictedRain = predicted.humidity > 75; // Simple rain prediction based on humidity
    const rainAccuracy = actualRain === predictedRain ? 100 : 0;
    
    return {
      temperatureAccuracy: Math.max(0, 100 - (tempDiff * 5)),
      humidityAccuracy: Math.max(0, 100 - (humidityDiff * 2)),
      rainAccuracy: rainAccuracy,
      overallAccuracy: Math.max(0, 100 - ((tempDiff * 2) + (humidityDiff * 0.8) + (rainAccuracy ? 0 : 20)))
    };
  }

  private getWindDirection(degrees: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }

  getAllData(): ProcessedWeatherData {
    return {
      current: this.getCurrentWeather(),
      hourly: this.getHourlyForecast(),
      daily: this.getDailyForecast(),
      historical: this.getHistoricalData()
    };
  }
}
