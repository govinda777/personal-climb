import { describe, expect, it, mock } from "bun:test";

global.global.mockUserResult = [{ stripeCustomerId: 'cus_123' }];
let mockUserResult: any[] = global.mockUserResult;

const mockDb = {
  select: mock(() => ({
    from: mock(() => ({
      where: mock(() => ({
        limit: mock(() => Promise.resolve(mockUserResult))
      }))
    }))
  })),
  insert: mock(() => ({ values: mock(() => Promise.resolve()) }))
};

// Override neon
mock.module("@neondatabase/serverless", () => {
  return {
    neon: mock(() => mock(() => {}))
  };
});

mock.module("drizzle-orm/neon-http", () => {
  return {
    drizzle: () => mockDb
  };
});

mock.module("../src/services/stripe", () => {
  return {
    StripeService: class {
      createBillingPortalSession = mock(() => Promise.resolve("https://billing.stripe.com/p/session/test"))
    }
  }
});

// Import the edge app AFTER mocking
import { app } from "./index";

describe("Billing Portal Edge API", () => {
  it("should return a billing portal url", async () => {
    mockUserResult = [{ stripeCustomerId: 'cus_123' }];
    const res = await app.request('/api/actions/billing-portal', {
      method: 'POST',
      body: JSON.stringify({ returnUrl: 'http://localhost:3000' }),
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test' }
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ url: 'https://billing.stripe.com/p/session/test' });
  });

  it("should return 404 if user has no stripe customer id", async () => {
    global.mockUserResult = [];
    const res = await app.request('/api/actions/billing-portal', {
      method: 'POST',
      body: JSON.stringify({ returnUrl: 'http://localhost:3000' }),
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test' }
    });

    expect(res.status).toBe(404);
  });
});
