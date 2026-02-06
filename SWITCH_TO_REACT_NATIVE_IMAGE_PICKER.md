# Switch to react-native-image-picker

## What Changed

We've switched from `expo-image-picker` to `react-native-image-picker` because:
- More reliable native module linking
- Better compatibility with React Native
- Doesn't depend on Expo's module system
- Well-maintained and widely used

## Installation Steps

### Step 1: Install the Package

```bash
npm install react-native-image-picker
```

### Step 2: Install iOS Pods

```bash
cd ios
export LANG=en_US.UTF-8
pod install
cd ..
```

### Step 3: Rebuild the App

```bash
npx expo run:ios --device
```

## What's Already Done

✅ Code updated in `hooks/use-doctor.ts` to use `react-native-image-picker`
✅ iOS permissions already configured in `Info.plist`
✅ Package.json updated to include the new dependency

## Permissions

The app already has the required permissions:
- iOS: `NSPhotoLibraryUsageDescription` in `Info.plist` ✅
- Android: Will be handled automatically

## API Differences

The new library uses a callback-based API instead of promises, but the hook handles this internally. The usage remains the same:

```typescript
const { pickImage } = useDoctor(providerId);
const imageUri = await pickImage();
```

## Troubleshooting

If you still get "Cannot find native module":

1. **Verify pod is installed:**
   ```bash
   ls ios/Pods/ | grep -i image
   ```

2. **Check if it's in Podfile.lock:**
   ```bash
   grep -i "image-picker" ios/Podfile.lock
   ```

3. **Clean and rebuild:**
   ```bash
   cd ios
   rm -rf Pods Podfile.lock build
   pod install
   cd ..
   npx expo run:ios --device
   ```

## Benefits

- ✅ More reliable native module linking
- ✅ Better error handling
- ✅ Works with standard React Native setup
- ✅ Doesn't require Expo-specific configuration
