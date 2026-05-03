export interface WifiLocationData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime: string;
  };
  current: {
    last_updated: string;
    temp_c: number;
    temp_f: number;
    is_day: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_mph: number;
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    pressure_in: number;
    precip_mm: number;
    precip_in: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    vis_km: number;
    vis_miles: number;
    uv: number;
    gust_mph: number;
    gust_kph: number;
  };
}

export class WifiLocationService {
  private static instance: WifiLocationService;
  private apiKey: string;
  private baseUrl: string;
  private cache: Map<string, { data: WifiLocationData; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  private constructor() {
    this.apiKey = (import.meta.env as any)?.VITE_WEATHER_API_KEY || '';
    this.baseUrl = 'https://api.weatherapi.com/v1';
  }

  static getInstance(): WifiLocationService {
    if (!WifiLocationService.instance) {
      WifiLocationService.instance = new WifiLocationService();
    }
    return WifiLocationService.instance;
  }

  /**
   * Get location using browser geolocation (WiFi/GPS/Network)
   */
  async getCurrentWifiLocation(): Promise<{ lat: number; lon: number; accuracy: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      console.log('📡 Starting location detection...');
      console.log('🔍 Checking browser location capabilities...');
      
      // Check browser location permissions first
      if ('permissions' in navigator) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          console.log('🔐 Location permission status:', result.state);
        });
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('📍 RAW GPS DATA RECEIVED:');
          console.log('   Latitude:', position.coords.latitude);
          console.log('   Longitude:', position.coords.longitude);
          console.log('   Accuracy:', position.coords.accuracy, 'meters');
          console.log('   Altitude:', position.coords.altitude);
          console.log('   Altitude Accuracy:', position.coords.altitudeAccuracy);
          console.log('   Heading:', position.coords.heading);
          console.log('   Speed:', position.coords.speed);
          console.log('   Timestamp:', new Date(position.timestamp).toISOString());

          // Determine location source
          let source = 'WiFi/Network';
          if (position.coords.accuracy < 50) {
            source = 'GPS';
          } else if (position.coords.accuracy < 200) {
            source = 'WiFi + GPS';
          }

          console.log('🎯 LOCATION ANALYSIS:');
          console.log('   Source:', source);
          console.log('   Accuracy:', `${position.coords.accuracy}m`);
          console.log('   Coordinates:', `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
          console.log('   Expected (Neelbad):', '23.2366°N, 77.4345°E');
          console.log('   Distance from expected:', this.calculateDistance(position.coords.latitude, position.coords.longitude, 23.2366, 77.4345).toFixed(2), 'km');

          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error('❌ WiFi location error:', error);
          let errorMessage = 'Unable to detect location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Check your WiFi/network connection.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location detection timed out. Please try again.';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true, // Enable high accuracy for better precision
          timeout: 20000, // 20 seconds timeout for better accuracy
          maximumAge: 0, // No cache - get fresh location
        }
      );
    });
  }

  /**
   * Get weather data for current WiFi-detected location
   */
  async getCurrentLocationWeather(): Promise<WifiLocationData> {
    try {
      const location = await this.getCurrentWifiLocation();
      return this.getWeatherByCoordinates(location.lat, location.lon);
    } catch (error) {
      console.error('❌ Failed to get WiFi location weather:', error);
      throw error;
    }
  }

  /**
   * Get weather by coordinates
   */
  async getWeatherByCoordinates(lat: number, lon: number): Promise<WifiLocationData> {
    const cacheKey = `${lat},${lon}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('📋 Using cached weather data');
      return cached.data;
    }

    try {
      console.log('🌤️ FETCHING WEATHER DATA:');
      console.log('   Input coordinates:', { lat, lon });
      console.log('   Expected location: Neelbad, Bhopal area');
      
      const url = `${this.baseUrl}/current.json?key=${this.apiKey}&q=${lat},${lon}&aqi=no`;
      console.log('🌐 API URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ WEATHER API RESPONSE:');
      console.log('   Location Name:', data.location.name);
      console.log('   Region:', data.location.region);
      console.log('   Country:', data.location.country);
      console.log('   API Coordinates:', `${data.location.lat}, ${data.location.lon}`);
      console.log('   Timezone:', data.location.tz_id);
      console.log('   Temperature:', data.current.temp_c, '°C');
      
      // Check if location matches expected Neelbad, Bhopal
      const isBhopalArea = data.location.name.toLowerCase().includes('bhopal') || 
                         data.location.region.toLowerCase().includes('bhopal');
      
      console.log('🎯 LOCATION ANALYSIS:');
      console.log('   Is Bhopal area?', isBhopalArea);
      console.log('   Detected name:', data.location.name);
      console.log('   Detected region:', data.location.region);
      console.log('   Expected: Neelbad, Bhopal');
      
      // Check if Shamgar is being returned
      const isShamgar = data.location.name.toLowerCase().includes('shamgar') || 
                       data.location.region.toLowerCase().includes('shamgar');
      
      if (isShamgar) {
        console.log('⚠️ SHAMGAR DETECTED - This is wrong location!');
        console.log('   Why Shamgar? Possible issues:');
        console.log('   1. IP-based location instead of GPS');
        console.log('   2. VPN/Proxy interference');
        console.log('   3. Browser using cached location');
        console.log('   4. WiFi network location database error');
      }
      
      // Calculate distance between input coordinates and API response
      const distance = this.calculateDistance(lat, lon, data.location.lat, data.location.lon);
      console.log('📏 Distance between input and API coordinates:', distance.toFixed(2), 'km');
      
      if (distance > 10) {
        console.log('⚠️ LARGE COORDINATE MISMATCH DETECTED!');
        console.log('   Input coords:', `${lat}, ${lon}`);
        console.log('   API coords:', `${data.location.lat}, ${data.location.lon}`);
        console.log('   Distance:', distance.toFixed(2), 'km');
      }
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('❌ Weather fetch error:', error);
      throw error;
    }
  }

  /**
   * Check if geolocation is supported
   */
  isLocationSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Get location detection method info
   */
  async getLocationInfo(): Promise<{
    supported: boolean;
    method: string;
    accuracy?: string;
  }> {
    if (!this.isLocationSupported()) {
      return { supported: false, method: 'Not supported' };
    }

    try {
      const position = await new Promise<any>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 0
        });
      });

      const accuracy = position.coords.accuracy;
      let method = 'WiFi/Network';
      let accuracyLevel = 'City level';
      
      if (accuracy < 50) {
        method = 'GPS';
        accuracyLevel = 'Building level';
      } else if (accuracy < 200) {
        accuracyLevel = 'Neighborhood level';
      } else if (accuracy < 1000) {
        accuracyLevel = 'City level';
      } else {
        accuracyLevel = 'Region level';
      }

      return {
        supported: true,
        method,
        accuracy: accuracyLevel
      };
    } catch (error) {
      return { supported: true, method: 'Error detecting' };
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Calculate distance between two coordinates in kilometers
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}
