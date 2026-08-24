import multer from "multer";
import path from "path";

/* ============================================================
   MEMORY STORAGE
   The file is temporarily stored in memory and then uploaded
   directly to Cloudinary.
============================================================ */

const storage = multer.memoryStorage();

/* ============================================================
   ALLOWED FILE TYPES
============================================================ */

const allowedExtensions = [
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".xls",
  ".xlsx",
  ".zip",
  ".rar",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".mp4",
];

/* ============================================================
   FILE FILTER
============================================================ */

const fileFilter = (req, file, cb) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    return cb(
      new Error(
        `Unsupported file type: ${extension}`
      ),
      false
    );
  }

  cb(null, true);
};

/* ============================================================
   MULTER
============================================================ */

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
  },
});

export default upload;