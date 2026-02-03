import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { schema } from './schema';
import * as models from './models';

// Lazy database initialization for Expo compatibility
let databaseInstance: Database | null = null;

export function getDatabase(): Database {
  if (databaseInstance) {
    return databaseInstance;
  }

  // For Expo, we use JSI mode with expo-sqlite for better performance
  const adapter = new SQLiteAdapter({
    schema,
    // migrations, // Uncomment when you have migrations
    dbName: 'cos_database', // Database name
    jsi: true, // Enable JSI mode for Expo (requires expo-sqlite)
    onSetUpError: (error) => {
      // Database failed to load -- offer the user to reload the app or log out
      console.error('Database setup error:', error);
    },
  });

  // Create the Watermelon database
  databaseInstance = new Database({
    adapter,
    modelClasses: [
      models.Appointment,
      models.Medication,
      models.MedicalReport,
      models.Doctor,
      models.HealthMetric,
    ],
  });

  return databaseInstance;
}

// Note: Don't call getDatabase() at module level for Expo compatibility
// Use getDatabase() or useDatabase() hook instead

// Export models for easy access
export * from './models';
