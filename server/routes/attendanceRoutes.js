import express from "express";

import {
  getAttendance,
  getAttendanceById,
  getAttendanceByCourseWeek,
  getAttendanceHistory,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceStatistics,
} from "../controllers/attendanceController.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Attendance Routes
|--------------------------------------------------------------------------
*/

// Get all attendance sessions
router.get("/", getAttendance);

// Get attendance statistics for a course
router.get(
  "/statistics/:courseId",
  getAttendanceStatistics
);

// Get attendance history for a course
router.get(
  "/history/:courseId",
  getAttendanceHistory
);

// Get attendance by course and week
router.get(
  "/course/:courseId/week/:week",
  getAttendanceByCourseWeek
);

// Get single attendance session
router.get("/:id", getAttendanceById);

// Create attendance
router.post("/", createAttendance);

// Update attendance
router.put("/:id", updateAttendance);

// Delete attendance
router.delete("/:id", deleteAttendance);

export default router;