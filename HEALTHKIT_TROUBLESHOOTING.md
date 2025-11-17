# HealthKit Troubleshooting Guide

## Error: `AppleHealthKit.default.initHealthKit is not a function`

This error occurs when the native HealthKit module isn't properly linked or the app hasn't been rebuilt after installing the package.

## Solution Steps

### 1. ✅ Verify Pod Installation
The CocoaPods installation should have completed successfully. You can verify by checking:
```bash
cd ios
pod install
```

You should see `RNAppleHealthKit` in the output.

### 2. 🔄 Rebuild the iOS App

**IMPORTANT**: After installing `react-native-health`, you MUST rebuild the app from scratch. The native module won't be available until you do this.

#### Option A: Using Expo CLI
```bash
# Clean build
npx expo run:ios --clean

# Or if using development build
npx expo prebuild --clean
npx expo run:ios
```

#### Option B: Using Xcode
1. Open `ios/CoS.xcworkspace` in Xcode (NOT `.xcodeproj`)
2. Product → Clean Build Folder (Shift + Cmd + K)
3. Product → Build (Cmd + B)
4. Run on device (Cmd + R)

### 3. ✅ Verify HealthKit Capability in Xcode

1. Open `ios/CoS.xcworkspace` in Xcode
2. Select the `CoS` target
3. Go to "Signing & Capabilities" tab
4. Click "+ Capability"
5. Add "HealthKit"
6. Ensure it shows a checkmark

### 4. ✅ Test on Physical Device

HealthKit **does NOT work on simulators**. You must test on a physical iOS device.

### 5. ✅ Check Native Module Availability

The code now includes a check to verify HealthKit is available:
```typescript
const isHealthKitAvailable = (): boolean => {
  return Platform.OS === 'ios' && AppleHealthKit != null && typeof AppleHealthKit.initHealthKit === 'function';
};
```

If you still see the error after rebuilding, the module isn't linked. Check:

1. **Verify the module is in Podfile.lock**:
   ```bash
   grep -i "RNAppleHealthKit" ios/Podfile.lock
   ```

2. **Check if the pod is installed**:
   ```bash
   cd ios
   pod list | grep -i health
   ```

3. **Reinstall pods**:
   ```bash
   cd ios
   rm -rf Pods Podfile.lock
   pod install
   ```

### 6. ✅ Verify Import Statement

The import should be:
```typescript
import AppleHealthKit from 'react-native-health';
```

NOT:
```typescript
import * as AppleHealthKit from 'react-native-health';
// or
import { AppleHealthKit } from 'react-native-health';
```

## Common Issues

### Issue: Module not found after rebuild
**Solution**: 
- Delete `node_modules` and reinstall: `npm install`
- Clean Xcode build folder
- Rebuild app

### Issue: "HealthKit is not available" error
**Solution**:
- Ensure you're testing on a physical iOS device (not simulator)
- Verify HealthKit capability is enabled in Xcode
- Rebuild the app

### Issue: Permissions not showing
**Solution**:
- Check `Info.plist` has `NSHealthShareUsageDescription` and `NSHealthUpdateUsageDescription`
- Delete app from device and reinstall
- Check iOS Settings → Privacy → Health → CoS

## Verification Checklist

- [ ] `react-native-health` is in `package.json`
- [ ] `pod install` completed successfully
- [ ] `RNAppleHealthKit` appears in pod installation output
- [ ] HealthKit capability added in Xcode
- [ ] App rebuilt from scratch (not just reloaded)
- [ ] Testing on physical iOS device
- [ ] `Info.plist` has HealthKit permission descriptions
- [ ] `CoS.entitlements` has HealthKit enabled

## Next Steps After Fix

Once the app is rebuilt and running on a device:

1. Navigate to "Today's Schedule" screen
2. iOS will show permission dialog automatically
3. Grant permissions for the health data types
4. Health metrics should appear in the UI

## Still Having Issues?

If the error persists after following all steps:

1. Check the Xcode console for native module errors
2. Verify the app bundle includes the HealthKit framework
3. Check that the app's deployment target is iOS 12.0 or higher
4. Ensure you're using the correct import syntax (default import)

