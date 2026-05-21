import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import professorApp from '../src/api/professor'
import athleteApp from '../src/api/athlete'


export const config = {
  runtime: 'nodejs'
}

export const app = new Hono().basePath('/api')

app.route('/professor', professorApp)
app.route('/athlete', athleteApp)

app.get('/hello', (c) => {
  return c.json({
    message: 'Hello from Personal Climb API on Vercel!',
  })
})

<<<<<<< HEAD
// Check-in Route
const checkinSchema = z.object({
  athleteId: z.string().uuid(),
  slotId: z.string().uuid()
})

app.post('/checkin', zValidator('json', checkinSchema), async (c) => {
  const { athleteId, slotId } = c.req.valid('json')

  try {
    const sql = neon(process.env.DATABASE_URL!)
    const db = drizzle(sql, { schema })

    const [existingCheckin] = await db
      .select()
      .from(schema.checkins)
      .where(and(eq(schema.checkins.athleteId, athleteId), eq(schema.checkins.slotId, slotId)))
      .limit(1)

    if (existingCheckin) {
      return c.json({ status: 'error', message: 'User already checked in for this slot' }, 409)
    }

    await db.insert(schema.checkins).values({
      athleteId,
      slotId,
      status: 'scheduled'
    })

    return c.json({ status: 'success', message: 'Check-in confirmed' })
  } catch (error: any) {
    console.error('Checkin error:', error)
    if (error.message?.includes('duplicate key value') || error.code === '23505') {
       return c.json({ status: 'error', message: 'User already checked in for this slot' }, 409)
    }
    return c.json({ status: 'error', message: 'Internal server error' }, 500)
  }
})

=======

export default handle(app)
