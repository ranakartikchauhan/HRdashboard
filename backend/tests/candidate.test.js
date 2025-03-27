import request from "supertest";
import app from "../index.js";
import mongoose from "mongoose";
import candidate from "../models/candidate.js";

describe("candidate API", () => {
  let createdItem;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clear the collection before each test
    await candidate.deleteMany({});
  });

  test("POST /api/candidate should create a new candidate", async () => {
    const response = await request(app)
      .post("/api/candidate")
      .send({ name: "Test candidate", price: 100, isPublished: true });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.name).toBe("Test candidate");
    createdItem = response.body;
  });

  test("GET /api/candidate should return paginated results", async () => {
    // Create some test data
    await candidate.create([
      { name: "candidate 1", price: 100, isPublished: true },
      { name: "candidate 2", price: 200, isPublished: false },
    ]);

    const response = await request(app).get("/api/candidate?page=1&limit=2");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("total");
    expect(response.body).toHaveProperty("page");
    expect(response.body).toHaveProperty("limit");
    expect(response.body.data).toHaveLength(2);
  });

  test("GET /api/candidate/:id should return a single candidate", async () => {
    const item = await candidate.create({
      name: "Test candidate",
      price: 100,
      isPublished: true,
    });
    const response = await request(app).get(`/api/candidate/${item._id}`);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Test candidate");
  });

  test("GET /api/candidate/:id should return 404 if candidate not found", async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const response = await request(app).get(`/api/candidate/${invalidId}`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("candidate not found");
  });

  test("PUT /api/candidate/:id should update a candidate", async () => {
    const item = await candidate.create({
      name: "Test candidate",
      price: 100,
      isPublished: true,
    });
    const response = await request(app)
      .put(`/api/candidate/${item._id}`)
      .send({ name: "Updated candidate", price: 200 });
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Updated candidate");
    expect(response.body.price).toBe(200);
  });

  test("PUT /api/candidate/:id should return 404 if candidate not found", async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .put(`/api/candidate/${invalidId}`)
      .send({ name: "Updated candidate", price: 200 });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("candidate not found");
  });

  test("DELETE /api/candidate/:id should delete a candidate", async () => {
    const item = await candidate.create({
      name: "Test candidate",
      price: 100,
      isPublished: true,
    });
    const response = await request(app).delete(`/api/candidate/${item._id}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("candidate deleted successfully");

    // Verify the item is deleted
    const deletedItem = await candidate.findById(item._id);
    expect(deletedItem).toBeNull();
  });

  test("DELETE /api/candidate/:id should return 404 if candidate not found", async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const response = await request(app).delete(`/api/candidate/${invalidId}`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("candidate not found");
  });
});
