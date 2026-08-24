import LearningMaterial from "../models/learningMaterial.js";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";
import path from "path";
import crypto from "crypto";

/* ============================================================
   UPLOAD FILE TO CLOUDINARY
============================================================ */

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.buffer) {
      return reject(
        new Error("No file buffer received.")
      );
    }

    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const originalName = path
      .basename(
        file.originalname,
        extension
      )
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "");

    const publicId =
      `${Date.now()}-${crypto.randomUUID()}-${originalName}${extension}`;

    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "aerolearn/materials",
          public_id: publicId,
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          resolve(result);
        }
      );

    Readable
      .from(file.buffer)
      .pipe(uploadStream);
  });
};

/* ============================================================
   CREATE LEARNING MATERIAL
============================================================ */

export const createLearningMaterial = async (
  req,
  res
) => {
  try {
    const {
      title,
      course,
      category,
      description,
      dueDate,
    } = req.body;

    let file = "";

    /* --------------------------------------------------------
       VIDEO
       Videos use YouTube URLs instead of file uploads.
    -------------------------------------------------------- */

    if (category === "Video") {
      file = req.body.file || "";
    }

    /* --------------------------------------------------------
       DOCUMENT / FILE
    -------------------------------------------------------- */

    else if (req.file) {
      const result =
        await uploadToCloudinary(req.file);

      file = result.secure_url;
    }

    const learningMaterial =
      await LearningMaterial.create({
        title,
        course,
        category,
        description,
        file,
        dueDate,
      });

    res.status(201).json(
      learningMaterial
    );

  } catch (error) {
    console.error(
      "CREATE LEARNING MATERIAL ERROR:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Failed to create learning material.",
    });
  }
};

/* ============================================================
   GET ALL LEARNING MATERIALS
============================================================ */

export const getLearningMaterials = async (
  req,
  res
) => {
  try {
    const learningMaterials =
      await LearningMaterial.find()
        .populate(
          "course",
          "name title code"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json(
      learningMaterials
    );

  } catch (error) {
    console.error(
      "GET LEARNING MATERIALS ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

/* ============================================================
   GET LEARNING MATERIAL BY ID
============================================================ */

export const getLearningMaterialById =
  async (req, res) => {
    try {
      const learningMaterial =
        await LearningMaterial.findById(
          req.params.id
        );

      if (!learningMaterial) {
        return res.status(404).json({
          message:
            "Learning material not found",
        });
      }

      res.status(200).json(
        learningMaterial
      );

    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };

/* ============================================================
   UPDATE LEARNING MATERIAL
============================================================ */

export const updateLearningMaterial =
  async (req, res) => {
    try {
      const learningMaterial =
        await LearningMaterial.findById(
          req.params.id
        );

      if (!learningMaterial) {
        return res.status(404).json({
          message:
            "Learning material not found",
        });
      }

      learningMaterial.title =
        req.body.title ??
        learningMaterial.title;

      learningMaterial.course =
        req.body.course ??
        learningMaterial.course;

      learningMaterial.category =
        req.body.category ??
        learningMaterial.category;

      learningMaterial.description =
        req.body.description ??
        learningMaterial.description;

      learningMaterial.dueDate =
        req.body.dueDate ??
        learningMaterial.dueDate;

      /* ------------------------------------------------------
         VIDEO
      ------------------------------------------------------ */

      if (
        req.body.category === "Video"
      ) {
        learningMaterial.file =
          req.body.file ||
          learningMaterial.file;
      }

      /* ------------------------------------------------------
         NEW FILE
      ------------------------------------------------------ */

      else if (req.file) {
        const result =
          await uploadToCloudinary(
            req.file
          );

        learningMaterial.file =
          result.secure_url;
      }

      const updated =
        await learningMaterial.save();

      res.status(200).json(
        updated
      );

    } catch (error) {
      console.error(
        "UPDATE LEARNING MATERIAL ERROR:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Failed to update learning material.",
      });
    }
  };

/* ============================================================
   DELETE LEARNING MATERIAL
============================================================ */

export const deleteLearningMaterial =
  async (req, res) => {
    try {
      const learningMaterial =
        await LearningMaterial.findById(
          req.params.id
        );

      if (!learningMaterial) {
        return res.status(404).json({
          message:
            "Learning material not found",
        });
      }

      /* ------------------------------------------------------
         Delete Cloudinary file if this is a Cloudinary URL.
         We intentionally don't fail the database deletion if
         Cloudinary deletion fails.
      ------------------------------------------------------ */

      if (
        learningMaterial.file &&
        learningMaterial.file.includes(
          "res.cloudinary.com"
        )
      ) {
        try {
          const url =
            learningMaterial.file;

          const uploadIndex =
            url.indexOf(
              "/aerolearn/materials/"
            );

          if (uploadIndex !== -1) {
            const publicPath =
              url.substring(
                uploadIndex +
                  "/aerolearn/materials/"
                    .length
              );

            const publicId =
              `aerolearn/materials/${publicPath}`;

            await cloudinary.uploader.destroy(
              publicId,
              {
                resource_type: "raw",
              }
            );
          }

        } catch (cloudinaryError) {
          console.error(
            "Cloudinary delete warning:",
            cloudinaryError.message
          );
        }
      }

      await LearningMaterial.findByIdAndDelete(
        req.params.id
      );

      res.status(200).json({
        message:
          "Learning material deleted successfully",
      });

    } catch (error) {
      console.error(
        "DELETE LEARNING MATERIAL ERROR:",
        error
      );

      res.status(500).json({
        message: error.message,
      });
    }
  };