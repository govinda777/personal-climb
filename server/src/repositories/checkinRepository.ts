import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import { eq, and } from 'drizzle-orm';

export class CheckinRepository {
  async findExistingCheckin(athleteId: string, slotId: string) {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql, { schema });

    const [existingCheckin] = await db
      .select()
      .from(schema.checkins)
      .where(and(eq(schema.checkins.athleteId, athleteId), eq(schema.checkins.slotId, slotId)))
      .limit(1);

    return existingCheckin || null;
  }

  async insertCheckin(athleteId: string, slotId: string) {
    const sql = neon(process.env.DATABASE_URL!);

    const res = await sql.transaction([
      sql`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE`,
      sql`
        INSERT INTO checkins (athlete_id, slot_id, status)
        SELECT ${athleteId}, ${slotId}, 'scheduled'
        FROM schedule_slots
        WHERE id = ${slotId}
        AND (
          SELECT COUNT(*)
          FROM checkins
          WHERE slot_id = ${slotId}
        ) < max_capacity
        RETURNING *;
      `
    ]);

    const rows = (res[1] as any).rows;
    if (!rows || rows.length === 0) {
      throw new Error('Slot capacity reached');
    }
  }
}
