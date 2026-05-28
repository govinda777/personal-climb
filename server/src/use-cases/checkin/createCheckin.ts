import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../../db/schema';
import { eq, and } from 'drizzle-orm';

interface CreateCheckinInput {
  athleteId: string;
  slotId: string;
}

export class CreateCheckinUseCase {
  async execute({ athleteId, slotId }: CreateCheckinInput) {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql, { schema });

    const [existingCheckin] = await db
      .select()
      .from(schema.checkins)
      .where(and(eq(schema.checkins.athleteId, athleteId), eq(schema.checkins.slotId, slotId)))
      .limit(1);

    if (existingCheckin) {
      throw new Error('User already checked in for this slot');
    }

    await db.insert(schema.checkins).values({
      athleteId,
      slotId,
      status: 'scheduled'
    });
  }
}
