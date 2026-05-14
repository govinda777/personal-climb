import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { privyAuth } from './middleware/auth'
import { GamificationService } from './services/gamification'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './db/schema'
import { eq, and } from 'drizzle-orm'
import { GAMIFICATION_CONFIG } from './lib/gamification'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })
const gamificationService = new GamificationService(db)

type Variables = {
  user: { id: string }
}

const app = new Hono<{ Variables: Variables }>().basePath('/api')

app.use('*', logger())

app.get('/', (c) => {
  return c.json({
    message: 'Climbing Evolution API',
    status: 'online'
  })
})

// Public routes
app.get('/personals/:slug', async (c) => {
  const slug = c.req.param('slug')
  const personal = await db.query.personals.findFirst({
    where: eq(schema.personals.slug, slug),
  })
  
  if (!personal) {
    return c.json({ error: 'Personal not found' }, 404)
  }
  return c.json(personal)
})

// Protected routes
app.use('/me/*', privyAuth())
app.use('/actions/*', privyAuth())
app.use('/personals/me/*', privyAuth())
app.use('/athletes/me/*', privyAuth())

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

// Athletes
app.post('/athletes/me/anamnesis', async (c) => {
  const user = c.get('user')
  const body = await c.req.json()
  
  // Create or get athlete
  let athlete = await db.query.athletes.findFirst({
    where: eq(schema.athletes.userId, user.id)
  })
  
  if (!athlete) {
    const inserted = await db.insert(schema.athletes).values({
      userId: user.id,
      vGradeLevel: body.vGradeLevel,
      physicalStats: body.physicalStats,
      equipmentAccess: body.equipmentAccess
    }).returning()
    
    if (!inserted || inserted.length === 0) {
      return c.json({ error: 'Failed to create athlete' }, 500)
    }
    athlete = inserted[0]
  } else {
    // Update athlete stats
    await db.update(schema.athletes).set({
      vGradeLevel: body.vGradeLevel,
      physicalStats: body.physicalStats,
      equipmentAccess: body.equipmentAccess
    }).where(eq(schema.athletes.id, athlete.id))
  }
  
  if (!athlete) {
    return c.json({ error: 'Erro ao processar perfil do atleta' }, 500)
  }

  // Insert anamnesis record
  const [anamnesis] = await db.insert(schema.anamnesis).values({
    athleteId: athlete.id,
    medicalRestrictions: body.medicalRestrictions,
    goals: body.goals,
    anthropometricData: body.anthropometricData,
  }).returning()
  
  return c.json({ athlete, anamnesis })
})

// Personals
app.get('/personals/me/pending-plans', async (c) => {
  const user = c.get('user')
  
  const personal = await db.query.personals.findFirst({
    where: eq(schema.personals.userId, user.id)
  })
  
  if (!personal) {
    return c.json({ error: 'Not a personal' }, 403)
  }
  
  const pendingPlans = await db.query.trainingPlans.findMany({
    where: and(
      eq(schema.trainingPlans.personalId, personal.id),
      eq(schema.trainingPlans.status, 'draft')
    ),
    with: {
      athlete: true
    }
  })
  
  return c.json(pendingPlans)
})

app.post('/personals/me/approve-plan/:planId', async (c) => {
  const user = c.get('user')
  const planId = c.req.param('planId')
  
  const personal = await db.query.personals.findFirst({
    where: eq(schema.personals.userId, user.id)
  })
  
  if (!personal) {
    return c.json({ error: 'Not a personal' }, 403)
  }
  
  const [updatedPlan] = await db.update(schema.trainingPlans).set({
    status: 'approved'
  }).where(
    and(
      eq(schema.trainingPlans.id, planId),
      eq(schema.trainingPlans.personalId, personal.id)
    )
  ).returning()
  
  return c.json(updatedPlan)
})

export default app
