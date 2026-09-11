import express from "express";

import {
  createStudent,
  getStudents,
  getStudentById,
  getStudentProfile,
  updateStudent,
  deleteStudent,
  searchStudents,
  getStudentStatistics,
} from "../controllers/studentController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// Aggregate and directory-style student data is staff-only.
router.get("/statistics", authorize("Admin", "Instructor"), getStudentStatistics);
router.get("/search", authorize("Admin", "Instructor"), searchStudents);
router.get("/", authorize("Admin", "Instructor"), getStudents);

// The existing profile endpoint is used by student-facing views too.
router.get(
  "/profile/:studentId",
  authorize("Admin", "Instructor", "Student"),
  getStudentProfile
);

router.get("/:id", authorize("Admin", "Instructor"), getStudentById);

// Student records are administrative master data.
router.post("/", authorize("Admin"), createStudent);
router.put("/:id", authorize("Admin"), updateStudent);
router.delete("/:id", authorize("Admin"), deleteStudent);

export default router;
