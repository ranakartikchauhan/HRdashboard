import request from "supertest";
import app from "../index.js";
import mongoose from "mongoose";
import attendance from "../models/attendance.js";

describe("attendance API", () => {
  let createdItem;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clear the collection before each test
    await attendance.deleteMany({});
  });

  test("POST /api/attendance should create a new attendance", async () => {
    const response = await request(app)
      .post("/api/attendance")
      .send({ name: "Test attendance", price: 100, isPublished: true });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.name).toBe("Test attendance");
    createdItem = response.body;
  });

  test("GET /api/attendance should return paginated results", async () => {
    // Create some test data
    await attendance.create([
      { name: "attendance 1", price: 100, isPublished: true },
      { name: "attendance 2", price: 200, isPublished: false },
    ]);

    const response = await request(app).get("/api/attendance?page=1&limit=2");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("total");
    expect(response.body).toHaveProperty("page");
    expect(response.body).toHaveProperty("limit");
    expect(response.body.data).toHaveLength(2);
  });

  test("GET /api/attendance/:id should return a single attendance", async () => {
    const item = await attendance.create({
      name: "Test attendance",
      price: 100,
      isPublished: true,
    });
    const response = await request(app).get(`/api/attendance/${item._id}`);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Test attendance");
  });

  test("GET /api/attendance/:id should return 404 if attendance not found", async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const response = await request(app).get(`/api/attendance/${invalidId}`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("attendance not found");
  });

  test("PUT /api/attendance/:id should update a attendance", async () => {
    const item = await attendance.create({
      name: "Test attendance",
      price: 100,
      isPublished: true,
    });
    const response = await request(app)
      .put(`/api/attendance/${item._id}`)
      .send({ name: "Updated attendance", price: 200 });
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Updated attendance");
    expect(response.body.price).toBe(200);
  });

  test("PUT /api/attendance/:id should return 404 if attendance not found", async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .put(`/api/attendance/${invalidId}`)
      .send({ name: "Updated attendance", price: 200 });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("attendance not found");
  });

  test("DELETE /api/attendance/:id should delete a attendance", async () => {
    const item = await attendance.create({
      name: "Test attendance",
      price: 100,
      isPublished: true,
    });
    const response = await request(app).delete(`/api/attendance/${item._id}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("attendance deleted successfully");

    // Verify the item is deleted
    const deletedItem = await attendance.findById(item._id);
    expect(deletedItem).toBeNull();
  });

  test("DELETE /api/attendance/:id should return 404 if attendance not found", async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const response = await request(app).delete(`/api/attendance/${invalidId}`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("attendance not found");
  });
});
