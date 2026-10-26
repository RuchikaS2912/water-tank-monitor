# ESP32 Configuration Update

## Your Deployed Backend URL
```
https://water-tank-monitor-1rrn.onrender.com
```

## Update Your ESP32 Code

### 1. Open your ESP32 Arduino sketch
File: `water_tank_monitor.ino` (or similar)

### 2. Update the Server URL
Find the line that defines the server URL and change it to:

```cpp
// WiFi and Server Configuration
const char* ssid = "YOUR_WIFI_SSID";           // Keep your WiFi SSID
const char* password = "YOUR_WIFI_PASSWORD";   // Keep your WiFi password
const char* serverUrl = "https://water-tank-monitor-1rrn.onrender.com";  // NEW URL
```

### 3. WebSocket URL (if using WebSocket)
If you're using WebSocket connection, update to:

```cpp
const char* wsUrl = "wss://water-tank-monitor-1rrn.onrender.com";
```

### 4. API Endpoint Examples

Your ESP32 should POST data to these endpoints:

#### Post Water Level Reading
```cpp
// Endpoint: https://water-tank-monitor-1rrn.onrender.com/api/update
// Method: POST
// Body: {"water_level_cm": 150, "tilt_angle": 2.5}
```

#### Get Configuration
```cpp
// Endpoint: https://water-tank-monitor-1rrn.onrender.com/api/config
// Method: GET
// Returns: {"tank_height_cm": 200, "target_level_cm": 180, "flow_rate_cm_per_min": 5}
```

### 5. Upload to ESP32
1. Connect ESP32 to your computer via USB
2. Select the correct board and port in Arduino IDE
3. Click "Upload"
4. Open Serial Monitor (115200 baud) to verify connection

### 6. Verify Connection
After uploading, check Serial Monitor for:
- WiFi connection success
- Server connection success
- Data posting confirmation

## Test Your ESP32

### Test 1: Health Check
Your ESP32 can verify the server is online:
```cpp
GET https://water-tank-monitor-1rrn.onrender.com/health
```
Expected response:
```json
{"status":"ok","timestamp":"2026-10-26T..."}
```

### Test 2: Post Sample Data
```cpp
POST https://water-tank-monitor-1rrn.onrender.com/api/update
Content-Type: application/json

{
  "water_level_cm": 100,
  "tilt_angle": 1.5
}
```

## Common Issues

### Issue: ESP32 can't connect to server
**Solution:** Ensure WiFi is connected first. Check Serial Monitor for WiFi IP address.

### Issue: HTTPS certificate errors
**Solution:** Add this to your ESP32 code:
```cpp
#include <WiFiClientSecure.h>
WiFiClientSecure client;
client.setInsecure(); // For testing - bypass certificate validation
```

### Issue: Timeout errors
**Solution:** 
- Render free tier takes ~30 seconds to wake from sleep
- Add retry logic with 30-second timeout for first request
- Subsequent requests are instant

## Sample ESP32 Code Structure

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* serverUrl = "https://water-tank-monitor-1rrn.onrender.com";

void postWaterLevel(float waterLevel, float tiltAngle) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(serverUrl) + "/api/update");
    http.addHeader("Content-Type", "application/json");
    
    String payload = "{\"water_level_cm\":" + String(waterLevel) + 
                     ",\"tilt_angle\":" + String(tiltAngle) + "}";
    
    int httpResponseCode = http.POST(payload);
    
    if (httpResponseCode > 0) {
      Serial.println("Data sent successfully: " + String(httpResponseCode));
    } else {
      Serial.println("Error sending data: " + String(httpResponseCode));
    }
    
    http.end();
  }
}
```

## Next Steps
1. ✅ Update ESP32 code with new URL
2. ✅ Upload to ESP32
3. ✅ Verify Serial Monitor shows successful connections
4. ✅ Check backend receives data at https://water-tank-monitor-1rrn.onrender.com/api/water-level
