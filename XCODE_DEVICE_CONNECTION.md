# Fix: "Could Not Connect to Development Server" on Real Device

## The Problem

When running on a **real device** via Xcode, the app can't connect to Metro because:
- `localhost:8081` refers to the **device itself**, not your computer
- The device needs your **computer's IP address** to connect

## Quick Fix Steps

### Step 1: Find Your Computer's IP Address

**On macOS:**
```bash
# Option 1: System Settings
# System Settings → Network → Wi-Fi → Details → IP Address

# Option 2: Terminal
ipconfig getifaddr en0
# or
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Note down your IP (e.g., `192.168.1.100`)

### Step 2: Configure Xcode Scheme

1. In Xcode, go to **Product → Scheme → Edit Scheme...**
2. Select **Run** in the left sidebar
3. Go to **Arguments** tab
4. Under **Environment Variables**, click **+** and add:
   - **Name:** `EXPO_DEV_CLIENT_LOCAL_IP`
   - **Value:** Your IP address (e.g., `192.168.1.100`)
5. Click **Close**

### Step 3: Verify Metro is Accessible

**On your iPhone (using Safari):**
1. Make sure iPhone and computer are on **same Wi-Fi network**
2. Open Safari on iPhone
3. Go to: `http://YOUR_IP:8081` (replace with your IP)
4. You should see Metro's status page
5. If you see "Connection refused" or can't connect:
   - Check firewall settings
   - Make sure port 8081 is open
   - Try disabling firewall temporarily to test

### Step 4: Start Metro and Run App

1. **Start Metro bundler:**
   ```bash
   npx expo start --dev-client
   ```
   
   Look for this line:
   ```
   Metro waiting on exp://YOUR_IP:8081
   ```

2. **In Xcode, run the app** - it should connect automatically

### Step 5: Manual Connection (If Still Not Working)

If automatic connection fails:

1. **Shake your iPhone** (or press Cmd+D in simulator)
2. Select **"Configure Bundler"**
3. Enter: `http://YOUR_IP:8081`
4. The app should reload and connect

## Alternative: Use Tunnel Mode

If devices are on different networks or firewall is blocking:

```bash
npx expo start --dev-client --tunnel
```

This uses Expo's tunnel service (works across networks, but slower).

## Troubleshooting

### Still Can't Connect?

1. **Check Wi-Fi:**
   - Device and computer must be on **same network**
   - Some corporate/public Wi-Fi blocks device-to-device communication

2. **Check Firewall:**
   - macOS Firewall might be blocking port 8081
   - System Settings → Network → Firewall
   - Allow Node.js or temporarily disable to test

3. **Check Metro Output:**
   - Should show: `Metro waiting on exp://YOUR_IP:8081`
   - If it shows `localhost`, that's the problem

4. **Test Connection:**
   ```bash
   # From your computer, test if Metro is accessible
   curl http://YOUR_IP:8081
   ```
   
   Should return Metro status page

5. **Check Xcode Console:**
   - Look for bundle URL messages
   - Should see: `✅ Found Metro bundle URL: http://...`

## Quick Checklist

- [ ] Metro bundler is running (`npx expo start --dev-client`)
- [ ] Device and computer are on same Wi-Fi network
- [ ] Found your computer's IP address
- [ ] Set `EXPO_DEV_CLIENT_LOCAL_IP` in Xcode scheme
- [ ] Can access `http://YOUR_IP:8081` from iPhone Safari
- [ ] Firewall isn't blocking port 8081
- [ ] Xcode scheme is set to Debug (not Release)

## Best Practice

**Always:**
1. Start Metro first: `npx expo start --dev-client`
2. Then run from Xcode
3. If connection fails, use dev menu to manually configure
