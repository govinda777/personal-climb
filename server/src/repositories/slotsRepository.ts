import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';

export class SlotsRepository {
  async getSlotsByPersonalId(personalId: string) {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql, { schema });

    return await db
      .select()
      .from(schema.scheduleSlots)
      .where(eq(schema.scheduleSlots.personalId, personalId));
  }

  async createSlot(data: any) {
    const sql = neon(process.env.DATABASE_URL!);

    const res = await sql.transaction([
      sql`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE`,
      sql`
        INSERT INTO schedule_slots (personal_id, start_time, end_time, max_capacity, location)
        VALUES (${data.personalId}, ${data.startTime}, ${data.endTime}, ${data.maxCapacity}, ${data.location || null})
        RETURNING *;
      `
    ]);

    return (res[1] as any).rows[0];
  }

  async updateSlot(id: string, body: any) {
    const sql = neon(process.env.DATABASE_URL!);

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
      sql([`UPDATE schedule_slots SET ${setQueryString} WHERE id = $${values.length} RETURNING *`] as unknown as TemplateStringsArray, ...values) as any
    ]);

    return (res[1] as any).rows[0] || null;
  }

  async deleteSlot(id: string) {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql, { schema });

    const deletedSlot = await db
      .delete(schema.scheduleSlots)
      .where(eq(schema.scheduleSlots.id, id))
      .returning();

    return deletedSlot.length > 0 ? deletedSlot[0] : null;
  }
}
