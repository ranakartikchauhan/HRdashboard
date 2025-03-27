import express from "express";
import leaveRoutes from "./leave.js";
import employeeRoutes from "./employee.js";
import attendanceRoutes from "./attendance.js";
import candidateRoutes from "./candidate.js";
import userRoutes from "./user.js";

const router = express.Router();
router.use("/user", userRoutes);

router.use("/candidate", candidateRoutes);

router.use("/attendance", attendanceRoutes);

router.use("/employee", employeeRoutes);

router.use("/leave", leaveRoutes);

export default router;
