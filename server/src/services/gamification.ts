import { profiles, gamificationLogs } from "../db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
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

  async canEarnXP(userId: string, reason: string, cooldownHours: number): Promise<boolean> {
    const logs = await this.db
      .select()
      .from(gamificationLogs)
      .where(and(
        eq(gamificationLogs.profileId, userId),
        eq(gamificationLogs.reason, reason)
      ))
      .orderBy(desc(gamificationLogs.createdAt))
      .limit(1);

    if (logs.length === 0) return true;

    const lastLog = logs[0];
    const now = new Date();
    if (!lastLog?.createdAt) return true;
    const hoursSinceLastAction = (now.getTime() - lastLog!.createdAt.getTime()) / (1000 * 60 * 60);

    return hoursSinceLastAction >= cooldownHours;
  }

  async addXP(userId: string, points: number, reason: string, cooldownHours: number = 0) {
    const profile = await this.getOrCreateProfile(userId);

    if (cooldownHours > 0) {
      const canEarn = await this.canEarnXP(userId, reason, cooldownHours);
      if (!canEarn) {
        throw new Error(`Rate limit exceeded for action: ${reason}. Cooldown is ${cooldownHours} hours.`);
      }
    }

    const newXP = (profile?.xp ?? 0) + points;

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

    const lastLogin = profile?.lastLoginAt;
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

    return { ...(profile || {}), awarded: false };
  }
}
