import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDirectory = path.join(
  process.cwd(),
  "uploads"
);

/* ==========================================
   Create Upload Directory
========================================== */

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

/* ==========================================
   Allowed File Types
========================================== */

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

/* ==========================================
   Storage Configuration
========================================== */

const storage = multer.diskStorage({

  destination(req, file, cb) {
    cb(null, uploadDirectory);
  },

  filename(req, file, cb) {

    const extension =
      path.extname(file.originalname);

    const fileName =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${extension}`;

    cb(null, fileName);
  },

});

/* ==========================================
   File Filter
========================================== */

const fileFilter = (
  req,
  file,
  cb
) => {

  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (
    allowedExtensions.includes(
      extension
    )
  ) {

    cb(null, true);

  } else {

    cb(
      new Error(
        `Unsupported file type: ${extension}`
      ),
      false
    );

  }

};

/* ==========================================
   Upload Middleware
========================================== */

const upload = multer({

  storage,

  fileFilter,

  limits: {

    fileSize:
      100 * 1024 * 1024,

  },

});

export default upload;