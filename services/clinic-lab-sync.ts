/**
 * Clinic and Lab Database Sync Service
 * 
 * This service handles storing and retrieving clinics and labs from the local database.
 * It's designed to be performant and avoid impacting app performance by:
 * - Batch operations
 * - Efficient queries
 * - Caching strategies
 */

import { Database } from '@nozbe/watermelondb';
import { ProcessedClinic, ProcessedLab } from './fasten-health-processor';
import { Clinic, Lab } from '@/database/models';
import { getDatabase } from '@/database';

/**
 * Stores clinics in the database (batch operation)
 * Replaces all existing clinics with the new set
 */
export async function syncClinicsToDatabase(
  clinics: ProcessedClinic[],
  database?: Database
): Promise<void> {
  const db = database || getDatabase();
  const clinicsCollection = db.get<Clinic>('clinics');

  try {
    // Delete all existing clinics
    const existingClinics = await clinicsCollection.query().fetch();
    await db.write(async () => {
      for (const clinic of existingClinics) {
        await clinic.destroyPermanently();
      }
    });

    // Insert new clinics in batch
    await db.write(async () => {
      for (const clinic of clinics) {
        const addressLine = clinic.address?.line?.join(', ') || null;
        
        await clinicsCollection.create((record) => {
          record.name = clinic.name;
          record.identifier = clinic.identifier || null;
          record.addressLine = addressLine;
          record.city = clinic.address?.city || null;
          record.state = clinic.address?.state || null;
          record.zip = clinic.address?.zip || null;
          record.country = clinic.address?.country || null;
          record.phone = clinic.phone || null;
          record.email = clinic.email || null;
          record.createdAt = new Date();
          record.updatedAt = new Date();
          record.syncedAt = new Date();
        });
      }
    });

    console.log(`✅ Synced ${clinics.length} clinics to database`);
  } catch (error) {
    console.error('❌ Error syncing clinics to database:', error);
    throw error;
  }
}

/**
 * Stores labs in the database (batch operation)
 * Replaces all existing labs with the new set
 */
export async function syncLabsToDatabase(
  labs: ProcessedLab[],
  database?: Database
): Promise<void> {
  const db = database || getDatabase();
  const labsCollection = db.get<Lab>('labs');

  try {
    // Delete all existing labs
    const existingLabs = await labsCollection.query().fetch();
    await db.write(async () => {
      for (const lab of existingLabs) {
        await lab.destroyPermanently();
      }
    });

    // Insert new labs in batch
    await db.write(async () => {
      for (const lab of labs) {
        const addressLine = lab.address?.line?.join(', ') || null;
        
        await labsCollection.create((record) => {
          record.name = lab.name;
          record.identifier = lab.identifier || null;
          record.addressLine = addressLine;
          record.city = lab.address?.city || null;
          record.state = lab.address?.state || null;
          record.zip = lab.address?.zip || null;
          record.country = lab.address?.country || null;
          record.phone = lab.phone || null;
          record.email = lab.email || null;
          record.createdAt = new Date();
          record.updatedAt = new Date();
          record.syncedAt = new Date();
        });
      }
    });

    console.log(`✅ Synced ${labs.length} labs to database`);
  } catch (error) {
    console.error('❌ Error syncing labs to database:', error);
    throw error;
  }
}

/**
 * Retrieves all clinics from the database
 */
export async function getClinicsFromDatabase(
  database?: Database
): Promise<ProcessedClinic[]> {
  const db = database || getDatabase();
  const clinicsCollection = db.get<Clinic>('clinics');

  try {
    const clinics = await clinicsCollection.query().fetch();
    
    return clinics.map((clinic) => ({
      id: clinic.id,
      name: clinic.name,
      identifier: clinic.identifier || undefined,
      address: clinic.addressLine || clinic.city || clinic.state || clinic.zip
        ? {
            line: clinic.addressLine ? [clinic.addressLine] : undefined,
            city: clinic.city || undefined,
            state: clinic.state || undefined,
            zip: clinic.zip || undefined,
            country: clinic.country || undefined,
          }
        : undefined,
      phone: clinic.phone || undefined,
      email: clinic.email || undefined,
      type: 'clinic' as const,
    }));
  } catch (error) {
    console.error('❌ Error retrieving clinics from database:', error);
    return [];
  }
}

/**
 * Retrieves all labs from the database
 */
export async function getLabsFromDatabase(
  database?: Database
): Promise<ProcessedLab[]> {
  const db = database || getDatabase();
  const labsCollection = db.get<Lab>('labs');

  try {
    const labs = await labsCollection.query().fetch();
    
    return labs.map((lab) => ({
      id: lab.id,
      name: lab.name,
      identifier: lab.identifier || undefined,
      address: lab.addressLine || lab.city || lab.state || lab.zip
        ? {
            line: lab.addressLine ? [lab.addressLine] : undefined,
            city: lab.city || undefined,
            state: lab.state || undefined,
            zip: lab.zip || undefined,
            country: lab.country || undefined,
          }
        : undefined,
      phone: lab.phone || undefined,
      email: lab.email || undefined,
    }));
  } catch (error) {
    console.error('❌ Error retrieving labs from database:', error);
    return [];
  }
}

/**
 * Syncs both clinics and labs from processed data to database
 */
export async function syncClinicsAndLabsToDatabase(
  clinics: ProcessedClinic[],
  labs: ProcessedLab[],
  database?: Database
): Promise<void> {
  await Promise.all([
    syncClinicsToDatabase(clinics, database),
    syncLabsToDatabase(labs, database),
  ]);
}
