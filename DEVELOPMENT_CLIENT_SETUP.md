# Development Client Setup for WatermelonDB

## Why Development Client?

WatermelonDB requires native SQLite modules that **cannot** run in Expo Go. You **must** use a Development Client.

## ✅ Benefits Over Expo Go

1. **Native Modules**: Full access to all native modules (WatermelonDB, HealthKit, etc.)
2. **Better Performance**: Native SQLite is much faster than AsyncStorage
3. **Production Parity**: Same build process as production builds
4. **Full Features**: All WatermelonDB features work (queries, relationships, reactive updates)

## 🚀 Quick Start

### Option 1: Local Development Build (Recommended for Daily Development)

#### For iOS:
```bash
# 1. Stop Metro bundler if running (Ctrl+C)

# 2. Install iOS dependencies
cd ios && pod install && cd ..

# 3. Build and run on iOS Simulator
npx expo run:ios

# Or run on a connected device
npx expo run:ios --device
```

#### For Android:
```bash
# 1. Stop Metro bundler if running (Ctrl+C)

# 2. Build and run on Android Emulator
npx expo run:android

# Or run on a connected device
npx expo run:android --device
```

### Option 2: EAS Build (For Physical Devices or Team Sharing)

```bash
# 1. Install EAS CLI (if not already installed)
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Build development client for iOS
eas build --profile development --platform ios

# 4. Build development client for Android
eas build --profile development --platform android

# 5. Install the build on your device (QR code will be provided)

# 6. Start Metro bundler
npx expo start --dev-client
```

## 📱 After Building

Once you have a development build:

1. **Start Metro bundler:**
   ```bash
   npx expo start --dev-client
   ```
   Or simply:
   ```bash
   npx expo start
   ```
   (Expo will automatically detect you're using a dev client)

2. **Open the app** on your device/simulator (it will connect to Metro automatically)

3. **Development workflow:**
   - Make code changes
   - Press `r` in Metro to reload
   - Or shake device → "Reload"
   - **No need to rebuild** unless you:
     - Add new native modules
     - Change `app.json` plugins
     - Update native dependencies

## 🔄 Daily Development Workflow

**Normal development (most of the time):**
```bash
npx expo start
```
Then open your dev client app - it connects automatically!

**When to rebuild (`npx expo run:ios`):**
- First time setup ✅ (you already did this!)
- After adding new native modules
- After changing `app.json` plugins
- After updating native dependencies (like `expo-sqlite`)
- When you get native module errors

**When to use `--clear` flag:**
- Only when you have cache issues
- When Metro bundler acts weird
- When you suspect stale cache
- **Not needed for normal development**

## 🔄 Migration from AsyncStorage

The current code has AsyncStorage as a fallback. Once you're using a Development Client:

1. ✅ WatermelonDB will work automatically
2. ✅ Data will be stored in SQLite (much faster)
3. ✅ All database features will be available
4. ✅ You can remove AsyncStorage fallback later (optional)

## ⚠️ Important Notes

- **First build takes 5-10 minutes** (compiles native code)
- **Subsequent builds are faster** (only rebuilds changed code)
- **You can't use Expo Go** - it won't work with WatermelonDB
- **Development Client is like a custom Expo Go** - same developer experience

## 🐛 Troubleshooting

### Build Fails?

1. **Clear caches:**
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

3. **For Android - Clean build:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

### Database Still Not Working?

1. Make sure you're using the **Development Client**, not Expo Go
2. Check console logs for database initialization errors
3. Verify `expo-sqlite` is in `package.json` dependencies
4. Rebuild after schema changes: `npx expo run:ios` or `npx expo run:android`

## 📚 Resources

- [Expo Development Builds Docs](https://docs.expo.dev/develop/development-builds/introduction/)
- [WatermelonDB Setup](https://nozbe.github.io/WatermelonDB/Installation.html)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
