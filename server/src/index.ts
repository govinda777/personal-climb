import { Hono } from 'hono'
import { logger } from 'hono/logger'

const app = new Hono()

app.use('*', logger())

app.get('/', (c) => {
  return c.json({
    message: 'Climbing Evolution API',
    status: 'online'
  })
})

// Future routes
// app.route('/auth', authRoutes)
// app.route('/training', trainingRoutes)
// app.route('/athlete', athleteRoutes)

export default app
