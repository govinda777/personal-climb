import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../../db/schema';
import { eq } from 'drizzle-orm';

export class DeleteSlotUseCase {
  async execute(id: string) {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql, { schema });

    const deletedSlot = await db
      .delete(schema.scheduleSlots)
      .where(eq(schema.scheduleSlots.id, id))
      .returning();

    if (deletedSlot.length === 0) {
      return null;
    }

    return deletedSlot[0];
  }
}
