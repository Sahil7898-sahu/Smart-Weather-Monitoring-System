export interface APIConfiguration {
  weatherAPI: {
    apiKey?: string;
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  offlineMode: {
    enabled: boolean;
    fallbackEnabled: boolean;
    dataUpdateInterval: number;
    sensorUpdateInterval: number;
  };
  sensors: {
    enabled: boolean;
    simulationMode: boolean;
    realSensorEndpoints: string[];
    defaultLocation: string;
  };
  predictions: {
    enabled: boolean;
    comparisonEnabled: boolean;
    historyRetentionHours: number;
    accuracyThreshold: number;
  };
}

export const defaultConfig: APIConfiguration = {
  weatherAPI: {
    apiKey: undefined, // Set via environment variable
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    timeout: 10000,
    retryAttempts: 3
  },
  offlineMode: {
    enabled: true,
    fallbackEnabled: true,
    dataUpdateInterval: 30000, // 30 seconds
    sensorUpdateInterval: 5000  // 5 seconds
  },
  sensors: {
    enabled: true,
    simulationMode: true, // Set to false to use real sensors
    realSensorEndpoints: [
      'http://10.16.200.17/data'
    ],
    defaultLocation: 'Nashik, Maharashtra'
  },
  predictions: {
    enabled: true,
    comparisonEnabled: true,
    historyRetentionHours: 72,
    accuracyThreshold: 70
  }
};

export class ConfigManager {
  private static instance: ConfigManager;
  private config: APIConfiguration;

  private constructor() {
    this.config = { ...defaultConfig };
    this.loadFromEnvironment();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadFromEnvironment(): void {
    // Load API key from environment variables
    if (typeof window !== 'undefined' && (window as any).__ENV__) {
      const env = (window as any).__ENV__;
      this.config.weatherAPI.apiKey = env.VITE_WEATHER_API_KEY;
    }
  }

  getConfig(): APIConfiguration {
    return { ...this.config };
  }

  updateConfig(updates: Partial<APIConfiguration>): void {
    this.config = this.mergeDeep(this.config, updates);
    this.saveToLocalStorage();
  }

  resetToDefaults(): void {
    this.config = { ...defaultConfig };
    this.saveToLocalStorage();
  }

  private mergeDeep(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.mergeDeep(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('weather-api-config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save config to localStorage:', error);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const saved = localStorage.getItem('weather-api-config');
      if (saved) {
        const savedConfig = JSON.parse(saved);
        this.config = this.mergeDeep(this.config, savedConfig);
      }
    } catch (error) {
      console.warn('Failed to load config from localStorage:', error);
    }
  }

  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  importConfig(configJson: string): boolean {
    try {
      const importedConfig = JSON.parse(configJson);
      this.config = this.mergeDeep(defaultConfig, importedConfig);
      this.saveToLocalStorage();
      return true;
    } catch (error) {
      console.error('Failed to import config:', error);
      return false;
    }
  }
}

// Environment variable helper
export const getEnvVar = (key: string): string | undefined => {
  if (typeof window !== 'undefined') {
    return (window as any).__ENV?.[key];
  }
  return undefined;
};
