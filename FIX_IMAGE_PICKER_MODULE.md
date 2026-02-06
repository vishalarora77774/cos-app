# Fix: Cannot find native module 'ExponentImagePicker'

## The Problem

The error "Cannot find native module 'ExponentImagePicker'" occurs because:
1. The native module wasn't properly linked during the build
2. The app was built before pods were installed
3. The native module needs to be compiled into the app binary

## Quick Fix

Run the fix script:

```bash
./scripts/fix-image-picker.sh
```

Then rebuild:

```bash
npx expo run:ios --device
```

## Manual Fix Steps

If the script doesn't work, follow these steps:

### Step 1: Clean Everything

```bash
# Stop Metro bundler if running (Ctrl+C)

# Clean iOS build
cd ios
rm -rf Pods Podfile.lock build DerivedData
cd ..

# Clean node modules (optional but recommended)
rm -rf node_modules
npm install
```

### Step 2: Reinstall Pods

```bash
cd ios
export LANG=en_US.UTF-8  # Fix encoding issues
pod install
cd ..
```

**Verify ExpoImagePicker is installed:**
```bash
ls -la ios/Pods/ExpoImagePicker
```

If this directory doesn't exist, the pod install failed. Check for errors in the pod install output.

### Step 3: Clear Metro Cache

```bash
npx expo start --clear
# Press Ctrl+C after it starts
```

### Step 4: Rebuild the App

**Important:** You MUST rebuild the app - restarting Metro is NOT enough!

```bash
# For real device
npx expo run:ios --device

# Or specify device name
npx expo run:ios --device --device-name "Your iPhone Name"
```

### Step 5: Verify in Xcode (Alternative)

1. Open `ios/CoS.xcworkspace` in Xcode
2. Clean Build Folder: Product → Clean Build Folder (Shift+Cmd+K)
3. Select your device from the device dropdown
4. Build and Run: Product → Run (Cmd+R)

## Verification

After rebuilding, check:

1. **In Xcode Console:** Look for "ExpoImagePicker" in the build output
2. **In App:** Try to pick an image - it should work without errors
3. **In Terminal:** Check for any "Cannot find native module" errors

## Common Issues

### Issue: Pod install fails with encoding error
**Solution:**
```bash
export LANG=en_US.UTF-8
cd ios
pod install
```

### Issue: Pod install says ExpoImagePicker not found
**Solution:**
1. Verify `expo-image-picker` is in `package.json`
2. Verify it's in `app.json` plugins array
3. Run `npm install` again
4. Run `pod install` again

### Issue: Build succeeds but module still not found
**Solution:**
1. Delete the app from your device
2. Clean build folder in Xcode
3. Rebuild completely
4. Make sure you're using a Development Build (not Expo Go)

### Issue: Module works in simulator but not on device
**Solution:**
1. Make sure you're building for the correct device architecture
2. Check that your device is properly connected and trusted
3. Try building directly from Xcode

## Why This Happens

Native modules like `expo-image-picker` need to be:
1. **Installed** - via npm/yarn
2. **Linked** - via CocoaPods (iOS) or Gradle (Android)
3. **Compiled** - into the app binary during build

If any step is missed or done out of order, the native module won't be available at runtime.

## Prevention

To avoid this in the future:
1. Always run `pod install` after adding native modules
2. Always rebuild the app after adding native modules
3. Don't skip the build step - Metro restart is not enough

## Still Not Working?

If the module still isn't found after following all steps:

1. Check that you're using a **Development Build**, not Expo Go
2. Verify the module version matches Expo SDK version
3. Check Xcode build logs for linking errors
4. Try removing and re-adding the module:
   ```bash
   npm uninstall expo-image-picker
   npm install expo-image-picker@~16.0.5
   cd ios && pod install && cd ..
   npx expo run:ios --device
   ```
