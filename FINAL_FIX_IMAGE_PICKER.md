# Final Fix: expo-image-picker Native Module

## The Problem

After multiple rebuilds, the native module still isn't found. This suggests the module isn't being compiled into the app binary.

## Root Cause

The module is:
- ✅ In `package.json`
- ✅ In `app.json` plugins  
- ✅ In `Podfile.lock`
- ❌ **NOT being compiled into the app binary**

## Solution: Verify and Force Link

### Step 1: Check if Module is Actually Built

In Xcode:
1. Open `ios/CoS.xcworkspace`
2. Product → Build (Cmd+B)
3. View → Navigators → Show Report Navigator (Cmd+9)
4. Search for "ExpoImagePicker" in the build log
5. Check if it's being compiled

### Step 2: Verify Module Registration

The module needs to be registered. Check if `ExpoModulesCore` is finding it:

In Xcode, add a breakpoint or log in `AppDelegate.swift` to verify modules are loading.

### Step 3: Nuclear Option - Complete Clean Rebuild

```bash
# 1. Delete everything
rm -rf ios/Pods ios/Podfile.lock ios/build ios/DerivedData
rm -rf node_modules
rm -rf .expo

# 2. Reinstall
npm install

# 3. Prebuild (regenerates native code)
npx expo prebuild --platform ios --clean

# 4. Install pods
cd ios
export LANG=en_US.UTF-8
pod install
cd ..

# 5. Open in Xcode and verify
open ios/CoS.xcworkspace
```

In Xcode:
1. Select the project in navigator
2. Select "CoS" target
3. Build Phases → Link Binary With Libraries
4. Check if `ExpoImagePicker` or `Pods_CoS.framework` is listed
5. If not, the module isn't being linked

### Step 4: Manual Verification

Check if the module is in the built app:

```bash
# After building, check the app binary
find ios/build -name "CoS.app" -exec sh -c 'nm "$1" 2>/dev/null | grep -i ImagePicker | head -5' _ {} \;
```

If nothing is found, the module isn't in the binary.

## Alternative: Check if Using Expo Go

**CRITICAL:** Are you using Expo Go? If so, that's the problem!

Expo Go doesn't support custom native modules. You MUST use a development build:

```bash
# Build development client (not Expo Go)
npx expo run:ios --device
```

Make sure you're NOT opening the app via Expo Go QR code.

## Last Resort: Check Module Version Compatibility

There might be a version mismatch:

```bash
# Check versions
npx expo-doctor

# Should show if there are compatibility issues
```

If there are issues, try:

```bash
# Use exact version matching Expo SDK
npm install expo-image-picker@16.0.6
cd ios && pod install && cd ..
npx expo run:ios --device
```

## Debug: Add Module Registration Logging

Temporarily add this to see what modules are registered:

In `hooks/use-doctor.ts`, add at the top:

```typescript
import { NativeModules } from 'react-native';
console.log('Available native modules:', Object.keys(NativeModules));
```

This will show all registered native modules. If `ExponentImagePicker` isn't in the list, it's not being registered.

## If Nothing Works

The issue might be that Expo's autolinking isn't working properly. Try:

1. **Check Expo SDK version:**
   ```bash
   npx expo --version
   ```

2. **Verify expo-image-picker compatibility:**
   - Expo SDK 54 should work with expo-image-picker 16.x
   - Check: https://docs.expo.dev/versions/

3. **Try a different approach:**
   - Use `expo-image-picker` version that exactly matches your Expo SDK
   - Or temporarily remove and re-add the module

4. **Check if other Expo modules work:**
   - Try using `expo-sqlite` or another Expo module
   - If those work but image-picker doesn't, it's module-specific
