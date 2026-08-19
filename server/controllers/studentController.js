import Student from "../models/student.js";
import Course from "../models/course.js";
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
    const student = await Student.findOne({
  studentId: req.params.studentId,
})
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
        message: "Student profile not found.",
      });
    }

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

    if (req.body.courses) {
      student.courses = req.body.courses;
    }

    const updatedStudent = await student.save();

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