# Fix: Cannot find native module 'ExponentImagePicker'

## The Problem

The error occurs because `expo-image-picker` is a native module that needs to be compiled into your app. After adding it to `package.json` and `app.json`, you need to rebuild the app.

## Solution: Clean Rebuild

### Step 1: Stop Metro Bundler
Press `Ctrl+C` in the terminal where Metro is running.

### Step 2: Clean Build (iOS)
```bash
# Navigate to iOS directory
cd ios

# Clean pods
rm -rf Pods Podfile.lock

# Reinstall pods
pod install

# Go back to root
cd ..
```

### Step 3: Clean Build (Android)
```bash
# Navigate to Android directory
cd android

# Clean gradle
./gradlew clean

# Go back to root
cd ..
```

### Step 4: Clear Metro Cache
```bash
npx expo start --clear
```

### Step 5: Rebuild the App

**For iOS:**
```bash
npx expo run:ios
```

**For Android:**
```bash
npx expo run:android
```

## Alternative: Quick Rebuild (if clean doesn't work)

If the above doesn't work, try:

```bash
# Clear all caches
rm -rf node_modules
npm install

# For iOS
cd ios && pod install && cd ..
npx expo run:ios

# For Android
npx expo run:android
```

## Verify Installation

After rebuilding, the image picker should work. You can test it by:
1. Opening a doctor detail page
2. Clicking the pen icon
3. Clicking "Add Photo" or "Change Photo"
4. The image picker should open

## Note

- The first rebuild after adding a native module takes longer (5-10 minutes)
- Make sure `expo-image-picker` is in both `package.json` and `app.json` plugins (already done)
- The app must be rebuilt - just restarting Metro won't work for native modules
