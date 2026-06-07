import { describe, expect, it, mock } from "bun:test";
import { z } from "zod";

let mockExistingCheckin: any[] = [];
let mockInsertThrowsDuplicate = false;
let mockInsertThrowsCapacity = false;

// Mock neon transaction result before importing
let mockNeonTransaction = mock(() => {
  if (mockInsertThrowsDuplicate) {
    throw new Error('duplicate key value violates unique constraint');
  }
  if (mockInsertThrowsCapacity) {
    return Promise.resolve([{}, { rows: [] }]); // Simulates no rows returned when capacity constraint is not met
  }
  return Promise.resolve([{}, { rows: [{ id: "mock-checkin-id" }] }]); // Simulates successful insertion
});

mock.module("@neondatabase/serverless", () => {
  return {
    neon: mock(() => {
      const fn: any = mock(() => {});
      fn.transaction = mockNeonTransaction;
      return fn;
    })
  };
});

const mockDb = {
  select: mock(() => ({
    from: mock(() => ({
      where: mock(() => ({
        limit: mock(() => Promise.resolve(mockExistingCheckin))
      }))
    }))
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
    mockInsertThrowsDuplicate = false;
    mockInsertThrowsCapacity = false;

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
    mockInsertThrowsDuplicate = false;
    mockInsertThrowsCapacity = false;

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
    mockInsertThrowsDuplicate = true;
    mockInsertThrowsCapacity = false;

    const res = await app.request('/api/checkin', {
      method: 'POST',
      body: JSON.stringify(validPayload),
      headers: { 'Content-Type': 'application/json' }
    });

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ status: 'error', message: 'User already checked in for this slot' });
  });

  it("should return 409 Conflict if slot capacity is reached", async () => {
    mockExistingCheckin = [];
    mockInsertThrowsDuplicate = false;
    mockInsertThrowsCapacity = true;

    const res = await app.request('/api/checkin', {
      method: 'POST',
      body: JSON.stringify(validPayload),
      headers: { 'Content-Type': 'application/json' }
    });

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ status: 'error', message: 'Slot capacity reached' });
  });
});
