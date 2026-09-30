import express from "express";

import {
  getAttendance,
  getAttendanceById,
  getMyCourseAttendance,
  checkAttendanceSession,
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

// Students can retrieve only their own attendance rows for a course.
router.get("/my/course/:courseId", authorize("Student"), getMyCourseAttendance);

// Admins and instructors may review attendance data.
router.get("/", authorize("Admin", "Instructor"), getAttendance);
router.get("/check", authorize("Admin", "Instructor"), checkAttendanceSession);
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
