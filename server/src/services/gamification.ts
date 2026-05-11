import { profiles, gamificationLogs } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../db/schema";
import { GAMIFICATION_CONFIG } from "../lib/gamification";

export class GamificationService {
  constructor(private db: NodePgDatabase<typeof schema>) {}

  async getOrCreateProfile(userId: string) {
    const existing = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const [newProfile] = await this.db
      .insert(profiles)
      .values({
        id: userId,
        xp: 0,
        level: 1,
      })
      .returning();

    return newProfile;
  }

  async addXP(userId: string, points: number, reason: string) {
    const profile = await this.getOrCreateProfile(userId);
    const newXP = profile.xp + points;

    const newLevel = GAMIFICATION_CONFIG.LEVEL_FORMULA(newXP);

    const [updatedProfile] = await this.db
      .update(profiles)
      .set({
        xp: newXP,
        level: newLevel,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userId))
      .returning();

    await this.db.insert(gamificationLogs).values({
      profileId: userId,
      points,
      reason,
    });

    return updatedProfile;
  }

  async handleDailyLogin(userId: string) {
    const profile = await this.getOrCreateProfile(userId);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const lastLogin = profile.lastLoginAt;
    const lastLoginDate = lastLogin ? new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate()) : null;

    if (!lastLoginDate || lastLoginDate < today) {
      const reward = GAMIFICATION_CONFIG.REWARDS.DAILY_LOGIN;
      const updated = await this.addXP(userId, reward.XP, reward.REASON);
      await this.db
        .update(profiles)
        .set({ lastLoginAt: now })
        .where(eq(profiles.id, userId));
      return { ...updated, awarded: true };
    }

    return { ...profile, awarded: false };
  }
}
