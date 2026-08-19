import express from "express";

import {
  createLearningMaterial,
  getLearningMaterials,
  getLearningMaterialById,
  updateLearningMaterial,
  deleteLearningMaterial,
} from "../controllers/learningMaterialController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

import upload from "../middleware/upload.js";

const router = express.Router();

router
  .route("/")
  .get(
    protect,
    authorize("Admin", "Instructor", "Student"),
    getLearningMaterials
  )
  .post(
    protect,
    authorize("Admin", "Instructor"),
    upload.single("file"),
    createLearningMaterial
  );

router
  .route("/:id")
 .get(
  protect,
  authorize("Admin", "Instructor", "Student"),
  getLearningMaterialById
)
  .put(
    protect,
    authorize("Admin", "Instructor"),
    upload.single("file"),
    updateLearningMaterial
  )
  .delete(
    protect,
    authorize("Admin"),
    deleteLearningMaterial
  );

export default router;