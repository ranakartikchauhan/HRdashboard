import express from "express";
import {
  getCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  changeCandidateStatus
} from "../controllers/candidateController.js";

const router = express.Router();

router.get("/", getCandidates);
router.get("/:id", getCandidateById);
router.post("/", createCandidate);
router.put("/:id", updateCandidate);
router.delete("/:id", deleteCandidate);
router.put("/:id/status", changeCandidateStatus);

export default router;
