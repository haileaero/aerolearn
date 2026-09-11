import Attendance from "../models/attendance.js";
import Course from "../models/course.js";
import Student from "../models/student.js";


const ATTENDANCE_STUDENT_SELECT = "studentId fullName department section year status";

const buildAttendanceRows = async (rows = []) => {
  const normalized = Array.isArray(rows) ? rows : [];
  const ids = normalized
    .map((row) => row?.student && typeof row.student === "object" ? row.student._id : row?.student)
    .filter(Boolean);

  const roster = await Student.find({ _id: { $in: ids } })
    .select(ATTENDANCE_STUDENT_SELECT)
    .lean();
  const byId = new Map(roster.map((student) => [String(student._id), student]));

  return normalized.map((row) => {
    const id = row?.student && typeof row.student === "object" ? row.student._id : row?.student;
    const student = id ? byId.get(String(id)) : null;
    return {
      student: id,
      studentId: student?.studentId || row?.studentId || "",
      studentName: student?.fullName || row?.studentName || "",
      section: student?.section || row?.section || "",
      year: student?.year || row?.year || "",
      status: row?.status || "Present",
    };
  });
};

const backfillAttendanceSnapshots = async (attendance) => {
  if (!attendance || !Array.isArray(attendance.students) || attendance.students.length === 0) return attendance;
  let changed = false;
  for (const item of attendance.students) {
    const student = item.student && typeof item.student === "object" ? item.student : null;
    if (!student) continue;
    if (!item.studentId && student.studentId) { item.studentId = student.studentId; changed = true; }
    if (!item.studentName && student.fullName) { item.studentName = student.fullName; changed = true; }
    if (!item.section && student.section) { item.section = student.section; changed = true; }
    if (!item.year && student.year) { item.year = student.year; changed = true; }
  }
  // Do not mutate historical records during a GET request. New/updated sessions
  // persist snapshots through buildAttendanceRows; this only enriches the response.
  void changed;
  return attendance;
};

/* ============================================================
   GET ALL ATTENDANCE SESSIONS
============================================================ */

export const getAttendance = async (
  req,
  res
) => {

  try {

    const attendance =
      await Attendance.find()

        .populate(
          "course",
          "code name department"
        )

        .populate(
          "students.student",
          "studentId fullName department section year status"
        )

        .sort({
          date: -1,
        });

    await Promise.all(attendance.map((item) => backfillAttendanceSnapshots(item)));

    res.status(200).json(
      attendance
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({

      message:
        "Failed to load attendance records.",

    });

  }

};

/* ============================================================
   GET SINGLE ATTENDANCE SESSION
============================================================ */

export const getAttendanceById =
  async (req, res) => {

    try {

      const attendance =
        await Attendance.findById(
          req.params.id
        )

          .populate(
            "course",
            "code name department"
          )

          .populate(
            "students.student",
            "studentId fullName department section year status"
          );

      if (!attendance) {

        return res.status(404).json({

          message:
            "Attendance session not found.",

        });

      }

      await backfillAttendanceSnapshots(attendance);

      res.status(200).json(
        attendance
      );

    } catch (error) {

      console.error(error);

      res.status(500).json({

        message:
          "Failed to load attendance session.",

      });

    }

  };

/* ============================================================
   GET ATTENDANCE BY COURSE + WEEK + PERIOD
============================================================ */

export const getAttendanceByCourseWeek =
  async (req, res) => {

    try {

      const period =
        Number(
          req.query.period || 1
        );

      const attendance =
        await Attendance.findOne({

          course:
            req.params.courseId,

          week:
            Number(
              req.params.week
            ),

          period,

        })

          .populate(
            "course",
            "code name department"
          )

          .populate(
            "students.student",
            "studentId fullName department section year status"
          );

      if (!attendance) {

        return res.status(404).json({

          message:
            "Attendance session not found.",

        });

      }

      await backfillAttendanceSnapshots(attendance);

      res.status(200).json(
        attendance
      );

    } catch (error) {

      console.error(error);

      res.status(500).json({

        message:
          "Failed to load attendance session.",

      });

    }

  };

/* ============================================================
   CREATE ATTENDANCE SESSION
============================================================ */

export const createAttendance = async (req, res) => {
  try {
    const {
      course,
      week,
      period,
      date,
      students,
    } = req.body;

    // Find the course
    const selectedCourse = await Course.findById(course);

    if (!selectedCourse) {
      return res.status(404).json({
        message: "Course not found.",
      });
    }

    // Check if attendance already exists
    const existingAttendance = await Attendance.findOne({
      course,
      week,
      period,
    });

    if (existingAttendance) {
      return res.status(400).json({
        message:
          "Attendance already exists for this week and period.",
      });
    }

    // Validate attendance statuses
    const allowedStatus = [
      "Present",
      "Absent",
      "Late",
    ];

    for (const record of students) {
      if (!allowedStatus.includes(record.status)) {
        return res.status(400).json({
          message:
            "Invalid attendance status detected.",
        });
      }
    }

    // Store a stable identity snapshot with each attendance row.
    const attendanceRows = await buildAttendanceRows(students);

    // Create attendance
    const attendance = await Attendance.create({
      department: selectedCourse.department,

      // Your Course model uses studyYear
      year: selectedCourse.studyYear,

      course,

      week,

      period,

      date,

      students: attendanceRows,
    });

    // Return populated attendance
    const populatedAttendance =
      await Attendance.findById(attendance._id)
        .populate(
          "course",
          "code name department studyYear"
        )
        .populate(
          "students.student",
          "studentId fullName department section year status"
        );

    await backfillAttendanceSnapshots(populatedAttendance);

    res.status(201).json(
      populatedAttendance
    );

  } catch (error) {
    console.error(
      "CREATE ATTENDANCE ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to create attendance session.",
      error: error.message,
    });
  }
};

/* ============================================================
   UPDATE ATTENDANCE SESSION
============================================================ */

export const updateAttendance =
  async (req, res) => {

    try {

      const attendance =
        await Attendance.findById(
          req.params.id
        );

      if (!attendance) {

        return res.status(404).json({

          message:
            "Attendance session not found.",

        });

      }

      const duplicate =
        await Attendance.findOne({

          _id: {
            $ne: req.params.id,
          },

          course:
            attendance.course,

          week:
            req.body.week,

          period:
            req.body.period,

        });

      if (duplicate) {

        return res.status(400).json({

          message:
            "Another attendance session already exists for this week and period.",

        });

      }

      const allowedStatus = [
        "Present",
        "Absent",
        "Late",
      ];

      for (const record of req.body.students) {

        if (
          !allowedStatus.includes(
            record.status
          )
        ) {

          return res.status(400).json({

            message:
              "Invalid attendance status detected.",

          });

        }

      }

      attendance.students =
        await buildAttendanceRows(req.body.students);

      attendance.week =
        req.body.week;

      attendance.period =
        req.body.period;

      attendance.date =
        req.body.date;
              await attendance.save();

      const updatedAttendance =
        await Attendance.findById(
          attendance._id
        )

          .populate(
            "course",
            "code name department"
          )

          .populate(
            "students.student",
            "studentId fullName department section year status"
          );

      await backfillAttendanceSnapshots(updatedAttendance);

      res.status(200).json(
        updatedAttendance
      );

    } catch (error) {

      console.error(error);

      res.status(500).json({

        message:
          "Failed to update attendance session.",

      });

    }

  };

/* ============================================================
   DELETE ATTENDANCE SESSION
============================================================ */

export const deleteAttendance =
  async (req, res) => {

    try {

      const attendance =
        await Attendance.findById(
          req.params.id
        );

      if (!attendance) {

        return res.status(404).json({

          message:
            "Attendance session not found.",

        });

      }

      await attendance.deleteOne();

      res.status(200).json({

        message:
          "Attendance session deleted successfully.",

      });

    } catch (error) {

      console.error(error);

      res.status(500).json({

        message:
          "Failed to delete attendance session.",

      });

    }

  };

/* ============================================================
   ATTENDANCE STATISTICS
============================================================ */

export const getAttendanceStatistics =
  async (req, res) => {

    try {

      const attendance =
        await Attendance.find({

          course:
            req.params.courseId,

        });
              let totalPresent = 0;
      let totalAbsent = 0;
      let totalLate = 0;

      attendance.forEach((session) => {

        session.students.forEach(
          (student) => {

            switch (student.status) {

              case "Present":
                totalPresent++;
                break;

              case "Absent":
                totalAbsent++;
                break;

              case "Late":
                totalLate++;
                break;

              default:
                break;

            }

          }
        );

      });

      const totalRecords =
        totalPresent +
        totalAbsent +
        totalLate;

      const attendanceRate =
        totalRecords === 0
          ? 0
          : Number(
              (
                (totalPresent /
                  totalRecords) *
                100
              ).toFixed(2)
            );

      const absentRate =
        totalRecords === 0
          ? 0
          : Number(
              (
                (totalAbsent /
                  totalRecords) *
                100
              ).toFixed(2)
            );

      const lateRate =
        totalRecords === 0
          ? 0
          : Number(
              (
                (totalLate /
                  totalRecords) *
                100
              ).toFixed(2)
            );

      const averageAttendance =
        attendance.length === 0
          ? 0
          : Number(
              (
                totalPresent /
                attendance.length
              ).toFixed(2)
            );

      res.status(200).json({

        sessions:
          attendance.length,

        totalRecords,

        totalPresent,

        totalAbsent,

        totalLate,

        attendanceRate,

        absentRate,

        lateRate,

        averageAttendance,

      });

    } catch (error) {

      console.error(error);

      res.status(500).json({

        message:
          "Failed to generate attendance statistics.",

      });

    }

  };

/* ============================================================
   ATTENDANCE HISTORY
============================================================ */

export const getAttendanceHistory =
  async (req, res) => {

    try {

      const attendance =
        await Attendance.find({

          course:
            req.params.courseId,

        })

          .populate(
            "course",
            "code name department"
          )

          .select(
            "course week period date createdAt"
          )

          .sort({

            week: 1,

            period: 1,

            date: -1,

          });

      res.status(200).json(
        attendance
      );

    } catch (error) {

      console.error(error);

      res.status(500).json({

        message:
          "Failed to load attendance history.",

      });

    }

  };