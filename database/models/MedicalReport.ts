// @ts-nocheck - WatermelonDB decorators handle field initialization
import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export default class MedicalReport extends Model {
  static table = 'medical_reports';

  // Constructor must be defined before fields to satisfy TypeScript strict mode
  constructor(...args: any[]) {
    super(...args);
  }

  @field('clinic_id') clinicId!: string | null;
  @field('patient_id') patientId!: string | null;
  @field('title') title!: string;
  @field('category') category!: string | null;
  @field('date') date!: string;
  @field('findings') findings!: string | null;
  @field('impression') impression!: string | null;
  @field('description') description!: string | null;
  @field('doctor_name') doctorName!: string | null;
  @field('doctor_specialty') doctorSpecialty!: string | null;
  @field('file_url') fileUrl!: string | null;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @date('synced_at') syncedAt!: Date | null;
}
