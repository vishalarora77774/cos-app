# Fix: NativeModules.DatabaseBridge is not defined

## The Problem

This error occurs because **WatermelonDB requires native modules** that are not available in Expo Go. You **must create a development build**.

## ⚠️ Important: Expo Go Won't Work

WatermelonDB uses native SQLite modules that require compilation. Expo Go doesn't include these modules, so you **cannot** use Expo Go with WatermelonDB.

## Solution: Create a Development Build

### Option 1: Local Development Build (Recommended for Development)

#### For iOS:
```bash
# 1. Stop Metro bundler if running (Ctrl+C)

# 2. Install iOS dependencies
cd ios && pod install && cd ..

# 3. Build and run on iOS
npx expo run:ios
```

#### For Android:
```bash
# 1. Stop Metro bundler if running (Ctrl+C)

# 2. Build and run on Android
npx expo run:android
```

### Option 2: EAS Build (For Testing on Physical Devices)

```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Login to Expo
eas login

# Build development version for iOS
eas build --profile development --platform ios

# Build development version for Android
eas build --profile development --platform android
```

### Option 3: Prebuild (If you have native folders)

```bash
# Generate native folders if they don't exist
npx expo prebuild

# Then build normally
npx expo run:ios
# or
npx expo run:android
```

## Verify Installation

After building, verify that:
1. ✅ `expo-sqlite` is in `package.json` dependencies
2. ✅ `expo-sqlite` is in `app.json` plugins array
3. ✅ App builds successfully without errors
4. ✅ Database initializes without errors

## What Changed

We added new database tables (`clinics` and `labs`), which requires:
- Schema version update (version 2)
- New models in database initialization
- Native module recompilation

## Troubleshooting

### Still Getting the Error?

1. **Clear all caches:**
   ```bash
   npx expo start --clear
   rm -rf node_modules
   npm install
   ```

2. **For iOS - Reinstall pods:**
   ```bash
   cd ios
   rm -rf Pods Podfile.lock
   pod install
   cd ..
   ```

3. **Delete and rebuild:**
   - Delete the app from your device/simulator
   - Rebuild from scratch

4. **Check app.json:**
   - Ensure `expo-sqlite` is in the plugins array
   - Verify `expo-sqlite` version matches your Expo SDK

### Check Your Setup

```bash
# Verify expo-sqlite is installed
npm list expo-sqlite

# Should show: expo-sqlite@16.0.10 (or similar)
```

## After Successful Build

Once the app builds successfully:
1. The database will initialize automatically
2. You can use all database features
3. Clinics and labs will sync to the database

## Need Help?

- Check WatermelonDB docs: https://nozbe.github.io/WatermelonDB/
- Expo development builds: https://docs.expo.dev/development/introduction/
- Expo SQLite: https://docs.expo.dev/versions/latest/sdk/sqlite/
