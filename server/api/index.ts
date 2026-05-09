import { Hono } from 'hono'
import { handle } from 'hono/vercel'

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
app.post('/checkin', async (c) => {
  const { athleteId, slotId } = await c.req.json()
  // Logic to save in DB...
  return c.json({ status: 'success', message: 'Check-in confirmed' })
})

export default handle(app)
