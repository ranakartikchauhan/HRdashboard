
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Signup Controller
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists", success: false });
  }

  const user = new User({ name, email, password });
  await user.save();

  const token = jwt.sign({ _id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: "1d" });

  res.cookie("token", token, { httpOnly: true }).status(201).json({
    message: "User created successfully",
    success: true,
    token,
  });
});

// Login Controller
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found", success: false });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials", success: false });
  }

  const token = jwt.sign({ _id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: "1d" });

  res.cookie("token", token, { httpOnly: true }).status(200).json({
    message: "Login successful",
    success: true,
    token,
  });
});

// Logout Controller
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token").status(200).json({
    message: "Logged out successfully",
    success: true,
  });
});
