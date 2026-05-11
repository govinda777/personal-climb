export const GAMIFICATION_CONFIG = {
  REWARDS: {
    DAILY_LOGIN: {
      XP: 10,
      REASON: "Daily Login",
    },
    ONBOARDING: {
      XP: 100,
      REASON: "Onboarding Complete",
    },
    WORKOUT_COMPLETE: {
      XP: 200,
      REASON: "Workout Session Completed",
    },
  },
  LEVEL_FORMULA: (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1,
};
