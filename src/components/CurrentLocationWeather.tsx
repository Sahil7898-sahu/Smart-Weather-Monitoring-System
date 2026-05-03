import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer, Eye, Gauge, MapPin, Clock, AlertTriangle, Loader2, Wifi, WifiOff } from 'lucide-react';
import { WifiLocationService, WifiLocationData } from '../services/wifiLocationService';

interface CurrentLocationWeatherProps {
  className?: string;
}

const CurrentLocationWeather: React.FC<CurrentLocationWeatherProps> = ({ className = '' }) => {
  const [weatherData, setWeatherData] = useState<WifiLocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationInfo, setLocationInfo] = useState<{ lat: number; lon: number; method: string } | null>(null);

  const wifiLocationService = WifiLocationService.getInstance();

  useEffect(() => {
    fetchLocationWeather();
  }, []);

  const fetchLocationWeather = async (forceGPS = false) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🌍 Starting current location weather fetch...');
      console.log('🔧 Force GPS mode:', forceGPS);
      
      // Get location info first
      const locationInfo = await wifiLocationService.getLocationInfo();
      console.log('📡 Location detection info:', locationInfo);
      
      const data = await wifiLocationService.getCurrentLocationWeather();
      console.log('✅ Location weather data received:', {
        location: data.location.name,
        region: data.location.region,
        country: data.location.country,
        temperature: data.current.temp_c,
        condition: data.current.condition.text
      });
      
      setWeatherData(data);
      setLocationInfo({
        lat: data.location.lat,
        lon: data.location.lon,
        method: forceGPS ? 'Force GPS' : locationInfo.method
      });
    } catch (err) {
      console.error('❌ Location weather fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch location weather data');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) return <Sun className="w-8 h-8 text-yellow-400" />;
    if (lowerCondition.includes('rain')) return <CloudRain className="w-8 h-8 text-blue-400" />;
    if (lowerCondition.includes('cloud')) return <Cloud className="w-8 h-8 text-gray-400" />;
    return <Sun className="w-8 h-8 text-yellow-400" />;
  };

  const getLocationIcon = () => {
    if (!locationInfo) return <Wifi className="w-5 h-5 text-blue-500" />;
    
    if (locationInfo.method.includes('GPS')) {
      return <MapPin className="w-5 h-5 text-green-500" />;
    } else if (locationInfo.method.includes('WiFi')) {
      return <Wifi className="w-5 h-5 text-blue-500" />;
    } else {
      return <WifiOff className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-semibold text-white mb-2">Detecting Your Location</h3>
          <p className="text-primary-200 text-sm">
            Using WiFi/Network to find your current location and weather...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 ${className}`}>
        <div className="text-center">
          <WifiOff className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Location Detection Failed</h3>
          <p className="text-primary-200 text-sm mb-4">
            {error}
          </p>
          <button
            onClick={() => fetchLocationWeather()}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Retry Location Detection
          </button>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Location Data Unavailable</h3>
          <p className="text-primary-200 text-sm mb-4">
            Unable to fetch location weather data. Please try again.
          </p>
          <button
            onClick={() => fetchLocationWeather()}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { current, location } = weatherData;

  return (
    <div className={`bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {getLocationIcon()}
            <p className="text-primary-200 text-sm">Your Current Location</p>
          </div>
          <p className="text-white text-lg font-semibold">{location.name}, {location.region}</p>
          <p className="text-primary-200 text-sm">{location.country}</p>
          {locationInfo && (
            <div className="text-primary-300 text-xs mt-1">
              <p>📍 {locationInfo.lat.toFixed(4)}°, {locationInfo.lon.toFixed(4)}°</p>
              <p className="text-xs text-primary-400 mt-1">
                📡 Detection: {locationInfo.method}
              </p>
              <p className="text-xs text-primary-400 mt-1">
                🎯 Expected: Neelbad, Bhopal (~23.2°N, 77.4°E)
              </p>
              <p className="text-xs text-primary-400 mt-1">
                {location.name.toLowerCase().includes('bhopal') || location.region.toLowerCase().includes('bhopal') 
                  ? '✅ Bhopal area detected' 
                  : '⚠️ Not in Bhopal area'}
              </p>
            </div>
          )}
        </div>
        <div className="text-right">
          {getWeatherIcon(current.condition.text)}
          <p className="text-primary-200 text-sm mt-1">{current.condition.text}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-5xl font-bold text-white">{Math.round(current.temp_c)}°C</p>
          <p className="text-primary-200 text-sm">Feels like {Math.round(current.feelslike_c)}°C</p>
        </div>
        <div className="text-right">
          <p className="text-primary-200 text-sm flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {location.localtime}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <Droplets className="w-5 h-5 mx-auto mb-1 text-blue-300" />
          <p className="text-xs text-primary-200">Humidity</p>
          <p className="font-semibold text-white">{current.humidity}%</p>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <Wind className="w-5 h-5 mx-auto mb-1 text-green-300" />
          <p className="text-xs text-primary-200">Wind</p>
          <p className="font-semibold text-white">{current.wind_kph} km/h</p>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <Gauge className="w-5 h-5 mx-auto mb-1 text-yellow-300" />
          <p className="text-xs text-primary-200">Pressure</p>
          <p className="font-semibold text-white">{current.pressure_mb} mb</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <Eye className="w-5 h-5 mx-auto mb-1 text-purple-300" />
          <p className="text-xs text-primary-200">Visibility</p>
          <p className="font-semibold text-white">{current.vis_km} km</p>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <Sun className="w-5 h-5 mx-auto mb-1 text-orange-300" />
          <p className="text-xs text-primary-200">UV Index</p>
          <p className="font-semibold text-white">{current.uv}</p>
        </div>
      </div>

      {current.precip_mm > 0 && (
        <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4">
          <div className="flex items-center gap-2 text-blue-200">
            <CloudRain className="w-5 h-5" />
            <span className="font-semibold text-sm">Current Precipitation</span>
          </div>
          <p className="text-xs text-blue-100 mt-1">{current.precip_mm}mm rainfall detected</p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <p className="text-primary-300 text-xs">
          Last updated: {new Date(current.last_updated).toLocaleTimeString()}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => fetchLocationWeather()}
            className="text-primary-200 hover:text-white text-xs transition-colors"
          >
            Refresh
          </button>
          {(location.name.toLowerCase().includes('bhopal') || location.region.toLowerCase().includes('bhopal')) === false && (
            <button
              onClick={async () => {
                try {
                  console.log('🎯 Manual override: Setting Neelbad, Bhopal location');
                  const neelbadCoords = { lat: 23.2366, lon: 77.4345 }; // Neelbad, Bhopal coordinates
                  const weatherData = await wifiLocationService.getWeatherByCoordinates(neelbadCoords.lat, neelbadCoords.lon);
                  setWeatherData(weatherData);
                  setLocationInfo({
                    lat: neelbadCoords.lat,
                    lon: neelbadCoords.lon,
                    method: 'Manual Override'
                  });
                } catch (error) {
                  console.error('❌ Manual override failed:', error);
                  setError('Failed to set Neelbad, Bhopal location');
                }
              }}
              className="text-primary-200 hover:text-white text-xs transition-colors"
            >
              Set Neelbad
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrentLocationWeather;
