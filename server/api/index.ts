import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../src/db/schema'
import { eq, and } from 'drizzle-orm'
import slotsApp from './slots'
import { CreateCheckinUseCase } from '../src/use-cases/checkin/createCheckin'



export const app = new Hono().basePath('/api')

app.get('/hello', (c) => {
  return c.json({
    message: 'Hello from Personal Climb API on Vercel!',
  })
})

// Check-in Route
const checkinSchema = z.object({
  athleteId: z.string().uuid(),
  slotId: z.string().uuid()
})

app.post('/checkin', zValidator('json', checkinSchema), async (c) => {
  const { athleteId, slotId } = c.req.valid('json')

  try {
    const useCase = new CreateCheckinUseCase();
    await useCase.execute({ athleteId, slotId });

    return c.json({ status: 'success', message: 'Check-in confirmed' })
  } catch (error: any) {
    console.error('Checkin error:', error)
    if (error.message === 'Slot capacity reached') {
      return c.json({ status: 'error', message: 'Slot capacity reached' }, 409)
    }
    if (error.message?.includes('duplicate key value') || error.code === '23505' || error.message === 'User already checked in for this slot') {
       return c.json({ status: 'error', message: 'User already checked in for this slot' }, 409)
    }
    return c.json({ status: 'error', message: 'Internal server error' }, 500)
  }
})



app.route('/slots', slotsApp)

export default handle(app)
