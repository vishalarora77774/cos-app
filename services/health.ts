import { Platform, NativeModules } from 'react-native';
import AppleHealthKit from 'react-native-health';
import type {
  HealthKitPermissions,
  HealthInputOptions,
  HealthValue,
} from 'react-native-health';

export interface HealthMetrics {
  steps: number;
  heartRate: number | null;
  sleepHours: number;
  caloriesBurned: number;
  isLoading: boolean;
  error: string | null;
}

/**
 * Get the HealthKit module (either from JS wrapper or native module directly)
 */
const getHealthKitModule = () => {
  // Try JS wrapper first
  if (AppleHealthKit && typeof AppleHealthKit.initHealthKit === 'function') {
    console.log('Using JS wrapper for HealthKit');
    return AppleHealthKit;
  }

  // Fallback to native module directly
  // The package uses NativeModules.AppleHealthKit, but the pod is RNAppleHealthKit
  const nativeModule = NativeModules.AppleHealthKit || NativeModules.RNAppleHealthKit || NativeModules.HealthKit;
  if (nativeModule) {
    console.log('Native module found:', nativeModule ? 'Yes' : 'No');
    console.log('Native module keys:', nativeModule ? Object.keys(nativeModule) : 'N/A');
    console.log('Has initHealthKit:', nativeModule ? typeof nativeModule.initHealthKit : 'N/A');
    
    // Check if methods exist on native module
    if (typeof nativeModule.initHealthKit === 'function') {
      console.log('Using native module directly');
      // Create a wrapper with Constants if needed
      return {
        ...nativeModule,
        Constants: AppleHealthKit?.Constants || {
          Permissions: {
            StepCount: 'StepCount',
            HeartRate: 'HeartRate',
            SleepAnalysis: 'SleepAnalysis',
            ActiveEnergyBurned: 'ActiveEnergyBurned',
          },
        },
      };
    } else {
      // Log what methods ARE available
      const availableMethods = nativeModule ? Object.keys(nativeModule).filter(key => typeof nativeModule[key] === 'function') : [];
      console.warn('Native module exists but initHealthKit is not a function');
      console.warn('Available methods on native module:', availableMethods);
      console.warn('All native module keys:', nativeModule ? Object.keys(nativeModule) : []);
    }
  }

  // Also check the JS wrapper structure
  if (AppleHealthKit) {
    console.log('JS wrapper exists:', !!AppleHealthKit);
    console.log('JS wrapper keys:', Object.keys(AppleHealthKit));
    console.log('JS wrapper has initHealthKit:', typeof AppleHealthKit.initHealthKit);
  }

  return null;
};

/**
 * Check if HealthKit is available on this platform
 */
const isHealthKitAvailable = (): boolean => {
  if (Platform.OS !== 'ios') {
    return false;
  }

  const healthKit = getHealthKitModule();
  
  if (!healthKit) {
    console.warn('HealthKit native module not found. Available modules:', Object.keys(NativeModules));
    return false;
  }

  if (typeof healthKit.initHealthKit !== 'function') {
    console.warn('HealthKit module found but initHealthKit is not a function. Module keys:', Object.keys(healthKit));
    return false;
  }

  return true;
};

/**
 * Initialize HealthKit with required permissions
 */
export const initializeHealthKit = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    // Check if HealthKit is available
    if (!isHealthKitAvailable()) {
      let errorMessage = 'HealthKit is not available. ';
      
      if (Platform.OS !== 'ios') {
        errorMessage += 'HealthKit is only available on iOS devices.';
      } else {
        const nativeModule = NativeModules.AppleHealthKit || NativeModules.RNAppleHealthKit;
        if (!nativeModule) {
          errorMessage += 'The native HealthKit module is not linked. Please:\n';
          errorMessage += '1. Run: cd ios && pod install\n';
          errorMessage += '2. Rebuild the app: npx expo run:ios --clean\n';
          errorMessage += '3. Test on a physical iOS device (simulators do not support HealthKit)';
        } else {
          errorMessage += 'The native module exists but initHealthKit method is not available.\n';
          errorMessage += 'This usually means the app needs to be rebuilt. Try:\n';
          errorMessage += '1. Stop Metro bundler\n';
          errorMessage += '2. Clear cache: npx expo start --clear\n';
          errorMessage += '3. Rebuild: npx expo run:ios --clean';
        }
      }
      
      console.error('HealthKit not available:', errorMessage);
      reject(new Error(errorMessage));
      return;
    }

    const healthKit = getHealthKitModule();
    if (!healthKit) {
      reject(new Error('Failed to get HealthKit module'));
      return;
    }

    const permissions: HealthKitPermissions = {
      permissions: {
        read: [
          healthKit.Constants.Permissions.StepCount,
          healthKit.Constants.Permissions.HeartRate,
          healthKit.Constants.Permissions.SleepAnalysis,
          healthKit.Constants.Permissions.ActiveEnergyBurned,
        ],
        write: [], // We only need read permissions
      },
    };

    healthKit.initHealthKit(permissions, (error: string) => {
      if (error) {
        console.log('Error initializing HealthKit: ', error);
        reject(new Error(error));
        return;
      }
      console.log('HealthKit initialized successfully');
      resolve(true);
    });
  });
};

/**
 * Get today's date range for HealthKit queries
 */
const getTodayDateRange = () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return {
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  };
};

/**
 * Fetch step count for today
 */
export const getTodayStepCount = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    const healthKit = getHealthKitModule();
    if (!healthKit || typeof healthKit.getStepCount !== 'function') {
      reject(new Error('HealthKit getStepCount method not available'));
      return;
    }

    const options: HealthInputOptions = getTodayDateRange();

    healthKit.getStepCount(options, (error: string, results: HealthValue) => {
      if (error) {
        console.log('Error fetching step count: ', error);
        reject(error);
        return;
      }
      resolve(results.value || 0);
    });
  });
};

/**
 * Fetch heart rate samples for today and return the most recent value
 */
export const getTodayHeartRate = (): Promise<number | null> => {
  return new Promise((resolve, reject) => {
    const healthKit = getHealthKitModule();
    if (!healthKit || typeof healthKit.getHeartRateSamples !== 'function') {
      reject(new Error('HealthKit getHeartRateSamples method not available'));
      return;
    }

    const options: HealthInputOptions = getTodayDateRange();

    healthKit.getHeartRateSamples(
      options,
      (error: string, results: HealthValue[]) => {
        if (error) {
          console.log('Error fetching heart rate: ', error);
          reject(error);
          return;
        }
        // Return the most recent heart rate value
        if (results && results.length > 0) {
          const sortedResults = results.sort(
            (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          );
          resolve(sortedResults[0].value || null);
        } else {
          resolve(null);
        }
      }
    );
  });
};

/**
 * Fetch sleep samples for today and calculate total sleep hours
 */
export const getTodaySleepHours = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    const healthKit = getHealthKitModule();
    if (!healthKit || typeof healthKit.getSleepSamples !== 'function') {
      reject(new Error('HealthKit getSleepSamples method not available'));
      return;
    }

    const options: HealthInputOptions = getTodayDateRange();

    healthKit.getSleepSamples(
      options,
      (error: string, results: HealthValue[]) => {
        if (error) {
          console.log('Error fetching sleep data: ', error);
          reject(error);
          return;
        }
        // Calculate total sleep hours from samples
        if (results && results.length > 0) {
          let totalMinutes = 0;
          results.forEach((sample) => {
            const start = new Date(sample.startDate);
            const end = new Date(sample.endDate);
            const duration = (end.getTime() - start.getTime()) / (1000 * 60); // Convert to minutes
            totalMinutes += duration;
          });
          const hours = totalMinutes / 60;
          resolve(Math.round(hours * 10) / 10); // Round to 1 decimal place
        } else {
          resolve(0);
        }
      }
    );
  });
};

/**
 * Fetch active energy burned (calories) for today
 */
export const getTodayCaloriesBurned = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    const healthKit = getHealthKitModule();
    if (!healthKit || typeof healthKit.getActiveEnergyBurned !== 'function') {
      reject(new Error('HealthKit getActiveEnergyBurned method not available'));
      return;
    }

    const options: HealthInputOptions = getTodayDateRange();

    healthKit.getActiveEnergyBurned(
      options,
      (error: string, results: HealthValue[]) => {
        if (error) {
          console.log('Error fetching active energy burned: ', error);
          reject(error);
          return;
        }
        // Sum all calories burned today
        if (results && results.length > 0) {
          const totalCalories = results.reduce(
            (sum, sample) => sum + (sample.value || 0),
            0
          );
          resolve(Math.round(totalCalories));
        } else {
          resolve(0);
        }
      }
    );
  });
};

/**
 * Fetch all health metrics for today
 */
export const getTodayHealthMetrics = async (): Promise<HealthMetrics> => {
  try {
    // Initialize HealthKit if not already initialized
    try {
      await initializeHealthKit();
    } catch (error) {
      // HealthKit might already be initialized, continue
      console.log('HealthKit initialization check:', error);
    }

    // Fetch all metrics in parallel
    const [steps, heartRate, sleepHours, caloriesBurned] = await Promise.all([
      getTodayStepCount().catch(() => 0),
      getTodayHeartRate().catch(() => null),
      getTodaySleepHours().catch(() => 0),
      getTodayCaloriesBurned().catch(() => 0),
    ]);

    return {
      steps,
      heartRate,
      sleepHours,
      caloriesBurned,
      isLoading: false,
      error: null,
    };
  } catch (error) {
    return {
      steps: 0,
      heartRate: null,
      sleepHours: 0,
      caloriesBurned: 0,
      isLoading: false,
      error: error instanceof Error ? error.message : 'Failed to fetch health data',
    };
  }
};

