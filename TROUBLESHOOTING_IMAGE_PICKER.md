# Troubleshooting: expo-image-picker Native Module

## Current Status

You've tried rebuilding but the native module still isn't working. Here's a systematic approach to fix it.

## Root Cause Analysis

The issue is that **autolinking isn't detecting expo-image-picker**, even though:
- ✅ It's in `package.json`
- ✅ It's in `app.json` plugins
- ✅ Pod is in `Podfile.lock`
- ❌ But autolinking doesn't see it

## Solution: Force Prebuild

The native code might not be properly generated. Try this:

### Step 1: Clean Prebuild
```bash
# This regenerates all native code from app.json
npx expo prebuild --platform ios --clean
```

### Step 2: Reinstall Pods
```bash
cd ios
export LANG=en_US.UTF-8
pod install
cd ..
```

### Step 3: Rebuild
```bash
npx expo run:ios --device
```

## Alternative: Use the Force Link Script

I've created a script that does all of this:

```bash
./scripts/force-link-image-picker.sh
```

Then rebuild:
```bash
npx expo run:ios --device
```

## Check Build Logs

When you rebuild, check the Xcode build logs for:
- `ExpoImagePicker` being compiled
- Any linking errors
- Missing module errors

In Xcode:
1. View → Navigators → Show Report Navigator (Cmd+9)
2. Select the latest build
3. Search for "ExpoImagePicker"
4. Check for errors or warnings

## Verify Module is Linked

After rebuilding, check if the module is in the app binary:

```bash
# Check if ExpoImagePicker symbols are in the binary
nm ios/build/Build/Products/Debug-iphoneos/CoS.app/CoS 2>/dev/null | grep -i "ImagePicker" | head -5
```

Or in Xcode:
1. Product → Archive
2. Window → Organizer
3. Check build logs for ExpoImagePicker

## Nuclear Option: Complete Clean Rebuild

If nothing works:

```bash
# 1. Clean everything
rm -rf ios/Pods ios/Podfile.lock ios/build
rm -rf node_modules
rm -rf .expo

# 2. Reinstall
npm install

# 3. Prebuild
npx expo prebuild --platform ios --clean

# 4. Install pods
cd ios
export LANG=en_US.UTF-8
pod install
cd ..

# 5. Rebuild
npx expo run:ios --device
```

## Check Development Client

Make sure you're using a **Development Build**, not Expo Go:
- Expo Go doesn't support custom native modules
- You need to build a development client

Verify in `app.json`:
- Should have `"newArchEnabled": true` (you do)
- Should be building with `npx expo run:ios` (not Expo Go)

## Still Not Working?

If after all this it still doesn't work:

1. **Check Xcode build settings:**
   - Open `ios/CoS.xcworkspace`
   - Select the project
   - Build Settings → Search "ExpoImagePicker"
   - Verify it's linked

2. **Check if module is actually being used:**
   - The error might be a false positive
   - Try using the module and see what happens
   - Check device logs for actual errors

3. **Verify Expo SDK compatibility:**
   - You're using Expo SDK 54
   - expo-image-picker 16.0.6 should be compatible
   - Check: https://docs.expo.dev/versions/

4. **Try a different approach:**
   - Use `expo-image-picker` version that matches your Expo SDK exactly
   - Or try using the camera API directly
