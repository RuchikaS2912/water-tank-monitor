const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const sqlite3 = require('sqlite3').verbose();
const { Expo } = require('expo-server-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./water_tank.db', (err) => {
  if (err) console.error('Database error:', err);
  else console.log('✓ Database connected');
});

// Create tables
db.run(`
  CREATE TABLE IF NOT EXISTS tank_config (
    id INTEGER PRIMARY KEY,
    tank_height_cm REAL NOT NULL,
    target_level_cm REAL NOT NULL,
    flow_rate_cm_per_min REAL DEFAULT 5.0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS water_levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    distance_cm REAL NOT NULL,
    water_level_cm REAL NOT NULL,
    percentage REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS push_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// WebSocket server for real-time updates
const server = app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});

const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('📱 Client connected. Total clients:', clients.size);
  
  // Send current water level immediately
  getCurrentWaterLevel((data) => {
    if (data) {
      ws.send(JSON.stringify({ type: 'waterLevel', data }));
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected. Total clients:', clients.size);
  });
});

// Broadcast to all connected clients
function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Initialize Expo push notification client
const expo = new Expo();

// Helper function to get current water level
function getCurrentWaterLevel(callback) {
  db.get(`
    SELECT wl.*, tc.tank_height_cm, tc.target_level_cm, tc.flow_rate_cm_per_min
    FROM water_levels wl
    LEFT JOIN tank_config tc ON tc.id = 1
    ORDER BY wl.timestamp DESC
    LIMIT 1
  `, callback);
}

// Calculate time to fill
function calculateTimeToFill(currentLevelCm, targetLevelCm, flowRate) {
  const remainingCm = targetLevelCm - currentLevelCm;
  if (remainingCm <= 0) return 0;
  return remainingCm / flowRate; // minutes
}

// Send push notification
async function sendPushNotification(title, body) {
  db.all('SELECT token FROM push_tokens', async (err, rows) => {
    if (err || !rows.length) return;

    const messages = rows
      .filter(row => Expo.isExpoPushToken(row.token))
      .map(row => ({
        to: row.token,
        sound: 'default',
        title: title,
        body: body,
        data: { type: 'tank_alert' },
      }));

    if (messages.length === 0) return;

    try {
      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        await expo.sendPushNotificationsAsync(chunk);
      }
      console.log('✓ Push notification sent:', title);
    } catch (error) {
      console.error('Push notification error:', error);
    }
  });
}

// API Routes

// Configure tank
app.post('/api/config', (req, res) => {
  const { tank_height_cm, target_level_cm, flow_rate_cm_per_min } = req.body;
  
  db.run(`
    INSERT OR REPLACE INTO tank_config (id, tank_height_cm, target_level_cm, flow_rate_cm_per_min, updated_at)
    VALUES (1, ?, ?, ?, CURRENT_TIMESTAMP)
  `, [tank_height_cm, target_level_cm, flow_rate_cm_per_min || 5.0], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, message: 'Tank configuration saved' });
  });
});

// Get tank configuration
app.get('/api/config', (req, res) => {
  db.get('SELECT * FROM tank_config WHERE id = 1', (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(row || { tank_height_cm: 200, target_level_cm: 180, flow_rate_cm_per_min: 5.0 });
  });
});

// Receive sensor data from ESP32
app.post('/api/sensor-data', (req, res) => {
  const { distance_cm } = req.body;
  
  if (!distance_cm) {
    return res.status(400).json({ error: 'distance_cm is required' });
  }

  // Get tank config to calculate water level
  db.get('SELECT * FROM tank_config WHERE id = 1', (err, config) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const tankHeight = config?.tank_height_cm || 200;
    const targetLevel = config?.target_level_cm || 180;
    const flowRate = config?.flow_rate_cm_per_min || 5.0;

    // Calculate water level (tank height - distance from sensor to water surface)
    const waterLevelCm = Math.max(0, tankHeight - distance_cm);
    const percentage = Math.min(100, (waterLevelCm / tankHeight) * 100);
    const timeToFill = calculateTimeToFill(waterLevelCm, targetLevel, flowRate);

    // Save to database
    db.run(`
      INSERT INTO water_levels (distance_cm, water_level_cm, percentage)
      VALUES (?, ?, ?)
    `, [distance_cm, waterLevelCm, percentage], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const data = {
        distance_cm,
        water_level_cm: waterLevelCm,
        percentage: percentage.toFixed(1),
        tank_height_cm: tankHeight,
        target_level_cm: targetLevel,
        time_to_fill_minutes: timeToFill.toFixed(1),
        timestamp: new Date().toISOString()
      };

      // Broadcast to all connected WebSocket clients
      broadcast({ type: 'waterLevel', data });

      // Check if notification should be sent (1-2 minutes before full)
      if (timeToFill <= 2 && timeToFill > 0.5) {
        const minutesText = timeToFill <= 1 ? '1 minute' : '2 minutes';
        sendPushNotification(
          '💧 Tank Almost Full!',
          `Your water tank will be full in approximately ${minutesText}.`
        );
      } else if (waterLevelCm >= targetLevel) {
        sendPushNotification(
          '✓ Tank Full!',
          'Your water tank has reached the target level.'
        );
      }

      res.json({ success: true, data });
    });
  });
});

// Get current water level
app.get('/api/water-level', (req, res) => {
  getCurrentWaterLevel((err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!row) {
      return res.json({ 
        message: 'No data yet',
        water_level_cm: 0,
        percentage: 0,
        time_to_fill_minutes: 0
      });
    }

    const timeToFill = calculateTimeToFill(
      row.water_level_cm,
      row.target_level_cm || 180,
      row.flow_rate_cm_per_min || 5.0
    );

    res.json({
      ...row,
      time_to_fill_minutes: timeToFill.toFixed(1)
    });
  });
});

// Get historical data
app.get('/api/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  
  db.all(`
    SELECT * FROM water_levels
    ORDER BY timestamp DESC
    LIMIT ?
  `, [limit], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Register push token
app.post('/api/register-token', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'token is required' });
  }

  if (!Expo.isExpoPushToken(token)) {
    return res.status(400).json({ error: 'Invalid Expo push token' });
  }

  db.run('INSERT OR IGNORE INTO push_tokens (token) VALUES (?)', [token], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, message: 'Push token registered' });
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

console.log('🚀 Water Tank Monitor Backend Ready');
console.log(`📡 WebSocket server running on ws://localhost:${PORT}`);
