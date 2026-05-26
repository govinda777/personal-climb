import { Hono } from "hono";
import { handle } from "hono/vercel";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "../src/db/schema";
import { eq, and, sql } from "drizzle-orm";

export const config = {
  runtime: "edge",
};

export const app = new Hono().basePath("/api");

app.get("/hello", (c) => {
  return c.json({
    message: "Hello from Personal Climb API on Vercel!",
  });
});

// Check-in Route
const checkinSchema = z.object({
  athleteId: z.string().uuid(),
  slotId: z.string().uuid(),
});

app.post("/checkin", zValidator("json", checkinSchema), async (c) => {
  const { athleteId, slotId } = c.req.valid("json");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const db = drizzle(pool, { schema });

  try {
    await db.transaction(
      async (tx) => {
        // 1. Check if user is already checked in
        const [existingCheckin] = await tx
          .select()
          .from(schema.checkins)
          .where(
            and(
              eq(schema.checkins.athleteId, athleteId),
              eq(schema.checkins.slotId, slotId),
            ),
          )
          .limit(1);

        if (existingCheckin) {
          throw new Error("ALREADY_CHECKED_IN");
        }

        // 2. Lock the schedule slot to prevent concurrent overbooking
        const [slot] = await tx
          .select()
          .from(schema.scheduleSlots)
          .where(eq(schema.scheduleSlots.id, slotId))
          .limit(1);

        if (!slot) {
          throw new Error("SLOT_NOT_FOUND");
        }

        // 3. Count current checkins
        const [{ count }] = await tx
          .select({
            count: sql<number>`cast(count(${schema.checkins.id}) as integer)`,
          })
          .from(schema.checkins)
          .where(eq(schema.checkins.slotId, slotId));

        if (count >= slot.maxCapacity) {
          throw new Error("SLOT_FULL");
        }

        // 4. Insert the checkin
        await tx.insert(schema.checkins).values({
          athleteId,
          slotId,
          status: "scheduled",
        });
      },
      { isolationLevel: "serializable" },
    );

    try {
      c.executionCtx.waitUntil(pool.end());
    } catch (e) {
      pool.end();
    }

    return c.json({ status: "success", message: "Check-in confirmed" });
  } catch (error: any) {
    try {
      c.executionCtx.waitUntil(pool.end());
    } catch (e) {
      pool.end();
    }

    console.error("Checkin error:", error);
    if (
      error.message === "ALREADY_CHECKED_IN" ||
      error.message?.includes("duplicate key value") ||
      error.code === "23505"
    ) {
      return c.json(
        { status: "error", message: "User already checked in for this slot" },
        409,
      );
    }
    if (error.message === "SLOT_FULL") {
      return c.json(
        { status: "error", message: "Schedule slot is at maximum capacity" },
        409,
      );
    }
    if (error.message === "SLOT_NOT_FOUND") {
      return c.json(
        { status: "error", message: "Schedule slot not found" },
        404,
      );
    }
    return c.json({ status: "error", message: "Internal server error" }, 500);
  }
});

export default handle(app);
