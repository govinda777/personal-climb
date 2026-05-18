import { describe, expect, it, mock } from "bun:test";
import { z } from "zod";

// Mock neon before importing
mock.module("@neondatabase/serverless", () => {
  return {
    neon: mock(() => mock(() => {}))
  };
});

let mockExistingCheckin: any[] = [];
let mockInsertThrows = false;

const mockDb = {
  select: mock(() => ({
    from: mock(() => ({
      where: mock(() => ({
        limit: mock(() => Promise.resolve(mockExistingCheckin))
      }))
    }))
  })),
  insert: mock(() => ({
    values: mock(() => {
      if (mockInsertThrows) {
        throw new Error('duplicate key value violates unique constraint');
      }
      return Promise.resolve();
    })
  }))
};

mock.module("drizzle-orm/neon-http", () => {
  return {
    drizzle: mock(() => mockDb)
  };
});

mock.module("drizzle-orm", () => ({
  eq: mock(() => ({})),
  and: mock(() => ({})),
  sql: mock(() => ({})),
}));

// Export the hono app from the index file to test
import { app } from "./index";

describe("Check-in API", () => {
  const validPayload = {
    athleteId: "123e4567-e89b-12d3-a456-426614174000",
    slotId: "123e4567-e89b-12d3-a456-426614174001"
  };

  it("should confirm checkin successfully", async () => {
    mockExistingCheckin = [];
    mockInsertThrows = false;

    const res = await app.request('/api/checkin', {
      method: 'POST',
      body: JSON.stringify(validPayload),
      headers: { 'Content-Type': 'application/json' }
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'success', message: 'Check-in confirmed' });
  });

  it("should return 409 Conflict if duplicate checkin is found in select", async () => {
    mockExistingCheckin = [{ id: '123' }];
    mockInsertThrows = false;

    const res = await app.request('/api/checkin', {
      method: 'POST',
      body: JSON.stringify(validPayload),
      headers: { 'Content-Type': 'application/json' }
    });

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ status: 'error', message: 'User already checked in for this slot' });
  });

  it("should return 409 Conflict if insert throws a duplicate key error", async () => {
    mockExistingCheckin = [];
    mockInsertThrows = true;

    const res = await app.request('/api/checkin', {
      method: 'POST',
      body: JSON.stringify(validPayload),
      headers: { 'Content-Type': 'application/json' }
    });

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ status: 'error', message: 'User already checked in for this slot' });
  });
});
