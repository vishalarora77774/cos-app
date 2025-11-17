# Debugging HealthKit Module Issue

## Current Error
```
HealthKit is not available. The native module exists but initHealthKit method is not available.
```

## What This Means

The package `react-native-health` tries to access `NativeModules.AppleHealthKit` from React Native. If this native module isn't properly bridged, the JavaScript wrapper will be incomplete (only Constants, no methods).

## Debugging Steps

### 1. Check the Console Logs

The updated code now logs detailed information. When you run the app, look for these logs:

```
Native module found: Yes/No
Native module keys: [...]
Has initHealthKit: function/undefined
Available methods on native module: [...]
JS wrapper exists: true/false
JS wrapper keys: [...]
```

### 2. What to Look For

**If you see:**
- `Native module found: No` → The native module isn't linked at all
- `Native module found: Yes` but `Has initHealthKit: undefined` → Native module exists but methods aren't bridged
- `Available methods on native module: []` → No methods are available (needs rebuild)

### 3. The Root Cause

Looking at the package code (`node_modules/react-native-health/index.js`):
```javascript
const { AppleHealthKit } = require('react-native').NativeModules

export const HealthKit = Object.assign({}, AppleHealthKit, {
  Constants: { ... }
})
```

If `NativeModules.AppleHealthKit` is `undefined`, then:
- `Object.assign({}, undefined, {...})` creates an object with only Constants
- No methods from the native module are available
- This is why `initHealthKit` is undefined

## Solution: Full Rebuild Required

The native module bridge is only established during the **build process**, not during hot reload or fast refresh.

### Step-by-Step Fix

1. **Stop everything:**
   ```bash
   # Stop Metro bundler (Ctrl+C)
   # Stop the app if running
   ```

2. **Clean everything:**
   ```bash
   # Clean Metro cache
   rm -rf node_modules/.cache
   rm -rf .expo
   
   # Clean iOS build
   cd ios
   rm -rf build
   rm -rf Pods
   rm Podfile.lock
   ```

3. **Reinstall and rebuild:**
   ```bash
   # Reinstall pods
   cd ios
   pod install
   cd ..
   
   # Rebuild from scratch
   npx expo run:ios --clean
   ```

4. **Verify on physical device:**
   - Must test on real iOS device
   - HealthKit doesn't work on simulators

## Expected Behavior After Rebuild

Once properly rebuilt, you should see in the console:
```
Native module found: Yes
Has initHealthKit: function
Using native module directly
HealthKit initialized successfully
```

## If Still Not Working

If after a full rebuild you still see the error:

1. **Check Xcode console** for native module errors
2. **Verify HealthKit capability** is enabled in Xcode:
   - Open `ios/CoS.xcworkspace`
   - Target → Signing & Capabilities
   - Ensure "HealthKit" is listed
3. **Check the logs** - the new debugging will show exactly what's available
4. **Verify pod installation:**
   ```bash
   cd ios
   pod list | grep -i health
   ```
   Should show: `RNAppleHealthKit (1.7.0)`

## Temporary Workaround

If you need to test the UI without HealthKit working, the code will gracefully handle the error and show an error message in the UI instead of crashing.

