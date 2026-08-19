import Course from "../models/course.js";

/* ============================================================
   GET ALL COURSES
============================================================ */

export const getCourses = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.department) {
      filter.department = req.query.department;
    }

    if (req.query.semester) {
      filter.semester = req.query.semester;
    }

    if (req.query.studyYear) {
      filter.studyYear = req.query.studyYear;
    }

    if (req.query.academicYear) {
      filter.academicYear = req.query.academicYear;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.instructor) {
      filter.instructor = req.query.instructor;
    }

    if (req.query.search) {
      filter.$or = [
        {
          code: {
            $regex: req.query.search,
            $options: "i",
          },
        },
        {
          name: {
            $regex: req.query.search,
            $options: "i",
          },
        },
        {
          department: {
            $regex: req.query.search,
            $options: "i",
          },
        },
      ];
    }

    const total = await Course.countDocuments(filter);

    const courses = await Course.find(filter)
      .populate(
        "instructor",
        "fullName email"
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    return res.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to retrieve courses.",
    });
  }
};

/* ============================================================
   GET COURSE BY ID
============================================================ */

export const getCourseById = async (req, res) => {
  try {

    const course = await Course.findById(req.params.id)
      .populate(
        "instructor",
        "fullName email"
      )
      .populate(
        "students",
        "studentId fullName"
      );

    if (!course) {
      return res.status(404).json({
        message: "Course not found.",
      });
    }

    return res.json(course);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to retrieve course.",
    });
  }
};

/* ============================================================
   CREATE COURSE
============================================================ */

export const createCourse = async (req, res) => {

  try {

    const {
      code,
      name,
      description,
      creditHours,
      semester,
      studyYear,
      department,
      instructor,
      thumbnail,
      status,
      schedule,
    } = req.body;

    if (
      !code ||
      !name ||
      !creditHours ||
      !semester ||
      !studyYear ||
      !department
    ) {
      return res.status(400).json({
        message:
          "Course Code, Course Name, Credit Hours, Semester, Study Year and Department are required.",
      });
    }

    const existingCourse =
      await Course.findOne({
        code: code.trim().toUpperCase(),
      });

    if (existingCourse) {
      return res.status(400).json({
        message:
          "Course code already exists.",
      });
    }

    const course = await Course.create({

      code: code.trim().toUpperCase(),

      name,

      description,

      creditHours,

      semester,

      studyYear,

      department,

      instructor,

      thumbnail,

      status: status || "Active",

      schedule,

    });

    const populatedCourse =
      await Course.findById(course._id)
      .populate(
        "instructor",
        "fullName email"
      );

    return res.status(201).json({

      message:
        "Course created successfully.",

      course: populatedCourse,

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Failed to create course.",
    });

  }

};
/* ============================================================
   UPDATE COURSE
============================================================ */

export const updateCourse = async (req, res) => {

  try {

    const course = await Course.findById(
      req.params.id
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found.",
      });
    }

    if (
      req.body.code &&
      req.body.code !== course.code
    ) {

      const existingCourse =
        await Course.findOne({

          code:
            req.body.code
              .trim()
              .toUpperCase(),

          _id: {
            $ne: course._id,
          },

        });

      if (existingCourse) {
        return res.status(400).json({
          message:
            "Course code already exists.",
        });
      }

    }

    course.code =
      req.body.code
        ?.trim()
        .toUpperCase() ??
      course.code;

    course.name =
      req.body.name ??
      course.name;

    course.description =
      req.body.description ??
      course.description;

    course.creditHours =
      req.body.creditHours ??
      course.creditHours;

    course.semester =
      req.body.semester ??
      course.semester;

    course.studyYear =
      req.body.studyYear ??
      course.studyYear;

    course.department =
      req.body.department ??
      course.department;

    course.instructor =
      req.body.instructor ??
      course.instructor;

    course.thumbnail =
      req.body.thumbnail ??
      course.thumbnail;

    course.status =
      req.body.status ??
      course.status;

    course.schedule =
      req.body.schedule ??
      course.schedule;

    if (req.body.students) {
      course.students =
        req.body.students;
    }

    const updatedCourse =
      await course.save();

    const populatedCourse =
      await Course.findById(
        updatedCourse._id
      )
        .populate(
          "instructor",
          "fullName email"
        )
        .populate(
          "students",
          "studentId fullName"
        );

    return res.json({

      message:
        "Course updated successfully.",

      course:
        populatedCourse,

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      message:
        "Failed to update course.",

    });

  }

};

/* ============================================================
   DELETE COURSE
============================================================ */

export const deleteCourse = async (
  req,
  res
) => {

  try {

    const course =
      await Course.findById(
        req.params.id
      );

    if (!course) {

      return res.status(404).json({

        message:
          "Course not found.",

      });

    }

    await course.deleteOne();

    return res.json({

      message:
        "Course deleted successfully.",

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      message:
        "Failed to delete course.",

    });

  }

};

/* ============================================================
   COURSE STATISTICS
============================================================ */

export const getCourseStatistics =
  async (
    req,
    res
  ) => {

    try {

      const totalCourses =
        await Course.countDocuments();

      const activeCourses =
        await Course.countDocuments({

          status: "Active",

        });

      const completedCourses =
        await Course.countDocuments({

          status: "Completed",

        });

      const archivedCourses =
        await Course.countDocuments({

          status: "Archived",

        });

      const totalEnrollment =
        await Course.aggregate([

          {
            $project: {
              studentsCount: {
                $size: {
                  $ifNull: [
                    "$students",
                    [],
                  ],
                },
              },
            },
          },

          {
            $group: {
              _id: null,
              totalStudents: {
                $sum:
                  "$studentsCount",
              },
            },
          },

        ]);

      const departmentStatistics =
        await Course.aggregate([

          {
            $group: {
              _id:
                "$department",
              totalCourses: {
                $sum: 1,
              },
            },
          },

          {
            $sort: {
              totalCourses: -1,
            },
          },

        ]);

      const semesterStatistics =
        await Course.aggregate([

          {
            $group: {
              _id:
                "$semester",
              totalCourses: {
                $sum: 1,
              },
            },
          },

          {
            $sort: {
              _id: 1,
            },
          },

        ]);

      const studyYearStatistics =
        await Course.aggregate([

          {
            $group: {
              _id:
                "$studyYear",
              totalCourses: {
                $sum: 1,
              },
            },
          },

          {
            $sort: {
              _id: 1,
            },
          },

        ]);

      return res.json({

        summary: {

          totalCourses,

          activeCourses,

          completedCourses,

          archivedCourses,

          totalEnrollment:
            totalEnrollment[0]
              ?.totalStudents || 0,

        },

        departmentStatistics,

        semesterStatistics,

        studyYearStatistics,

      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({

        message:
          "Failed to retrieve course statistics.",

      });

    }

  };
  