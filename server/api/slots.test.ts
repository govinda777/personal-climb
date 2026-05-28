import { describe, expect, it, mock } from "bun:test";
import { z } from "zod";

// Create an isolated hono app for slots tests to bypass the main app auth requirements entirely for unit tests
import slotsApp from "./slots";
const app = new (require("hono")).Hono();
app.route('/slots', slotsApp);

// Mock neon before importing
let mockNeonTransaction = mock(() => Promise.resolve([{ rows: [] }, { rows: [{ id: "mock-slot-id", maxCapacity: 10 }] }]));

mock.module("@neondatabase/serverless", () => {
  return {
    neon: mock(() => {
      const fn: any = mock(() => {});
      fn.transaction = mockNeonTransaction;
      return fn;
    })
  };
});

let mockSlotsSelectResult: any[] = [];
let mockSlotsDeleteResult: any[] = [];

const mockDb = {
  select: mock(() => ({
    from: mock(() => ({
      where: mock(() => Promise.resolve(mockSlotsSelectResult))
    }))
  })),
  delete: mock(() => ({
    where: mock(() => ({
      returning: mock(() => Promise.resolve(mockSlotsDeleteResult))
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

describe("Slots API - GET /", () => {
  it("should return slots for a given personalId", async () => {
    mockSlotsSelectResult = [{ id: "slot1", personalId: "123e4567-e89b-12d3-a456-426614174000" }];

    const res = await app.request('/slots?personalId=123e4567-e89b-12d3-a456-426614174000', {
      method: 'GET'
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('success');
    expect(json.data).toEqual(mockSlotsSelectResult);
  });
});

describe("Slots API - POST /", () => {
  const validPayload = {
    personalId: "123e4567-e89b-12d3-a456-426614174000",
    startTime: "2023-10-01T10:00:00Z",
    endTime: "2023-10-01T11:00:00Z",
    maxCapacity: 5,
    location: "Gym A"
  };

  it("should create a new slot and return success", async () => {
    mockNeonTransaction.mockImplementationOnce(() => Promise.resolve([{}, { rows: [{ id: "mock-slot-id", ...validPayload }] }]));

    const res = await app.request('/slots', {
      method: 'POST',
      body: JSON.stringify(validPayload),
      headers: { 'Content-Type': 'application/json' }
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('success');
    expect(json.data.id).toBe("mock-slot-id");
  });

  it("should return 400 Bad Request on validation failure", async () => {
    const res = await app.request('/slots', {
      method: 'POST',
      body: JSON.stringify({ personalId: "not-a-uuid" }),
      headers: { 'Content-Type': 'application/json' }
    });

    expect(res.status).toBe(400);
  });

  it("should return 409 Conflict if transaction throws error simulating constraint/overbooking", async () => {
    mockNeonTransaction.mockImplementationOnce(() => Promise.reject(new Error("duplicate key value")));

    const res = await app.request('/slots', {
      method: 'POST',
      body: JSON.stringify(validPayload),
      headers: { 'Content-Type': 'application/json' }
    });

    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.status).toBe('error');
  });
});

describe("Slots API - PUT /:id", () => {
  const updatePayload = {
    maxCapacity: 10
  };

  it("should update an existing slot and return success", async () => {
    mockNeonTransaction.mockImplementationOnce(() => Promise.resolve([{}, { rows: [{ id: "mock-slot-id", maxCapacity: 10 }] }]));

    const res = await app.request('/slots/mock-slot-id', {
      method: 'PUT',
      body: JSON.stringify(updatePayload),
      headers: { 'Content-Type': 'application/json' }
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('success');
    expect(json.data.maxCapacity).toBe(10);
  });

  it("should return 400 Bad Request if no fields are provided", async () => {
    const res = await app.request('/slots/mock-slot-id', {
      method: 'PUT',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' }
    });

    expect(res.status).toBe(400);
  });

  it("should return 404 if slot not found to update", async () => {
    mockNeonTransaction.mockImplementationOnce(() => Promise.resolve([{}, { rows: [] }]));

    const res = await app.request('/slots/mock-slot-id', {
      method: 'PUT',
      body: JSON.stringify(updatePayload),
      headers: { 'Content-Type': 'application/json' }
    });

    expect(res.status).toBe(404);
  });
});

describe("Slots API - DELETE /:id", () => {
  it("should delete an existing slot and return success", async () => {
    mockSlotsDeleteResult = [{ id: "mock-slot-id" }];

    const res = await app.request('/slots/mock-slot-id', {
      method: 'DELETE'
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('success');
    expect(json.data.id).toBe("mock-slot-id");
  });

  it("should return 404 if slot not found to delete", async () => {
    mockSlotsDeleteResult = [];

    const res = await app.request('/slots/mock-slot-id', {
      method: 'DELETE'
    });

    expect(res.status).toBe(404);
  });
});
