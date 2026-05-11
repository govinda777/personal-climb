import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { privyAuth } from './middleware/auth'
import { GamificationService } from './services/gamification'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './db/schema'
import { GAMIFICATION_CONFIG } from './lib/gamification'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})
const db = drizzle(pool, { schema })
const gamificationService = new GamificationService(db)

type Variables = {
  user: { id: string }
}

const app = new Hono<{ Variables: Variables }>()

app.use('*', logger())

app.get('/', (c) => {
  return c.json({
    message: 'Climbing Evolution API',
    status: 'online'
  })
})

// Protected routes
app.use('/me/*', privyAuth())
app.use('/actions/*', privyAuth())

app.get('/me', async (c) => {
  const user = c.get('user')
  const profile = await gamificationService.handleDailyLogin(user.id)
  return c.json(profile)
})

app.post('/actions/onboarding', async (c) => {
  const user = c.get('user')
  const reward = GAMIFICATION_CONFIG.REWARDS.ONBOARDING
  const profile = await gamificationService.addXP(user.id, reward.XP, reward.REASON)
  return c.json(profile)
})

app.post('/actions/workout-complete', async (c) => {
  const user = c.get('user')
  const reward = GAMIFICATION_CONFIG.REWARDS.WORKOUT_COMPLETE
  const profile = await gamificationService.addXP(user.id, reward.XP, reward.REASON)
  return c.json(profile)
})

export default app
