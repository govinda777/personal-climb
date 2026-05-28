import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/db/schema';
import { eq } from 'drizzle-orm';

const app = new Hono();

// Schemas for validation
const getSlotsQuerySchema = z.object({
  personalId: z.string().uuid(),
});

const slotBodySchema = z.object({
  personalId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  maxCapacity: z.number().int().positive().default(1),
  location: z.string().optional(),
});

app.get('/', zValidator('query', getSlotsQuerySchema), async (c) => {
  const { personalId } = c.req.valid('query');

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql, { schema });

    const slots = await db
      .select()
      .from(schema.scheduleSlots)
      .where(eq(schema.scheduleSlots.personalId, personalId));

    return c.json({ status: 'success', data: slots });
  } catch (error: any) {
    console.error('Fetch slots error:', error);
    return c.json({ status: 'error', message: 'Internal server error' }, 500);
  }
});

app.post('/', zValidator('json', slotBodySchema), async (c) => {
  const body = c.req.valid('json');

  try {
    const sql = neon(process.env.DATABASE_URL!);

    // We enforce isolation level explicitly since batch doesn't natively support setting the transaction level this way
    // Also using a raw query to simulate overbooking protection and enforce constraint.
    const res = await sql.transaction([
      sql`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE`,
      sql`
        INSERT INTO schedule_slots (personal_id, start_time, end_time, max_capacity, location)
        VALUES (${body.personalId}, ${body.startTime}, ${body.endTime}, ${body.maxCapacity}, ${body.location || null})
        RETURNING *;
      `
    ]);

    const createdSlot = res[1].rows[0];

    return c.json({ status: 'success', data: createdSlot });
  } catch (error: any) {
    console.error('Create slot error:', error);
    return c.json({ status: 'error', message: 'Failed to create slot due to conflict or error' }, 409);
  }
});

const slotUpdateSchema = z.object({
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  maxCapacity: z.number().int().positive().optional(),
  location: z.string().optional(),
});

app.put('/:id', zValidator('json', slotUpdateSchema), async (c) => {
  const id = c.req.param('id');
  const body = c.req.valid('json');

  try {
    const sql = neon(process.env.DATABASE_URL!);

    if (Object.keys(body).length === 0) {
       return c.json({ status: 'error', message: 'No fields to update' }, 400);
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
      return c.json({ status: 'error', message: 'Slot not found' }, 404);
    }

    return c.json({ status: 'success', data: updatedSlot });
  } catch (error: any) {
    console.error('Update slot error:', error);
    return c.json({ status: 'error', message: 'Failed to update slot due to conflict or error' }, 409);
  }
});

app.delete('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql, { schema });

    const deletedSlot = await db
      .delete(schema.scheduleSlots)
      .where(eq(schema.scheduleSlots.id, id))
      .returning();

    if (deletedSlot.length === 0) {
      return c.json({ status: 'error', message: 'Slot not found' }, 404);
    }

    return c.json({ status: 'success', data: deletedSlot[0] });
  } catch (error: any) {
    console.error('Delete slot error:', error);
    return c.json({ status: 'error', message: 'Internal server error' }, 500);
  }
});

export default app;
