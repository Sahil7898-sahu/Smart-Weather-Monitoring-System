export interface SensorReading {
  id: string;
  timestamp: Date;
  temperature: number;
  humidity: number;
  deviceId: string;
  location?: string;
}

export interface RainfallPrediction {
  probability: number; // 0-100%
  intensity: 'none' | 'light' | 'moderate' | 'heavy';
  expectedAmount?: number; // mm
  timeWindow: string; // e.g., "next 2 hours"
  confidence: number; // 0-100%
}

export interface SensorData {
  current: SensorReading;
  historical: SensorReading[];
  prediction: RainfallPrediction;
}

export interface SensorStatus {
  isConnected: boolean;
  lastUpdate: Date;
  batteryLevel?: number;
  signalStrength?: number;
}
