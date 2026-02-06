import { useCallback, useEffect, useState } from 'react';
import { getDatabase } from '@/database';
import { HealthDetails } from '@/database/models';
import { processFastenHealthDataFromFile } from '@/services/fasten-health-processor';

export interface HealthDetailsData {
  height?: string;
  weight?: string;
  bloodType?: string;
  bloodPressureSystolic?: string;
  bloodPressureDiastolic?: string;
  usesCpap: boolean;
  chronicConditions: string[];
}

export function useHealthDetails() {
  const [healthDetails, setHealthDetails] = useState<HealthDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadHealthDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const database = getDatabase();
      if (!database) {
        throw new Error('Database not available. Please ensure you are using a Development Client.');
      }

      const healthDetailsCollection = database.collections.get<HealthDetails>('health_details');
      const healthDetailsRecords = await healthDetailsCollection.query().fetch();

      if (healthDetailsRecords.length > 0) {
        const record = healthDetailsRecords[0];
        setHealthDetails({
          height: record.height || undefined,
          weight: record.weight || undefined,
          bloodType: record.bloodType || undefined,
          bloodPressureSystolic: record.bloodPressureSystolic || undefined,
          bloodPressureDiastolic: record.bloodPressureDiastolic || undefined,
          usesCpap: record.usesCpap,
          chronicConditions: record.chronicConditions ? JSON.parse(record.chronicConditions) : [],
        });
      } else {
        // Load from file processing and sync to database
        const processedData = await processFastenHealthDataFromFile();
        if (processedData.healthDetails) {
          await syncHealthDetailsToDatabase(processedData.healthDetails);
          setHealthDetails({
            height: processedData.healthDetails.height,
            weight: processedData.healthDetails.weight,
            bloodType: processedData.healthDetails.bloodType,
            bloodPressureSystolic: processedData.healthDetails.bloodPressureSystolic,
            bloodPressureDiastolic: processedData.healthDetails.bloodPressureDiastolic,
            usesCpap: processedData.healthDetails.usesCpap,
            chronicConditions: processedData.healthDetails.chronicConditions || [],
          });
        }
      }
    } catch (err) {
      console.error('❌ Error loading health details:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncHealthDetailsToDatabase = useCallback(async (healthDetails: HealthDetailsData) => {
    try {
      const database = getDatabase();
      if (!database) {
        console.warn('⚠️ Database not available for syncing health details');
        return;
      }

      const healthDetailsCollection = database.collections.get<HealthDetails>('health_details');
      const existingRecords = await healthDetailsCollection.query().fetch();

      if (existingRecords.length > 0) {
        // Update existing record
        await database.write(async () => {
          const record = existingRecords[0];
          await record.update((healthDetail) => {
            healthDetail.height = healthDetails.height || null;
            healthDetail.weight = healthDetails.weight || null;
            healthDetail.bloodType = healthDetails.bloodType || null;
            healthDetail.bloodPressureSystolic = healthDetails.bloodPressureSystolic || null;
            healthDetail.bloodPressureDiastolic = healthDetails.bloodPressureDiastolic || null;
            healthDetail.usesCpap = healthDetails.usesCpap;
            healthDetail.chronicConditions = healthDetails.chronicConditions.length > 0 
              ? JSON.stringify(healthDetails.chronicConditions) 
              : null;
            healthDetail.updatedAt = new Date();
            healthDetail.syncedAt = new Date();
          });
        });
      } else {
        // Create new record
        await database.write(async () => {
          await healthDetailsCollection.create((healthDetail) => {
            healthDetail.height = healthDetails.height || null;
            healthDetail.weight = healthDetails.weight || null;
            healthDetail.bloodType = healthDetails.bloodType || null;
            healthDetail.bloodPressureSystolic = healthDetails.bloodPressureSystolic || null;
            healthDetail.bloodPressureDiastolic = healthDetails.bloodPressureDiastolic || null;
            healthDetail.usesCpap = healthDetails.usesCpap;
            healthDetail.chronicConditions = healthDetails.chronicConditions.length > 0 
              ? JSON.stringify(healthDetails.chronicConditions) 
              : null;
            healthDetail.patientId = null;
            healthDetail.createdAt = new Date();
            healthDetail.updatedAt = new Date();
            healthDetail.syncedAt = new Date();
          });
        });
      }
    } catch (err) {
      console.error('❌ Error syncing health details to database:', err);
    }
  }, []);

  const updateHealthDetails = useCallback(async (updates: Partial<HealthDetailsData>) => {
    try {
      const database = getDatabase();
      if (!database) {
        throw new Error('Database not available. Please ensure you are using a Development Client.');
      }

      // Prepare the updated data
      const currentData = healthDetails || {
        usesCpap: false,
        chronicConditions: [],
      };
      const updatedData: HealthDetailsData = {
        height: updates.height !== undefined ? updates.height : currentData.height,
        weight: updates.weight !== undefined ? updates.weight : currentData.weight,
        bloodType: updates.bloodType !== undefined ? updates.bloodType : currentData.bloodType,
        bloodPressureSystolic: updates.bloodPressureSystolic !== undefined ? updates.bloodPressureSystolic : currentData.bloodPressureSystolic,
        bloodPressureDiastolic: updates.bloodPressureDiastolic !== undefined ? updates.bloodPressureDiastolic : currentData.bloodPressureDiastolic,
        usesCpap: updates.usesCpap !== undefined ? updates.usesCpap : currentData.usesCpap,
        chronicConditions: updates.chronicConditions !== undefined ? updates.chronicConditions : currentData.chronicConditions,
      };

      const healthDetailsCollection = database.collections.get<HealthDetails>('health_details');
      const existingRecords = await healthDetailsCollection.query().fetch();

      await database.write(async () => {
        if (existingRecords.length > 0) {
          // Update existing record
          const record = existingRecords[0];
          await record.update((healthDetail) => {
            healthDetail.height = updatedData.height || null;
            healthDetail.weight = updatedData.weight || null;
            healthDetail.bloodType = updatedData.bloodType || null;
            healthDetail.bloodPressureSystolic = updatedData.bloodPressureSystolic || null;
            healthDetail.bloodPressureDiastolic = updatedData.bloodPressureDiastolic || null;
            healthDetail.usesCpap = updatedData.usesCpap;
            healthDetail.chronicConditions = updatedData.chronicConditions.length > 0 
              ? JSON.stringify(updatedData.chronicConditions) 
              : null;
            healthDetail.updatedAt = new Date();
          });
          console.log('✅ Updated existing health details record in database');
        } else {
          // Create new record
          await healthDetailsCollection.create((healthDetail) => {
            healthDetail.height = updatedData.height || null;
            healthDetail.weight = updatedData.weight || null;
            healthDetail.bloodType = updatedData.bloodType || null;
            healthDetail.bloodPressureSystolic = updatedData.bloodPressureSystolic || null;
            healthDetail.bloodPressureDiastolic = updatedData.bloodPressureDiastolic || null;
            healthDetail.usesCpap = updatedData.usesCpap;
            healthDetail.chronicConditions = updatedData.chronicConditions.length > 0 
              ? JSON.stringify(updatedData.chronicConditions) 
              : null;
            healthDetail.patientId = null;
            healthDetail.createdAt = new Date();
            healthDetail.updatedAt = new Date();
          });
          console.log('✅ Created new health details record in database');
        }
      });

      // Reload health details to reflect changes
      await loadHealthDetails();
      console.log('✅ Health details reloaded from database');
    } catch (err) {
      console.error('❌ Error updating health details:', err);
      throw err;
    }
  }, [healthDetails, loadHealthDetails]);

  useEffect(() => {
    loadHealthDetails();
  }, [loadHealthDetails]);

  return {
    healthDetails,
    isLoading,
    error,
    updateHealthDetails,
    refresh: loadHealthDetails,
  };
}
