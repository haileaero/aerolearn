import express from "express";

import {
  createUser,
  getUsers,
  getStudents,
  getInstructors,
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
router.post("/", authorize("Admin"), createUser);
router.get("/", authorize("Admin"), getUsers);
router.put("/:id", authorize("Admin"), updateUser);
router.delete("/:id", authorize("Admin"), deleteUser);

// Instructors are needed in course/assessment selectors; students are needed
// in teaching workflows, so staff may read these limited directory endpoints.
router.get("/students", authorize("Admin", "Instructor"), getStudents);
router.get("/instructors", authorize("Admin", "Instructor"), getInstructors);

export default router;
