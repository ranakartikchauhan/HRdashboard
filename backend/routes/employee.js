import express from "express";
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  searchByName,
} from "../controllers/employeeController.js";
import { getEmployeesWithAttendance } from "../controllers/attendanceController.js";

const router = express.Router();

router.get("/", getEmployees);
router.post("/", createEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);
router.delete("/serach", searchByName);
router.get("/attendance",getEmployeesWithAttendance)

export default router;
