import express from "express";
import {
  assignTaskAndUpdateStatus,
} from "../controllers/attendanceController.js";

const router = express.Router();

router.put("/update", assignTaskAndUpdateStatus);

export default router;
