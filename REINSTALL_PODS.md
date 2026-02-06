# Fix: No Expo Pods Installed

## The Problem

You have a `Pods` directory but **no Expo pods are installed**. This is why `ExpoImagePicker` is missing.

## Solution: Reinstall All Pods

Run these commands in your terminal:

```bash
# Step 1: Navigate to iOS directory
cd ios

# Step 2: Clean everything
rm -rf Pods Podfile.lock build

# Step 3: Set encoding (fixes CocoaPods issues)
export LANG=en_US.UTF-8

# Step 4: Install pods (this will install ALL pods including ExpoImagePicker)
pod install

# Step 5: Go back to root
cd ..
```

## Verify Installation

After `pod install` completes, check:

```bash
# Should show ExpoImagePicker and other Expo pods
ls ios/Pods/ | grep -i "^Expo"

# Specifically check for ExpoImagePicker
ls ios/Pods/ExpoImagePicker
```

You should see:
- `ExpoImagePicker`
- `ExpoModulesCore`
- `ExpoSQLite`
- And other Expo pods

## Then Rebuild

After pods are installed:

```bash
npx expo run:ios --device
```

## Expected Output

When `pod install` runs successfully, you should see in the output:
```
Installing ExpoImagePicker (16.0.6)
```

If you don't see this, there might be an issue with:
1. `expo-image-picker` not being in `package.json` (but it is)
2. `expo-image-picker` not being in `app.json` plugins (but it is)
3. Node modules not being installed properly

## Troubleshooting

If `pod install` fails or doesn't install ExpoImagePicker:

1. **Reinstall node modules:**
   ```bash
   rm -rf node_modules
   npm install
   ```

2. **Then try pod install again:**
   ```bash
   cd ios
   export LANG=en_US.UTF-8
   pod install
   cd ..
   ```

3. **Check autolinking:**
   ```bash
   npx expo-modules-autolinking resolve --platform ios | grep image-picker
   ```

If autolinking doesn't show `expo-image-picker`, there's a configuration issue.
