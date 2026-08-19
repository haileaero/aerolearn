import Assessment from "../models/assessment.js";
import Course from "../models/course.js";

/* ============================================================
   GET ALL ASSESSMENTS
============================================================ */

export const getAssessments = async (
  req,
  res
) => {

  try {

    const assessments =
      await Assessment.find()

        .populate(
          "course",
          "code name department"
        )

        .populate(
          "scores.student",
          "studentId fullName department"
        )

        .sort({
          createdAt: -1,
        });

    res.status(200).json(
      assessments
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({

      message:
        "Failed to load assessments.",

    });

  }

};

/* ============================================================
   GET ASSESSMENT BY ID
============================================================ */

export const getAssessmentById =
  async (req, res) => {

    try {

      const assessment =
        await Assessment.findById(
          req.params.id
        )

          .populate(
            "course",
            "code name department"
          )

          .populate(
            "scores.student",
            "studentId fullName department"
          );

      if (!assessment) {

        return res.status(404).json({

          message:
            "Assessment not found.",

        });

      }

      res.status(200).json(
        assessment
      );

    } catch (error) {

      console.error(error);

      res.status(500).json({

        message:
          "Failed to load assessment.",

      });

    }

  };

/* ============================================================
   CREATE ASSESSMENT
============================================================ */

export const createAssessment =
  async (req, res) => {

    try {

      const {

        course,
        title,
        category,
        week,
        dueDate,
        totalMark,
        weight,
        description,

      } = req.body;

      const selectedCourse =
        await Course.findById(
          course
        ).populate(
          "students"
        );

      if (!selectedCourse) {

        return res.status(404).json({

          message:
            "Course not found.",

        });

      }

      if (
        selectedCourse.students.length === 0
      ) {

        return res.status(400).json({

          message:
            "This course has no enrolled students.",

        });

      }

      const existingAssessment =
        await Assessment.findOne({

          course,

          title,

          week,

        });

      if (existingAssessment) {

        return res.status(400).json({

          message:
            "An assessment with the same title and week already exists for this course.",

        });

      }

      const scores =
        selectedCourse.students.map(
          (student) => ({

            student:
              student._id,

            score: 0,

            remark: "",

          })
        );
              const assessment =
        await Assessment.create({

          course,

          title,

          category,

          week,

          dueDate,

          totalMark,

          weight,

          description,

          scores,

        });

      const populatedAssessment =
        await Assessment.findById(
          assessment._id
        )

          .populate(
            "course",
            "code name department"
          )

          .populate(
            "scores.student",
            "studentId fullName department"
          );

      res.status(201).json(
        populatedAssessment
      );

    } catch (error) {

      console.error(error);

      res.status(500).json({

        message:
          "Failed to create assessment.",

      });

    }

  };

/* ============================================================
   UPDATE ASSESSMENT
============================================================ */

export const updateAssessment =
  async (req, res) => {

    try {

      const assessment =
        await Assessment.findById(
          req.params.id
        );

      if (!assessment) {

        return res.status(404).json({

          message:
            "Assessment not found.",

        });

      }

      assessment.title =
        req.body.title ??
        assessment.title;

      assessment.category =
        req.body.category ??
        assessment.category;

      assessment.week =
        req.body.week ??
        assessment.week;

      assessment.dueDate =
        req.body.dueDate ??
        assessment.dueDate;

      assessment.totalMark =
        req.body.totalMark ??
        assessment.totalMark;

      assessment.weight =
        req.body.weight ??
        assessment.weight;

      assessment.description =
        req.body.description ??
        assessment.description;
              await assessment.save();

      const updatedAssessment =
        await Assessment.findById(
          assessment._id
        )

          .populate(
            "course",
            "code name department"
          )

          .populate(
            "scores.student",
            "studentId fullName department"
          );

      res.status(200).json(
        updatedAssessment
      );

    } catch (error) {

      console.error(error);

      res.status(500).json({

        message:
          "Failed to update assessment.",

      });

    }

  };

/* ============================================================
   UPDATE STUDENT SCORES
============================================================ */

export const updateScores =
  async (req, res) => {

    try {

      const assessment =
        await Assessment.findById(
          req.params.id
        );

      if (!assessment) {

        return res.status(404).json({

          message:
            "Assessment not found.",

        });

      }

      if (
        !Array.isArray(req.body.scores)
      ) {

        return res.status(400).json({

          message:
            "Scores must be an array.",

        });

      }

      for (const item of req.body.scores) {

        if (
          item.score < 0 ||
          item.score >
            assessment.totalMark
        ) {

          return res.status(400).json({

            message:
              `Invalid score for student ${item.student}. Scores must be between 0 and ${assessment.totalMark}.`,

          });

        }

      }

      assessment.scores =
        req.body.scores;
              await assessment.save();

      const updatedAssessment =
        await Assessment.findById(
          assessment._id
        )

          .populate(
            "course",
            "code name department"
          )

          .populate(
            "scores.student",
            "studentId fullName department"
          );

      res.status(200).json(
        updatedAssessment
      );

    } catch (error) {

      console.error(error);

      res.status(500).json({

        message:
          "Failed to update assessment scores.",

      });

    }

  };

/* ============================================================
   DELETE ASSESSMENT
============================================================ */

export const deleteAssessment =
  async (req, res) => {

    try {

      const assessment =
        await Assessment.findById(
          req.params.id
        );

      if (!assessment) {

        return res.status(404).json({

          message:
            "Assessment not found.",

        });

      }

      await assessment.deleteOne();

      res.status(200).json({

        message:
          "Assessment deleted successfully.",

      });

    } catch (error) {

      console.error(error);

      res.status(500).json({

        message:
          "Failed to delete assessment.",

      });

    }

  };
  /* ============================================================
   ASSESSMENT STATISTICS
============================================================ */

export const getAssessmentStatistics =
  async (req, res) => {

    try {

      const totalAssessments =
        await Assessment.countDocuments();

      const quizzes =
        await Assessment.countDocuments({

          category: "Quiz",

        });

      const assignments =
        await Assessment.countDocuments({

          category: "Assignment",

        });

      const exams =
        await Assessment.countDocuments({

          category: "Exam",

        });

      const projects =
        await Assessment.countDocuments({

          category: "Project",

        });

      const courses =
        await Assessment.distinct(
          "course"
        );

      res.status(200).json({

        totalAssessments,

        totalCourses:
          courses.length,

        quizzes,

        assignments,

        exams,

        projects,

      });

    } catch (error) {

      console.error(error);

      res.status(500).json({

        message:
          "Failed to load assessment statistics.",

      });

    }

  };