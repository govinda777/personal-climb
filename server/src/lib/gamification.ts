export const GAMIFICATION_CONFIG = {
  REWARDS: {
    DAILY_LOGIN: {
      XP: 10,
      REASON: "Daily Login",
      COOLDOWN_HOURS: 24, // Limite de 1 por dia
    },
    ONBOARDING: {
      XP: 100,
      REASON: "Onboarding Complete",
      COOLDOWN_HOURS: 8760, // Limite de 1 por ano (efetivamente 1 vez)
    },
    WORKOUT_COMPLETE: {
      XP: 200,
      REASON: "Workout Session Completed",
      COOLDOWN_HOURS: 12, // Rate Limiting de 1 treino a cada 12 horas
    },
  },
  LEVEL_FORMULA: (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1,
  EIP712_DOMAIN: {
    name: "XpAttestation",
    version: "1",
    chainId: 31337, // Localhost/Hardhat. Ajustar em prod!
  },
  EIP712_TYPES: {
    AttestPayload: [
      { name: "user", type: "address" },
      { name: "totalXp", type: "uint256" },
      { name: "nonce", type: "bytes32" },
    ],
  },
};
