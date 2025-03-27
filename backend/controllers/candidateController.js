import Candidate from "../models/candidate.js";
import asyncHandler from "express-async-handler";

/**
 * @swagger
 * tags:
 *   name: Candidate
 *   description: API for managing candidates
 */

/**
 * @swagger
 * /api/candidate:
 *   get:
 *     summary: Get paginated list of candidates
 *     tags: [Candidate]
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
 *         description: List of candidates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total number of candidates
 *                 page:
 *                   type: integer
 *                   description: Current page number
 *                 limit:
 *                   type: integer
 *                   description: Number of items per page
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Candidate'
 */
export const getCandidates = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Candidate.countDocuments();
  const candidates = await Candidate.find().skip(skip).limit(limit);

  res.json({ total, page, limit, data: candidates });
});

/**
 * @swagger
 * /api/candidate/{id}:
 *   get:
 *     summary: Get a single candidate by ID
 *     tags: [Candidate]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A candidate object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Candidate'
 *       404:
 *         description: Candidate not found
 */
export const getCandidateById = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findById(req.params.id);
  if (!candidate) {
    res.status(404);
    throw new Error("Candidate not found");
  }
  res.json(candidate);
});

/**
 * @swagger
 * /api/candidate:
 *   post:
 *     summary: Create a new candidate
 *     tags: [Candidate]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Candidate'
 *     responses:
 *       201:
 *         description: Created candidate
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Candidate'
 */
export const createCandidate = asyncHandler(async (req, res) => {
  const candidate = new Candidate(req.body);
  const savedCandidate = await candidate.save();
  res.status(201).json(savedCandidate);
});

/**
 * @swagger
 * /api/candidate/{id}:
 *   put:
 *     summary: Update a candidate by ID
 *     tags: [Candidate]
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
 *             $ref: '#/components/schemas/Candidate'
 *     responses:
 *       200:
 *         description: Updated candidate
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Candidate'
 *       404:
 *         description: Candidate not found
 */
export const updateCandidate = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findById(req.params.id);
  if (!candidate) {
    res.status(404);
    throw new Error("Candidate not found");
  }

  Object.assign(candidate, req.body);
  const updatedCandidate = await candidate.save();
  res.json(updatedCandidate);
});

/**
 * @swagger
 * /api/candidate/{id}:
 *   delete:
 *     summary: Delete a candidate by ID
 *     tags: [Candidate]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Candidate deleted successfully
 *       404:
 *         description: Candidate not found
 */
export const deleteCandidate = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findById(req.params.id);
  if (!candidate) {
    res.status(404);
    throw new Error("Candidate not found");
  }

  await candidate.deleteOne();
  res.json({ message: "Candidate deleted successfully" });
});


/**
 * @swagger
 * /api/candidate/{id}/status:
 *   patch:
 *     summary: Update the status of a candidate
 *     tags: [Candidate]
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
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: New status of the candidate
 *                 example: "Shortlisted"
 *     responses:
 *       200:
 *         description: Updated candidate status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Candidate'
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Candidate not found
 */
export const changeCandidateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    res.status(400);
    throw new Error("Status is required");
  }

  const candidate = await Candidate.findById(req.params.id);
  if (!candidate) {
    res.status(404);
    throw new Error("Candidate not found");
  }

  candidate.status = status;
  const updatedCandidate = await candidate.save();

  res.json(updatedCandidate);
});
