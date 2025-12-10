# Deep Linking Testing Guide

## Configuration Summary

Your app is configured with:
- **Custom Scheme**: `cos://` (for OAuth redirects and deep links)
- **Bundle Identifier (iOS)**: `com.joinabrightfuture.cos`
- **Package Name (Android)**: `com.joinabrightfuture.cos`
- **Universal Links (iOS)**: `applinks:joinabrightfuture.com`
- **App Links (Android)**: `https://joinabrightfuture.com`

## Available Redirect URLs

- `cos://` - Opens the app
- `cos://Home` - Opens Home screen
- `cos://oauth/callback` - OAuth callback URL
- `cos://auth/callback` - Auth callback URL
- `cos://Home/appointments` - Deep link to specific route
- Any route in your app: `cos://[route-path]`

## Testing Methods

### Method 1: Terminal Testing (Recommended for Quick Tests)

#### iOS Simulator:
```bash
# Test basic deep link
xcrun simctl openurl booted "cos://"

# Test specific route
xcrun simctl openurl booted "cos://Home"

# Test OAuth callback with parameters
xcrun simctl openurl booted "cos://oauth/callback?code=abc123&state=xyz"

# Test with query parameters
xcrun simctl openurl booted "cos://Home/appointments?id=123"
```

#### Android Emulator:
```bash
# Test basic deep link
adb shell am start -W -a android.intent.action.VIEW -d "cos://"

# Test specific route
adb shell am start -W -a android.intent.action.VIEW -d "cos://Home"

# Test OAuth callback with parameters
adb shell am start -W -a android.intent.action.VIEW -d "cos://oauth/callback?code=abc123&state=xyz"

# Test with query parameters
adb shell am start -W -a android.intent.action.VIEW -d "cos://Home/appointments?id=123"
```

### Method 2: Browser Testing (Mobile Device)

1. **Open Safari (iOS) or Chrome (Android)**
2. **Type in address bar**: `cos://Home`
3. **Expected**: App should open and navigate to Home screen

**Note**: Some browsers may show a warning. Tap "Open" to proceed.

### Method 3: Notes App Testing

1. **Create a note** with the deep link: `cos://Home/appointments`
2. **Tap the link**
3. **Expected**: App opens and navigates to the specified route

### Method 4: QR Code Testing

1. **Generate a QR code** with URL: `cos://Home`
2. **Scan with device camera**
3. **Expected**: App opens automatically

### Method 5: OAuth Provider Testing

#### Setup:
1. **Configure OAuth provider** (Google, Apple, etc.) with redirect URL:
   - `cos://oauth/callback` or
   - `cos://auth/callback`

2. **Complete OAuth flow**:
   - User clicks "Sign in with [Provider]"
   - Redirects to provider
   - After authentication, provider redirects to `cos://oauth/callback?code=...`
   - App should open and handle the callback

#### Verify:
- App opens automatically after OAuth
- Callback parameters are received correctly
- User is authenticated and navigated appropriately

### Method 6: Universal Links Testing (Requires Domain Setup)

**Prerequisites:**
1. Set up Apple App Site Association (AASA) file for iOS
2. Set up Digital Asset Links for Android

#### iOS Universal Links:
1. **Create AASA file** at: `https://joinabrightfuture.com/.well-known/apple-app-site-association`
   - The file should reference bundle ID: `com.joinabrightfuture.cos`
2. **Test with**:
   ```bash
   xcrun simctl openurl booted "https://joinabrightfuture.com/Home"
   ```

#### Android App Links:
1. **Create assetlinks.json** at: `https://joinabrightfuture.com/.well-known/assetlinks.json`
   - The file should reference package name: `com.joinabrightfuture.cos`
2. **Test with**:
   ```bash
   adb shell am start -W -a android.intent.action.VIEW -d "https://joinabrightfuture.com/Home"
   ```

## Testing Checklist

### ✅ Basic Deep Linking
- [ ] App opens with `cos://`
- [ ] App navigates to specific routes (e.g., `cos://Home`)
- [ ] Query parameters are parsed correctly
- [ ] App handles invalid routes gracefully

### ✅ OAuth Redirects
- [ ] OAuth provider redirects to `cos://oauth/callback`
- [ ] App opens automatically after OAuth
- [ ] Callback parameters (code, state) are received
- [ ] User is authenticated successfully

### ✅ Universal Links (if configured)
- [ ] iOS: Links from Safari open in app
- [ ] Android: Links from Chrome open in app
- [ ] Links work from other apps (Messages, Email, etc.)

### ✅ Edge Cases
- [ ] App handles deep links when already open
- [ ] App handles deep links when closed
- [ ] App handles deep links with invalid parameters
- [ ] App handles deep links to non-existent routes

## Debugging Tips

### Check if Deep Link is Received:
Add logging in your app's root layout or index file:
```typescript
import * as Linking from 'expo-linking';
import { useEffect } from 'react';

useEffect(() => {
  // Handle initial URL (app opened from deep link)
  Linking.getInitialURL().then((url) => {
    if (url) {
      console.log('Initial URL:', url);
    }
  });

  // Handle URL changes (app already open)
  const subscription = Linking.addEventListener('url', ({ url }) => {
    console.log('Deep link received:', url);
  });

  return () => subscription.remove();
}, []);
```

### Verify Configuration:
1. **iOS**: Check `ios/CoS/Info.plist` for `CFBundleURLSchemes`
2. **Android**: Check `android/app/src/main/AndroidManifest.xml` for intent filters
3. **Expo**: Verify `app.json` has correct `scheme` value

### Common Issues:

1. **App doesn't open from deep link**:
   - Verify scheme matches in `app.json` and native configs
   - Rebuild native apps after config changes
   - Check if app is installed and scheme is registered

2. **Route not found**:
   - Verify route exists in your app structure
   - Check Expo Router routing configuration

3. **OAuth callback not working**:
   - Verify redirect URL matches exactly in OAuth provider
   - Check if callback handler is implemented
   - Ensure URL parameters are parsed correctly

## Next Steps

1. **Set up AASA/assetlinks.json** files on your server at `joinabrightfuture.com`
2. **Test with your OAuth provider** (if applicable) - use redirect URL: `cos://oauth/callback`
3. **Implement deep link handling** in your app code
4. **Test on both iOS and Android devices**
5. **Rebuild native apps** after configuration changes:
   ```bash
   # iOS
   npx expo run:ios
   
   # Android
   npx expo run:android
   ```

## Quick Test Commands

```bash
# iOS - Test Home route
xcrun simctl openurl booted "cos://Home"

# Android - Test Home route  
adb shell am start -W -a android.intent.action.VIEW -d "cos://Home"

# iOS - Test OAuth callback
xcrun simctl openurl booted "cos://oauth/callback?code=test123"

# Android - Test OAuth callback
adb shell am start -W -a android.intent.action.VIEW -d "cos://oauth/callback?code=test123"
```

