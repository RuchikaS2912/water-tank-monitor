# Render.com Deployment Guide

## Quick Deploy

Your backend is deployed at: `https://water-tank-monitor.onrender.com`

Service ID: `srv-dbfocal9fdbs739u5j9g`

## Configuration

### Build Settings
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Root Directory**: (empty)

### Environment Variables
```
NODE_ENV=production
PORT=(auto-set by Render)
```

## Testing Your Deployment

Once deployed, test these endpoints:

### 1. Health Check
```bash
curl https://water-tank-monitor.onrender.com/health
```
Expected: `{"status":"ok","timestamp":"..."}`

### 2. Get Water Level
```bash
curl https://water-tank-monitor.onrender.com/api/water-level
```

### 3. WebSocket Connection
The WebSocket endpoint will be at:
```
wss://water-tank-monitor.onrender.com
```

## Update ESP32 Firmware

After deployment, update your ESP32 code with the new server URL:

```cpp
// Change this line in water_tank_monitor.ino
const char* serverUrl = "https://water-tank-monitor.onrender.com";
```

## Update Mobile App

Update the API URL in your mobile app:

```javascript
// In App.js
const API_URL = 'https://water-tank-monitor.onrender.com';
const WS_URL = 'wss://water-tank-monitor.onrender.com';
```

## Common Issues

### Build Fails
- Check that `backend/package.json` exists
- Verify Node.js dependencies are correct
- Check Render logs for specific error

### App Won't Start
- Ensure `backend/server.js` exists
- Verify the start command is correct
- Check that PORT environment variable is used

### Free Tier Sleep
Free instances spin down after 15 minutes of inactivity. First request after sleep takes ~30 seconds to wake up.

**Solution**: Keep the service alive with a cron job:
```bash
# Ping every 10 minutes
*/10 * * * * curl https://water-tank-monitor.onrender.com/health
```

## Manual Deploy

To trigger a manual deploy:
1. Go to https://dashboard.render.com/web/srv-dbfocal9fdbs739u5j9g
2. Click "Manual Deploy" → "Deploy latest commit"

## Logs

View real-time logs:
https://dashboard.render.com/web/srv-dbfocal9fdbs739u5j9g/logs

## Re-deploy After Code Changes

1. Commit and push changes to GitHub:
```bash
cd ~/Work/water-tank-monitor
git add .
git commit -m "Your changes"
git push origin master
```

2. Render auto-deploys within 1-2 minutes

## Database Persistence

⚠️ **Important**: The SQLite database (`water_tank.db`) is ephemeral on the free tier. It resets when the service restarts.

**Solutions**:
1. **Upgrade to paid plan** ($7/month) and add a persistent disk
2. **Use external database**: PostgreSQL (free tier on Render) or MongoDB Atlas (free tier)
3. **Accept data loss**: For testing, ephemeral storage is fine

## Environment Variables on Render

Current variables:
- `NODE_ENV=production` (set by you)
- `PORT` (auto-set by Render)

To add more:
1. Go to service settings
2. Click "Environment" tab
3. Add key-value pairs
4. Service auto-redeploys

## Cost

- **Free Tier**: $0/month, 750 hours/month, 0.1 CPU, 512 MB RAM
- Services spin down after inactivity
- More than enough for this project!

## Next Steps After Successful Deploy

1. ✅ Test all API endpoints
2. ✅ Update ESP32 with new URL
3. ✅ Update mobile app with new URL
4. ✅ Test end-to-end: ESP32 → Backend → Mobile App
5. ✅ Set up monitoring/uptime checks (optional)
