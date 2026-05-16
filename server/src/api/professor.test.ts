import { describe, it, expect, mock, beforeEach } from "bun:test";
import { createMiddleware } from 'hono/factory';

// Mock middleware first
mock.module("../middleware/auth", () => ({
  privyAuth: () => createMiddleware(async (c: any, next: any) => { c.set('user', { id: 'did:privy:test1234' }); await next(); })
}));

// Mock DB
const mockInsert = mock(() => ({
  values: mock(() => ({
    returning: mock(() => [{ id: 'mock-id', brandName: 'Test Brand' }])
  }))
}));

const mockUpdate = mock(() => ({
  set: mock(() => ({
    where: mock(() => ({
      returning: mock(() => [{ id: 'mock-id', brandName: 'Updated Brand' }])
    }))
  }))
}));

const mockSelect = mock(() => ({
  from: mock(() => ({
    where: mock(() => ({
      limit: mock(() => [{ id: 'personal-1', brandName: 'Test Brand' }])
    }))
  }))
}));

mock.module("drizzle-orm/node-postgres", () => ({
  drizzle: () => ({
    insert: mockInsert,
    update: mockUpdate,
    select: mockSelect
  })
}));

import app from "./professor";

describe.skip("Professor API Routes", () => {
  beforeEach(() => {
    mockSelect.mockClear();
    mockUpdate.mockClear();
    mockInsert.mockClear();
  });

  it("should update profile (PUT /profile)", async () => {
    const res = await app.request('/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer fake' },
      body: JSON.stringify({ brandName: 'Updated Brand', primaryColor: '#ffffff' })
    });

    expect(res.status).toBe(200);
  });

  it("should fail validation if brandName is missing (PUT /profile)", async () => {
    const res = await app.request('/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer fake' },
      body: JSON.stringify({ primaryColor: '#ffffff' })
    });

    expect(res.status).toBe(400);
  });

  it("should update training protocol (PUT /protocol)", async () => {
    const res = await app.request('/protocol', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer fake' },
      body: JSON.stringify({ trainingPhilosophy: 'This is my philosophy, it needs to be long enough', evaluationMetrics: {} })
    });

    expect(res.status).toBe(200);
  });
});
