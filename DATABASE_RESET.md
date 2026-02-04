# Fix: "no such column: doctors.provider_id"

## The Problem

The database schema was updated to version 6 to add `photo_url` and `provider_id` columns to the `doctors` table, but your existing database still has the old schema.

## Solution: Reset Database (Development)

For development, the easiest fix is to delete the app and reinstall it. This will recreate the database with the new schema.

### Option 1: Delete App and Reinstall (Recommended for Development)

1. **Delete the app from your device/simulator:**
   - Long press the app icon → Delete App
   - Or in Xcode: Product → Clean Build Folder (Cmd+Shift+K)

2. **Rebuild and reinstall:**
   ```bash
   npx expo run:ios
   ```
   Or run from Xcode

3. **The database will be recreated** with the new schema (version 6)

### Option 2: Use Migration (Already Created)

I've created a migration file that will automatically add the columns when the app starts. However, if you're still getting the error, it means:

1. The migration hasn't run yet, OR
2. The database was created before migrations were enabled

**To force migration:**
- Delete the app and reinstall (Option 1) - this is easiest for development

## Verify Migration

After reinstalling, check the console for:
- `✅ Database initialized successfully`
- No errors about missing columns

## For Production

When deploying to production, the migration will automatically run when users update to the new version. The migration file (`database/migrations.ts`) is already set up.

## Quick Fix Command

```bash
# Stop Metro
# Delete app from device
# Then rebuild:
npx expo run:ios
```

The database will be recreated with the correct schema.
