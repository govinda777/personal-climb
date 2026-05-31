import { describe, it, expect, mock, beforeEach } from "bun:test";

// Mock middleware first
import { createMiddleware } from 'hono/factory';
mock.module("../middleware/auth", () => ({
  privyAuth: () => createMiddleware(async (c: any, next: any) => { c.set('user', { id: 'did:privy:test1234' }); await next(); })
}));
//


// Mock DB
const mockInsert = mock(() => ({
  values: mock(() => ({
    returning: mock(() => [{ id: 'mock-id' }])
  }))
}));

const mockUpdate = mock(() => ({
  set: mock(() => ({
    where: mock(() => ({
      returning: mock(() => [{ id: 'mock-id' }])
    }))
  }))
}));

const mockSelect = mock(() => ({
  from: mock(() => ({
    where: mock(() => ({
      limit: mock(() => [{ id: 'athlete-1', personalId: 'personal-1' }])
    }))
  }))
}));

mock.module("@privy-io/server-auth", () => ({
  PrivyClient: class {
    verifyAuthToken() {
      return Promise.resolve({ userId: 'did:privy:test1234' });
    }
  }
}));
mock.module("drizzle-orm/node-postgres", () => ({
  drizzle: () => ({
    insert: mockInsert,
    update: mockUpdate,
    select: mockSelect
  })
}));

import app from "./athlete";

describe.skip("Athlete API Routes", () => {
  beforeEach(() => {
    mockSelect.mockClear();
    mockUpdate.mockClear();
    mockInsert.mockClear();
  });

  it("should fail validation if consent is false (POST /anamnesis)", async () => {
    const res = await app.request('/anamnesis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer fake-token' },
      body: JSON.stringify({ consentTermsSigned: false })
    });

    expect(res.status).toBe(400);
  });

  it("should fail validation if slotId is not UUID (POST /checkin)", async () => {
    const res = await app.request('/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer fake-token' },
      body: JSON.stringify({ slotId: 'not-a-uuid' })
    });

    expect(res.status).toBe(400);
  });

  it("should fail validation if rpe is out of bounds (POST /workout-log)", async () => {
    const res = await app.request('/workout-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer fake-token' },
      body: JSON.stringify({ sessionId: '123e4567-e89b-12d3-a456-426614174000', rpe: 11 })
    });

    expect(res.status).toBe(400);
  });
});
