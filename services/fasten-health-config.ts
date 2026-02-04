/**
 * Fasten Health Data Configuration
 * 
 * This file allows you to easily switch between original and mock data
 * for testing purposes.
 */

/**
 * Set to true to use mock data, false to use original data
 * You can also set this via environment variable: EXPO_PUBLIC_USE_MOCK_DATA=true
 * 
 * IMPORTANT: Default is false (uses real/original data)
 * The app will use original data by default unless explicitly set to use mock data.
 * 
 * To use original data (default):
 * - Leave this as false, OR
 * - Set EXPO_PUBLIC_USE_MOCK_DATA=false, OR
 * - Don't set the environment variable
 * 
 * To use mock data:
 * - Set this to true, OR
 * - Set EXPO_PUBLIC_USE_MOCK_DATA=true
 */
export const USE_MOCK_DATA = false;

/**
 * Get the data file path based on configuration
 */
export function getFastenHealthDataPath(): string {
  return USE_MOCK_DATA 
    ? '../data/mock-fasten-health-data.json'
    : '../data/fasten-health-data.json';
}

/**
 * Get the data file name for logging
 */
export function getFastenHealthDataName(): string {
  return USE_MOCK_DATA ? 'mock' : 'fasten-health-data';
}
