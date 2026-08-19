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

const router = express.Router();

/* =====================================
   Student Statistics
===================================== */

router.get(
  "/statistics",
  getStudentStatistics
);

/* =====================================
   Search Students
===================================== */

router.get(
  "/search",
  searchStudents
);

/* =====================================
   Student Profile (for logged-in student)
===================================== */

router.get(
  "/profile/:studentId",
  getStudentProfile
);

/* =====================================
   Get All Students
===================================== */

router.get(
  "/",
  getStudents
);

/* =====================================
   Get Student By ID
===================================== */

router.get(
  "/:id",
  getStudentById
);

/* =====================================
   Create Student
===================================== */

router.post(
  "/",
  createStudent
);

/* =====================================
   Update Student
===================================== */

router.put(
  "/:id",
  updateStudent
);

/* =====================================
   Delete Student
===================================== */

router.delete(
  "/:id",
  deleteStudent
);

export default router;