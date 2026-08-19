import express from "express";

import {

  getAssessments,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  updateScores,
  deleteAssessment,
  getAssessmentStatistics,

} from "../controllers/assessmentController.js";

import {

  protect,
  authorize,

} from "../middleware/authMiddleware.js";

const router =
  express.Router();

/* ============================================================
   READ
============================================================ */

router.get(

  "/",

  protect,

  getAssessments

);

router.get(

  "/statistics",

  protect,

  authorize(
    "Admin",
    "Instructor"
  ),

  getAssessmentStatistics

);

router.get(

  "/:id",

  protect,

  getAssessmentById

);

/* ============================================================
   CREATE
============================================================ */

router.post(

  "/",

  protect,

  authorize(
    "Admin",
    "Instructor"
  ),

  createAssessment

);

/* ============================================================
   UPDATE
============================================================ */

router.put(

  "/:id",

  protect,

  authorize(
    "Admin",
    "Instructor"
  ),

  updateAssessment

);

/* ============================================================
   UPDATE SCORES
============================================================ */

router.put(

  "/:id/scores",

  protect,

  authorize(
    "Admin",
    "Instructor"
  ),

  updateScores

);

/* ============================================================
   DELETE
============================================================ */

router.delete(

  "/:id",

  protect,

  authorize(
    "Admin"
  ),

  deleteAssessment

);

export default router;