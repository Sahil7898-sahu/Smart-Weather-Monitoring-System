import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Cloud, CloudSnow, Wind, Droplets, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { WeatherPredictionService, type WeatherForecast } from '../services/weatherPredictionService';

interface WeatherForecastComponentProps {
  className?: string;
}

export const WeatherForecastComponent: React.FC<WeatherForecastComponentProps> = ({ className }) => {
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const loadForecast = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const predictionService = WeatherPredictionService.getInstance();
        await predictionService.initialize();
        
        const forecastData = await predictionService.generate7DayForecast();
        setForecast(forecastData);
        setLastUpdate(new Date());
        
        console.log('🌤️ 7-day forecast loaded:', forecastData);
      } catch (err) {
        console.error('❌ Failed to load forecast:', err);
        setError('Failed to load weather forecast');
      } finally {
        setLoading(false);
      }
    };

    loadForecast();
    
    // Update forecast every hour
    const interval = setInterval(loadForecast, 3600000);
    
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (conditions: string) => {
    if (conditions.includes('Heavy Rain') || conditions.includes('Moderate Rain')) {
      return <CloudRain className="h-6 w-6 text-blue-600" />;
    }
    if (conditions.includes('Light Rain')) {
      return <CloudRain className="h-6 w-6 text-gray-500" />;
    }
    if (conditions.includes('Snow')) {
      return <CloudSnow className="h-6 w-6 text-blue-300" />;
    }
    if (conditions.includes('Sunny')) {
      return <Sun className="h-6 w-6 text-yellow-500" />;
    }
    return <Cloud className="h-6 w-6 text-gray-400" />;
  };

  const getRainColor = (probability: number) => {
    if (probability > 70) return 'text-red-600 bg-red-50';
    if (probability > 50) return 'text-orange-600 bg-orange-50';
    if (probability > 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-green-600';
    if (confidence > 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: 'rising' | 'falling' | 'stable') => {
    if (trend === 'rising') return <TrendingUp className="h-3 w-3 text-red-500" />;
    if (trend === 'falling') return <TrendingDown className="h-3 w-3 text-blue-500" />;
    return <Activity className="h-3 w-3 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-8 text-red-600">
          <CloudRain className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Weather Forecast Unavailable</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CloudRain className="h-5 w-5" />
          7-Day Weather Forecast
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">Live Prediction</span>
          </div>
          <span className="text-xs text-gray-500">
            Updated: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {forecast.map((day, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 transition-all hover:shadow-md ${
              index === 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold text-sm">{day.day}</div>
                <div className="text-xs text-gray-500">
                  {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
              {getWeatherIcon(day.conditions)}
            </div>

            {/* Temperature */}
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-800">
                  {day.temperature.high}°
                </span>
                <span className="text-sm text-gray-500">
                  {day.temperature.low}°
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Avg: {day.temperature.average}°C
              </div>
            </div>

            {/* Conditions */}
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-700">{day.conditions}</div>
              <div className="text-xs text-gray-500">
                Humidity: {day.humidity.average}% ({day.humidity.range.min}-{day.humidity.range.max}%)
              </div>
            </div>

            {/* Rain Prediction */}
            <div className="mb-3">
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRainColor(day.precipitation.probability)}`}>
                <Droplets className="h-3 w-3" />
                {day.precipitation.probability}% rain
              </div>
              {day.precipitation.amount > 0 && (
                <div className="text-xs text-gray-600 mt-1">
                  {day.precipitation.amount}mm {day.precipitation.type}
                </div>
              )}
            </div>

            {/* Data Source & Confidence */}
            <div className="border-t pt-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Source:</span>
                  <span className={`font-medium ${
                    day.dataSource === 'sensor' ? 'text-green-600' :
                    day.dataSource === 'api' ? 'text-blue-600' : 'text-purple-600'
                  }`}>
                    {day.dataSource === 'sensor' ? 'ESP32' :
                     day.dataSource === 'api' ? 'API' : 'Combined'}
                  </span>
                </div>
                <div className={`font-medium ${getConfidenceColor(day.confidence)}`}>
                  {Math.round(day.confidence * 100)}%
                </div>
              </div>
              
              {/* Influence Factors */}
              <div className="mt-2 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Sensor: {Math.round(day.factors.sensorInfluence * 100)}%</span>
                  <span>API: {Math.round(day.factors.apiInfluence * 100)}%</span>
                  <span>Pattern: {Math.round(day.factors.historicalPattern * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-blue-600">
              {forecast.filter(d => d.precipitation.probability > 50).length}
            </div>
            <div className="text-xs text-gray-500">Rainy Days</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-orange-600">
              {Math.round(forecast.reduce((sum, d) => sum + d.precipitation.amount, 0))}mm
            </div>
            <div className="text-xs text-gray-500">Total Rainfall</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-red-600">
              {Math.round(forecast.reduce((sum, d) => sum + d.temperature.high, 0) / forecast.length)}°C
            </div>
            <div className="text-xs text-gray-500">Avg High</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600">
              {Math.round(forecast.reduce((sum, d) => sum + d.confidence, 0) / forecast.length * 100)}%
            </div>
            <div className="text-xs text-gray-500">Avg Confidence</div>
          </div>
        </div>
      </div>
    </div>
  );
};
