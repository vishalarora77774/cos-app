# Database Initialization Error Fix

## Error: "Cannot read property 'initializeJSI' of null"

This error occurs when WatermelonDB's JSI (JavaScript Interface) mode can't initialize properly. This is common after:
- Adding new database models (Clinic, Lab)
- Schema version changes
- Installing/updating expo-sqlite

## Quick Fix Steps

### 1. Stop Metro Bundler
Press `Ctrl+C` in the terminal where Metro is running

### 2. Clear Cache and Rebuild
```bash
# Clear Metro cache
npx expo start --clear

# For iOS - Reinstall pods and rebuild
cd ios && pod install && cd ..
npx expo run:ios

# For Android - Rebuild
npx expo run:android
```

### 3. If Error Persists - Disable JSI Temporarily

Edit `database/index.ts` and change:
```typescript
jsi: true,  // Change this to false
```

to:
```typescript
jsi: false,  // Disable JSI mode temporarily
```

Then restart the app. Note: This will be slower but should work.

### 4. Verify expo-sqlite Installation

```bash
npx expo install expo-sqlite
```

## What Changed

The database schema was updated to version 2 to add:
- `clinics` table
- `labs` table

These new tables require the app to be rebuilt so the native SQLite module can recognize the new schema.

## Prevention

After any schema changes:
1. Always increment schema version in `database/schema.ts`
2. Rebuild the app (don't just reload)
3. Test database initialization

## Still Having Issues?

1. Check that `DatabaseProvider` wraps your app in `app/_layout.tsx`
2. Verify all models are included in `database/index.ts` modelClasses array
3. Check console for other error messages
4. Try deleting the app and reinstalling (this clears the database)
