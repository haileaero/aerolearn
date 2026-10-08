import express from "express";

import {
  createUser,
  getUsers,
  getStudents,
  getInstructors,
  getUserStatistics,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// User administration is restricted to Admin.
router.post(
  "/",
  authorize("Admin"),
  createUser
);

router.get(
  "/",
  authorize("Admin"),
  getUsers
);

// Global user statistics must be declared before /:id.
router.get(
  "/statistics",
  authorize("Admin"),
  getUserStatistics
);

router.put(
  "/:id",
  authorize("Admin"),
  updateUser
);

router.delete(
  "/:id",
  authorize("Admin"),
  deleteUser
);

// Instructors are needed in course/assessment selectors;
// students are needed in teaching workflows.
router.get(
  "/students",
  authorize("Admin", "Instructor"),
  getStudents
);

router.get(
  "/instructors",
  authorize("Admin", "Instructor"),
  getInstructors
);

export default router;
