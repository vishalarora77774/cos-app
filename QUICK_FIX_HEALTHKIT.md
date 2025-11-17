# Quick Fix: HealthKit Module Not Available

## The Error
```
HealthKit module is not available. Please rebuild the app after installing pods.
```

## Why This Happens
After installing `react-native-health`, the native iOS module needs to be linked. This requires a **full rebuild** of the app, not just a reload.

## Quick Fix (3 Steps)

### Step 1: Verify Pods Are Installed ✅
```bash
cd ios
pod install
```
You should see `RNAppleHealthKit` in the output.

### Step 2: Rebuild the App 🔄
**This is the critical step!** The app must be rebuilt from scratch:

```bash
# Stop any running Metro bundler (Ctrl+C)

# Clean and rebuild
npx expo run:ios --clean
```

**OR** if using Xcode:
1. Open `ios/CoS.xcworkspace` in Xcode
2. Product → Clean Build Folder (Shift + Cmd + K)
3. Product → Build (Cmd + B)
4. Run on device

### Step 3: Test on Physical Device 📱
- HealthKit **does NOT work on simulators**
- Must test on a real iOS device
- Connect device via USB or ensure it's on the same network

## Verify It's Working

After rebuilding, check the console logs. You should see:
- ✅ `HealthKit initialized successfully` (if permissions granted)
- ❌ If you still see errors, check the console for which native modules are available

The improved error handler will now show:
- Which native modules are available (if HealthKit is missing)
- Specific instructions based on what's wrong

## Common Mistakes

❌ **Don't do this:**
- Just reloading the app (Cmd + R in simulator)
- Only running `pod install` without rebuilding
- Testing on iOS Simulator

✅ **Do this:**
- Full rebuild with `--clean` flag
- Test on physical device
- Verify HealthKit capability in Xcode

## Still Not Working?

Check the console output. The new error handler will log:
```
HealthKit native module not found. Available modules: [...]
```

This shows which native modules ARE available, helping diagnose the issue.

If `RNAppleHealthKit` or `AppleHealthKit` is NOT in the list, the native module isn't linked. Try:
1. Delete `ios/Pods` and `ios/Podfile.lock`
2. Run `pod install` again
3. Rebuild the app

