import request from "supertest";
import app from "../index.js";
import mongoose from "mongoose";
import leave from "../models/leave.js";

describe("leave API", () => {
  let createdItem;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clear the collection before each test
    await leave.deleteMany({});
  });

  test("POST /api/leave should create a new leave", async () => {
    const response = await request(app)
      .post("/api/leave")
      .send({ name: "Test leave", price: 100, isPublished: true });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.name).toBe("Test leave");
    createdItem = response.body;
  });

  test("GET /api/leave should return paginated results", async () => {
    // Create some test data
    await leave.create([
      { name: "leave 1", price: 100, isPublished: true },
      { name: "leave 2", price: 200, isPublished: false },
    ]);

    const response = await request(app).get("/api/leave?page=1&limit=2");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("total");
    expect(response.body).toHaveProperty("page");
    expect(response.body).toHaveProperty("limit");
    expect(response.body.data).toHaveLength(2);
  });

  test("GET /api/leave/:id should return a single leave", async () => {
    const item = await leave.create({
      name: "Test leave",
      price: 100,
      isPublished: true,
    });
    const response = await request(app).get(`/api/leave/${item._id}`);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Test leave");
  });

  test("GET /api/leave/:id should return 404 if leave not found", async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const response = await request(app).get(`/api/leave/${invalidId}`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("leave not found");
  });

  test("PUT /api/leave/:id should update a leave", async () => {
    const item = await leave.create({
      name: "Test leave",
      price: 100,
      isPublished: true,
    });
    const response = await request(app)
      .put(`/api/leave/${item._id}`)
      .send({ name: "Updated leave", price: 200 });
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Updated leave");
    expect(response.body.price).toBe(200);
  });

  test("PUT /api/leave/:id should return 404 if leave not found", async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .put(`/api/leave/${invalidId}`)
      .send({ name: "Updated leave", price: 200 });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("leave not found");
  });

  test("DELETE /api/leave/:id should delete a leave", async () => {
    const item = await leave.create({
      name: "Test leave",
      price: 100,
      isPublished: true,
    });
    const response = await request(app).delete(`/api/leave/${item._id}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("leave deleted successfully");

    // Verify the item is deleted
    const deletedItem = await leave.findById(item._id);
    expect(deletedItem).toBeNull();
  });

  test("DELETE /api/leave/:id should return 404 if leave not found", async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const response = await request(app).delete(`/api/leave/${invalidId}`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("leave not found");
  });
});
