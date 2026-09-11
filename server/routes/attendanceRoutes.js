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

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Every attendance endpoint requires an authenticated user.
router.use(protect);

// Admins and instructors may review attendance data.
router.get("/", authorize("Admin", "Instructor"), getAttendance);
router.get(
  "/statistics/:courseId",
  authorize("Admin", "Instructor"),
  getAttendanceStatistics
);
router.get(
  "/history/:courseId",
  authorize("Admin", "Instructor"),
  getAttendanceHistory
);
router.get(
  "/course/:courseId/week/:week",
  authorize("Admin", "Instructor"),
  getAttendanceByCourseWeek
);
router.get("/:id", authorize("Admin", "Instructor"), getAttendanceById);

// Attendance records may only be managed by staff.
router.post("/", authorize("Admin", "Instructor"), createAttendance);
router.put("/:id", authorize("Admin", "Instructor"), updateAttendance);
router.delete("/:id", authorize("Admin", "Instructor"), deleteAttendance);

export default router;
