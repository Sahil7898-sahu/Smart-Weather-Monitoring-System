# 🌡️ ESP32 DHT11 Real-time Sensor Setup

## ✅ **Real-time Sensor Data Enabled**

Your Smart Weather Monitoring system is now configured to show **real-time data** from your ESP32 DHT11 sensors!

### **🔧 Configuration Updated:**
- ✅ **Real sensors enabled**: `VITE_ENABLE_REAL_SENSORS=true`
- ✅ **ESP32 endpoint**: `http://10.16.200.17/data`
- ✅ **Update interval**: Every 3 seconds
- ✅ **Enhanced dashboard**: Live data indicators

---

## 🎯 **What You'll See on Sensor Dashboard:**

### **🟢 When ESP32 is Connected:**
- **Live indicator**: Pulsing green dot
- **Status**: "ESP32 Connected" 
- **Data source**: "Real ESP32 Data"
- **Update frequency**: Every 3 seconds
- **Sensor ID**: Your actual DHT11 sensor ID
- **Temperature**: Real-time from DHT11
- **Humidity**: Real-time from DHT11

### **🟡 When ESP32 is Disconnected:**
- **Status**: "ESP32 Disconnected"
- **Data source**: "Simulation Mode"
- **Fallback data**: Simulated sensor values
- **Warning**: No real-time connection

---

## 🚀 **ESP32 DHT11 Setup Requirements:**

### **Hardware Needed:**
1. **ESP32 Development Board**
2. **DHT11 Temperature & Humidity Sensor**
3. **Jumper Wires**
4. **USB Cable for power**

### **Wiring Connections:**
```
DHT11    →    ESP32
VCC      →    3.3V
GND      →    GND
DATA     →    GPIO4 (or any digital pin)
```

### **ESP32 Code (Arduino IDE):**
```cpp
#include <WiFi.h>
#include <WebServer.h>
#include <DHT.h>

#define DHTPIN 4          // Digital pin connected to DHT11
#define DHTTYPE DHT11     // DHT 11

DHT dht(DHTPIN, DHTTYPE);
WebServer server(80);

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  
  // Setup web server endpoint
  server.on("/data", HTTP_GET, handleData);
  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  server.handleClient();
  delay(2000); // Wait 2 seconds between readings
}

void handleData() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  
  // Check if any reads failed
  if (isnan(temperature) || isnan(humidity)) {
    server.send(500, "application/json", "{\"error\":\"Failed to read from DHT sensor\"}");
    return;
  }
  
  // Create JSON response
  String json = "{";
  json += "\"temperature\":" + String(temperature, 1);
  json += ",\"humidity\":" + String(humidity, 1);
  json += ",\"pressure\":1013.25";
  json += ",\"sensorId\":\"DHT11_001\"";
  json += ",\"location\":\"Field A\"";
  json += ",\"timestamp\":\"" + String(millis()) + "\"";
  json += "}";
  
  server.send(200, "application/json", json);
  
  Serial.println("Data sent: " + json);
}
```

---

## 📱 **Sensor Dashboard Features:**

### **🔴 Real-time Indicators:**
- **Pulsing green dot**: Live connection active
- **"Live" badge**: Real-time data streaming
- **Timestamp**: Last update time
- **Update frequency**: Shows 3-second refresh

### **📊 Data Display:**
- **Temperature**: Large, color-coded display
- **Humidity**: Large, color-coded display
- **Sensor ID**: Shows actual DHT11 identifier
- **Location**: Field/location information
- **Connection status**: ESP32 connection state

### **🎨 Visual Feedback:**
- **Green**: Connected with real data
- **Yellow**: Connecting/initializing
- **Red**: Disconnected/using simulation

---

## 🔍 **Troubleshooting:**

### **❌ "ESP32 Disconnected" Status:**

#### **Check Network:**
1. **ESP32 IP**: Verify it's `10.16.200.17`
2. **WiFi connection**: ESP32 must be on same network
3. **Firewall**: No blocking of port 80

#### **Check Hardware:**
1. **DHT11 wiring**: Verify VCC, GND, DATA connections
2. **Power**: ESP32 getting proper power
3. **Sensor**: DHT11 not damaged

#### **Check Code:**
1. **WiFi credentials**: Correct SSID and password
2. **Server endpoint**: `/data` route configured
3. **JSON format**: Proper response structure

### **🧪 Test ESP32 Connection:**

#### **Browser Test:**
```
http://10.16.200.17/data
```

**Expected Response:**
```json
{
  "temperature": 28.5,
  "humidity": 65.2,
  "pressure": 1013.25,
  "sensorId": "DHT11_001",
  "location": "Field A",
  "timestamp": "123456"
}
```

#### **Console Debugging:**
Open browser console (F12) and look for:
```
🔄 Updating sensor data...
📊 Sensor data received: 5 readings
🌡️ Latest sensor reading: {temperature: 28.5, humidity: 65.2, ...}
✅ ESP32 DHT11 connected - Real data detected
```

---

## ⚙️ **Configuration Options:**

### **Update Frequency:**
```bash
# In .env file
VITE_SENSOR_UPDATE_INTERVAL=3000  # 3 seconds (default)
VITE_DATA_UPDATE_INTERVAL=3000    # 3 seconds (default)
```

### **ESP32 IP Address:**
```bash
# Update if your ESP32 has different IP
VITE_ESP32_IP_ADDRESS=10.16.200.17
VITE_ESP32_TEMP_ENDPOINT=http://10.16.200.17/data
VITE_ESP32_HUMID_ENDPOINT=http://10.16.200.17/data
```

---

## 🎯 **Expected Behavior:**

### **✅ Working Setup:**
1. **ESP32 boots** and connects to WiFi
2. **DHT11 reads** temperature/humidity every 2 seconds
3. **Web server** responds to `/data` requests
4. **Dashboard shows** live data with green indicators
5. **Values update** every 3 seconds automatically

### **🔄 Data Flow:**
```
DHT11 Sensor → ESP32 → WiFi → Web Server → Browser → Dashboard
     (2s)        (instant)    (3s refresh)     (live display)
```

---

## 🚀 **Ready to Use!**

Your sensor dashboard is now configured for **real-time ESP32 DHT11 data**! 

1. **Setup your ESP32** with the provided code
2. **Connect DHT11** sensor properly
3. **Configure WiFi** credentials
4. **Power on ESP32**
5. **Visit sensor dashboard** to see live data

The dashboard will automatically detect and display real-time sensor data when your ESP32 is connected and running! 🌡️
