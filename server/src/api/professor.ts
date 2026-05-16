import { Hono } from 'hono'
import { privyAuth } from '../middleware/auth'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '../db/schema'
import { eq } from 'drizzle-orm'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})
const db = drizzle(pool, { schema })

type Variables = {
  user: { id: string }
}

const app = new Hono<{ Variables: Variables }>()

app.use('*', privyAuth())


const profileSchema = z.object({
  brandName: z.string().min(1),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  bio: z.string().optional()
})

app.put('/profile', zValidator('json', profileSchema), async (c) => {
  const user = c.get('user')
  const { brandName, primaryColor, bio } = c.req.valid('json')

  try {
    const [updatedPersonal] = await db
      .update(schema.personals)
      .set({
        brandName,
        primaryColor,
        bio
      })
      .where(eq(schema.personals.userId, user.id))
      .returning()

    if (!updatedPersonal) {
      // If no personal record exists for this user, we might want to create one,
      // but let's assume they have one from onboarding for now. Or create if not found.
      const [newPersonal] = await db.insert(schema.personals).values({
        userId: user.id,
        brandName,
        primaryColor,
        bio,
        slug: brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      }).returning()
      return c.json({ success: true, personal: newPersonal })
    }

    return c.json({ success: true, personal: updatedPersonal })
  } catch (error) {
    console.error("Failed to update profile", error)
    return c.json({ error: 'Failed to update profile' }, 500)
  }
})

const protocolSchema = z.object({
  trainingPhilosophy: z.string().min(10),
  evaluationMetrics: z.record(z.any()).optional() // JSON map of metric name to config
})

app.put('/protocol', zValidator('json', protocolSchema), async (c) => {
  const user = c.get('user')
  const { trainingPhilosophy, evaluationMetrics } = c.req.valid('json')

  try {
    const [updatedPersonal] = await db
      .update(schema.personals)
      .set({
        trainingPhilosophy,
        evaluationMetrics
      })
      .where(eq(schema.personals.userId, user.id))
      .returning()

    if (!updatedPersonal) {
      return c.json({ error: 'Personal profile not found. Please complete basic profile first.' }, 404)
    }

    return c.json({ success: true, personal: updatedPersonal })
  } catch (error) {
    console.error("Failed to update protocol", error)
    return c.json({ error: 'Failed to update protocol' }, 500)
  }
})

const scheduleSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  maxCapacity: z.number().int().min(1),
  location: z.string().optional()
})

app.post('/schedule', zValidator('json', scheduleSchema), async (c) => {
  const user = c.get('user')
  const { startTime, endTime, maxCapacity, location } = c.req.valid('json')

  try {
    const personalsList = await db.select().from(schema.personals).where(eq(schema.personals.userId, user.id)).limit(1)
    if (personalsList.length === 0) {
      return c.json({ error: 'Personal not found' }, 404)
    }
    const personalId = personalsList[0]!.id

    const [newSlot] = await db.insert(schema.scheduleSlots).values({
      personalId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      maxCapacity,
      location
    }).returning()

    return c.json({ success: true, slot: newSlot })
  } catch (error) {
    console.error("Failed to create schedule slot", error)
    return c.json({ error: 'Failed to create schedule slot' }, 500)
  }
})

app.get('/schedule', async (c) => {
  const user = c.get('user')

  try {
    const personalsList = await db.select().from(schema.personals).where(eq(schema.personals.userId, user.id)).limit(1)
    if (personalsList.length === 0) {
      return c.json({ slots: [] })
    }
    const personalId = personalsList[0]!.id

    const slots = await db.select().from(schema.scheduleSlots).where(eq(schema.scheduleSlots.personalId, personalId))

    // Enrich with booked count (simplified for now, ideally group by)
    const enrichedSlots = await Promise.all(slots.map(async (slot) => {
      const bookings = await db.select().from(schema.checkins).where(eq(schema.checkins.slotId, slot.id))
      return { ...slot, bookedCount: bookings.length }
    }))

    return c.json({ slots: enrichedSlots })
  } catch (error) {
    console.error("Failed to fetch schedule slots", error)
    return c.json({ error: 'Failed to fetch schedule slots' }, 500)
  }
})

app.get('/plans', async (c) => {
  const user = c.get('user')

  try {
    const personalsList = await db.select().from(schema.personals).where(eq(schema.personals.userId, user.id)).limit(1)
    if (personalsList.length === 0) return c.json({ error: 'Personal not found' }, 404)
    const personalId = personalsList[0]!.id

    // Get all plans for this trainer
    const plans = await db.select().from(schema.trainingPlans).where(eq(schema.trainingPlans.personalId, personalId))

    // For full dashboard we'd join with athletes to get names.
    const enrichedPlans = await Promise.all(plans.map(async (plan) => {
      const athleteList = await db.select().from(schema.athletes).where(eq(schema.athletes.id, plan.athleteId)).limit(1)
      // Since userId holds the DID, we might not have a full name without querying privy or a profiles table.
      // Assuming a simple structure for now.
      return {
        ...plan,
        athleteName: athleteList.length > 0 ? athleteList[0].userId : 'Unknown Athlete'
      }
    }))

    return c.json({ plans: enrichedPlans })
  } catch (error) {
    console.error("Failed to fetch plans", error)
    return c.json({ error: 'Failed to fetch plans' }, 500)
  }
})

const planApprovalSchema = z.object({
  status: z.enum(['approved', 'draft', 'rejected']),
  aiRationale: z.string().optional()
})

app.put('/plans/:id/approve', zValidator('json', planApprovalSchema), async (c) => {
  const planId = c.req.param('id')
  const { status, aiRationale } = c.req.valid('json')

  try {
    const [updatedPlan] = await db.update(schema.trainingPlans).set({
      status,
      ...(aiRationale !== undefined && { aiRationale })
    }).where(eq(schema.trainingPlans.id, planId)).returning()

    if (!updatedPlan) {
       return c.json({ error: 'Plan not found' }, 404)
    }

    return c.json({ success: true, plan: updatedPlan })
  } catch (error) {
    console.error("Failed to approve plan", error)
    return c.json({ error: 'Failed to approve plan' }, 500)
  }
})

app.get('/dashboard', async (c) => {
  const user = c.get('user')
  try {
    const personalsList = await db.select().from(schema.personals).where(eq(schema.personals.userId, user.id)).limit(1)
    if (personalsList.length === 0) return c.json({ error: 'Personal not found' }, 404)

    const personal = personalsList[0]!

    // Get athletes
    const athletesList = await db.select().from(schema.athletes).where(eq(schema.athletes.personalId, personal.id))

    // Get pending plans
    const pendingPlansList = await db.select().from(schema.trainingPlans).where(
      eq(schema.trainingPlans.personalId, personal.id)
    )
    const pendingPlansCount = pendingPlansList.filter(p => p!.status === 'draft').length

    // Simulated/Basic stats
    const stats = {
      totalAthletes: athletesList.length,
      pendingApproval: pendingPlansCount,
      inactiveStudents: athletesList.filter(a => a!.isActive === 0).length,
      evolutionRate: '85%' // Placeholder for complex gamification calculation
    }

    const students = athletesList.map(a => ({
      id: a.id,
      name: a!.userId!.substring(0, 8), // Placeholder DID trunc until we join profile names
      lastTrain: 'Há 2 dias',
      grade: a!.vGradeLevel || 'V0',
      status: pendingPlansList.some(p => p!.athleteId === a!.id && p.status === 'draft') ? 'pending' : 'active',
      alert: a.isActive === 0
    }))

    return c.json({
      personal: {
        brandName: personal!.brandName
      },
      stats,
      students
    })

  } catch (error) {
    console.error("Failed to fetch dashboard", error)
    return c.json({ error: 'Failed to fetch dashboard' }, 500)
  }
})
export default app
