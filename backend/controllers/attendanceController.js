import Attendance from "../models/attendance.js";
import Employee from "../models/employee.js"
import asyncHandler from "express-async-handler";

// Get all employees with attendance details
export const getEmployeesWithAttendance = asyncHandler(async (req, res) => {
  const employees = await Employee.find();

  // Fetch today's attendance for each employee
  const employeesWithAttendance = await Promise.all(
    employees.map(async (employee) => {
      const attendance = await Attendance.findOne({
        employeeId: employee._id,
        createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }, // Filter by today's date
      });

      return {
        ...employee._doc, // Spread employee details
        attendance: attendance || { status: "Absent", task: "" },
      };
    })
  );

  res.json(employeesWithAttendance);
});

export const assignTaskAndUpdateStatus = asyncHandler(async (req, res) => {
  const { employeeId, task, status } = req.body;

  if (!employeeId || !status) {
    res.status(400);
    throw new Error("Employee ID and status are required");
  }

  // Find existing attendance for today
  let attendance = await Attendance.findOne({
    employeeId,
    createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
  });

  if (!attendance) {
    // Create new attendance record if not exists
    attendance = new Attendance({ employeeId, task, status });
  } else {
    // Update existing attendance
    attendance.task = task;
    attendance.status = status;
  }

  await attendance.save();
  res.json({ message: "Attendance updated successfully", attendance });
});
