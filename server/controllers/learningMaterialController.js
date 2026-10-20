import LearningMaterial from "../models/learningMaterial.js";
import Student from "../models/student.js";
import Course from "../models/course.js";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";
import path from "path";
import crypto from "crypto";

/**
 * Instructors may only manage materials attached to course offerings
 * explicitly assigned to their account. Admin access remains unrestricted.
 */
const instructorOwnsCourse = async (userId, courseId) => {
  if (!userId || !courseId) return false;
  return Boolean(
    await Course.exists({
      _id: courseId,
      instructor: userId,
    })
  );
};

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

    if (
      req.user?.role === "Instructor" &&
      !(await instructorOwnsCourse(req.user._id, course))
    ) {
      return res.status(403).json({
        message: "You can only add learning materials to courses assigned to you.",
      });
    }

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
    let filter = {};

    if (req.user?.role === "Instructor") {
      const assignedCourses = await Course.find({
        instructor: req.user._id,
      }).select("_id");

      // Use course offering IDs, not course names, so materials from another
      // department or another instructor are never mixed into this roster.
      filter = {
        course: {
          $in: assignedCourses.map((course) => course._id),
        },
      };
    }

    if (req.user?.role === "Student") {
      const student = await Student.findOne({ $or: [{ user: req.user._id }, { studentId: req.user.studentId }] });

      if (!student || student.status !== "Active") {
        return res.status(200).json([]);
      }

      const eligibleCourses = await Course.find({
        department: student.department,
        studyYear: student.year,
        semester: student.semester,
        status: "Active",
      }).select("_id name code");

      // Learning materials are shared by course name, not by a single
      // department-specific course-offering ID. This lets one upload serve
      // every active offering with the same course name across departments.
      // We still start with this student's own eligible courses, then include
      // other active offerings whose normalized name matches one of them.
      const normalizeCourseName = (value) =>
        String(value || "")
          .trim()
          .replace(/\s+/g, " ")
          .toLocaleLowerCase();

      const eligibleCourseNames = new Set(
        eligibleCourses
          .map((course) => normalizeCourseName(course.name))
          .filter(Boolean)
      );

      const allActiveCourses = eligibleCourseNames.size
        ? await Course.find({ status: "Active" }).select("_id name")
        : [];

      const sharedCourseIds = allActiveCourses
        .filter((course) => eligibleCourseNames.has(normalizeCourseName(course.name)))
        .map((course) => course._id);

      const courseIds = [
        ...new Map(
          [...eligibleCourses.map((course) => course._id), ...sharedCourseIds]
            .map((id) => [String(id), id])
        ).values(),
      ];

      filter = { course: { $in: courseIds } };

      // Repair stale enrollment while the resource library is being loaded.
      student.courses = courseIds;
      await student.save();
      if (courseIds.length) {
        await Course.updateMany(
          { _id: { $in: courseIds } },
          { $addToSet: { students: student._id } }
        );
      }
    }

    const learningMaterials =
      await LearningMaterial.find(filter)
        .populate(
          "course",
          "name title code department studyYear semester status"
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
        ).populate("course", "name title code department studyYear semester status instructor");

      if (!learningMaterial) {
        return res.status(404).json({
          message:
            "Learning material not found",
        });
      }

      if (
        req.user?.role === "Instructor" &&
        !(
          learningMaterial.course &&
          String(learningMaterial.course.instructor?._id || learningMaterial.course.instructor || "") === String(req.user._id)
        )
      ) {
        return res.status(403).json({
          message: "You can only access learning materials for courses assigned to you.",
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

      if (req.user?.role === "Instructor") {
        const nextCourseId = req.body.course || learningMaterial.course;

        if (
          !(await instructorOwnsCourse(req.user._id, learningMaterial.course)) ||
          !(await instructorOwnsCourse(req.user._id, nextCourseId))
        ) {
          return res.status(403).json({
            message: "You can only update materials for courses assigned to you.",
          });
        }
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