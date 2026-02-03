import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export default class Doctor extends Model {
  static table = 'doctors';

  @field('name') name!: string;
  @field('specialty') specialty!: string | null;
  @field('clinic_id') clinicId!: string | null;
  @field('clinic_name') clinicName!: string | null;
  @field('phone') phone!: string | null;
  @field('email') email!: string | null;
  @field('address') address!: string | null;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @date('synced_at') syncedAt!: Date | null;
}
