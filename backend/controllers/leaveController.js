import Leave from "../models/leave.js";
import asyncHandler from "express-async-handler";

export const getLeaves = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const filter = {};
  if (req.query.date != 'null') {
    const date = new Date(req.query.date);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    filter.date = {
      $gte: startOfDay,
      $lte: endOfDay
    };
  }

  const total = await Leave.countDocuments(filter);
  const leaves = await Leave.find(filter)
    .skip(skip)
    .limit(limit)
    .populate("employeeId");

  res.json({ total, page, limit, data: leaves });
});

export const getLeaveById = asyncHandler(async (req, res) => {
  const item = await Leave.findById(req.params.id);
  if (item) {
    res.json(item);
  } else {
    res.status(404);
    throw new Error("Leave not found");
  }
});


export const createLeave = asyncHandler(async (req, res) => {
  const item = new Leave(req.body);
  const savedItem = await item.save();
  res.status(201).json(savedItem);
});


export const updateLeave = asyncHandler(async (req, res) => {
  const item = await Leave.findById(req.params.id);
  if (item) {
    Object.assign(item, req.body);
    const updatedItem = await item.save();
    res.json(updatedItem);
  } else {
    res.status(404);
    throw new Error("Leave not found");
  }
});


export const deleteLeave = asyncHandler(async (req, res) => {
  const item = await Leave.findById(req.params.id);
  if (item) {
    await item.deleteOne();
    res.json({ message: "Leave deleted successfully" });
  } else {
    res.status(404);
    throw new Error("Leave not found");
  }
});

export const updateStatus = asyncHandler(async (req, res) => {
  const item = await Leave.findById(req.params.id);
  if (item) {
     item.status = req.body.status;
     item.save()
    res.json({ message: "Updated successfully" });
  } else {
    res.status(404);
    throw new Error("Leave not found");
  }
});