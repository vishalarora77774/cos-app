import { useEffect, useState, useMemo } from 'react';
import { getDatabase } from '@/database';
import { Doctor } from '@/database/models';
import { Q } from '@nozbe/watermelondb';

/**
 * Hook to get doctor photo URL by provider ID
 * Returns the photo URL if found in database, otherwise null
 * Refreshes when providerId changes
 */
export function useDoctorPhoto(providerId: string | undefined): string | null {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!providerId) {
      setPhotoUrl(null);
      return;
    }

    const loadPhoto = async () => {
      try {
        const database = getDatabase();
        if (!database) {
          return;
        }

        const doctorsCollection = database.collections.get<Doctor>('doctors');
        const doctorRecords = await doctorsCollection
          .query(Q.where('provider_id', providerId))
          .fetch();

        if (doctorRecords.length > 0 && doctorRecords[0].photoUrl) {
          setPhotoUrl(doctorRecords[0].photoUrl);
        } else {
          setPhotoUrl(null);
        }
      } catch (error) {
        console.error('Error loading doctor photo:', error);
        setPhotoUrl(null);
      }
    };

    loadPhoto();
    
    // Set up a subscription to watch for changes
    const database = getDatabase();
    if (database) {
      const doctorsCollection = database.collections.get<Doctor>('doctors');
      const query = doctorsCollection.query(Q.where('provider_id', providerId));
      
      // Subscribe to changes and reload when data changes
      const subscription = query.observe().subscribe((doctors) => {
        if (doctors.length > 0 && doctors[0].photoUrl) {
          setPhotoUrl(doctors[0].photoUrl);
        } else {
          setPhotoUrl(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [providerId]);

  return photoUrl;
}

/**
 * Hook to get multiple doctor photos by provider IDs
 * Returns a map of providerId -> photoUrl
 * Automatically updates when the database changes
 */
export function useDoctorPhotos(providerIds: (string | undefined)[]): Map<string, string> {
  const [photos, setPhotos] = useState<Map<string, string>>(new Map());
  const validIds = useMemo(() => providerIds.filter((id): id is string => !!id), [providerIds.join(',')]);

  useEffect(() => {
    if (validIds.length === 0) {
      setPhotos(new Map());
      return;
    }

    const loadPhotos = async () => {
      try {
        const database = getDatabase();
        if (!database) {
          return;
        }

        const doctorsCollection = database.collections.get<Doctor>('doctors');
        const photoMap = new Map<string, string>();

        // Load photos for all provider IDs
        for (const providerId of validIds) {
          try {
            const doctorRecords = await doctorsCollection
              .query(Q.where('provider_id', providerId))
              .fetch();

            if (doctorRecords.length > 0 && doctorRecords[0].photoUrl) {
              photoMap.set(providerId, doctorRecords[0].photoUrl);
            }
          } catch (error) {
            console.error(`Error loading photo for provider ${providerId}:`, error);
          }
        }

        setPhotos(photoMap);
      } catch (error) {
        console.error('Error loading doctor photos:', error);
        setPhotos(new Map());
      }
    };

    loadPhotos();

    // Set up subscriptions to watch for changes
    const database = getDatabase();
    if (database) {
      const doctorsCollection = database.collections.get<Doctor>('doctors');
      const subscriptions = validIds.map(providerId => {
        const query = doctorsCollection.query(Q.where('provider_id', providerId));
        return query.observe().subscribe((doctors) => {
          setPhotos(prev => {
            const newMap = new Map(prev);
            if (doctors.length > 0 && doctors[0].photoUrl) {
              newMap.set(providerId, doctors[0].photoUrl);
            } else {
              newMap.delete(providerId);
            }
            return newMap;
          });
        });
      });

      return () => {
        subscriptions.forEach(sub => sub.unsubscribe());
      };
    }
  }, [validIds.join(',')]);

  return photos;
}
