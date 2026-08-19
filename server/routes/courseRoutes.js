import express from "express";

import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================
// Get All Courses
// ======================================
router.get("/", protect, getCourses);

// ======================================
// Get One Course
// ======================================
router.get("/:id", protect, getCourseById);

// ======================================
// Create Course
// ======================================
router.post("/", protect, createCourse);

// ======================================
// Update Course
// ======================================
router.put("/:id", protect, updateCourse);

// ======================================
// Delete Course
// ======================================
router.delete("/:id", protect, deleteCourse);

export default router;