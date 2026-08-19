import Attendance from "../models/attendance.js";
import Course from "../models/course.js";

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
          "studentId fullName department"
        )

        .sort({
          date: -1,
        });

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
            "studentId fullName department"
          );

      if (!attendance) {

        return res.status(404).json({

          message:
            "Attendance session not found.",

        });

      }

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
            "studentId fullName department"
          );

      if (!attendance) {

        return res.status(404).json({

          message:
            "Attendance session not found.",

        });

      }

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

    // Create attendance
    const attendance = await Attendance.create({
      department: selectedCourse.department,

      // Your Course model uses studyYear
      year: selectedCourse.studyYear,

      course,

      week,

      period,

      date,

      students,
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
          "studentId fullName department"
        );

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
        req.body.students;

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
            "studentId fullName department"
          );

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