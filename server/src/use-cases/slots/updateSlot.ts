import { neon } from '@neondatabase/serverless';

interface UpdateSlotInput {
  id: string;
  startTime?: string;
  endTime?: string;
  maxCapacity?: number;
  location?: string;
}

export class UpdateSlotUseCase {
  async execute(data: UpdateSlotInput) {
    const { id, ...body } = data;
    const sql = neon(process.env.DATABASE_URL!);

    if (Object.keys(body).length === 0) {
       throw new Error('No fields to update');
    }

    const setParts = [];
    const values: any[] = [];

    if (body.startTime) {
      setParts.push(`start_time = $${values.length + 1}`);
      values.push(body.startTime);
    }
    if (body.endTime) {
      setParts.push(`end_time = $${values.length + 1}`);
      values.push(body.endTime);
    }
    if (body.maxCapacity) {
      setParts.push(`max_capacity = $${values.length + 1}`);
      values.push(body.maxCapacity);
    }
    if (body.location !== undefined) {
      setParts.push(`location = $${values.length + 1}`);
      values.push(body.location);
    }

    values.push(id);
    const setQueryString = setParts.join(', ');

    const res = await sql.transaction([
      sql`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE`,
      sql(`UPDATE schedule_slots SET ${setQueryString} WHERE id = $${values.length} RETURNING *`, values) as any
    ]);

    const updatedSlot = res[1].rows[0];

    if (!updatedSlot) {
      return null;
    }

    return updatedSlot;
  }
}
