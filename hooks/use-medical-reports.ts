import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDatabase } from '@/database/DatabaseProvider';
import { MedicalReport } from '@/database/models';
import { Q } from '@nozbe/watermelondb';
import { useObservable } from '@nozbe/with-observables';

/**
 * Hook to fetch medical reports from WatermelonDB with React Query integration
 */
export function useMedicalReports(filters?: {
  category?: string;
  patientId?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const database = useDatabase();
  const queryClient = useQueryClient();

  // Build query with filters
  let query = database.get<MedicalReport>('medical_reports').query();
  if (filters?.category) {
    query = query.extend(Q.where('category', filters.category));
  }
  if (filters?.patientId) {
    query = query.extend(Q.where('patient_id', filters.patientId));
  }
  if (filters?.dateFrom) {
    query = query.extend(Q.where('date', Q.gte(filters.dateFrom)));
  }
  if (filters?.dateTo) {
    query = query.extend(Q.where('date', Q.lte(filters.dateTo)));
  }
  
  // Use WatermelonDB observable for real-time updates
  const reports = useObservable(query.observe(), [filters?.category, filters?.patientId, filters?.dateFrom, filters?.dateTo]);

  const createMedicalReport = useMutation({
    mutationFn: async (reportData: {
      clinicId?: string;
      patientId?: string;
      title: string;
      category?: string;
      date: string;
      findings?: string;
      impression?: string;
      description?: string;
      doctorName?: string;
      doctorSpecialty?: string;
      fileUrl?: string;
    }) => {
      return await database.write(async () => {
        return await database.get<MedicalReport>('medical_reports').create((report) => {
          report.clinicId = reportData.clinicId || null;
          report.patientId = reportData.patientId || null;
          report.title = reportData.title;
          report.category = reportData.category || null;
          report.date = reportData.date;
          report.findings = reportData.findings || null;
          report.impression = reportData.impression || null;
          report.description = reportData.description || null;
          report.doctorName = reportData.doctorName || null;
          report.doctorSpecialty = reportData.doctorSpecialty || null;
          report.fileUrl = reportData.fileUrl || null;
          report.createdAt = new Date();
          report.updatedAt = new Date();
        });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical_reports'] });
    },
  });

  const updateMedicalReport = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      title?: string;
      category?: string;
      date?: string;
      findings?: string;
      impression?: string;
      description?: string;
      doctorName?: string;
      doctorSpecialty?: string;
      fileUrl?: string;
    }) => {
      return await database.write(async () => {
        const report = await database.get<MedicalReport>('medical_reports').find(id);
        await report.update((r) => {
          if (updates.title) r.title = updates.title;
          if (updates.category) r.category = updates.category;
          if (updates.date) r.date = updates.date;
          if (updates.findings) r.findings = updates.findings;
          if (updates.impression) r.impression = updates.impression;
          if (updates.description) r.description = updates.description;
          if (updates.doctorName) r.doctorName = updates.doctorName;
          if (updates.doctorSpecialty) r.doctorSpecialty = updates.doctorSpecialty;
          if (updates.fileUrl) r.fileUrl = updates.fileUrl;
          r.updatedAt = new Date();
        });
        return report;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical_reports'] });
    },
  });

  const deleteMedicalReport = useMutation({
    mutationFn: async (id: string) => {
      return await database.write(async () => {
        const report = await database.get<MedicalReport>('medical_reports').find(id);
        await report.markAsDeleted();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical_reports'] });
    },
  });

  return {
    reports: reports || [],
    isLoading: !reports,
    createMedicalReport: createMedicalReport.mutateAsync,
    updateMedicalReport: updateMedicalReport.mutateAsync,
    deleteMedicalReport: deleteMedicalReport.mutateAsync,
    isCreating: createMedicalReport.isPending,
    isUpdating: updateMedicalReport.isPending,
    isDeleting: deleteMedicalReport.isPending,
  };
}
