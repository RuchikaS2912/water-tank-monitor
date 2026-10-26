/*
 * Water Tank Monitor - ESP32 Firmware
 * 
 * Hardware connections:
 * - HC-SR04 Ultrasonic Sensor:
 *   VCC -> 5V
 *   GND -> GND
 *   TRIG -> GPIO 5
 *   ECHO -> GPIO 18
 * 
 * Configuration:
 * 1. Update WIFI_SSID and WIFI_PASSWORD with your WiFi credentials
 * 2. Update SERVER_URL with your backend server IP address
 * 3. Upload to ESP32
 * 4. Open Serial Monitor (115200 baud) to see debug output
 */

#include <WiFi.h>
#include <HTTPClient.h>

// WiFi credentials
const char* WIFI_SSID = "YOUR_WIFI_SSID";        // Change this
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"; // Change this

// Server configuration
const char* SERVER_URL = "http://192.168.1.100:3000/api/sensor-data"; // Change to your server IP

// Ultrasonic sensor pins
const int TRIG_PIN = 5;
const int ECHO_PIN = 18;

// Timing
const unsigned long MEASUREMENT_INTERVAL = 2000; // Measure every 2 seconds
unsigned long lastMeasurement = 0;

// Moving average filter (reduces noise)
const int NUM_READINGS = 5;
float readings[NUM_READINGS];
int readIndex = 0;
float total = 0;
float average = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n=== Water Tank Monitor ESP32 ===");
  
  // Initialize sensor pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  
  // Initialize readings array
  for (int i = 0; i < NUM_READINGS; i++) {
    readings[i] = 0;
  }
  
  // Connect to WiFi
  connectWiFi();
}

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    connectWiFi();
  }
  
  // Take measurement at interval
  if (millis() - lastMeasurement >= MEASUREMENT_INTERVAL) {
    lastMeasurement = millis();
    
    float distance = measureDistance();
    
    if (distance > 0 && distance < 400) { // Valid range: 2cm to 400cm
      // Apply moving average filter
      total = total - readings[readIndex];
      readings[readIndex] = distance;
      total = total + readings[readIndex];
      readIndex = (readIndex + 1) % NUM_READINGS;
      average = total / NUM_READINGS;
      
      Serial.printf("Raw: %.1f cm | Filtered: %.1f cm\n", distance, average);
      
      // Send to server
      sendToServer(average);
    } else {
      Serial.println("Invalid reading - out of range");
    }
  }
}

void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n✗ WiFi Connection Failed!");
  }
}

float measureDistance() {
  // Trigger pulse
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Read echo pulse
  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
  
  if (duration == 0) {
    return -1; // No echo received
  }
  
  // Calculate distance in cm
  // Speed of sound = 343 m/s = 0.0343 cm/µs
  // Distance = (duration / 2) * 0.0343
  float distance = (duration * 0.0343) / 2.0;
  
  return distance;
}

void sendToServer(float distance) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Cannot send: WiFi not connected");
    return;
  }
  
  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload
  String payload = "{\"distance_cm\":" + String(distance, 1) + "}";
  
  int httpResponseCode = http.POST(payload);
  
  if (httpResponseCode > 0) {
    Serial.printf("✓ Sent to server (HTTP %d)\n", httpResponseCode);
    
    if (httpResponseCode == 200) {
      String response = http.getString();
      Serial.println("Server response: " + response);
    }
  } else {
    Serial.printf("✗ HTTP Error: %s\n", http.errorToString(httpResponseCode).c_str());
  }
  
  http.end();
}

// Additional utility functions

void printSystemInfo() {
  Serial.println("\n=== System Info ===");
  Serial.printf("Chip Model: %s\n", ESP.getChipModel());
  Serial.printf("Chip Revision: %d\n", ESP.getChipRevision());
  Serial.printf("CPU Frequency: %d MHz\n", ESP.getCpuFreqMHz());
  Serial.printf("Free Heap: %d bytes\n", ESP.getFreeHeap());
  Serial.printf("WiFi RSSI: %d dBm\n", WiFi.RSSI());
  Serial.println("==================\n");
}
