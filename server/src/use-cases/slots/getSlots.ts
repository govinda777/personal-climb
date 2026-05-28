import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../../db/schema';
import { eq } from 'drizzle-orm';

export class GetSlotsUseCase {
  async execute(personalId: string) {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql, { schema });

    const slots = await db
      .select()
      .from(schema.scheduleSlots)
      .where(eq(schema.scheduleSlots.personalId, personalId));

    return slots;
  }
}
