export const GAMIFICATION_CONFIG = {
  REWARDS: {
    DAILY_LOGIN: {
      XP: 10,
      MESSAGE: "Você ganhou 10 XP pelo login diário!",
    },
    ONBOARDING: {
      XP: 100,
      MESSAGE: "Bem-vindo ao Protocolo! Você ganhou 100 XP!",
    },
    WORKOUT_COMPLETE: {
      XP: 200,
      MESSAGE: "Treino finalizado com sucesso! +200 XP para sua evolução.",
    },
  },
  LEVEL_FORMULA: (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1,
};
