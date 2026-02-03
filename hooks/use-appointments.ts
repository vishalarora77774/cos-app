import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDatabase } from '@/database/DatabaseProvider';
import { Appointment } from '@/database/models';
import { Q } from '@nozbe/watermelondb';
import { useObservable } from '@nozbe/with-observables';

/**
 * Hook to fetch appointments from WatermelonDB with React Query integration
 */
export function useAppointments(filters?: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const database = useDatabase();
  const queryClient = useQueryClient();

  // Build query with filters
  let query = database.get<Appointment>('appointments').query();
  if (filters?.status) {
    query = query.extend(Q.where('status', filters.status));
  }
  if (filters?.dateFrom) {
    query = query.extend(Q.where('date', Q.gte(filters.dateFrom)));
  }
  if (filters?.dateTo) {
    query = query.extend(Q.where('date', Q.lte(filters.dateTo)));
  }
  
  // Use WatermelonDB observable for real-time updates
  const appointments = useObservable(query.observe(), [filters?.status, filters?.dateFrom, filters?.dateTo]);

  // Create appointment mutation
  const createAppointment = useMutation({
    mutationFn: async (appointmentData: {
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
    }) => {
      return await database.write(async () => {
        return await database.get<Appointment>('appointments').create((appointment) => {
          appointment.clinicId = appointmentData.clinicId || null;
          appointment.patientId = appointmentData.patientId || null;
          appointment.date = appointmentData.date;
          appointment.time = appointmentData.time;
          appointment.type = appointmentData.type;
          appointment.status = appointmentData.status;
          appointment.doctorName = appointmentData.doctorName;
          appointment.doctorSpecialty = appointmentData.doctorSpecialty || null;
          appointment.diagnosis = appointmentData.diagnosis || null;
          appointment.notes = appointmentData.notes || null;
          appointment.providerId = appointmentData.providerId || null;
          appointment.createdAt = new Date();
          appointment.updatedAt = new Date();
        });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  // Update appointment mutation
  const updateAppointment = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      date?: string;
      time?: string;
      type?: string;
      status?: string;
      doctorName?: string;
      doctorSpecialty?: string;
      diagnosis?: string;
      notes?: string;
    }) => {
      return await database.write(async () => {
        const appointment = await database.get<Appointment>('appointments').find(id);
        await appointment.update((app) => {
          if (updates.date) app.date = updates.date;
          if (updates.time) app.time = updates.time;
          if (updates.type) app.type = updates.type;
          if (updates.status) app.status = updates.status;
          if (updates.doctorName) app.doctorName = updates.doctorName;
          if (updates.doctorSpecialty) app.doctorSpecialty = updates.doctorSpecialty;
          if (updates.diagnosis) app.diagnosis = updates.diagnosis;
          if (updates.notes) app.notes = updates.notes;
          app.updatedAt = new Date();
        });
        return appointment;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  // Delete appointment mutation
  const deleteAppointment = useMutation({
    mutationFn: async (id: string) => {
      return await database.write(async () => {
        const appointment = await database.get<Appointment>('appointments').find(id);
        await appointment.markAsDeleted();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  return {
    appointments: appointments || [],
    isLoading: !appointments, // Loading until observable provides data
    createAppointment: createAppointment.mutateAsync,
    updateAppointment: updateAppointment.mutateAsync,
    deleteAppointment: deleteAppointment.mutateAsync,
    isCreating: createAppointment.isPending,
    isUpdating: updateAppointment.isPending,
    isDeleting: deleteAppointment.isPending,
  };
}

/**
 * Hook to fetch a single appointment by ID
 */
export function useAppointment(id: string) {
  const database = useDatabase();

  const appointment = useObservable(
    database.get<Appointment>('appointments').findAndObserve(id),
    [id]
  );

  return {
    appointment: appointment,
    isLoading: !appointment,
  };
}
