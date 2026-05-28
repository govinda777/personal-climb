import { neon } from '@neondatabase/serverless';

interface CreateSlotInput {
  personalId: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  location?: string;
}

export class CreateSlotUseCase {
  async execute(data: CreateSlotInput) {
    const sql = neon(process.env.DATABASE_URL!);

    const res = await sql.transaction([
      sql`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE`,
      sql`
        INSERT INTO schedule_slots (personal_id, start_time, end_time, max_capacity, location)
        VALUES (${data.personalId}, ${data.startTime}, ${data.endTime}, ${data.maxCapacity}, ${data.location || null})
        RETURNING *;
      `
    ]);

    const createdSlot = res[1].rows[0];
    return createdSlot;
  }
}
