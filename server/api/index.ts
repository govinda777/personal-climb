import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

export const config = {
  runtime: 'edge'
}

const app = new Hono().basePath('/api')

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
  // Logic to save in DB...
  return c.json({ status: 'success', message: 'Check-in confirmed' })
})

export default handle(app)
