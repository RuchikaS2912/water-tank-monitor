# 🚀 Quick Start Guide

## Complete Setup in 30 Minutes

### Prerequisites
- [ ] Hardware purchased (ESP32 + HC-SR04 sensor)
- [ ] Node.js installed on computer
- [ ] Arduino IDE installed
- [ ] Smartphone (iOS or Android)

---

## Part 1: Test the Backend (5 minutes)

1. **Open terminal and navigate to project:**
   ```bash
   cd ~/Work/water-tank-monitor/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Verify it's running:**
   You should see:
   ```
   ✓ Database connected
   ✓ Server running on port 3000
   📡 WebSocket server running
   🚀 Water Tank Monitor Backend Ready
   ```

5. **Find your computer's IP address:**
   - **Mac/Linux:** Open another terminal and run `ifconfig | grep "inet "`
   - **Windows:** Run `ipconfig` and look for IPv4 Address
   - Example: `192.168.1.105`
   - **Write this down - you'll need it!**

6. **Test the API:**
   Open browser and go to: `http://localhost:3000/health`
   Should show: `{"status":"ok","timestamp":"..."}`

✅ **Backend is ready!**

---

## Part 2: Setup ESP32 Hardware (10 minutes)

### Connect the Sensor

```
HC-SR04 → ESP32
VCC     → 5V
GND     → GND
TRIG    → GPIO 5
ECHO    → GPIO 18
```

### Upload Firmware

1. **Open Arduino IDE**

2. **Add ESP32 Board Support:**
   - File → Preferences
   - In "Additional Board Manager URLs", add:
     ```
     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
     ```
   - Tools → Board → Boards Manager
   - Search "esp32" and install it

3. **Open the firmware:**
   - File → Open
   - Navigate to `esp32-firmware/water_tank_monitor.ino`

4. **Update WiFi credentials:**
   Change these lines (around line 19-20):
   ```cpp
   const char* WIFI_SSID = "YourWiFiName";
   const char* WIFI_PASSWORD = "YourWiFiPassword";
   const char* SERVER_URL = "http://192.168.1.105:3000/api/sensor-data";
   ```
   Replace `192.168.1.105` with YOUR computer's IP from Part 1!

5. **Configure Arduino IDE:**
   - Tools → Board → ESP32 Dev Module
   - Tools → Port → Select your ESP32 (usually `/dev/cu.usbserial-*` on Mac)
   - Tools → Upload Speed → 115200

6. **Upload:**
   - Click the Upload button (→)
   - Wait for "Done uploading"

7. **Open Serial Monitor:**
   - Tools → Serial Monitor
   - Set baud rate to 115200
   - You should see:
     ```
     === Water Tank Monitor ESP32 ===
     Connecting to WiFi...
     ✓ WiFi Connected!
     IP Address: 192.168.1.123
     Raw: 25.3 cm | Filtered: 25.1 cm
     ✓ Sent to server (HTTP 200)
     ```

✅ **ESP32 is sending data!**

---

## Part 3: Mobile App Setup (15 minutes)

1. **Navigate to mobile app:**
   ```bash
   cd ~/Work/water-tank-monitor/mobile-app
   ```

2. **Install Expo Go on your phone:**
   - iOS: App Store → Search "Expo Go"
   - Android: Play Store → Search "Expo Go"

3. **Update the API URL:**
   Open `App.js` in a text editor and change line 18:
   ```javascript
   const API_URL = 'http://192.168.1.105:3000';
   ```
   Use YOUR computer's IP address!

4. **Start the dev server:**
   ```bash
   npm start
   ```

5. **Scan QR code:**
   - A QR code will appear in terminal
   - Open Expo Go app on phone
   - Tap "Scan QR Code"
   - Point camera at QR code
   - App will load on your phone!

6. **Configure tank in app:**
   - Tap the ⚙️ icon (bottom right)
   - Enter your tank specs:
     - **Tank Height**: Your tank's height in cm (e.g., 200)
     - **Target Level**: How full you want it (e.g., 180 - leaves 20cm buffer)
     - **Flow Rate**: Start with 5, adjust later
   - Tap "Save Configuration"

✅ **You should see live water level updates!**

---

## Part 4: Calibration (5 minutes)

### Measure Your Tank Height

1. **Measure from bottom to top of tank** (in cm)
2. **Enter this in app** (⚙️ → Tank Height)

### Measure Flow Rate

1. **Start filling your tank**
2. **Note current water level** (from app)
3. **Wait 5 minutes**
4. **Note new water level**
5. **Calculate:** `(New Level - Old Level) / 5 = cm per minute`
6. **Enter in app** (⚙️ → Flow Rate)

Example:
- Start: 50cm
- After 5 min: 75cm
- Flow rate: (75-50)/5 = 5 cm/min

### Test Notifications

1. Make sure you allowed notification permissions
2. Set target level close to current level (temporarily)
3. When water crosses that level, you should get notification
4. Set it back to normal after testing

---

## Verification Checklist

- [ ] Backend server shows "✓ Server running"
- [ ] ESP32 Serial Monitor shows distance readings
- [ ] ESP32 Serial Monitor shows "✓ Sent to server"
- [ ] Mobile app shows "Connected" (green dot)
- [ ] Mobile app displays water level percentage
- [ ] Time to fill is calculated
- [ ] Notifications are enabled

---

## Common Issues & Fixes

### ❌ App shows "Disconnected"
**Fix:** Make sure phone and computer are on the **same WiFi network**

### ❌ ESP32 can't connect to WiFi
**Fix:** 
- Double-check WiFi name and password (case sensitive!)
- Some ESP32 don't work with 5GHz WiFi - use 2.4GHz

### ❌ ESP32 HTTP errors
**Fix:**
- Verify SERVER_URL has correct IP
- Check backend is running (don't close the terminal!)
- Try `ping 192.168.1.105` from another computer to verify server is reachable

### ❌ Wrong water level readings
**Fix:**
- Check sensor is at TOP of tank, facing DOWN
- Verify tank height is correct in app config
- Test sensor by moving hand above it - reading should change

### ❌ App won't load on phone
**Fix:**
- Make sure phone and computer on same WiFi
- Try running `npm start` again
- Check if firewall is blocking port 8081

### ❌ Notifications not working
**Fix:**
- Only works on real phone, not simulator
- Grant notification permissions when asked
- Check under app settings if notifications are allowed

---

## Production Deployment

### Keep Backend Running 24/7

**Option 1: Keep computer on**
- Good for testing
- Computer must stay on

**Option 2: Use Raspberry Pi**
- Copy backend folder to Raspberry Pi
- Install Node.js on Pi
- Run `npm start`
- Much more reliable!

**Option 3: Cloud server**
- Deploy to Heroku, AWS, or DigitalOcean
- Need to expose public URL
- Update ESP32 and mobile app with new URL

### Build Standalone Mobile App

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for Android
cd mobile-app
eas build -p android

# Build for iOS (requires Apple Developer account)
eas build -p ios
```

---

## What's Next?

1. **Monitor for a few days** - Make sure everything is stable
2. **Adjust flow rate** - Fine-tune based on actual filling time
3. **Permanent mounting** - Secure sensor and ESP32 properly
4. **Power solution** - Use power bank or wall adapter
5. **Weatherproofing** - Protect ESP32 if outdoor installation

---

## Support

If something doesn't work:
1. Check Serial Monitor for ESP32 errors
2. Check backend terminal for server errors
3. Verify all IP addresses match
4. Make sure all devices on same WiFi network

**Happy Monitoring! 💧**
