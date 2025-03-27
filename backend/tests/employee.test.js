import request from "supertest";
import app from "../index.js";
import mongoose from "mongoose";
import employee from "../models/employee.js";

describe("employee API", () => {
  let createdItem;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clear the collection before each test
    await employee.deleteMany({});
  });

  test("POST /api/employee should create a new employee", async () => {
    const response = await request(app)
      .post("/api/employee")
      .send({ name: "Test employee", price: 100, isPublished: true });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.name).toBe("Test employee");
    createdItem = response.body;
  });

  test("GET /api/employee should return paginated results", async () => {
    // Create some test data
    await employee.create([
      { name: "employee 1", price: 100, isPublished: true },
      { name: "employee 2", price: 200, isPublished: false },
    ]);

    const response = await request(app).get("/api/employee?page=1&limit=2");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("total");
    expect(response.body).toHaveProperty("page");
    expect(response.body).toHaveProperty("limit");
    expect(response.body.data).toHaveLength(2);
  });

  test("GET /api/employee/:id should return a single employee", async () => {
    const item = await employee.create({
      name: "Test employee",
      price: 100,
      isPublished: true,
    });
    const response = await request(app).get(`/api/employee/${item._id}`);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Test employee");
  });

  test("GET /api/employee/:id should return 404 if employee not found", async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const response = await request(app).get(`/api/employee/${invalidId}`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("employee not found");
  });

  test("PUT /api/employee/:id should update a employee", async () => {
    const item = await employee.create({
      name: "Test employee",
      price: 100,
      isPublished: true,
    });
    const response = await request(app)
      .put(`/api/employee/${item._id}`)
      .send({ name: "Updated employee", price: 200 });
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Updated employee");
    expect(response.body.price).toBe(200);
  });

  test("PUT /api/employee/:id should return 404 if employee not found", async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .put(`/api/employee/${invalidId}`)
      .send({ name: "Updated employee", price: 200 });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("employee not found");
  });

  test("DELETE /api/employee/:id should delete a employee", async () => {
    const item = await employee.create({
      name: "Test employee",
      price: 100,
      isPublished: true,
    });
    const response = await request(app).delete(`/api/employee/${item._id}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("employee deleted successfully");

    // Verify the item is deleted
    const deletedItem = await employee.findById(item._id);
    expect(deletedItem).toBeNull();
  });

  test("DELETE /api/employee/:id should return 404 if employee not found", async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const response = await request(app).delete(`/api/employee/${invalidId}`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("employee not found");
  });
});
