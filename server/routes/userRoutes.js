import express from "express";

import {
  createUser,
  getUsers,
  getStudents,
  getInstructors,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ===========================
// Get Users
// ===========================

// Get all users
router.post("/", protect, createUser);
router.get("/", protect, getUsers);

// Get all students
router.get("/students", protect, getStudents);

// Get all instructors
router.get("/instructors", protect, getInstructors);

// ===========================
// Update User
// ===========================
router.put("/:id", protect, updateUser);

// ===========================
// Delete User
// ===========================
router.delete("/:id", protect, deleteUser);

export default router;