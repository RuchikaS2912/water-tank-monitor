# Mobile App Configuration Update

## Your Deployed Backend URL
```
https://water-tank-monitor-1rrn.onrender.com
```

## Update Your React Native App

### 1. Locate Configuration File
Open your mobile app's main configuration file (usually `App.js` or a config file)

### 2. Update API URL
Find the API URL constant and change it to:

```javascript
// Config constants
const API_URL = 'https://water-tank-monitor-1rrn.onrender.com';
const WS_URL = 'wss://water-tank-monitor-1rrn.onrender.com';

// Or if using separate endpoints:
const API_BASE_URL = 'https://water-tank-monitor-1rrn.onrender.com/api';
```

### 3. Full Configuration Example

```javascript
// App.js or config.js
import React, { useState, useEffect } from 'react';

// Backend Configuration
const API_URL = 'https://water-tank-monitor-1rrn.onrender.com';

// API Endpoints
const ENDPOINTS = {
  waterLevel: `${API_URL}/api/water-level`,
  history: `${API_URL}/api/history`,
  config: `${API_URL}/api/config`,
  updateConfig: `${API_URL}/api/config`,
  registerPushToken: `${API_URL}/api/register-push-token`
};

// Fetch water level
const fetchWaterLevel = async () => {
  try {
    const response = await fetch(ENDPOINTS.waterLevel);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching water level:', error);
    return null;
  }
};
```

### 4. WebSocket Configuration (if using WebSocket)

```javascript
import { useEffect, useState } from 'react';

const useWebSocket = () => {
  const [waterLevel, setWaterLevel] = useState(null);
  
  useEffect(() => {
    const ws = new WebSocket('wss://water-tank-monitor-1rrn.onrender.com');
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setWaterLevel(data);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    return () => ws.close();
  }, []);
  
  return waterLevel;
};
```

### 5. Test the Connection

Add this test function to verify the backend is reachable:

```javascript
const testBackendConnection = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    console.log('Backend health:', data);
    // Expected: { status: 'ok', timestamp: '...' }
    return data.status === 'ok';
  } catch (error) {
    console.error('Backend connection failed:', error);
    return false;
  }
};
```

### 6. Rebuild and Test

#### For Expo:
```bash
cd ~/Work/water-tank-monitor/mobile-app
npm start
# Then press 'a' for Android or 'i' for iOS
```

#### For React Native CLI:
```bash
cd ~/Work/water-tank-monitor/mobile-app

# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

## API Endpoints Reference

### Get Current Water Level
```javascript
fetch('https://water-tank-monitor-1rrn.onrender.com/api/water-level')
  .then(res => res.json())
  .then(data => console.log(data));
// Returns: { water_level_cm, percentage, time_to_fill_minutes, ... }
```

### Get History
```javascript
fetch('https://water-tank-monitor-1rrn.onrender.com/api/history')
  .then(res => res.json())
  .then(data => console.log(data));
// Returns: Array of historical readings
```

### Get Configuration
```javascript
fetch('https://water-tank-monitor-1rrn.onrender.com/api/config')
  .then(res => res.json())
  .then(data => console.log(data));
// Returns: { tank_height_cm, target_level_cm, flow_rate_cm_per_min }
```

### Update Configuration
```javascript
fetch('https://water-tank-monitor-1rrn.onrender.com/api/config', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tank_height_cm: 200,
    target_level_cm: 180,
    flow_rate_cm_per_min: 5
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Register Push Notification Token (Expo)
```javascript
import * as Notifications from 'expo-notifications';

const registerForPushNotifications = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;
  
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  
  await fetch('https://water-tank-monitor-1rrn.onrender.com/api/register-push-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
};
```

## Complete Example Component

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const API_URL = 'https://water-tank-monitor-1rrn.onrender.com';

export default function WaterLevelScreen() {
  const [waterLevel, setWaterLevel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/water-level`);
        const data = await response.json();
        setWaterLevel(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Water Tank Monitor</Text>
      <Text style={styles.level}>{waterLevel?.percentage || 0}%</Text>
      <Text style={styles.detail}>
        {waterLevel?.water_level_cm || 0} cm
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  level: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#38bdf8',
  },
  detail: {
    fontSize: 18,
    color: '#666',
  },
});
```

## Troubleshooting

### Issue: "Network request failed"
**Solution:** 
- Check internet connection
- Verify API_URL is correct
- Test in browser: https://water-tank-monitor-1rrn.onrender.com/health

### Issue: Data not updating
**Solution:**
- Check if ESP32 is sending data
- Verify backend logs on Render dashboard
- Check mobile app console for errors

### Issue: Slow initial load
**Solution:**
- Render free tier sleeps after 15 min inactivity
- First request takes ~30 seconds to wake
- Show loading indicator during initial fetch
- Subsequent requests are instant

### Issue: WebSocket disconnects
**Solution:**
- Implement reconnection logic
- Add heartbeat/ping messages
- Handle connection state in UI

## Testing Checklist

- [ ] Backend health check returns OK
- [ ] Water level data loads in app
- [ ] History data displays correctly
- [ ] Configuration can be viewed
- [ ] Push notifications register successfully
- [ ] WebSocket connection works (if implemented)
- [ ] App handles backend sleep/wake gracefully

## Next Steps
1. ✅ Update mobile app API URLs
2. ✅ Test on physical device or emulator
3. ✅ Verify data updates from ESP32
4. ✅ Test push notifications
5. ✅ Deploy to app stores (optional)
