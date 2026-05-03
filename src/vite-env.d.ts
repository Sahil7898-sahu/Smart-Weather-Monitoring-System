/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEATHER_API_KEY: string
  readonly VITE_WEATHER_API_BASE_URL: string
  readonly VITE_ESP32_IP_ADDRESS: string
  readonly VITE_ESP32_PORT: string
  readonly VITE_ESP32_TEMP_ENDPOINT: string
  readonly VITE_ESP32_HUMID_ENDPOINT: string
  readonly VITE_SENSOR_UPDATE_INTERVAL: string
  readonly VITE_DATA_UPDATE_INTERVAL: string
  readonly VITE_ENABLE_REAL_SENSORS: string
  readonly VITE_DEBUG_MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
