# Water Tank Monitor

IoT water tank monitoring system with ESP32, ultrasonic sensor, and mobile app.

## Components
- **ESP32 Firmware**: Sensor code for Arduino IDE
- **Backend**: Node.js/Express server with WebSocket support
- **Mobile App**: React Native (Expo) app

## Quick Start

### Backend
```bash
cd backend
npm install
npm start
```

### Mobile App
```bash
cd mobile-app
npm install
npx expo start
```

## Documentation
- [Quick Start Guide](docs/QUICK_START.md)
- [Shopping List](docs/SHOPPING_LIST.md)
- [Amazon India Links](docs/AMAZON_INDIA_LINKS.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## Deployment
Backend deployed on Railway: Auto-deploys from main branch

## Hardware Requirements
- ESP32 development board
- HC-SR04 ultrasonic sensor
- Jumper wires
- USB power supply

Total cost: ~₹878 (~$10-15)

## License
MIT
