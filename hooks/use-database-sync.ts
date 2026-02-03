import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDatabase } from '@/database/DatabaseProvider';
import { Appointment, Medication, MedicalReport, Doctor, HealthMetric } from '@/database/models';

/**
 * Hook for syncing data from API/server to WatermelonDB
 * This is useful when you fetch data from an API and want to store it locally
 */
export function useDatabaseSync() {
  const database = useDatabase();
  const queryClient = useQueryClient();

  // Sync appointments from API
  const syncAppointments = useMutation({
    mutationFn: async (appointments: Array<{
      id?: string;
      clinicId?: string;
      patientId?: string;
      date: string;
      time: string;
      type: string;
      status: string;
      doctorName: string;
      doctorSpecialty?: string;
      diagnosis?: string;
      notes?: string;
      providerId?: string;
    }>) => {
      return await database.write(async () => {
        const syncedAppointments = [];
        for (const appointmentData of appointments) {
          // Try to find existing appointment by date, time, and doctor
          const existing = await database
            .get<Appointment>('appointments')
            .query()
            .fetch();

          const match = existing.find(
            (a) =>
              a.date === appointmentData.date &&
              a.time === appointmentData.time &&
              a.doctorName === appointmentData.doctorName
          );

          if (match) {
            // Update existing
            await match.update((app) => {
              app.clinicId = appointmentData.clinicId || app.clinicId;
              app.patientId = appointmentData.patientId || app.patientId;
              app.date = appointmentData.date;
              app.time = appointmentData.time;
              app.type = appointmentData.type;
              app.status = appointmentData.status;
              app.doctorName = appointmentData.doctorName;
              app.doctorSpecialty = appointmentData.doctorSpecialty || app.doctorSpecialty;
              app.diagnosis = appointmentData.diagnosis || app.diagnosis;
              app.notes = appointmentData.notes || app.notes;
              app.providerId = appointmentData.providerId || app.providerId;
              app.updatedAt = new Date();
              app.syncedAt = new Date();
            });
            syncedAppointments.push(match);
          } else {
            // Create new
            const newAppointment = await database.get<Appointment>('appointments').create((app) => {
              app.clinicId = appointmentData.clinicId || null;
              app.patientId = appointmentData.patientId || null;
              app.date = appointmentData.date;
              app.time = appointmentData.time;
              app.type = appointmentData.type;
              app.status = appointmentData.status;
              app.doctorName = appointmentData.doctorName;
              app.doctorSpecialty = appointmentData.doctorSpecialty || null;
              app.diagnosis = appointmentData.diagnosis || null;
              app.notes = appointmentData.notes || null;
              app.providerId = appointmentData.providerId || null;
              app.createdAt = new Date();
              app.updatedAt = new Date();
              app.syncedAt = new Date();
            });
            syncedAppointments.push(newAppointment);
          }
        }
        return syncedAppointments;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  // Sync medications from API
  const syncMedications = useMutation({
    mutationFn: async (medications: Array<{
      id?: string;
      clinicId?: string;
      patientId?: string;
      name: string;
      dosage: string;
      frequency: string;
      purpose?: string;
      startDate?: string;
      endDate?: string;
      isActive: boolean;
    }>) => {
      return await database.write(async () => {
        const syncedMedications = [];
        for (const medicationData of medications) {
          const existing = await database
            .get<Medication>('medications')
            .query()
            .fetch();

          const match = existing.find(
            (m) =>
              m.name === medicationData.name &&
              m.dosage === medicationData.dosage &&
              m.frequency === medicationData.frequency
          );

          if (match) {
            await match.update((med) => {
              med.clinicId = medicationData.clinicId || med.clinicId;
              med.patientId = medicationData.patientId || med.patientId;
              med.name = medicationData.name;
              med.dosage = medicationData.dosage;
              med.frequency = medicationData.frequency;
              med.purpose = medicationData.purpose || med.purpose;
              med.startDate = medicationData.startDate || med.startDate;
              med.endDate = medicationData.endDate || med.endDate;
              med.isActive = medicationData.isActive;
              med.updatedAt = new Date();
              med.syncedAt = new Date();
            });
            syncedMedications.push(match);
          } else {
            const newMedication = await database.get<Medication>('medications').create((med) => {
              med.clinicId = medicationData.clinicId || null;
              med.patientId = medicationData.patientId || null;
              med.name = medicationData.name;
              med.dosage = medicationData.dosage;
              med.frequency = medicationData.frequency;
              med.purpose = medicationData.purpose || null;
              med.startDate = medicationData.startDate || null;
              med.endDate = medicationData.endDate || null;
              med.isActive = medicationData.isActive;
              med.createdAt = new Date();
              med.updatedAt = new Date();
              med.syncedAt = new Date();
            });
            syncedMedications.push(newMedication);
          }
        }
        return syncedMedications;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  // Sync medical reports from API
  const syncMedicalReports = useMutation({
    mutationFn: async (reports: Array<{
      id?: string;
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
    }>) => {
      return await database.write(async () => {
        const syncedReports = [];
        for (const reportData of reports) {
          const existing = await database
            .get<MedicalReport>('medical_reports')
            .query()
            .fetch();

          const match = existing.find(
            (r) => r.title === reportData.title && r.date === reportData.date
          );

          if (match) {
            await match.update((r) => {
              r.clinicId = reportData.clinicId || r.clinicId;
              r.patientId = reportData.patientId || r.patientId;
              r.title = reportData.title;
              r.category = reportData.category || r.category;
              r.date = reportData.date;
              r.findings = reportData.findings || r.findings;
              r.impression = reportData.impression || r.impression;
              r.description = reportData.description || r.description;
              r.doctorName = reportData.doctorName || r.doctorName;
              r.doctorSpecialty = reportData.doctorSpecialty || r.doctorSpecialty;
              r.fileUrl = reportData.fileUrl || r.fileUrl;
              r.updatedAt = new Date();
              r.syncedAt = new Date();
            });
            syncedReports.push(match);
          } else {
            const newReport = await database.get<MedicalReport>('medical_reports').create((r) => {
              r.clinicId = reportData.clinicId || null;
              r.patientId = reportData.patientId || null;
              r.title = reportData.title;
              r.category = reportData.category || null;
              r.date = reportData.date;
              r.findings = reportData.findings || null;
              r.impression = reportData.impression || null;
              r.description = reportData.description || null;
              r.doctorName = reportData.doctorName || null;
              r.doctorSpecialty = reportData.doctorSpecialty || null;
              r.fileUrl = reportData.fileUrl || null;
              r.createdAt = new Date();
              r.updatedAt = new Date();
              r.syncedAt = new Date();
            });
            syncedReports.push(newReport);
          }
        }
        return syncedReports;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical_reports'] });
    },
  });

  return {
    syncAppointments: syncAppointments.mutateAsync,
    syncMedications: syncMedications.mutateAsync,
    syncMedicalReports: syncMedicalReports.mutateAsync,
    isSyncingAppointments: syncAppointments.isPending,
    isSyncingMedications: syncMedications.isPending,
    isSyncingReports: syncMedicalReports.isPending,
  };
}
