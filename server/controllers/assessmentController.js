import Assessment from "../models/assessment.js";
import Course from "../models/course.js";
import Student from "../models/student.js";

const rosterFilterForCourse = (course) => ({
  status: "Active",
  department: course.department,
  year: course.studyYear,
  semester: course.semester,
});

const syncAssessmentRoster = async (assessment) => {
  const course = assessment.course && typeof assessment.course === "object" ? assessment.course : null;
  if (!course?._id) return assessment;

<<<<<<< HEAD
  const [matching, linked] = await Promise.all([
    Student.find(rosterFilterForCourse(course)).select("_id").lean(),
    Student.find({
      status: "Active",
      $or: [{ courses: course._id }, { _id: { $in: course.students || [] } }],
    }).select("_id").lean(),
  ]);
  const rosterIds = [...new Set([...matching, ...linked].map((student) => String(student._id)))];
  const existing = new Map((assessment.scores || []).filter((row) => row.student).map((row) => [String(row.student._id || row.student), row]));
  let changed = false;

  assessment.scores = rosterIds.map((studentId) => {
    const row = existing.get(studentId);
    if (row) return row;
    changed = true;
    return { student: studentId, score: 0, entered: false, remark: "" };
  });
  if (assessment.scores.length !== existing.size) changed = true;
  if (changed) {
    await Assessment.updateOne({ _id: assessment._id }, { $set: { scores: assessment.scores.map((row) => ({
      student: row.student?._id || row.student, score: row.score || 0, entered: row.entered === true, remark: row.remark || ""
    })) } });
    await assessment.populate("scores.student", "studentId fullName department section");
  }
=======
  // The course's academic offering is the source of truth. Do not union
  // stale Student.courses / Course.students references into this roster: the
  // same course code may be offered to several departments.
  const matching = await Student.find(rosterFilterForCourse(course))
    .select("_id")
    .lean();
  const rosterIds = matching.map((student) => String(student._id));
  const existing = new Map(
    (assessment.scores || [])
      .filter((row) => row.student)
      .map((row) => [String(row.student._id || row.student), row])
  );
  // Filter the API response without deleting historical score rows from the
  // database. Existing scores for eligible students are retained; newly
  // eligible students get an empty row in this response until the score sheet
  // is saved.
  assessment.scores = rosterIds.map((studentId) => {
    const row = existing.get(studentId);
    if (row) return row;
    return { student: studentId, score: 0, entered: false, remark: "" };
  });
  await assessment.populate("scores.student", "studentId fullName department section");
>>>>>>> 31203c3 (Fix department-specific student rosters)
  assessment.scores = (assessment.scores || []).filter((row) => row.student);
  return assessment;
};

/* ============================================================
   GET ALL ASSESSMENTS
============================================================ */

export const getAssessments = async (
  req,
  res
) => {

  try {

    const assessmentFilter = {};
    if (req.user?.role === "Instructor") {
      const assignedCourseIds = await Course.find({ instructor: req.user._id }).distinct("_id");
      assessmentFilter.course = { $in: assignedCourseIds };
    }

    const assessments =
      await Assessment.find(assessmentFilter)

        .populate(
          "course",
          "code name department studyYear semester academicYear instructor"
        )

        .populate(
          "scores.student",
          "studentId fullName department section"
        )

        .sort({
          createdAt: -1,
        });

    // Populated score rows whose Student document no longer exists have
    // student=null. Never expose/count those stale rows in instructor/admin UI.
    for (const assessment of assessments) {
      await syncAssessmentRoster(assessment);
    }

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
            "code name department studyYear semester academicYear instructor"
          )

          .populate(
            "scores.student",
            "studentId fullName department section"
          );

      if (!assessment) {

        return res.status(404).json({

          message:
            "Assessment not found.",

        });

      }

      await syncAssessmentRoster(assessment);

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

      const selectedCourse = await Course.findById(course);

      if (!selectedCourse) {
        return res.status(404).json({ message: "Course not found." });
      }

      if (req.user?.role === "Instructor" && String(selectedCourse.instructor || "") !== String(req.user._id)) {
        return res.status(403).json({ message: "You can only create assessments for courses assigned to you." });
      }

<<<<<<< HEAD
      // Enrollment can exist on either side in older AeroLearn records.
      // Reconcile both Course.students and Student.courses before building the
      // score sheet so Admin/Instructor do not get a false “no students” error.
=======
      // A course offering belongs to one department/year/semester. Use that
      // academic placement to build its roster; stale cross-department links
      // must never pull students into another department's assessment.
>>>>>>> 31203c3 (Fix department-specific student rosters)
      const matchingStudents = await Student.find({
        department: selectedCourse.department,
        year: selectedCourse.studyYear,
        semester: selectedCourse.semester,
        status: "Active",
      }).select("_id");

<<<<<<< HEAD
      const explicitlyLinked = await Student.find({
        $or: [
          { _id: { $in: selectedCourse.students || [] } },
          { courses: selectedCourse._id },
        ],
        status: "Active",
      }).select("_id");

      const enrolledMap = new Map();
      for (const student of [...matchingStudents, ...explicitlyLinked]) {
        enrolledMap.set(String(student._id), student._id);
      }
      const enrolledStudentIds = [...enrolledMap.values()];
=======
      const enrolledStudentIds = matchingStudents.map((student) => student._id);
>>>>>>> 31203c3 (Fix department-specific student rosters)

      // Assessment creation is course-level and must not depend on enrollment.
      // If students are already available, keep the existing relationships in sync;
      // otherwise create the assessment with an empty score sheet. Students can be
      // attached later without blocking Admin/Instructor from preparing assessments.
      if (enrolledStudentIds.length > 0) {
        await Course.updateOne(
          { _id: selectedCourse._id },
          { $addToSet: { students: { $each: enrolledStudentIds } } }
        );
        await Student.updateMany(
          { _id: { $in: enrolledStudentIds } },
          { $addToSet: { courses: selectedCourse._id } }
        );
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

      const scores = enrolledStudentIds.map(
          (studentId) => ({

            student: studentId,

            score: 0,

            entered: false,

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

          totalMark: Number(weight),

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
            "code name department studyYear semester academicYear instructor"
          )

          .populate(
            "scores.student",
            "studentId fullName department section"
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

      assessment.weight =
        req.body.weight ??
        assessment.weight;

      // In AeroLearn the assessment contribution is also its maximum score.
      assessment.totalMark = Number(assessment.weight);

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
            "code name department studyYear semester academicYear instructor"
          )

          .populate(
            "scores.student",
            "studentId fullName department section"
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

      const requestedStudentIds = req.body.scores.map((item) => item.student).filter(Boolean);
      const existingStudentIds = new Set(
        (await Student.find({ _id: { $in: requestedStudentIds } }).select("_id").lean())
          .map((student) => String(student._id))
      );
<<<<<<< HEAD
=======
      const scoreCourse = await Course.findById(assessment.course)
        .select("department studyYear semester")
        .lean();
      if (!scoreCourse) {
        return res.status(400).json({ message: "The course for this assessment no longer exists." });
      }
      const eligibleStudentIds = new Set(
        (await Student.find(rosterFilterForCourse(scoreCourse)).distinct("_id"))
          .map((studentId) => String(studentId))
      );
>>>>>>> 31203c3 (Fix department-specific student rosters)

      for (const item of req.body.scores) {

        if (!existingStudentIds.has(String(item.student))) {
          return res.status(400).json({
            message: "A score row belongs to a student who has been removed. Refresh the assessment and try again.",
          });
        }

<<<<<<< HEAD
=======
        if (!eligibleStudentIds.has(String(item.student))) {
          return res.status(400).json({
            message: "This student is not enrolled in the department, study year and semester for this course.",
          });
        }

>>>>>>> 31203c3 (Fix department-specific student rosters)
        if (
          item.score < 0 ||
          item.score >
            assessment.weight
        ) {

          return res.status(400).json({

            message:
              `Invalid score for student ${item.student}. Scores must be between 0 and ${assessment.weight}.`,

          });

        }

      }

      const historicalOutOfRosterRows = (assessment.scores || []).filter((row) => {
        const studentId = row.student?._id || row.student;
        return studentId && !eligibleStudentIds.has(String(studentId));
      });
      assessment.scores = [
        ...req.body.scores.map((item) => ({
          student: item.student,
          score: item.entered === false ? 0 : Number(item.score) || 0,
          entered: item.entered !== false,
          remark: item.remark || "",
        })),
        ...historicalOutOfRosterRows,
      ];
      await assessment.save();

      const updatedAssessment =
        await Assessment.findById(
          assessment._id
        )

          .populate(
            "course",
            "code name department studyYear semester academicYear instructor"
          )

          .populate(
            "scores.student",
            "studentId fullName department section"
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
   GET MY RESULTS (STUDENT)
============================================================ */

export const getMyResults = async (req, res) => {
  try {
    if (req.user?.role !== "Student") {
      return res.status(403).json({ message: "Student access only." });
    }

    const student = await Student.findOne({ $or: [{ user: req.user._id }, { studentId: req.user.studentId }] });

    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    const currentCourses = await Course.find({
      department: student.department,
      studyYear: student.year,
      semester: student.semester,
      status: "Active",
    }).select("_id code name department studyYear semester academicYear creditHours status");

    const currentCourseIds = currentCourses.map((course) => course._id);

    if (student.status === "Active" && currentCourseIds.length) {
      // Repair the student's current course references and course rosters.
      await Student.updateOne(
        { _id: student._id },
        { $addToSet: { courses: { $each: currentCourseIds } } }
      );
      await Course.updateMany(
        { _id: { $in: currentCourseIds } },
        { $addToSet: { students: student._id } }
      );

      // Repair score sheets created before enrollment was synchronized.
      await Assessment.updateMany(
        {
          course: { $in: currentCourseIds },
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

    // Historical assessments remain visible even if the student later moves to
    // another year/semester. This prevents valid old results from disappearing.
    const historicalAssessments = await Assessment.find({
      "scores.student": student._id,
    })
      .populate("course", "code name department studyYear semester academicYear creditHours status")
      .sort({ dueDate: -1, createdAt: -1 });

    const currentAssessments = currentCourseIds.length
      ? await Assessment.find({ course: { $in: currentCourseIds } })
          .populate("course", "code name department studyYear semester academicYear creditHours status")
          .sort({ dueDate: -1, createdAt: -1 })
      : [];

    const assessmentMap = new Map();
    for (const assessment of [...historicalAssessments, ...currentAssessments]) {
      assessmentMap.set(String(assessment._id), assessment);
    }

    const assessments = [...assessmentMap.values()].map((assessment) => {
      const scoreRow = (assessment.scores || []).find(
        (item) => String(item.student) === String(student._id)
      );

      return {
        _id: assessment._id,
        course: assessment.course,
        title: assessment.title,
        category: assessment.category,
        week: assessment.week,
        dueDate: assessment.dueDate,
        totalMark: assessment.totalMark,
        weight: assessment.weight,
        description: assessment.description,
        result: scoreRow
          ? {
              score: Number(scoreRow.score || 0),
              entered: scoreRow.entered === true || Number(scoreRow.score) > 0,
              remark: scoreRow.remark || "",
            }
          : { score: 0, entered: false, remark: "" },
      };
    });

    const courseMap = new Map();
    for (const course of currentCourses) {
      courseMap.set(String(course._id), course);
    }
    for (const assessment of assessments) {
      if (assessment.course?._id) {
        courseMap.set(String(assessment.course._id), assessment.course);
      }
    }

    return res.json({
      student: {
        studentId: student.studentId,
        fullName: student.fullName,
        year: student.year,
        semester: student.semester,
        department: student.department,
      },
      courses: [...courseMap.values()],
      assessments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to load student results." });
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