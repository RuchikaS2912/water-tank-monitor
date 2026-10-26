# 🛒 Shopping List

## Hardware Components

### Essential Components

| Item | Quantity | Approx. Price | Where to Buy | Notes |
|------|----------|---------------|--------------|-------|
| ESP32 Dev Board | 1 | $6-10 | Amazon, AliExpress | Any ESP32 works |
| HC-SR04 Ultrasonic Sensor | 1 | $2-5 | Amazon, AliExpress | Get the waterproof version if available |
| Jumper Wires (Male-Female) | 4-5 | $2-3 | Amazon | Or use regular wires |
| USB Cable | 1 | $3-5 | Amazon | Micro-USB or USB-C (depends on ESP32) |
| 5V Power Adapter | 1 | $5-8 | Amazon | Can also use USB power bank |

**Total Cost: ~$20-30**

### Optional but Recommended

| Item | Price | Purpose |
|------|-------|---------|
| Waterproof Box | $5-10 | Protect ESP32 from moisture |
| Extension Cable for Sensor | $3-5 | If tank is far from power outlet |
| Raspberry Pi (if you have one) | - | Run backend server 24/7 |

## Where to Buy

### Online Stores
- **Amazon** - Fast shipping, good prices
- **AliExpress** - Cheapest, but takes 2-4 weeks
- **Adafruit** - Quality components, great docs
- **SparkFun** - Similar to Adafruit
- **Local electronics store** - Instant, but more expensive

### Recommended Amazon Search Terms
- "ESP32 development board"
- "HC-SR04 ultrasonic sensor"
- "ESP32 starter kit" (includes wires and components)

## What to Look For

### ESP32 Board
✅ **Good:**
- NodeMCU-32S
- ESP32 DevKit V1
- ESP32-WROOM-32
- Any board with "ESP32" in the name

❌ **Avoid:**
- ESP8266 (older, less powerful)
- Generic "Arduino" without ESP32

### HC-SR04 Sensor
✅ **Good:**
- Standard HC-SR04
- JSN-SR04T (waterproof version - better!)
- US-100

❌ **Avoid:**
- Generic distance sensors without specs

## Wiring Diagram

```
                          ESP32
                      +-----------+
                      |           |
    HC-SR04           |   GPIO5   |  TRIG Pin
    +-------+         |           |
    |       |---------|   GPIO18  |  ECHO Pin
    | VCC   |---------|    5V     |  Power
    | GND   |---------|   GND     |  Ground
    +-------+         |           |
                      |  USB Port |---- Computer/Power
                      +-----------+

```

## Assembly Instructions

### Step 1: Identify Pins
On your HC-SR04:
- VCC = Power (usually marked)
- GND = Ground
- TRIG = Trigger pin
- ECHO = Echo pin

On your ESP32:
- Find GPIO5 and GPIO18 (labeled on board)
- Find 5V and GND pins

### Step 2: Connect Wires
Use jumper wires or solder:
1. HC-SR04 VCC → ESP32 5V (red wire)
2. HC-SR04 GND → ESP32 GND (black wire)
3. HC-SR04 TRIG → ESP32 GPIO5 (yellow wire)
4. HC-SR04 ECHO → ESP32 GPIO18 (green wire)

### Step 3: Test Connection
1. Connect ESP32 to computer via USB
2. Open Arduino IDE Serial Monitor (115200 baud)
3. You should see distance readings
4. Wave your hand in front of sensor - readings should change

### Step 4: Mount in Tank
1. Place sensor at TOP of tank
2. Sensor face should point DOWN
3. Use zip ties, tape, or mounting bracket
4. Keep wires organized and away from water
5. Put ESP32 in waterproof box if possible

## Power Options

### Option 1: USB Power Bank (Recommended)
- Cheap and portable
- ESP32 uses very little power
- 10,000mAh bank lasts weeks
- Easy to recharge

### Option 2: USB Wall Adapter
- Permanent solution
- Needs outlet near tank
- 5V 1A adapter is enough

### Option 3: Solar Panel (Advanced)
- For outdoor tanks
- Needs battery + charge controller
- More complex but autonomous

## Troubleshooting Hardware

### Sensor Not Working
1. Check all 4 wires are connected firmly
2. Swap TRIG and ECHO pins (easy to mix up)
3. Try different GPIO pins
4. Sensor needs 2cm-400cm range to work

### ESP32 Not Programming
1. Hold BOOT button while uploading
2. Try different USB cable (some are power-only)
3. Install CH340 driver (Google "CH340 driver Mac/Windows")
4. Select correct COM port in Arduino IDE

### Intermittent Readings
1. Sensor too close to water (< 2cm)
2. Water surface is turbulent
3. Electrical interference
4. Bad wire connection

## Safety Notes

⚠️ **Important:**
- Don't submerge sensor in water
- Keep ESP32 away from water
- Use proper insulation
- Don't use near flammable materials
- Unplug when not testing

## Next Steps After Purchase

1. ✅ Test components individually
2. ✅ Upload firmware and verify sensor readings
3. ✅ Mount temporarily and test for a day
4. ✅ Once working, do permanent installation
5. ✅ Set up backend server on computer/Raspberry Pi
6. ✅ Install mobile app and configure

---

**Budget Tip:** If ordering from AliExpress, order 2 of each component. They're so cheap that having spares is worth it in case something doesn't work.
