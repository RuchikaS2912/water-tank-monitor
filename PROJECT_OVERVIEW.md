# 💧 Water Tank Monitor - Project Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Water Tank (2nd Floor)                     │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    HC-SR04 Sensor                       │    │
│  │                    (Mounted at top)                     │    │
│  │                          ↓                               │    │
│  │                    Measures distance                     │    │
│  │                          ↓                               │    │
│  │  ═════════════════════════════════  ← Target Level      │    │
│  │  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  ← Water Surface  │    │
│  │                                                          │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
│             ┌──────────────┐                                    │
│             │   ESP32      │  ← WiFi enabled microcontroller    │
│             │   Board      │                                    │
│             └──────────────┘                                    │
│                     ↓ WiFi                                      │
└─────────────────────────────────────────────────────────────────┘
                      │
                      │ HTTP POST (every 2 seconds)
                      │ { "distance_cm": 25.3 }
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Server (Node.js)                       │
│                    Runs on: Computer / Raspberry Pi               │
│                                                                   │
│  ┌─────────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   REST API      │  │  WebSocket   │  │  SQLite Database │  │
│  │  Port 3000      │  │  Real-time   │  │  History Storage │  │
│  └─────────────────┘  └──────────────┘  └──────────────────┘  │
│                                                                   │
│  Logic:                                                          │
│  - Calculate water level = Tank Height - Distance                │
│  - Calculate time to fill = Remaining / Flow Rate               │
│  - Send notifications when < 2 minutes to full                  │
└─────────────────────────────────────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
    WebSocket                 REST API + Push
         │                         │
         ↓                         ↓
┌────────────────┐        ┌────────────────┐
│  Mobile App    │        │  Expo Push     │
│  (React Native)│◄───────┤  Notification  │
│                │        │  Service       │
│  Features:     │        └────────────────┘
│  • Live level  │
│  • Time to fill│
│  • Config UI   │
│  • Alerts      │
└────────────────┘
```

## Data Flow

### 1. Measurement (Every 2 seconds)
```
ESP32 → Ultrasonic Sensor → Get Distance → Apply Filter → Send to Server
```

### 2. Processing (Backend)
```
Receive Distance → Calculate Water Level → Calculate Time → Store in DB
                                    ↓
                              Broadcast via WebSocket
                                    ↓
                            Check notification thresholds
```

### 3. Display (Mobile App)
```
WebSocket Update → Update UI → Show Level/Time/Progress Bar
```

### 4. Notification (When < 2 min to full)
```
Backend → Expo Push Service → Mobile Device → Sound/Vibrate/Banner
```

## File Structure

```
water-tank-monitor/
├── backend/                    # Node.js server
│   ├── server.js              # Main server code
│   ├── package.json           # Dependencies
│   ├── .env                   # Configuration
│   └── water_tank.db          # SQLite database (created on first run)
│
├── mobile-app/                # React Native app
│   ├── App.js                 # Main app UI
│   ├── app.json               # Expo configuration
│   ├── package.json           # Dependencies
│   └── assets/                # Icons and images
│
├── esp32-firmware/            # Arduino code for ESP32
│   └── water_tank_monitor.ino # Sensor reading & WiFi code
│
├── docs/                      # Documentation
│   ├── QUICK_START.md        # 30-minute setup guide
│   └── SHOPPING_LIST.md      # Hardware buying guide
│
└── README.md                  # Main documentation
```

## Technology Stack

### Backend
- **Node.js** + **Express** - Web server
- **WebSocket (ws)** - Real-time bidirectional communication
- **SQLite3** - Lightweight database
- **Expo Server SDK** - Push notifications
- **CORS** - Cross-origin requests

### Mobile App
- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and build service
- **Expo Notifications** - Push notification handling

### Hardware
- **ESP32** - WiFi-enabled microcontroller
- **Arduino Framework** - Programming environment
- **HC-SR04** - Ultrasonic distance sensor

## Key Features

### ✅ Real-time Updates
- WebSocket connection for instant data
- No need to refresh manually
- Live connection status indicator

### ✅ Smart Notifications
- Predictive alerts (1-2 min before full)
- Push notifications to phone
- Customizable thresholds

### ✅ Easy Configuration
- No coding needed after setup
- In-app tank configuration
- Adjustable flow rate

### ✅ Reliable
- Auto-reconnect on network issues
- Moving average filter for sensor noise
- Offline data queuing

### ✅ Lightweight
- Minimal resource usage
- Works on Raspberry Pi
- Low bandwidth (< 1MB/day)

## Calculations

### Water Level Percentage
```
percentage = (water_level_cm / tank_height_cm) × 100
```

### Water Level in CM
```
water_level_cm = tank_height_cm - distance_from_sensor_cm
```

### Time to Fill (minutes)
```
remaining_cm = target_level_cm - current_level_cm
time_to_fill = remaining_cm / flow_rate_cm_per_min
```

### Example
- Tank height: 200 cm
- Sensor reads: 50 cm from water surface
- Current water level: 200 - 50 = 150 cm (75%)
- Target level: 180 cm
- Flow rate: 5 cm/min
- Remaining: 180 - 150 = 30 cm
- Time to fill: 30 / 5 = 6 minutes

## Performance

### ESP32
- Power consumption: ~160mA @ 5V (0.8W)
- WiFi range: ~50 meters indoors
- Measurement accuracy: ±0.3cm
- Update frequency: Every 2 seconds

### Backend
- CPU: < 5% on modern laptop
- RAM: ~50MB
- Disk: ~10MB (includes Node modules)
- Network: ~1KB per update

### Mobile App
- Bundle size: ~30MB
- Battery: Minimal (uses WebSocket, not polling)
- Data usage: < 1MB per day

## Scalability

### Single Tank
- Works out of the box
- Perfect for home use

### Multiple Tanks
- Add more ESP32 devices
- Each posts to same backend
- Modify app to show multiple tanks
- Database already supports multiple tanks

### Multiple Users
- Deploy backend to cloud
- Add authentication
- Each user gets their own tanks
- Push notifications per user

## Security Considerations

### Current (Local Network)
- No authentication (assumes trusted network)
- Sensor data not sensitive
- Runs on local WiFi only

### Production (If exposing to internet)
- Add API key authentication
- Use HTTPS/WSS instead of HTTP/WS
- Implement rate limiting
- Add user accounts
- Encrypt sensitive data

## Cost Analysis

### One-time Hardware Cost
- ESP32: $8
- HC-SR04 Sensor: $3
- Wires & Power: $5
- **Total: ~$16**

### Recurring Costs
- Electricity: ~$0.50/month (0.8W × 24h × 30 days)
- Internet: $0 (existing WiFi)
- Server: $0 (self-hosted) or $5/month (cloud)
- Mobile data: $0 (WiFi only)

### Alternative (Without This System)
- Manual checking: 10 min/day × 365 days = 60 hours/year
- Water overflow damage risk: Priceless

**ROI: Pays for itself in saved time within 1 week!**

## Future Enhancements

### Possible Additions
- [ ] Historical graphs (daily/weekly/monthly usage)
- [ ] Multiple tank support in UI
- [ ] Water consumption analytics
- [ ] Integration with home automation (Home Assistant, etc.)
- [ ] Voice assistant support (Alexa, Google Home)
- [ ] SMS alerts (in addition to push)
- [ ] Web dashboard (in addition to mobile app)
- [ ] Pump automation (auto-shutoff when full)
- [ ] Water quality monitoring (with additional sensors)
- [ ] Rain detection (outdoor tanks)

### Easy to Add
- Temperature sensor (DS18B20)
- Flow rate sensor (actual measurement vs estimate)
- Valve control (solenoid valve for auto-shutoff)
- LED indicator on tank itself

## Troubleshooting Decision Tree

```
Problem: No data in app
│
├─> Backend not running?
│   └─> Start: npm start
│
├─> ESP32 not connected to WiFi?
│   └─> Check Serial Monitor, verify credentials
│
├─> Wrong IP address in app?
│   └─> Update App.js with correct IP
│
└─> Phone and server on different networks?
    └─> Connect both to same WiFi
```

## Support & Maintenance

### Regular Maintenance
- Check battery/power weekly
- Clean sensor monthly (dust accumulation)
- Verify calibration monthly
- Update firmware when needed

### Monitoring
- Backend logs show all activity
- Serial Monitor shows ESP32 status
- App shows connection status

### Backup
- Database: `cp water_tank.db water_tank.db.backup`
- Config: Settings stored in database
- Code: Already on your computer

## License & Credits

- **License**: MIT (Free to use and modify)
- **Created**: 2026
- **Technologies**: Open source (Node.js, React Native, Arduino)

---

**Questions?** Check the docs folder or open an issue!
