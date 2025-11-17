# Health App Permissions Flow

## How Permissions Work in This Implementation

### Step-by-Step Permission Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. App Launch                                                │
│    User opens "Today's Schedule" screen                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Component Mounts                                         │
│    useEffect hook triggers in today-schedule.tsx            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Fetch Health Data Called                                  │
│    getTodayHealthMetrics() is invoked                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Initialize HealthKit                                      │
│    initializeHealthKit() is called                           │
│    This is where permissions are requested!                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. iOS Permission Dialog Appears                             │
│    ┌─────────────────────────────────────┐                 │
│    │  "CoS" Would Like to Access          │                 │
│    │  Your Health Data                     │                 │
│    │                                       │                 │
│    │  This app needs access to your        │                 │
│    │  health data to display your daily    │                 │
│    │  activity metrics including steps,    │                 │
│    │  sleep, heart rate, and calories      │                 │
│    │  burned.                              │                 │
│    │                                       │                 │
│    │  [Turn All Categories On]            │                 │
│    │  [Don't Allow]  [Allow]               │                 │
│    └─────────────────────────────────────┘                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌───────────────┐          ┌──────────────────┐
│ User Allows   │          │ User Denies       │
│ Permissions   │          │ Permissions       │
└───────┬───────┘          └────────┬─────────┘
        │                           │
        ▼                           ▼
┌──────────────────────┐   ┌──────────────────────┐
│ 6a. Success Path     │   │ 6b. Error Path       │
│ - HealthKit          │   │ - Error message      │
│   initialized        │   │   stored in state    │
│ - Data fetching      │   │ - UI shows error     │
│   begins             │   │   message            │
│ - Metrics displayed  │   │ - No data shown      │
│   on UI              │   │                      │
└──────────────────────┘   └──────────────────────┘
```

## Code Flow Details

### 1. **Component Mount** (`today-schedule.tsx`)
```typescript
useEffect(() => {
  const fetchHealthData = async () => {
    setHealthMetrics((prev) => ({ ...prev, isLoading: true }));
    try {
      const metrics = await getTodayHealthMetrics(); // ← Triggers permission request
      setHealthMetrics(metrics);
    } catch (error) {
      // Handle error
    }
  };
  fetchHealthData();
}, []);
```

### 2. **Permission Request** (`services/health.ts`)
```typescript
export const initializeHealthKit = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const permissions: HealthKitPermissions = {
      permissions: {
        read: [
          AppleHealthKit.Constants.Permissions.StepCount,      // ← Requested
          AppleHealthKit.Constants.Permissions.HeartRate,      // ← Requested
          AppleHealthKit.Constants.Permissions.SleepAnalysis,  // ← Requested
          AppleHealthKit.Constants.Permissions.ActiveEnergyBurned, // ← Requested
        ],
      },
    };

    // ⚠️ THIS IS WHERE THE PERMISSION DIALOG APPEARS ⚠️
    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      if (error) {
        reject(error); // User denied or error occurred
        return;
      }
      resolve(true); // Permissions granted!
    });
  });
};
```

### 3. **What Happens After Permission Grant**

Once permissions are granted:
- HealthKit is initialized
- The app can now read health data
- Data fetching functions are called:
  - `getTodayStepCount()`
  - `getTodayHeartRate()`
  - `getTodaySleepHours()`
  - `getTodayCaloriesBurned()`
- Data is displayed in the UI

## Permission States

### First Time User
1. **No permissions granted yet**
2. When `initHealthKit()` is called → iOS shows permission dialog
3. User sees the description from `Info.plist`
4. User chooses "Allow" or "Don't Allow"

### Permission Already Granted
1. **Permissions already exist**
2. When `initHealthKit()` is called → No dialog appears
3. HealthKit initializes silently
4. Data fetching proceeds immediately

### Permission Denied
1. **User previously denied**
2. When `initHealthKit()` is called → Returns error
3. Error is caught and displayed in UI
4. User can manually grant permissions in iOS Settings:
   - Settings → Privacy & Security → Health → CoS

## Key Points

### ✅ Automatic Permission Request
- **No manual permission request needed** - iOS handles it automatically
- The `initHealthKit()` call triggers the system permission dialog
- This happens the **first time** the function is called

### ✅ Permission Descriptions
- The text shown in the dialog comes from `Info.plist`:
  - `NSHealthShareUsageDescription` - for reading data
  - `NSHealthUpdateUsageDescription` - for writing data

### ✅ Granular Permissions
- We request **specific** data types:
  - Steps
  - Heart Rate
  - Sleep
  - Calories
- User can grant/deny each category individually in the dialog

### ✅ One-Time Request
- Permission dialog appears **only once** (first time)
- After that, iOS remembers the user's choice
- To change permissions, user must go to iOS Settings

## Testing Permissions

### To Test Permission Flow:
1. **First Launch**: Delete app and reinstall → Permission dialog should appear
2. **Grant Permissions**: Allow all categories → Data should load
3. **Deny Permissions**: Don't allow → Error message should appear
4. **Change Permissions**: Settings → Privacy → Health → CoS → Toggle categories

### To Reset Permissions (for testing):
```bash
# On iOS device, go to:
Settings → Privacy & Security → Health → CoS
# Toggle permissions off/on
```

## Error Handling

If permissions are denied:
```typescript
// In getTodayHealthMetrics()
catch (error) {
  return {
    steps: 0,
    heartRate: null,
    sleepHours: 0,
    caloriesBurned: 0,
    isLoading: false,
    error: 'Failed to fetch health data', // ← Shown in UI
  };
}
```

The UI will display:
- Loading state while requesting permissions
- Error message if permissions denied
- Health metrics if permissions granted

