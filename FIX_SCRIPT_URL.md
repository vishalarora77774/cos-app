# Fix: "No Script URL Provided" - Step by Step

## Step 1: Find Your Computer's IP Address

Run this command to find your IP:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Or on macOS:
```bash
ipconfig getifaddr en0
```

Note down your IP address (e.g., `192.168.1.100`)

## Step 2: Start Metro Bundler

```bash
npx expo start --dev-client
```

**Important:** Look for this line in the output:
```
Metro waiting on exp://YOUR_IP:8081
```

Make sure it shows your computer's IP, not `localhost` or `127.0.0.1`

## Step 3: Configure Xcode Scheme

1. In Xcode, go to **Product → Scheme → Edit Scheme...**
2. Select **Run** in the left sidebar
3. Go to **Arguments** tab
4. Under **Environment Variables**, click **+** and add:
   - **Name:** `EXPO_DEV_CLIENT_LOCAL_IP`
   - **Value:** Your IP address from Step 1 (e.g., `192.168.1.100`)
5. Click **Close**

## Step 4: Check Network Connection

### On Your iPhone:
1. Make sure iPhone and computer are on the **same Wi-Fi network**
2. Open Safari on iPhone
3. Go to: `http://YOUR_IP:8081` (replace with your IP)
4. You should see Metro's status page
5. If you see "Connection refused" or can't connect:
   - Check firewall settings
   - Make sure port 8081 is open
   - Try disabling firewall temporarily to test

## Step 5: Run from Xcode

1. Make sure Metro is still running
2. In Xcode, select your device
3. Click **Run** (or press Cmd+R)
4. The app should connect to Metro

## Step 6: Manual Connection (If Still Not Working)

If the app still can't connect:

1. **Shake your iPhone** (or press Cmd+D in simulator)
2. Select **"Configure Bundler"**
3. Enter: `http://YOUR_IP:8081`
4. The app should reload and connect

## Alternative: Use Tunnel Mode

If devices are on different networks or firewall is blocking:

```bash
npx expo start --dev-client --tunnel
```

This uses Expo's tunnel service (slower but works across networks).

## Troubleshooting

### Check Metro is Accessible

Test from your iPhone's Safari:
```
http://YOUR_COMPUTER_IP:8081
```

Should show Metro status page.

### Check Firewall

On macOS:
1. System Settings → Network → Firewall
2. Make sure it's not blocking Node.js or port 8081
3. Or temporarily disable to test

### Check Xcode Console

Look for these messages:
- `✅ Found Metro bundle URL:` = Success!
- `❌ Could not determine bundle URL` = Problem

### Common Issues

1. **Different Wi-Fi networks** → Use tunnel mode
2. **Firewall blocking** → Allow port 8081
3. **Metro not running** → Start Metro first
4. **Wrong IP address** → Check with `ifconfig`
5. **Xcode caching** → Clean build folder (Cmd+Shift+K)

## Quick Test

Run this to verify everything:
```bash
# Terminal 1: Start Metro
npx expo start --dev-client

# Terminal 2: Test connection (should show Metro status)
curl http://YOUR_IP:8081
```

If curl works but app doesn't, it's an Xcode/device configuration issue.
