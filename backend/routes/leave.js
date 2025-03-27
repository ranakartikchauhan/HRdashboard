import express from "express";
import {
  getLeaves,
  getLeaveById,
  createLeave,
  updateLeave,
  deleteLeave,
  updateStatus,
} from "../controllers/leaveController.js";

const router = express.Router();

router.get("/", getLeaves);
router.get("/:id", getLeaveById);
router.post("/", createLeave);
router.put("/:id", updateLeave);
router.delete("/:id", deleteLeave);
router.put("/updateStatus/:id", updateStatus);

export default router;
