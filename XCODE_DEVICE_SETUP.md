# Fix: "No Script URL Provided" When Running on Real Device

## The Problem

When running the app via Xcode to a real device, you get "no script url provided" because the device can't connect to Metro bundler.

## Solution

### Option 1: Start Metro Bundler First (Recommended)

1. **Start Metro bundler in a terminal:**
   ```bash
   npx expo start --dev-client
   ```
   Or simply:
   ```bash
   npx expo start
   ```

2. **Make sure your device and computer are on the same Wi-Fi network**

3. **In Xcode, run the app** - it should automatically connect to Metro

4. **If it doesn't connect automatically:**
   - Shake the device (or press Cmd+D in simulator)
   - Select "Configure Bundler"
   - Enter your computer's IP address (shown in Metro terminal)
   - Or scan the QR code if available

### Option 2: Use Tunnel Mode

If devices are on different networks:

```bash
npx expo start --dev-client --tunnel
```

This uses Expo's tunnel service to connect devices.

### Option 3: Configure Bundle URL in Xcode Scheme

1. In Xcode, go to **Product → Scheme → Edit Scheme**
2. Select **Run** → **Arguments**
3. Add environment variable:
   - **Name:** `RCT_METRO_PORT`
   - **Value:** `8081` (or your Metro port)
4. Or add:
   - **Name:** `EX_DEV_CLIENT_NETWORK_INSPECTOR`
   - **Value:** `1`

### Option 4: Manual Bundle URL (Last Resort)

If nothing else works, you can manually set the bundle URL:

1. Find your computer's IP address:
   ```bash
   # macOS
   ipconfig getifaddr en0
   # or
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. In Xcode, edit `ios/CoS/AppDelegate.swift`:
   ```swift
   override func bundleURL() -> URL? {
   #if DEBUG
     // Replace YOUR_IP with your computer's IP
     return URL(string: "http://YOUR_IP:8081/.expo/.virtual-metro-entry")!
   #else
     return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
   #endif
   }
   ```

## Quick Checklist

- [ ] Metro bundler is running (`npx expo start`)
- [ ] Device and computer are on same Wi-Fi network
- [ ] Firewall isn't blocking port 8081
- [ ] Xcode scheme is set to Debug (not Release)
- [ ] App is built as Development Client (not production build)

## Troubleshooting

### Still Not Working?

1. **Check Metro is accessible:**
   ```bash
   # In Metro terminal, you should see:
   # Metro waiting on exp://YOUR_IP:8081
   ```

2. **Test connection from device:**
   - Open Safari on your iPhone
   - Go to `http://YOUR_COMPUTER_IP:8081`
   - You should see Metro's status page

3. **Reset Metro:**
   ```bash
   npx expo start --clear
   ```

4. **Check Xcode console** for the actual error message

## Best Practice

**Always start Metro first, then run from Xcode:**
```bash
# Terminal 1: Start Metro
npx expo start --dev-client

# Terminal 2 or Xcode: Run the app
# The app will automatically connect to Metro
```
