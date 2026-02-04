import { useCallback, useEffect, useState } from 'react';
import { getDatabase } from '@/database';
import { Doctor } from '@/database/models';
import { Q } from '@nozbe/watermelondb';

// Dynamic import to prevent errors if native module isn't available
const loadImagePicker = async () => {
  try {
    const ImagePicker = await import('expo-image-picker');
    return ImagePicker.default || ImagePicker;
  } catch (error) {
    console.warn('expo-image-picker not available:', error);
    return null;
  }
};

export interface DoctorData {
  id: string;
  name: string;
  specialty?: string;
  phone?: string;
  email?: string;
  address?: string;
  photoUrl?: string;
  providerId?: string; // Link to Fasten Health provider ID
  clinicId?: string;
  clinicName?: string;
}

export function useDoctor(providerId: string) {
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadDoctor = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const database = getDatabase();
      if (!database) {
        throw new Error('Database not available. Please ensure you are using a Development Client.');
      }

      const doctorsCollection = database.collections.get<Doctor>('doctors');
      const doctorRecords = await doctorsCollection
        .query(Q.where('provider_id', providerId))
        .fetch();

      if (doctorRecords.length > 0) {
        const record = doctorRecords[0];
        setDoctor({
          id: record.id,
          name: record.name,
          specialty: record.specialty || undefined,
          phone: record.phone || undefined,
          email: record.email || undefined,
          address: record.address || undefined,
          photoUrl: record.photoUrl || undefined,
          providerId: record.providerId || undefined,
          clinicId: record.clinicId || undefined,
          clinicName: record.clinicName || undefined,
        });
      } else {
        // Doctor not found in database
        setDoctor(null);
      }
    } catch (err) {
      console.error('❌ Error loading doctor:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [providerId]);

  const updateDoctor = useCallback(async (updates: Partial<DoctorData>) => {
    try {
      const database = getDatabase();
      if (!database) {
        throw new Error('Database not available. Please ensure you are using a Development Client.');
      }

      const doctorsCollection = database.collections.get<Doctor>('doctors');
      const existingRecords = await doctorsCollection
        .query(Q.where('provider_id', providerId))
        .fetch();

      await database.write(async () => {
        if (existingRecords.length > 0) {
          // Update existing record
          const record = existingRecords[0];
          await record.update((doctor) => {
            if (updates.name !== undefined) doctor.name = updates.name;
            if (updates.specialty !== undefined) doctor.specialty = updates.specialty || null;
            if (updates.phone !== undefined) doctor.phone = updates.phone || null;
            if (updates.email !== undefined) doctor.email = updates.email || null;
            if (updates.address !== undefined) doctor.address = updates.address || null;
            if (updates.photoUrl !== undefined) doctor.photoUrl = updates.photoUrl || null;
            if (updates.clinicId !== undefined) doctor.clinicId = updates.clinicId || null;
            if (updates.clinicName !== undefined) doctor.clinicName = updates.clinicName || null;
            doctor.updatedAt = new Date();
          });
          console.log('✅ Updated doctor record in database');
        } else {
          // Create new record
          await doctorsCollection.create((doctor) => {
            doctor.name = updates.name || 'Unknown Doctor';
            doctor.specialty = updates.specialty || null;
            doctor.phone = updates.phone || null;
            doctor.email = updates.email || null;
            doctor.address = updates.address || null;
            doctor.photoUrl = updates.photoUrl || null;
            doctor.providerId = providerId;
            doctor.clinicId = updates.clinicId || null;
            doctor.clinicName = updates.clinicName || null;
            doctor.createdAt = new Date();
            doctor.updatedAt = new Date();
          });
          console.log('✅ Created new doctor record in database');
        }
      });

      // Reload doctor data
      await loadDoctor();
      console.log('✅ Doctor data reloaded from database');
    } catch (err) {
      console.error('❌ Error updating doctor:', err);
      throw err;
    }
  }, [providerId, loadDoctor]);

  const pickImage = useCallback(async (): Promise<string | null> => {
    try {
      // Lazy load ImagePicker
      const ImagePicker = await loadImagePicker();
      if (!ImagePicker) {
        throw new Error('Image picker is not available. Please rebuild the app: npx expo run:ios');
      }

      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access media library is required');
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      return null;
    } catch (err) {
      console.error('❌ Error picking image:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (providerId) {
      loadDoctor();
    }
  }, [providerId, loadDoctor]);

  return {
    doctor,
    isLoading,
    error,
    updateDoctor,
    pickImage,
    refresh: loadDoctor,
  };
}
