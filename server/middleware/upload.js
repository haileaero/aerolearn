import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

/* ============================================================
   UPLOAD DIRECTORY
============================================================ */

const uploadPath =
  "uploads/materials";

if (!fs.existsSync(uploadPath)) {

  fs.mkdirSync(uploadPath, {
    recursive: true,
  });

}

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

  ".mp4",

];

/* ============================================================
   STORAGE
============================================================ */

const storage =
  multer.diskStorage({

    destination(
      req,
      file,
      cb
    ) {

      cb(
        null,
        uploadPath
      );

    },

    filename(
      req,
      file,
      cb
    ) {

      const extension =
        path.extname(
          file.originalname
        );

      const name =
        path
          .basename(
            file.originalname,
            extension
          )
          .replace(
            /\s+/g,
            "-"
          )
          .replace(
            /[^a-zA-Z0-9-_]/g,
            ""
          );

      const unique =
        crypto.randomUUID();

      cb(

        null,

        `${Date.now()}-${unique}-${name}${extension.toLowerCase()}`

      );

    },

  });

/* ============================================================
   FILE FILTER
============================================================ */

const fileFilter = (
  req,
  file,
  cb
) => {

  const extension =
    path
      .extname(
        file.originalname
      )
      .toLowerCase();

  if (
    !allowedExtensions.includes(
      extension
    )
  ) {

    return cb(

      new Error(
        "Unsupported file type."
      ),

      false

    );

  }

  cb(
    null,
    true
  );

};

/* ============================================================
   MULTER CONFIGURATION
============================================================ */

const upload =
  multer({

    storage,

    fileFilter,

    limits: {

      fileSize:
        100 *
        1024 *
        1024, // 100 MB

    },

  });

export default upload;