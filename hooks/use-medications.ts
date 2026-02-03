import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDatabase } from '@/database/DatabaseProvider';
import { Medication } from '@/database/models';
import { Q } from '@nozbe/watermelondb';
import { useObservable } from '@nozbe/with-observables';

/**
 * Hook to fetch medications from WatermelonDB with React Query integration
 */
export function useMedications(filters?: {
  isActive?: boolean;
  patientId?: string;
}) {
  const database = useDatabase();
  const queryClient = useQueryClient();

  // Build query with filters
  let query = database.get<Medication>('medications').query();
  if (filters?.isActive !== undefined) {
    query = query.extend(Q.where('is_active', filters.isActive));
  }
  if (filters?.patientId) {
    query = query.extend(Q.where('patient_id', filters.patientId));
  }
  
  // Use WatermelonDB observable for real-time updates
  const medications = useObservable(query.observe(), [filters?.isActive, filters?.patientId]);

  const createMedication = useMutation({
    mutationFn: async (medicationData: {
      clinicId?: string;
      patientId?: string;
      name: string;
      dosage: string;
      frequency: string;
      purpose?: string;
      startDate?: string;
      endDate?: string;
      isActive: boolean;
    }) => {
      return await database.write(async () => {
        return await database.get<Medication>('medications').create((medication) => {
          medication.clinicId = medicationData.clinicId || null;
          medication.patientId = medicationData.patientId || null;
          medication.name = medicationData.name;
          medication.dosage = medicationData.dosage;
          medication.frequency = medicationData.frequency;
          medication.purpose = medicationData.purpose || null;
          medication.startDate = medicationData.startDate || null;
          medication.endDate = medicationData.endDate || null;
          medication.isActive = medicationData.isActive;
          medication.createdAt = new Date();
          medication.updatedAt = new Date();
        });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  const updateMedication = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      name?: string;
      dosage?: string;
      frequency?: string;
      purpose?: string;
      startDate?: string;
      endDate?: string;
      isActive?: boolean;
    }) => {
      return await database.write(async () => {
        const medication = await database.get<Medication>('medications').find(id);
        await medication.update((med) => {
          if (updates.name) med.name = updates.name;
          if (updates.dosage) med.dosage = updates.dosage;
          if (updates.frequency) med.frequency = updates.frequency;
          if (updates.purpose !== undefined) med.purpose = updates.purpose;
          if (updates.startDate) med.startDate = updates.startDate;
          if (updates.endDate) med.endDate = updates.endDate;
          if (updates.isActive !== undefined) med.isActive = updates.isActive;
          med.updatedAt = new Date();
        });
        return medication;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  const deleteMedication = useMutation({
    mutationFn: async (id: string) => {
      return await database.write(async () => {
        const medication = await database.get<Medication>('medications').find(id);
        await medication.markAsDeleted();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  return {
    medications: medications || [],
    isLoading: !medications,
    createMedication: createMedication.mutateAsync,
    updateMedication: updateMedication.mutateAsync,
    deleteMedication: deleteMedication.mutateAsync,
    isCreating: createMedication.isPending,
    isUpdating: updateMedication.isPending,
    isDeleting: deleteMedication.isPending,
  };
}
