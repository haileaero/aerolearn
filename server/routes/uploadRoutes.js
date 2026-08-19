import express from "express";
import upload from "../config/multer.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Upload Documents Only
|--------------------------------------------------------------------------
|
| Videos are handled using YouTube URLs.
| Supported uploads:
| PDF
| DOC
| DOCX
| PPT
| PPTX
| XLS
| XLSX
| ZIP
| RAR
| JPG
| PNG
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    res.status(200).json({
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