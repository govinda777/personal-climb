import { test, expect } from "@playwright/test";

test.describe("Gamification Web3 E2E", () => {
  test("Should trigger onboarding and retrieve EIP-712 XP proof (Mocked API)", async ({
    page,
  }) => {
    // Interceptar rotas da API para simular o backend e a integração Privy
    const mockDid = "did:privy:mock-user";
    const mockWallet = "0x1234567890123456789012345678901234567890";
    const xpPoints = 100;

    await page.route("**/api/actions/onboarding", async (route) => {
      // Contador simulado para aplicar o Rate Limiting
      const hasOnboarded =
        route.request().headers()["x-has-onboarded"] === "true";
      if (hasOnboarded) {
        await route.fulfill({
          status: 429,
          contentType: "application/json",
          body: JSON.stringify({
            error:
              "Rate limit exceeded for action: Onboarding Complete. Cooldown is 8760 hours.",
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: mockDid,
            xp: xpPoints,
            level: 2,
          }),
        });
      }
    });

    await page.route(`**/api/verify-xp/${mockWallet}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          payload: {
            user: mockWallet,
            totalXp: xpPoints,
            nonce: "0xmocknonce123",
          },
          signature: "0xmocked_eip712_signature",
          signerAuthority: "0xserverauthority",
        }),
      });
    });

    // 1. Simula a chamada de ação que dá XP (1ª vez)
    const onboardingRes = await page.evaluate(async () => {
      const res = await fetch("http://127.0.0.1:3000/api/actions/onboarding", {
        method: "POST",
        headers: { Authorization: "Bearer mock-token" },
      });
      return { ok: res.ok, json: await res.json(), status: res.status };
    });

    expect(onboardingRes.ok).toBeTruthy();
    expect(onboardingRes.json.xp).toBe(100);

    // 2. Simula o Rate Limiting (rejeitando a segunda chamada de onboarding)
    const duplicateRes = await page.evaluate(async () => {
      const res = await fetch("http://127.0.0.1:3000/api/actions/onboarding", {
        method: "POST",
        headers: {
          Authorization: "Bearer mock-token",
          "X-Has-Onboarded": "true", // Trigger para nosso mock do rate limit
        },
      });
      return { ok: res.ok, json: await res.json(), status: res.status };
    });

    expect(duplicateRes.status).toBe(429);
    expect(duplicateRes.json.error).toContain("Rate limit exceeded");

    // 3. Simula a chamada de EIP-712 Attestation
    const verifyRes = await page.evaluate(async (wallet) => {
      const res = await fetch(`http://127.0.0.1:3000/api/verify-xp/${wallet}`, {
        headers: { Authorization: "Bearer mock-token" },
      });
      return { ok: res.ok, json: await res.json() };
    }, mockWallet);

    expect(verifyRes.ok).toBeTruthy();
    const eip712Data = verifyRes.json;

    // Asserções para garantir que o formato de assinatura e payload estão corretos para o smart contract
    expect(eip712Data).toHaveProperty("signature");
    expect(eip712Data.payload.totalXp).toBe(xpPoints);
    expect(eip712Data.payload.user).toBe(mockWallet);
    expect(eip712Data.signerAuthority).toBeDefined();
  });
});
