import {
  describe,
  expect,
  it,
  mock,
  beforeEach,
  afterEach,
  setSystemTime,
} from "bun:test";

// Mock the database schema and drizzle-orm before importing the service
mock.module("../db/schema", () => ({
  profiles: { id: "profiles_id" },
  gamificationLogs: { id: "gamification_logs_id" },
}));

mock.module("drizzle-orm", () => ({
  eq: mock(() => ({})),
  and: mock(() => ({})),
  sql: mock(() => ({})),
}));

// Now we can import the service
import { GamificationService } from "./gamification";
import { GAMIFICATION_CONFIG } from "../lib/gamification";

describe("GamificationService", () => {
  let service: GamificationService;
  let mockDb: any;

  beforeEach(() => {
    // Basic mock structure for Drizzle's fluent API
    mockDb = {
      select: mock(() => ({
        from: mock(() => ({
          where: mock(() => ({
            limit: mock(() => Promise.resolve([])),
          })),
        })),
      })),
      insert: mock(() => ({
        values: mock(() => ({
          returning: mock(() => Promise.resolve([])),
        })),
      })),
      update: mock(() => ({
        set: mock(() => ({
          where: mock(() => ({
            returning: mock(() => Promise.resolve([])),
          })),
        })),
      })),
    };
    service = new GamificationService(mockDb);
  });

  afterEach(() => {
    setSystemTime(); // Reset system time after each test
  });

  describe("handleDailyLogin", () => {
    const userId = "user_123";
    const mockProfile = {
      id: userId,
      xp: 100,
      level: 2,
      lastLoginAt: null as Date | null,
    };

    it("should award XP for the first ever login", async () => {
      const now = new Date("2024-03-20T10:00:00Z");
      setSystemTime(now);

      // Mock getOrCreateProfile to return a profile with no lastLoginAt
      mockDb.select.mockImplementation(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([mockProfile]),
          }),
        }),
      }));

      // Mock update to return updated profile
      const updatedProfile = {
        ...mockProfile,
        xp: mockProfile.xp + 10,
        lastLoginAt: now,
      };
      mockDb.update.mockImplementation(() => ({
        set: () => ({
          where: () => ({
            returning: () => Promise.resolve([updatedProfile]),
          }),
        }),
      }));

      const result = await service.handleDailyLogin(userId);

      expect(result.awarded).toBe(true);
      expect(result.xp).toBe(
        mockProfile.xp + GAMIFICATION_CONFIG.REWARDS.DAILY_LOGIN.XP,
      );

      // Verify update was called to set lastLoginAt
      expect(mockDb.update).toHaveBeenCalled();
    });

    it("should award XP for login on a new day", async () => {
      const lastLogin = new Date("2024-03-19T23:59:59Z");
      const now = new Date("2024-03-20T00:00:01Z");
      setSystemTime(now);

      const profileWithLastLogin = { ...mockProfile, lastLoginAt: lastLogin };

      mockDb.select.mockImplementation(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([profileWithLastLogin]),
          }),
        }),
      }));

      const updatedProfile = {
        ...profileWithLastLogin,
        xp: profileWithLastLogin.xp + 10,
        lastLoginAt: now,
      };
      mockDb.update.mockImplementation(() => ({
        set: () => ({
          where: () => ({
            returning: () => Promise.resolve([updatedProfile]),
          }),
        }),
      }));

      const result = await service.handleDailyLogin(userId);

      expect(result.awarded).toBe(true);
      expect(result.xp).toBe(
        profileWithLastLogin.xp + GAMIFICATION_CONFIG.REWARDS.DAILY_LOGIN.XP,
      );
    });

    it("should NOT award XP for login on the same day", async () => {
      const lastLogin = new Date("2024-03-20T08:00:00Z");
      const now = new Date("2024-03-20T15:00:00Z");
      setSystemTime(now);

      const profileWithLastLogin = { ...mockProfile, lastLoginAt: lastLogin };

      mockDb.select.mockImplementation(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([profileWithLastLogin]),
          }),
        }),
      }));

      const result = await service.handleDailyLogin(userId);

      expect(result.awarded).toBe(false);
      expect(result.xp).toBe(profileWithLastLogin.xp);
    });

    it("should award XP exactly at midnight of a new day", async () => {
      const lastLogin = new Date("2024-03-19T23:59:59Z");
      const now = new Date("2024-03-20T00:00:00Z");
      setSystemTime(now);

      const profileWithLastLogin = { ...mockProfile, lastLoginAt: lastLogin };

      mockDb.select.mockImplementation(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([profileWithLastLogin]),
          }),
        }),
      }));

      const updatedProfile = {
        ...profileWithLastLogin,
        xp: profileWithLastLogin.xp + 10,
        lastLoginAt: now,
      };
      mockDb.update.mockImplementation(() => ({
        set: () => ({
          where: () => ({
            returning: () => Promise.resolve([updatedProfile]),
          }),
        }),
      }));

      const result = await service.handleDailyLogin(userId);

      expect(result.awarded).toBe(true);
    });
  });
});
