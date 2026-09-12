import Student from "../models/student.js";
import Course from "../models/course.js";
import Assessment from "../models/assessment.js";

const activeCourseFilterForStudent = (student) => ({
  department: student.department,
  studyYear: student.year,
  semester: student.semester,
  status: "Active",
});

async function reconcileStudentCourses(student) {
  if (!student || student.status !== "Active") {
    if (student && Array.isArray(student.courses) && student.courses.length) {
      await Course.updateMany(
        { students: student._id },
        { $pull: { students: student._id } }
      );
      student.courses = [];
      await student.save();
    }
    return [];
  }

  const matchedCourses = await Course.find(activeCourseFilterForStudent(student)).select("_id");
  const matchedIds = matchedCourses.map((course) => course._id);
  const currentIds = (student.courses || []).map(String).sort();
  const nextIds = matchedIds.map(String).sort();

  if (JSON.stringify(currentIds) !== JSON.stringify(nextIds)) {
    student.courses = matchedIds;
    await student.save();
  }

  await Course.updateMany(
    { students: student._id, _id: { $nin: matchedIds } },
    { $pull: { students: student._id } }
  );

  if (matchedIds.length) {
    await Course.updateMany(
      { _id: { $in: matchedIds } },
      { $addToSet: { students: student._id } }
    );

    // Existing assessments may have been created before this student's course
    // enrollment was repaired. Add a pending score row without touching any
    // previously entered score. This keeps My Results and teacher score sheets
    // aligned with the repaired course roster.
    await Assessment.updateMany(
      {
        course: { $in: matchedIds },
        "scores.student": { $ne: student._id },
      },
      {
        $push: {
          scores: {
            student: student._id,
            score: 0,
            entered: false,
            remark: "",
          },
        },
      }
    );
  }

  return matchedIds;
}
/* ============================================================
   GET ALL STUDENTS
============================================================ */

export const getStudents = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.department) {
      filter.department = req.query.department;
    }

    if (req.query.program) {
      filter.program = req.query.program;
    }

    if (req.query.year) {
      filter.year = req.query.year;
    }

    if (req.query.semester) {
      filter.semester = req.query.semester;
    }

    if (req.query.section) {
      filter.section = req.query.section;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      filter.$or = [
        {
          fullName: {
            $regex: req.query.search,
            $options: "i",
          },
        },
        {
          studentId: {
            $regex: req.query.search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: req.query.search,
            $options: "i",
          },
        },
      ];
    }

    const total = await Student.countDocuments(filter);

   const students = await Student.find(filter)
  .populate("user", "fullName email studentId department phone role")
  .populate("advisor", "fullName")
  .populate({
    path: "courses",
    populate: {
      path: "instructor",
      select: "fullName email",
    },
  })
  .sort({
    createdAt: -1,
  })
  .skip(skip)
  .limit(limit);

    return res.json({
      students,
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
      message: "Failed to retrieve students.",
    });
  }
};

/* ============================================================
   GET STUDENT BY ID
============================================================ */

export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
  .populate("user", "fullName email studentId department phone role")
  .populate("advisor", "fullName email")
  .populate({
    path: "courses",
    populate: {
      path: "instructor",
      select: "fullName email",
    },
  });
    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    return res.json(student);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to retrieve student.",
    });
  }
};

/* ============================================================
   GET STUDENT PROFILE
============================================================ */

export const getStudentProfile = async (req, res) => {
  try {
    if (
      req.user?.role === "Student" &&
      req.user?.studentId !== req.params.studentId
    ) {
      return res.status(403).json({
        message: "You can only access your own student profile.",
      });
    }

    const studentRecord = await Student.findOne({
      studentId: req.params.studentId,
    });

    if (!studentRecord) {
      return res.status(404).json({
        message: "Student profile not found.",
      });
    }

    await reconcileStudentCourses(studentRecord);

    const student = await Student.findById(studentRecord._id)
      .populate("user", "fullName email studentId department phone role")
      .populate("advisor", "fullName email")
      .populate({
        path: "courses",
        match: { status: "Active" },
        populate: {
          path: "instructor",
          select: "fullName email",
        },
      });

    return res.json(student);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to retrieve student profile.",
    });
  }
};

/* ============================================================
   CREATE STUDENT
============================================================ */

export const createStudent = async (req, res) => {
  try {
    const {
      user,
      studentId,
      fullName,
      gender,
      email,
      phone,
      department,
      program,
      year,
      semester,
      section,
      status,
      photo,
      admissionYear,
      advisor,
      courses,
    } = req.body;

    if (
      !studentId ||
      !fullName ||
      !gender ||
      !email ||
      !department
    ) {
      return res.status(400).json({
        message:
          "Student ID, Full Name, Gender, Email and Department are required.",
      });
    }

    const existingStudent = await Student.findOne({
      studentId,
    });

    if (existingStudent) {
      return res.status(400).json({
        message: "Student ID already exists.",
      });
    }

    const existingEmail = await Student.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existingEmail) {
      return res.status(400).json({
        message: "Email already exists.",
      });
    }

    const matchedCourses = await Course.find({
  department,
  studyYear: year,
  semester,
  status: "Active",
});

const student = await Student.create({
  user: user || null,
  studentId,
  fullName,
  gender,
  email: email.trim().toLowerCase(),
  phone,
  department,
  program,
  year,
  semester,
  section,
  status: status || "Active",
  photo,
  admissionYear,
  advisor,
  courses: matchedCourses.map((course) => course._id),
});
if (matchedCourses.length > 0) {
  await Course.updateMany(
    {
      _id: {
        $in: matchedCourses.map((course) => course._id),
      },
    },
    {
      $addToSet: {
        students: student._id,
      },
    }
  );
}

    return res.status(201).json({
      message: "Student registered successfully.",
      student,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to register student.",
    });
  }
};
/* ============================================================
   UPDATE STUDENT
============================================================ */

export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    if (
      req.body.studentId &&
      req.body.studentId !== student.studentId
    ) {
      const existingStudent = await Student.findOne({
        studentId: req.body.studentId,
        _id: { $ne: student._id },
      });

      if (existingStudent) {
        return res.status(400).json({
          message: "Student ID already exists.",
        });
      }
    }

    if (
      req.body.email &&
      req.body.email !== student.email
    ) {
      const existingEmail = await Student.findOne({
        email: req.body.email.trim().toLowerCase(),
        _id: { $ne: student._id },
      });

      if (existingEmail) {
        return res.status(400).json({
          message: "Email already exists.",
        });
      }
    }

    if (req.body.user !== undefined) {
      const userId = req.body.user && typeof req.body.user === "object"
        ? req.body.user._id
        : req.body.user;
      student.user = userId || null;
    }

    student.studentId =
      req.body.studentId ?? student.studentId;

    student.fullName =
      req.body.fullName ?? student.fullName;

    student.gender =
      req.body.gender ?? student.gender;

    student.email =
      req.body.email?.trim().toLowerCase() ??
      student.email;

    student.phone =
      req.body.phone ?? student.phone;

    student.department =
      req.body.department ?? student.department;

    student.program =
      req.body.program ?? student.program;

    student.year =
      req.body.year ?? student.year;

    student.semester =
      req.body.semester ?? student.semester;

    student.section =
      req.body.section ?? student.section;

    student.status =
      req.body.status ?? student.status;

    student.photo =
      req.body.photo ?? student.photo;

    student.admissionYear =
      req.body.admissionYear ??
      student.admissionYear;

    student.advisor =
      req.body.advisor ?? student.advisor;

    if (Array.isArray(req.body.courses)) {
      student.courses = req.body.courses;
    }

    const updatedStudent = await student.save();

    // Keep course enrollment synchronized whenever department, year, semester,
    // or status changes. This also repairs older student records that were
    // created before a matching course existed.
    await reconcileStudentCourses(updatedStudent);

    const populatedStudent =
  await Student.findById(updatedStudent._id)
    .populate(
      "advisor",
      "fullName email"
    )
    .populate({
      path: "courses",
      populate: {
        path: "instructor",
        select: "fullName email",
      },
    });

    return res.json({
      message: "Student updated successfully.",
      student: populatedStudent,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to update student.",
    });
  }
};

/* ============================================================
   DELETE STUDENT
============================================================ */

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    await Course.updateMany(
      { students: student._id },
      { $pull: { students: student._id } }
    );
    await student.deleteOne();

    return res.json({
      message: "Student deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to delete student.",
    });
  }
};

/* ============================================================
   SEARCH STUDENTS
============================================================ */

export const searchStudents = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";

    const students = await Student.find({
      $or: [
        {
          fullName: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          studentId: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          email: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          department: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          program: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          section: {
            $regex: keyword,
            $options: "i",
          },
        },
      ],
    })
      .populate("user", "fullName email studentId department phone role")
  .populate("advisor", "fullName")
.populate({
  path: "courses",
  populate: {
    path: "instructor",
    select: "fullName email",
  },
})
.sort({
  createdAt: -1,
});

    return res.json(students);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to search students.",
    });
  }
};
/* ============================================================
   STUDENT STATISTICS
============================================================ */

export const getStudentStatistics = async (req, res) => {
  try {
    const totalStudents =
      await Student.countDocuments();

    const activeStudents =
      await Student.countDocuments({
        status: "Active",
      });

    const graduatedStudents =
      await Student.countDocuments({
        status: "Graduated",
      });

    const suspendedStudents =
      await Student.countDocuments({
        status: "Suspended",
      });

    const departments =
      await Student.aggregate([
        {
          $group: {
            _id: "$department",
            total: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            total: -1,
          },
        },
      ]);

    const programs =
      await Student.aggregate([
        {
          $group: {
            _id: "$program",
            total: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            total: -1,
          },
        },
      ]);

    const years =
      await Student.aggregate([
        {
          $group: {
            _id: "$year",
            total: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            total: 1,
          },
        },
      ]);

    const semesters =
      await Student.aggregate([
        {
          $group: {
            _id: "$semester",
            total: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            total: 1,
          },
        },
      ]);

    return res.json({
      summary: {
        totalStudents,
        activeStudents,
        graduatedStudents,
        suspendedStudents,
      },
      departments,
      programs,
      years,
      semesters,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to retrieve student statistics.",
    });
  }
};