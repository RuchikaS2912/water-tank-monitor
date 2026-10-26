# 📐 Visual Setup Guide

## System Overview (Bird's Eye View)

```
                    ╔═══════════════════════════════════════╗
                    ║        YOUR HOUSE - 2nd Floor          ║
                    ║                                       ║
                    ║   ┌─────────────────────────────┐   ║
                    ║   │  Water Tank (at ceiling)    │   ║
                    ║   │                             │   ║
                    ║   │  ┌───┐                      │   ║
                    ║   │  │ 📡 │ HC-SR04 (at top)    │   ║
                    ║   │  └───┘                      │   ║
                    ║   │    │                        │   ║
                    ║   │    │ wires                  │   ║
                    ║   │    ↓                        │   ║
                    ║   │  ┌─────┐                    │   ║
                    ║   │  │ESP32│                    │   ║
                    ║   │  └─────┘                    │   ║
                    ║   │    │ WiFi                   │   ║
                    ║   └────┼────────────────────────┘   ║
                    ║        │                            ║
                    ╚════════╪════════════════════════════╝
                             │
                         WiFi │ (192.168.1.x)
                             │
                    ╔════════╪════════════════════════════╗
                    ║    WiFi Router                      ║
                    ╚════════╪════════════════════════════╝
                             │
                 ┌───────────┼───────────┐
                 │                       │
         ╔═══════╪═══════╗      ╔═══════╪════════╗
         ║  💻 Computer   ║      ║  📱 Your Phone  ║
         ║                ║      ║                 ║
         ║  Running:      ║      ║  Running:       ║
         ║  • Backend     ║      ║  • Mobile App   ║
         ║  • Node.js     ║      ║  • Expo Go      ║
         ║  • Database    ║      ║  • Receives     ║
         ║  • WebSocket   ║      ║    Notifications║
         ╚════════════════╝      ╚═════════════════╝
```

---

## Hardware Wiring Diagram

### HC-SR04 to ESP32 Connection

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  HC-SR04 Ultrasonic Sensor                                      │
│  ┌────────────────────────────┐                                │
│  │                            │                                │
│  │    [🔊]        [🎤]         │  Front view (the "eyes")       │
│  │   Sender     Receiver       │                                │
│  └────────────────────────────┘                                │
│       │  │  │  │                                                │
│       │  │  │  │                                                │
│      VCC TRIG ECHO GND                                          │
│       │  │  │  │                                                │
│       │  │  │  └────────┐  Black wire                          │
│       │  │  └───────────┼─────┐  Green wire                    │
│       │  └──────────────┼─────┼──┐  Yellow wire                │
│       └─────────────────┼─────┼──┼──┐  Red wire                │
│                         │     │  │  │                           │
│                         │     │  │  │                           │
│                       ┌─▼─────▼──▼──▼────────────────┐         │
│                       │                               │         │
│                       │    ESP32 Development Board    │         │
│                       │                               │         │
│                       │  5V ●  (Power - Red wire)     │         │
│                       │  GND ●  (Ground - Black)      │         │
│                       │  GPIO 5 ●  (TRIG - Yellow)    │         │
│                       │  GPIO 18 ●  (ECHO - Green)    │         │
│                       │                               │         │
│                       │              ┌──────┐         │         │
│                       │              │ USB  │         │         │
│                       └──────────────┴──────┴─────────┘         │
│                                      │                          │
│                                      │ USB Cable                │
│                                      │                          │
│                                   ┌──▼───┐                      │
│                                   │ Power│ (Wall adapter        │
│                                   │Source│  or Power Bank)      │
│                                   └──────┘                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Detailed Pin Connections

```
HC-SR04        Wire Color    ESP32 Pin      Purpose
─────────      ──────────    ─────────      ───────
VCC            Red           5V             Power supply
TRIG           Yellow        GPIO 5         Trigger signal (output from ESP32)
ECHO           Green         GPIO 18        Echo signal (input to ESP32)
GND            Black         GND            Ground
```

---

## Tank Mounting Diagram

### Side View of Water Tank

```
        ║                         ║
        ║                         ║ ← Tank Top (Lid)
        ╠═════════════════════════╣
        ║                         ║
        ║    ╔═══╗                ║
        ║    ║ O ║ ← Sensor       ║ ← Mount sensor here (TOP of tank)
        ║    ╚═╤═╝                ║    Face DOWN toward water
        ║      │ wires            ║
        ║      └───────→ ESP32    ║
        ║      (outside tank)     ║
        ║                         ║
        ║  ← Distance (50cm) →    ║
        ║           ↓             ║
        ║═══════════════════════  ║ ← Target Level (180cm from bottom)
        ║                         ║
        ║~~~~~~~~~~~~~~~~~~~~~~~~~║ ← Current Water Surface (150cm)
        ║~~~~~~~~~~~~~~~~~~~~~~~~~║
        ║~~~~~~~~~~~~~~~~~~~~~~~~~║
        ║~~~~~~~~~~~~~~~~~~~~~~~~~║
        ║~~~~~~~~~~~~~~~~~~~~~~~~~║
        ║~~~~~~~~~~~~~~~~~~~~~~~~~║
        ║~~~~~~~~~~~~~~~~~~~~~~~~~║
        ╠═════════════════════════╣ ← Bottom of tank (0cm)
        ╚═════════════════════════╝

Calculation:
- Tank Height: 200cm (bottom to top)
- Sensor reads: 50cm (distance to water)
- Water Level: 200 - 50 = 150cm (75%)
- Target: 180cm
- Remaining: 180 - 150 = 30cm to go
```

### Top View of Tank

```
     ┌─────────────────────────────────┐
     │                                 │
     │                                 │
     │              ┌───┐              │ ← Sensor centered
     │              │ O │              │    for best reading
     │              └───┘              │
     │                ↓                │
     │            [  beam  ]           │ ← Ultrasonic beam
     │                ↓                │    (invisible)
     │                ↓                │
     │      ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈         │
     │      ≈ Water Surface ≈         │
     │      ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈         │
     │                                 │
     └─────────────────────────────────┘
```

---

## Mobile App UI Layout

```
┌─────────────────────────────────────┐
│  💧 Water Tank Monitor    🟢 Connected│  ← Header
├─────────────────────────────────────┤
│                                     │
│  Pull down to refresh ↻             │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Current Water Level           │ │
│  │                               │ │
│  │         75%                   │ │  ← Main card
│  │     150.0 cm / 200 cm         │ │
│  │                               │ │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░     │ │  ← Progress bar
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ⏱️ Time to Fill               │ │
│  │                               │ │
│  │         6m 0s                 │ │  ← Time remaining
│  │                               │ │
│  │ Target: 180 cm                │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 📊 Tank Info                  │ │
│  │                               │ │
│  │ Tank Height:      200 cm      │ │
│  │ Current Level:    150.0 cm    │ │  ← Info display
│  │ Flow Rate:        5 cm/min    │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🔔 Notifications              │ │
│  │ You'll be notified when tank  │ │
│  │ is 1-2 minutes from full      │ │
│  │ Push enabled ✓                │ │
│  └───────────────────────────────┘ │
│                                     │
│                        ┌──────┐    │
│                        │  ⚙️  │    │  ← Config button
│                        └──────┘    │
└─────────────────────────────────────┘
```

### Configuration Screen

```
┌─────────────────────────────────────┐
│  ⚙️ Tank Configuration               │  ← Header
├─────────────────────────────────────┤
│                                     │
│  Tank Height (cm)                   │
│  ┌───────────────────────────────┐ │
│  │ 200                           │ │  ← Input field
│  └───────────────────────────────┘ │
│                                     │
│  Target Level (cm)                  │
│  ┌───────────────────────────────┐ │
│  │ 180                           │ │
│  └───────────────────────────────┘ │
│                                     │
│  Flow Rate (cm/min)                 │
│  ┌───────────────────────────────┐ │
│  │ 5.0                           │ │
│  └───────────────────────────────┘ │
│  How fast water rises               │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Save Configuration          │ │  ← Save button
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Cancel                      │ │  ← Cancel button
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

---

## Data Flow Diagram

### Real-time Update Flow

```
Step 1: ESP32 Measures
┌────────────────┐
│     ESP32      │
│   every 2s:    │
│  measureDist() │
│       ↓        │
│   50.3 cm      │
└────────┬───────┘
         │
         │ HTTP POST
         │ {"distance_cm": 50.3}
         ↓
┌────────────────────────────────────┐
│       Backend Server (Node.js)      │
│                                    │
│  1. Receive distance               │
│  2. Load tank config from DB       │
│  3. Calculate:                     │
│     water_level = 200 - 50.3       │
│                 = 149.7 cm         │
│     percentage = 149.7/200 * 100   │
│                = 74.85%            │
│     time_to_fill = (180-149.7)/5   │
│                  = 6.06 min        │
│  4. Store in database              │
│  5. Check notification threshold   │
└────────┬───────────────────────────┘
         │
         │ WebSocket Broadcast
         │ {"type":"waterLevel",
         │  "data": {
         │    "percentage": "74.85",
         │    "water_level_cm": 149.7,
         │    "time_to_fill_minutes": "6.06"
         │  }}
         ↓
┌────────────────┐
│  Mobile App    │
│                │
│  1. Receive WS │
│  2. Update UI  │
│  3. Animate    │
│     progress   │
└────────────────┘
```

### Notification Flow

```
Water Level Increasing...

145cm ────────────────────────────────────
150cm ────────────────────────────────────
155cm ────────────────────────────────────
160cm ────────────────────────────────────
165cm ────────────────────────────────────
170cm ────────────────────────────────────
175cm ────────────────────────────────────
176cm ─────► Backend: time_to_fill = 0.8 min (< 1 min)
     └────► Send Push: "Tank almost full! 48 seconds"
     
178cm ─────► Backend: time_to_fill = 0.4 min (< 30 sec)
     └────► Send Push: "Tank filling now! 24 seconds"
     
180cm ─────► Target reached!
     └────► Send Push: "Tank full!"
```

---

## Network Diagram

```
                Internet (optional - not required)
                         │
                         │
                    ┌────▼────┐
                    │  Router │  192.168.1.1
                    │ (WiFi)  │
                    └────┬────┘
                         │
         ┌───────────────┼────────────────────┐
         │               │                    │
    ┌────▼─────┐   ┌────▼──────┐      ┌─────▼──────┐
    │  ESP32   │   │ Computer  │      │   Phone    │
    │          │   │           │      │            │
    │192.168.1.│   │192.168.1. │      │192.168.1.  │
    │   .123   │   │   .105    │      │   .199     │
    │          │   │           │      │            │
    │ Sends    │   │ Backend:  │      │ Mobile App │
    │ sensor   │───▶ Port 3000 │◀─────│            │
    │ data     │   │           │      │            │
    └──────────┘   │ WebSocket │      │ WebSocket  │
                   │ Server    │─────▶│ Client     │
                   └───────────┘      └────────────┘

Data paths:
• ESP32 → Backend: HTTP POST every 2 seconds
• Backend → Phone: WebSocket (real-time push)
• Phone → Backend: HTTP GET (config, manual refresh)
```

---

## Installation Sequence

### Physical Installation Steps

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  Step 1: Prepare Hardware                       │
│  ┌────────────────────────────────────────────┐ │
│  │ 1. Unbox ESP32                             │ │
│  │ 2. Unbox HC-SR04 sensor                    │ │
│  │ 3. Get 4 jumper wires ready                │ │
│  │ 4. Get USB cable                           │ │
│  └────────────────────────────────────────────┘ │
│                     ↓                            │
│  Step 2: Wire Sensor                            │
│  ┌────────────────────────────────────────────┐ │
│  │ Connect 4 wires:                           │ │
│  │ • VCC (red) → 5V                           │ │
│  │ • GND (black) → GND                        │ │
│  │ • TRIG (yellow) → GPIO 5                   │ │
│  │ • ECHO (green) → GPIO 18                   │ │
│  └────────────────────────────────────────────┘ │
│                     ↓                            │
│  Step 3: Test on Desk                           │
│  ┌────────────────────────────────────────────┐ │
│  │ • Connect ESP32 to computer via USB        │ │
│  │ • Upload firmware                          │ │
│  │ • Open Serial Monitor                      │ │
│  │ • Wave hand above sensor                   │ │
│  │ • Should see changing distances            │ │
│  └────────────────────────────────────────────┘ │
│                     ↓                            │
│  Step 4: Mount on Tank                          │
│  ┌────────────────────────────────────────────┐ │
│  │ • Place sensor at TOP of tank              │ │
│  │ • Secure with zip ties/tape                │ │
│  │ • Position ESP32 outside tank              │ │
│  │ • Connect power (wall/battery)             │ │
│  └────────────────────────────────────────────┘ │
│                     ↓                            │
│  Step 5: Verify                                 │
│  ┌────────────────────────────────────────────┐ │
│  │ • Check Serial Monitor for readings        │ │
│  │ • Should show current water level          │ │
│  │ • Backend should receive data              │ │
│  │ • Mobile app should update                 │ │
│  └────────────────────────────────────────────┘ │
│                     ✅                           │
│                  DONE!                          │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## Before and After

### Before This System

```
You: "I need to check if water tank is full"
        ↓
Walk to stairs
        ↓
Climb to 2nd floor
        ↓
Open tank access
        ↓
Look inside
        ↓
"Not full yet"
        ↓
Repeat every 15 minutes
        ↓
Eventually: "Oh no! It overflowed!"
```

### After This System

```
*Glance at phone*
"Tank at 75%, 6 minutes to go"
        ↓
*Continue what you're doing*
        ↓
*Notification arrives*
"Tank almost full! 1 minute remaining"
        ↓
Walk over and turn off tap
        ↓
Tank perfectly full, no overflow!
```

---

## Quick Reference Card

Print this and stick it on your desk:

```
╔══════════════════════════════════════════════════╗
║     WATER TANK MONITOR - QUICK REFERENCE        ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  Start Backend:                                  ║
║  $ cd ~/Work/water-tank-monitor/backend         ║
║  $ npm start                                     ║
║                                                  ║
║  Start Mobile App:                               ║
║  $ cd ~/Work/water-tank-monitor/mobile-app      ║
║  $ npm start                                     ║
║  (Scan QR with Expo Go app)                      ║
║                                                  ║
║  Check ESP32:                                    ║
║  • Arduino IDE → Serial Monitor (115200 baud)    ║
║  • Should show distance readings                 ║
║                                                  ║
║  Your IP Address: ________________               ║
║  (Find with: ifconfig | grep inet)               ║
║                                                  ║
║  Configuration:                                  ║
║  • Tank Height: _____ cm                        ║
║  • Target Level: _____ cm                       ║
║  • Flow Rate: _____ cm/min                      ║
║                                                  ║
║  Troubleshooting:                                ║
║  • App disconnected? Check IP address           ║
║  • ESP32 not working? Check Serial Monitor      ║
║  • Wrong readings? Recalibrate tank height      ║
║                                                  ║
║  Docs:                                           ║
║  ~/Work/water-tank-monitor/SUMMARY.md           ║
║  ~/Work/water-tank-monitor/docs/QUICK_START.md  ║
║                                                  ║
╚══════════════════════════════════════════════════╝
```

---

## Component Photos (What to Look For)

### ESP32 Board
```
  USB Port
     │
     ▼
┌─────────┐
│ ┌─────┐ │  ← Antenna (WiFi)
│ │     │ │
│ │ ESP │ │  ← Main chip (shiny metal case)
│ │ 32  │ │
│ └─────┘ │
│  ● ● ● ●│  ← GPIO pins (2 rows)
│  ● ● ● ●│
│  ● ● ● ●│
└─────────┘

Look for:
• "ESP32" written on chip or board
• USB port (Micro-USB or USB-C)
• Lots of pins (30-40 pins total)
• About size of credit card
```

### HC-SR04 Sensor
```
Front view:
┌─────────────────┐
│  ╭───╮   ╭───╮  │  ← Two silver cylinders (transmitter & receiver)
│  │ O │   │ O │  │     Look like small speakers
│  ╰───╯   ╰───╯  │
│                 │
│    HC-SR04      │  ← Usually has name printed
└─────────────────┘
      │ │ │ │
     VCC T E GND      ← 4 pins
```

---

This visual guide should help you understand exactly how everything connects and works!
