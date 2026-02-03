# Expo Setup for WatermelonDB

## Installation Steps

1. **Install expo-sqlite** (required for Expo):
   ```bash
   npx expo install expo-sqlite
   ```

2. **Install WatermelonDB packages** (if not already done):
   ```bash
   npm install @nozbe/watermelondb @nozbe/with-observables --legacy-peer-deps
   ```

3. **For iOS**, run pod install:
   ```bash
   cd ios && pod install && cd ..
   ```

## Important Notes

- The database is initialized **lazily** (only when needed) to ensure native modules are ready
- JSI mode is enabled (`jsi: true`) for better performance with Expo
- The `DatabaseProvider` handles initialization automatically
- Always use the `useDatabase()` hook instead of importing database directly

## Troubleshooting

### Error: "NativeModules.DatabaseBridge is not defined"

This means:
1. `expo-sqlite` is not installed - run `npx expo install expo-sqlite`
2. Native modules aren't linked - run `cd ios && pod install` for iOS
3. App needs to be rebuilt - stop Metro and restart with `npx expo start --clear`

### Database not initializing

- Check that `DatabaseProvider` wraps your app in `app/_layout.tsx`
- Ensure `expo-sqlite` is installed and linked
- Check console for setup errors

## Usage

```typescript
import { useDatabase, useDatabaseReady } from '@/database/DatabaseProvider';

function MyComponent() {
  const isReady = useDatabaseReady();
  const database = useDatabase(); // Throws if not ready
  
  if (!isReady) {
    return <LoadingScreen />;
  }
  
  // Use database...
}
```
