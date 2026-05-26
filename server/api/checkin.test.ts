import { describe, expect, it, mock } from "bun:test";
import { z } from "zod";

let mockExistingCheckin: any[] = [];
let mockSlot: any[] = [{ id: '123', maxCapacity: 1 }];
let mockCount: any[] = [{ count: 0 }];
let mockInsertThrows = false;

const mockTxDb = {
  select: mock((args: any) => ({
    from: mock((table: any) => ({
      where: mock(() => {
        return {
          limit: mock(() => {
            const tableName = table && typeof table === 'object' ? (table as any)[Symbol.for('drizzle:Name')] || table.name || Object.keys(table)[0] : table;
            if (tableName === 'checkins' || table?.name === 'checkins' || table?.checkins) {
              return Promise.resolve(mockExistingCheckin);
            }
            if (tableName === 'schedule_slots' || table?.name === 'schedule_slots' || table?.scheduleSlots) {
              return Promise.resolve(mockSlot);
            }
            return Promise.resolve([]);
          }),
          then: (resolve: any) => {
             // For the count query without limit
             resolve(mockCount);
          }
        }
      })
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

const mockDb = {
  transaction: mock(async (cb: any) => {
    return cb(mockTxDb);
  })
};

// Mock Pool before importing
mock.module("@neondatabase/serverless", () => {
  return {
    Pool: class { constructor() {} end() {} }
  };
});

mock.module("drizzle-orm/neon-serverless", () => {
  return {
    drizzle: mock(() => mockDb)
  };
});

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
    slotId: "123e4567-e89b-12d3-a456-426614174001",
  };

  it("should confirm checkin successfully", async () => {
    mockExistingCheckin = [];
    mockSlot = [{ id: '123', maxCapacity: 1 }];
    mockCount = [{ count: 0 }];
    mockInsertThrows = false;

    const res = await app.request("/api/checkin", {
      method: "POST",
      body: JSON.stringify(validPayload),
      headers: { "Content-Type": "application/json" },
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      status: "success",
      message: "Check-in confirmed",
    });
  });

  it("should return 409 Conflict if duplicate checkin is found in select", async () => {
    mockExistingCheckin = [{ id: "123" }];
    mockSlot = [{ id: '123', maxCapacity: 1 }];
    mockCount = [{ count: 0 }];
    mockInsertThrows = false;

    const res = await app.request("/api/checkin", {
      method: "POST",
      body: JSON.stringify(validPayload),
      headers: { "Content-Type": "application/json" },
    });

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({
      status: "error",
      message: "User already checked in for this slot",
    });
  });

  it("should return 404 Not Found if slot is missing", async () => {
    mockExistingCheckin = [];
    mockSlot = [];
    mockCount = [{ count: 0 }];
    mockInsertThrows = false;

    const res = await app.request("/api/checkin", {
      method: "POST",
      body: JSON.stringify(validPayload),
      headers: { "Content-Type": "application/json" },
    });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      status: "error",
      message: "Schedule slot not found",
    });
  });

  it("should return 409 Conflict if schedule slot is at maximum capacity", async () => {
    mockExistingCheckin = [];
    mockSlot = [{ id: '123', maxCapacity: 5 }];
    mockCount = [{ count: 5 }];
    mockInsertThrows = false;

    const res = await app.request("/api/checkin", {
      method: "POST",
      body: JSON.stringify(validPayload),
      headers: { "Content-Type": "application/json" },
    });

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({
      status: "error",
      message: "Schedule slot is at maximum capacity",
    });
  });

  it("should return 409 Conflict if insert throws a duplicate key error", async () => {
    mockExistingCheckin = [];
    mockSlot = [{ id: '123', maxCapacity: 1 }];
    mockCount = [{ count: 0 }];
    mockInsertThrows = true;

    const res = await app.request("/api/checkin", {
      method: "POST",
      body: JSON.stringify(validPayload),
      headers: { "Content-Type": "application/json" },
    });

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({
      status: "error",
      message: "User already checked in for this slot",
    });
  });
});
