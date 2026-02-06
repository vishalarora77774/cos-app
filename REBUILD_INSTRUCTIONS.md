# How to Rebuild the iOS App

## Method 1: Using Expo CLI (Recommended)

### Step 1: Make sure your device is connected
- Connect your iPhone/iPad via USB
- Unlock your device
- Trust the computer if prompted

### Step 2: Rebuild the app
```bash
# From the project root directory
npx expo run:ios --device
```

This will:
- Build the app with all native modules
- Install it on your connected device
- Start Metro bundler automatically

### Step 3: Wait for the build
- First build takes 5-10 minutes
- You'll see build progress in the terminal
- The app will launch automatically when done

---

## Method 2: Using Xcode

### Step 1: Open the workspace
```bash
open ios/CoS.xcworkspace
```
**Important:** Open `.xcworkspace`, NOT `.xcodeproj`

### Step 2: Select your device
- In Xcode, click the device selector (top toolbar)
- Choose your connected iPhone/iPad

### Step 3: Clean build folder
- Product → Clean Build Folder (or press Shift+Cmd+K)
- Wait for it to complete

### Step 4: Build and run
- Product → Run (or press Cmd+R)
- Wait for the build to complete (5-10 minutes first time)
- The app will install and launch on your device

---

## Troubleshooting

### Issue: "No devices found"
**Solution:**
1. Make sure device is connected via USB
2. Unlock your device
3. Trust the computer
4. In Xcode: Window → Devices and Simulators → Check device is listed

### Issue: Build fails with signing errors
**Solution:**
1. Open Xcode
2. Select the project in the navigator
3. Select the "CoS" target
4. Go to "Signing & Capabilities"
5. Select your development team
6. Xcode will automatically manage signing

### Issue: Build takes too long
**Solution:**
- First build after adding native modules always takes 5-10 minutes
- Subsequent builds are faster (1-2 minutes)
- This is normal - be patient!

### Issue: App builds but crashes on launch
**Solution:**
1. Check Metro bundler is running
2. Look at device logs in Xcode: Window → Devices → View Device Logs
3. Check terminal for error messages

---

## Verify the Build Worked

After rebuilding, test the image picker:
1. Open the app on your device
2. Go to a doctor detail page
3. Click "Add Photo"
4. You should see the photo picker (not an error)

If you still get "Cannot find native module", the build didn't include the module. Try:
1. Clean build folder again
2. Delete the app from your device
3. Rebuild completely
