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
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// All authenticated roles may view course information.
router.get("/", authorize("Admin", "Instructor", "Student"), getCourses);
router.get("/:id", authorize("Admin", "Instructor", "Student"), getCourseById);

// Course master data is administered centrally.
router.post("/", authorize("Admin", "Instructor"), createCourse);
router.put("/:id", authorize("Admin", "Instructor"), updateCourse);
router.delete("/:id", authorize("Admin", "Instructor"), deleteCourse);

export default router;
