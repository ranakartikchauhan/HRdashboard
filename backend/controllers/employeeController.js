import Employee from "../models/employee.js";
import asyncHandler from "express-async-handler";

/**
 * @swagger
 * tags:
 *   name: Employee
 *   description: API for managing employees
 */

/**
 * @swagger
 * /api/employee:
 *   get:
 *     summary: Get paginated list of employees
 *     tags: [Employee]
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Number of items per page
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of employees
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total number of employees
 *                 page:
 *                   type: integer
 *                   description: Current page number
 *                 limit:
 *                   type: integer
 *                   description: Number of items per page
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Employee'
 */
export const getEmployees = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Employee.countDocuments();
    const employees = await Employee.find().skip(skip).limit(limit);

    res.json({ total, page, limit, data: employees });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});


export const getEmployeeById = asyncHandler(async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export const searchByName = asyncHandler(async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ error: "Name parameter is required" });
    }
    
    const users = await Employee.find({ name: { $regex: name, $options: "i" } })
      .limit(5);
    
    if (users.length === 0) {
      return res.status(404).json({ error: "No matching users found" });
    }
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});


export const createEmployee = asyncHandler(async (req, res) => {
  try {
    const employee = new Employee(req.body);
    const savedEmployee = await employee.save();
    res.status(201).json(savedEmployee);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @swagger
 * /api/employee/{id}:
 *   put:
 *     summary: Update an employee by ID
 *     tags: [Employee]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       200:
 *         description: Updated employee
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *       404:
 *         description: Employee not found
 */
export const updateEmployee = asyncHandler(async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    Object.assign(employee, req.body);
    const updatedEmployee = await employee.save();
    res.json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @swagger
 * /api/employee/{id}:
 *   delete:
 *     summary: Delete an employee by ID
 *     tags: [Employee]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *       404:
 *         description: Employee not found
 */
export const deleteEmployee = asyncHandler(async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    await employee.deleteOne();
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
