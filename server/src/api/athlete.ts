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


app.get('/slots', async (c) => {
  const user = c.get('user')
  try {
    const athleteList = await db.select().from(schema.athletes).where(eq(schema.athletes.userId, user.id)).limit(1)
    if (athleteList.length === 0) {
      return c.json({ error: 'Athlete not found' }, 404)
    }
    const personalId = athleteList[0]!.personalId
    if (!personalId) {
      return c.json({ slots: [] }) // No personal assigned yet
    }

    const slots = await db.select().from(schema.scheduleSlots).where(eq(schema.scheduleSlots.personalId, personalId))

    const enrichedSlots = await Promise.all(slots.map(async (slot) => {
      const bookings = await db.select().from(schema.checkins).where(eq(schema.checkins.slotId, slot.id))
      const hasBooked = bookings.some(b => b!.athleteId === athleteList[0]!.id)
      return { ...slot, bookedCount: bookings.length, hasBooked }
    }))

    return c.json({ slots: enrichedSlots })
  } catch (error) {
    console.error("Failed to fetch slots", error)
    return c.json({ error: 'Failed to fetch slots' }, 500)
  }
})

const checkinSchema = z.object({
  slotId: z.string().uuid()
})

app.post('/checkin', zValidator('json', checkinSchema), async (c) => {
  const user = c.get('user')
  const { slotId } = c.req.valid('json')

  try {
    const athleteList = await db.select().from(schema.athletes).where(eq(schema.athletes.userId, user.id)).limit(1)
    if (athleteList.length === 0) {
      return c.json({ error: 'Athlete not found' }, 404)
    }
    const athleteId = athleteList[0]!.id

    // Check capacity
    const slots = await db.select().from(schema.scheduleSlots).where(eq(schema.scheduleSlots.id, slotId)).limit(1)
    if (slots.length === 0) return c.json({ error: 'Slot not found' }, 404)
    const slot = slots[0]!

    const existingBookings = await db.select().from(schema.checkins).where(eq(schema.checkins.slotId, slotId))

    // Check if already booked
    if (existingBookings.some(b => b!.athleteId === athleteId)) {
       return c.json({ error: 'Already booked this slot' }, 400)
    }

    if (existingBookings.length >= slot!.maxCapacity) {
      return c.json({ error: 'Slot is full' }, 400)
    }

    const [newCheckin] = await db.insert(schema.checkins).values({
      athleteId,
      slotId,
      status: 'scheduled'
    }).returning()

    return c.json({ success: true, checkin: newCheckin })
  } catch (error) {
    console.error("Failed to checkin", error)
    return c.json({ error: 'Failed to checkin' }, 500)
  }
})

const anamnesisSchema = z.object({
  medicalRestrictions: z.string().optional(),
  goals: z.string().optional(),
  anthropometricData: z.record(z.any()).optional(),
  lifestyleInfo: z.record(z.any()).optional(),
  consentTermsSigned: z.boolean().refine(val => val === true, {
    message: "Consent terms must be signed"
  })
})

app.post('/anamnesis', zValidator('json', anamnesisSchema), async (c) => {
  const user = c.get('user')
  const body = c.req.valid('json')

  try {
    const athleteList = await db.select().from(schema.athletes).where(eq(schema.athletes.userId, user.id)).limit(1)
    if (athleteList.length === 0) {
      return c.json({ error: 'Athlete not found' }, 404)
    }
    const athleteId = athleteList[0]!.id

    // Check if anamnesis already exists
    const existing = await db.select().from(schema.anamnesis).where(eq(schema.anamnesis.athleteId, athleteId)).limit(1)

    if (existing.length > 0) {
      // Update
      const [updated] = await db.update(schema.anamnesis).set({
        ...body,
        updatedAt: new Date()
      }).where(eq(schema.anamnesis.id, existing[0]!.id)).returning()
      return c.json({ success: true, anamnesis: updated })
    }

    // Insert
    const [newAnamnesis] = await db.insert(schema.anamnesis).values({
      athleteId,
      ...body
    }).returning()

    return c.json({ success: true, anamnesis: newAnamnesis })
  } catch (error) {
    console.error("Failed to save anamnesis", error)
    return c.json({ error: 'Failed to save anamnesis' }, 500)
  }
})

const workoutLogSchema = z.object({
  sessionId: z.string().uuid(),
  rpe: z.number().int().min(1).max(10),
  feeling: z.string().optional()
})

app.post('/workout-log', zValidator('json', workoutLogSchema), async (c) => {
  const user = c.get('user')
  const { sessionId, rpe, feeling } = c.req.valid('json')

  try {
    const athleteList = await db.select().from(schema.athletes).where(eq(schema.athletes.userId, user.id)).limit(1)
    if (athleteList.length === 0) return c.json({ error: 'Athlete not found' }, 404)
    const athleteId = athleteList[0]!.id

    const [newLog] = await db.insert(schema.workoutLogs).values({
      athleteId,
      sessionId,
      rpe,
      feeling
    }).returning()

    return c.json({ success: true, log: newLog })
  } catch (error) {
    console.error("Failed to save workout log", error)
    return c.json({ error: 'Failed to save workout log' }, 500)
  }
})
export default app
