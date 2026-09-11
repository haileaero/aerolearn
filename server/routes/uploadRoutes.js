import express from "express";
import upload from "../config/multer.js";
import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("Admin", "Instructor"),
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    return res.status(200).json({
      success: true,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mimeType: req.file.mimetype,
    });
  }
);

export default router;
