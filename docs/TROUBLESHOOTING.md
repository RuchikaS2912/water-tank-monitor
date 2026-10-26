# 🔧 Troubleshooting Guide

## Quick Diagnostics

### Is Everything Connected?

Run this checklist in order:

```
1. Backend Server Running?
   ├─ Terminal shows "Server running on port 3000" → ✅
   └─ Terminal shows error or not running → ❌ Start with: npm start

2. ESP32 Connected to WiFi?
   ├─ Serial Monitor shows "WiFi Connected!" → ✅
   └─ Shows "WiFi Connection Failed" → ❌ Check WiFi credentials

3. ESP32 Sending Data?
   ├─ Serial Monitor shows "✓ Sent to server (HTTP 200)" → ✅
   └─ Shows "HTTP Error" → ❌ Check SERVER_URL

4. Mobile App Connected?
   ├─ Green dot at top shows "Connected" → ✅
   └─ Red dot shows "Disconnected" → ❌ Check API_URL in App.js
```

---

## Common Problems & Solutions

### 🔴 Problem: App shows "Disconnected"

**Symptoms:**
- Red dot at top of app
- No water level data
- Can't reach server

**Causes & Fixes:**

1. **Wrong IP address in app**
   ```bash
   # Find your computer's IP
   # Mac/Linux:
   ifconfig | grep "inet "
   
   # Windows:
   ipconfig
   ```
   Then update `mobile-app/App.js` line 18 with correct IP

2. **Phone and computer on different WiFi networks**
   - Check phone WiFi settings
   - Connect to same network as computer
   - Guest networks might be isolated

3. **Backend not running**
   ```bash
   cd ~/Work/water-tank-monitor/backend
   npm start
   ```

4. **Firewall blocking port 3000**
   - Mac: System Preferences → Security & Privacy → Firewall → Allow Node
   - Windows: Windows Defender → Allow an app → Node.js

5. **Backend crashed**
   - Check terminal for errors
   - Restart: Ctrl+C, then npm start

---

### 🔴 Problem: ESP32 Can't Connect to WiFi

**Symptoms:**
- Serial Monitor shows "WiFi Connection Failed"
- Repeated dots (......) forever
- No IP address displayed

**Causes & Fixes:**

1. **Wrong WiFi credentials**
   - Check spelling (case sensitive!)
   - Special characters in password might need escaping
   - Try shorter/simpler password temporarily

2. **5GHz WiFi network**
   - ESP32 only supports 2.4GHz
   - Check router settings or use 2.4GHz SSID
   - Most routers broadcast both

3. **Too far from router**
   - Move ESP32 closer temporarily
   - Check signal strength: WiFi.RSSI() in code
   - Use WiFi extender if needed

4. **Router security settings**
   - ESP32 supports WPA/WPA2
   - Doesn't support enterprise WiFi
   - Try guest network

5. **Too many devices on network**
   - Router might be limiting connections
   - Restart router
   - Check DHCP pool size

**Debug Code to Add:**
```cpp
// Add this after WiFi.begin() for more details
WiFi.onEvent([](WiFiEvent_t event) {
  Serial.printf("WiFi Event: %d\n", event);
});
```

---

### 🔴 Problem: ESP32 HTTP Errors

**Symptoms:**
- Serial Monitor shows "✓ WiFi Connected" but "✗ HTTP Error"
- HTTP code -1, -11, or other negative numbers

**Causes & Fixes:**

1. **Wrong SERVER_URL**
   - Should be: `http://YOUR_IP:3000/api/sensor-data`
   - NOT: `localhost` (won't work from ESP32)
   - NOT: `https://` (backend uses http)
   - Must include port `:3000`

2. **Backend not running**
   ```bash
   # Test from browser first
   http://YOUR_IP:3000/health
   # Should return: {"status":"ok"}
   ```

3. **Computer firewall blocking**
   - Temporarily disable firewall to test
   - Add exception for Node.js/port 3000

4. **Computer sleeping**
   - Disable sleep mode
   - Or use Raspberry Pi for backend

**Test with curl:**
```bash
# From another computer on same network
curl -X POST http://YOUR_IP:3000/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{"distance_cm": 123.4}'
```

---

### 🔴 Problem: Wrong Water Level Readings

**Symptoms:**
- Water level shows 0% when tank is full
- Shows 100% when tank is empty
- Jumps around randomly
- Negative values

**Causes & Fixes:**

1. **Tank height not configured correctly**
   - Tap ⚙️ in app
   - Measure tank from BOTTOM to TOP
   - Enter in centimeters
   - Example: 6 feet = 183 cm

2. **Sensor mounted incorrectly**
   - Must be at TOP of tank
   - Must face DOWN
   - Should be within 5cm of rim
   - Needs clear line of sight to water

3. **Sensor reading wrong**
   - Check Serial Monitor for raw readings
   - Wave hand above sensor - should change
   - Distance should be 2-400cm range
   - Less than 2cm: sensor too close

4. **Calculation backwards**
   Backend calculates: `water_level = tank_height - distance`
   - Distance ↑ → Water Level ↓ (correct)
   - If backwards, sensor might be at bottom (wrong!)

5. **Noise and interference**
   - Already has moving average filter
   - Increase NUM_READINGS in .ino if still noisy
   - Check for electrical interference
   - Keep away from motors/pumps

**Calibration Test:**
```
1. Empty tank → Note sensor reading → Should be ~tank_height
2. Half full → Note sensor reading → Should be ~tank_height/2
3. Full tank → Note sensor reading → Should be ~5-10cm
```

---

### 🔴 Problem: No Notifications

**Symptoms:**
- Water level updates work
- Time countdown works
- But no push notifications received

**Causes & Fixes:**

1. **Permissions not granted**
   - iOS: Settings → Water Tank Monitor → Notifications → Allow
   - Android: Settings → Apps → Water Tank Monitor → Notifications → On
   - App will ask on first launch

2. **Running in simulator**
   - Push notifications ONLY work on real device
   - Use Expo Go on physical phone
   - Or build standalone app

3. **Push token not registered**
   - Check app under "Notifications" section
   - Should show "Push enabled ✓"
   - If not, restart app to trigger registration

4. **Expo notification service issue**
   - Check backend logs for push errors
   - Verify Expo SDK version matches
   - Test with: `npx expo push:test`

5. **Threshold not reached**
   - Notifications sent at < 2 minutes to full
   - For testing, temporarily set target_level_cm close to current level
   - Or edit backend threshold in server.js line 168

**Test Notification Manually:**
Add this to backend for testing:
```javascript
// In server.js, add this route:
app.get('/test-notification', (req, res) => {
  sendPushNotification('Test', 'This is a test notification');
  res.json({ sent: true });
});
```

---

### 🔴 Problem: App Won't Load on Phone

**Symptoms:**
- QR code scanned
- Shows "Opening project..."
- Then error or nothing happens

**Causes & Fixes:**

1. **Phone and computer on different networks**
   - Must be same WiFi
   - Check both devices
   - Disable VPN

2. **Metro bundler not running**
   ```bash
   # Should see "Metro waiting on exp://..."
   npm start
   ```

3. **Port 8081 blocked**
   - Firewall might be blocking Metro
   - Try: `npm start -- --port 19000`
   - Update firewall rules

4. **Cache issues**
   ```bash
   npm start -- --clear
   ```

5. **Expo Go app outdated**
   - Update Expo Go from app store
   - Should match SDK version in package.json

---

### 🔴 Problem: Sensor Readings Inconsistent

**Symptoms:**
- Jumps between values
- Sometimes shows max distance (400cm)
- Intermittent failures

**Causes & Fixes:**

1. **Loose wiring**
   - Check all 4 connections
   - Push wires firmly into breadboard/pins
   - Consider soldering for permanent install

2. **Power issues**
   - HC-SR04 needs stable 5V
   - USB cable might be bad (try different one)
   - Power bank low on charge

3. **Sensor defective**
   - HC-SR04 is cheap, might be faulty
   - Test with hand wave (should be consistent)
   - Order backup sensor

4. **Electrical noise**
   - Nearby pump or motor causing interference
   - Add capacitor across VCC/GND (100µF)
   - Use shielded cable

5. **Water surface issues**
   - Turbulent water reflects poorly
   - Wait for water to settle
   - Angle sensor slightly if needed

---

### 🔴 Problem: Time to Fill is Wrong

**Symptoms:**
- Says 30 minutes but tank fills in 10
- Or opposite - way over-estimates

**Causes & Fixes:**

1. **Flow rate not calibrated**
   - Default is 5 cm/min (just a guess)
   - MUST measure your actual flow rate
   - See README for measurement process

2. **Variable flow rate**
   - Water pressure changes over time
   - Flow rate faster when empty, slower when full
   - Use average flow rate for best estimate

3. **Multiple water sources**
   - If you have multiple taps filling
   - Measure with all sources ON
   - Adjust when changing setup

**Accurate Flow Rate Measurement:**
```
1. Start with tank partially full (easier to time)
2. Turn on water
3. Note starting level from app (e.g. 100cm)
4. Set timer for 10 minutes
5. Note ending level (e.g. 150cm)
6. Calculate: (150-100)/10 = 5 cm/min
7. Enter 5.0 in app config
```

---

### 🔴 Problem: Backend Crashes

**Symptoms:**
- Terminal shows error and exits
- Server stops responding
- "Cannot read property of undefined" errors

**Causes & Fixes:**

1. **Database corruption**
   ```bash
   # Backup and recreate
   mv water_tank.db water_tank.db.backup
   # Restart server - will create new DB
   npm start
   ```

2. **Missing dependencies**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Port already in use**
   ```bash
   # Find process using port 3000
   lsof -i :3000
   # Kill it
   kill -9 [PID]
   # Or change port in .env
   ```

4. **Out of memory**
   - Restart computer
   - Close other apps
   - Use Raspberry Pi (more stable)

---

### 🔴 Problem: Can't Upload to ESP32

**Symptoms:**
- Arduino IDE shows "Upload failed"
- "Port not available" error
- "espcomm_sync failed"

**Causes & Fixes:**

1. **Wrong board selected**
   - Tools → Board → ESP32 Dev Module
   - NOT "Arduino Uno" or other boards

2. **Wrong port**
   - Tools → Port → Should show ESP32
   - Mac: Usually `/dev/cu.usbserial-*`
   - Windows: Usually `COM3` or higher
   - Unplug/replug to see which appears

3. **USB cable is power-only**
   - Some cables only charge, no data
   - Try different cable
   - Must be data cable

4. **Driver not installed**
   - Google "CH340 driver" for your OS
   - Install and restart computer
   - Replug ESP32

5. **Hold BOOT button**
   - Hold BOOT button on ESP32
   - Click Upload
   - Keep holding until "Connecting..." appears
   - Release button

6. **Serial Monitor open**
   - Close Serial Monitor before uploading
   - Only open after upload complete

---

## Advanced Diagnostics

### Check Backend Health
```bash
# API health
curl http://localhost:3000/health

# Current water level
curl http://localhost:3000/api/water-level

# Tank config
curl http://localhost:3000/api/config

# Test sensor data post
curl -X POST http://localhost:3000/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{"distance_cm": 50.5}'
```

### Check Database
```bash
cd backend
sqlite3 water_tank.db

# List tables
.tables

# See latest readings
SELECT * FROM water_levels ORDER BY timestamp DESC LIMIT 10;

# See config
SELECT * FROM tank_config;

# Exit
.quit
```

### ESP32 Serial Monitor Commands
Add these to debug:
```cpp
// In loop(), add keyboard serial input:
if (Serial.available()) {
  char c = Serial.read();
  if (c == 't') {
    // Test measurement
    Serial.println("Testing sensor...");
    float d = measureDistance();
    Serial.printf("Distance: %.1f cm\n", d);
  }
  if (c == 'w') {
    // WiFi status
    Serial.printf("WiFi: %s\n", WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected");
    Serial.printf("IP: %s\n", WiFi.localIP().toString().c_str());
    Serial.printf("RSSI: %d dBm\n", WiFi.RSSI());
  }
}
```

---

## Still Stuck?

### Systematic Debug Process

1. **Test Each Component Separately**
   - Backend: Start server, test with curl
   - ESP32: View Serial Monitor, check WiFi and sensor
   - Mobile: Test with mock data (temporarily hardcode values)

2. **Check Logs**
   - Backend: Terminal output
   - ESP32: Serial Monitor (115200 baud)
   - Mobile: Expo console and device logs

3. **Simplify**
   - Remove moving average filter temporarily
   - Increase update interval (10s instead of 2s)
   - Disable notifications
   - Hard-code values to isolate issue

4. **Replace Components**
   - Try different ESP32
   - Try different HC-SR04 sensor
   - Try different USB cable
   - Try different WiFi network

### Getting Help

If you're still stuck, gather this info:

**System Info:**
- [ ] Computer OS and version
- [ ] Node.js version (`node --version`)
- [ ] ESP32 board type
- [ ] Router brand/model
- [ ] Phone OS and version

**What Works:**
- [ ] Backend can start: Yes/No
- [ ] ESP32 connects to WiFi: Yes/No
- [ ] ESP32 sends HTTP: Yes/No
- [ ] App connects to backend: Yes/No
- [ ] Sensor reads distance: Yes/No

**Error Messages:**
- Backend terminal: [copy/paste]
- ESP32 Serial Monitor: [copy/paste]
- Mobile app: [screenshot]

**Your Setup:**
- Tank height: ___ cm
- Sensor placement: [description]
- Current water level: ___ cm (manual measurement)
- Sensor reading: ___ cm (from Serial Monitor)

---

## Prevention Tips

### Maintain Reliability

**Weekly:**
- [ ] Check power cable connected
- [ ] Verify app still works
- [ ] Look at backend logs for errors

**Monthly:**
- [ ] Clean sensor (dust with soft cloth)
- [ ] Check WiFi signal strength
- [ ] Verify flow rate calibration
- [ ] Test notification (temporarily adjust threshold)

**After Power Outage:**
- [ ] ESP32 should auto-reconnect
- [ ] Backend needs manual restart
- [ ] Consider UPS or battery backup

**Before Leaving on Vacation:**
- [ ] Test everything end-to-end
- [ ] Set up backend on Raspberry Pi (more reliable than laptop)
- [ ] Ensure power source is stable
- [ ] Give neighbor access to shut off water if alert fails

---

## Emergency: Water Overflowing!

1. **Shut off water** (primary action!)
2. Debug later
3. Check why notification didn't work:
   - Was phone on silent?
   - Was app running?
   - Did ESP32 lose power?
   - Check backend logs for notification attempts

**Fail-safe Ideas:**
- Physical overflow pipe (hardware solution, most reliable)
- Second notification method (SMS service)
- Automatic valve shutoff (solenoid valve + relay)
- Loud buzzer on ESP32 itself
- Set target level 10-20cm below actual rim

---

**Remember:** This is a monitoring system, not a safety system. Always have physical overflow protection!
