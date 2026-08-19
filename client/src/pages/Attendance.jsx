import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import "../styles/attendance.css";

import api from "../api";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  FaCalendarAlt,
  FaHistory,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaFilePdf,
  FaSave,
} from "react-icons/fa";

function Attendance() {
  // ============================================================
  // DEPARTMENTS
  // ============================================================

  const departments = [
    "Aerospace Engineering",
    "Production Engineering",
    "Armament Engineering",
    "Computer Engineering",
    "Motor Vehicle Engineering",
    "Metallurgy and Material Engineering",
    "Chemical Engineering",
    "Electrical Power Engineering",
    "Electronics Engineering",
    "Civil Engineering",
  ];

  // ============================================================
  // STATE
  // ============================================================

  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [history, setHistory] = useState([]);

  const [selectedDepartment, setSelectedDepartment] =
    useState("");

  const [selectedCourse, setSelectedCourse] =
    useState("");

  const [week, setWeek] = useState(1);

  const [period, setPeriod] = useState(1);

  const [date, setDate] = useState("");

  const [attendanceId, setAttendanceId] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadCourses();
  }, []);

  // ============================================================
  // LOAD COURSES
  // ============================================================

  const loadCourses = async () => {
  try {
    setError("");

    const response = await api.get("/courses");

    console.log("Courses:", response.data);

    setCourses(
      Array.isArray(response.data)
        ? response.data
        : response.data.courses || []
    );
  } catch (err) {
    console.error("Load courses error:", err);

    setError(
      err.response?.data?.message ||
      "Unable to load courses."
    );
  }
};
  // ============================================================
  // FILTER COURSES BY DEPARTMENT
  // ============================================================

  const filteredCourses = useMemo(() => {
    if (!selectedDepartment) {
      return [];
    }

    return courses.filter(
      (course) =>
        course.department ===
        selectedDepartment
    );
  }, [
    courses,
    selectedDepartment,
  ]);

  // ============================================================
  // SELECTED COURSE DATA
  // ============================================================

  const selectedCourseData =
    useMemo(() => {
      return courses.find(
        (course) =>
          course._id ===
          selectedCourse
      );
    }, [
      courses,
      selectedCourse,
    ]);

  // ============================================================
  // ATTENDANCE SUMMARY
  // ============================================================

  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;

    students.forEach(
      (student) => {
        switch (
          student.status
        ) {
          case "Present":
            present++;
            break;

          case "Absent":
            absent++;
            break;

          case "Late":
            late++;
            break;

          default:
            break;
        }
      }
    );

    return {
      total: students.length,

      present,

      absent,

      late,

      percentage:
        students.length === 0
          ? "0.0"
          : (
              (present /
                students.length) *
              100
            ).toFixed(1),
    };
  }, [students]);

  // ============================================================
  // LOAD ATTENDANCE HISTORY
  // ============================================================

  const loadHistory = async (
    courseId
  ) => {
    if (!courseId) {
      setHistory([]);
      return;
    }

    try {
      const response =
        await api.get(
          `/attendance/history/${courseId}`
        );

      setHistory(
        Array.isArray(
          response.data
        )
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Load attendance history error:",
        err
      );

      setHistory([]);
    }
  };

  // ============================================================
  // LOAD STUDENTS FOR SELECTED COURSE
  // ============================================================

  const loadStudents = async (
    selectedWeek = week,
    selectedPeriod = period
  ) => {
    if (!selectedDepartment) {
      setError(
        "Please select a department."
      );
      return;
    }

    if (!selectedCourse) {
      setError(
        "Please select a course."
      );
      return;
    }

    setLoading(true);

    setError("");

    setMessage("");

    try {
      // ========================================================
      // FIRST:
      // Try to find existing attendance
      // ========================================================

      try {
        const attendanceResponse =
          await api.get(
            `/attendance/course/${selectedCourse}/week/${selectedWeek}?period=${selectedPeriod}`
          );

        const attendance =
          attendanceResponse.data;

        setAttendanceId(
          attendance._id
        );

        setDate(
          attendance.date
            ? attendance.date.substring(
                0,
                10
              )
            : ""
        );

        const loadedStudents =
          Array.isArray(
            attendance.students
          )
            ? attendance.students
                .map(
                  (item) => ({
                    student:
                      item.student?._id ||
                      item.student,

                    studentId:
                      item.student
                        ?.studentId ||
                      "",

                    fullName:
                      item.student
                        ?.fullName ||
                      "",

                    status:
                      item.status ||
                      "Present",
                  })
                )
            : [];

        setStudents(
          loadedStudents
        );

        setMessage(
          "Attendance record loaded successfully."
        );

        setLoading(false);

        return;
      } catch (attendanceError) {
        // ======================================================
        // 404 MEANS ATTENDANCE DOES NOT EXIST YET
        // ======================================================

        if (
          attendanceError.response
            ?.status !== 404
        ) {
          throw attendanceError;
        }
      }

      // ========================================================
      // NO ATTENDANCE FOUND
      // LOAD COURSE AND ENROLLED STUDENTS
      // ========================================================

      // ========================================================
// LOAD ALL STUDENTS FROM THE SAME DEPARTMENT
// ========================================================

const courseResponse = await api.get(
  `/courses/${selectedCourse}`
);

const course = courseResponse.data;

const studentResponse = await api.get("/students");

const allStudents = Array.isArray(studentResponse.data)
  ? studentResponse.data
  : studentResponse.data.students || [];

const departmentStudents = allStudents.filter(
  (student) =>
    student.department === course.department
);

const loadedStudents = departmentStudents.map(
  (student) => ({
    student: student._id,
    studentId: student.studentId,
    fullName: student.fullName,
    status: "Present",
  })
);

      setStudents(
        loadedStudents
      );

      setAttendanceId(null);

      if (
        loadedStudents.length ===
        0
      ) {
        setError(
          "No students are enrolled in this course."
        );
      } else {
        setMessage(
          "Students loaded successfully. You can now record attendance."
        );
      }
    } catch (err) {
      console.error(
        "Load students error:",
        err
      );

      setStudents([]);

      setAttendanceId(null);

      setError(
        err.response?.data?.message ||
          "Unable to load attendance or enrolled students."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CHANGE ATTENDANCE STATUS
  // ============================================================

  const handleStatusChange = (
    index,
    status
  ) => {
    setStudents((previous) => {
      const updated = [
        ...previous,
      ];

      updated[index] = {
        ...updated[index],
        status,
      };

      return updated;
    });
  };

  // ============================================================
  // SAVE / UPDATE ATTENDANCE
  // ============================================================

  const saveAttendance = async () => {
    if (!selectedDepartment) {
      setError(
        "Please select a department."
      );
      return;
    }

    if (!selectedCourse) {
      setError(
        "Please select a course."
      );
      return;
    }

    if (!date) {
      setError(
        "Please select attendance date."
      );
      return;
    }

    if (
      students.length === 0
    ) {
      setError(
        "No students available."
      );
      return;
    }

    setSaving(true);

    setError("");

    setMessage("");

    try {
      const payload = {
        course:
          selectedCourse,

        week,

        period,

        date,

        students:
          students.map(
            (student) => ({
              student:
                student.student,

              status:
                student.status,
            })
          ),
      };

      // ========================================================
      // UPDATE EXISTING ATTENDANCE
      // ========================================================

      if (attendanceId) {
        await api.put(
          `/attendance/${attendanceId}`,
          payload
        );

        setMessage(
          "Attendance updated successfully."
        );
      }

      // ========================================================
      // CREATE NEW ATTENDANCE
      // ========================================================

      else {
        const response =
          await api.post(
            "/attendance",
            payload
          );

        setAttendanceId(
          response.data._id
        );

        setMessage(
          "Attendance saved successfully."
        );
      }

      // Refresh history
      await loadHistory(
        selectedCourse
      );
    } catch (err) {
      console.error(
        "Save attendance error:",
        err
      );

      setError(
        err.response?.data
          ?.message ||
          "Unable to save attendance."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // EXPORT ATTENDANCE PDF
  // ============================================================

  const exportPDF = () => {
    if (
      students.length === 0
    ) {
      setError(
        "No attendance available to export."
      );
      return;
    }

    const doc =
      new jsPDF();

    doc.setFontSize(22);

    doc.text(
      "AeroLearn LMS",
      14,
      18
    );

    doc.setFontSize(15);

    doc.text(
      "Attendance Report",
      14,
      30
    );

    doc.setFontSize(11);

    doc.text(
      `Department: ${selectedDepartment}`,
      14,
      42
    );

    doc.text(
      `Course: ${
        selectedCourseData?.code ||
        ""
      } - ${
        selectedCourseData?.name ||
        ""
      }`,
      14,
      50
    );

    doc.text(
      `Week: ${week}`,
      14,
      58
    );

    doc.text(
      `Period: ${period}`,
      60,
      58
    );

    doc.text(
      `Date: ${date}`,
      110,
      58
    );

    autoTable(doc, {
      startY: 68,

      head: [
        [
          "#",
          "Student ID",
          "Student Name",
          "Status",
        ],
      ],

      body:
        students.map(
          (
            student,
            index
          ) => [
            index + 1,

            student.studentId,

            student.fullName,

            student.status,
          ]
        ),
    });

    const finalY =
      doc.lastAutoTable
        ?.finalY || 70;

    const y =
      finalY + 15;

    doc.setFontSize(12);

    doc.text(
      `Total Students: ${summary.total}`,
      14,
      y
    );

    doc.text(
      `Present: ${summary.present}`,
      14,
      y + 8
    );

    doc.text(
      `Absent: ${summary.absent}`,
      14,
      y + 16
    );

    doc.text(
      `Late: ${summary.late}`,
      14,
      y + 24
    );

    doc.text(
      `Attendance Rate: ${summary.percentage}%`,
      14,
      y + 32
    );

    doc.save(
      `${
        selectedCourseData?.code ||
        "Attendance"
      }_Week_${week}_Period_${period}.pdf`
    );
  };

  // ============================================================
  // RESET SESSION WHEN DEPARTMENT CHANGES
  // ============================================================

  const handleDepartmentChange = (
    value
  ) => {
    setSelectedDepartment(
      value
    );

    setSelectedCourse("");

    setStudents([]);

    setHistory([]);

    setAttendanceId(null);

    setDate("");

    setMessage("");

    setError("");
  };

  // ============================================================
  // CHANGE COURSE
  // ============================================================

  const handleCourseChange = async (
    courseId
  ) => {
    setSelectedCourse(
      courseId
    );

    setStudents([]);

    setAttendanceId(null);

    setDate("");

    setMessage("");

    setError("");

    if (courseId) {
      await loadHistory(
        courseId
      );
    } else {
      setHistory([]);
    }
  };

  // ============================================================
  // LOAD HISTORY RECORD
  // ============================================================

  const handleHistoryClick = async (
    item
  ) => {
    const selectedWeek =
      item.week || 1;

    const selectedPeriod =
      item.period || 1;

    setWeek(
      selectedWeek
    );

    setPeriod(
      selectedPeriod
    );

    await loadStudents(
      selectedWeek,
      selectedPeriod
    );
  };

  // ============================================================
  // USER INTERFACE
  // ============================================================

  return (
    <Layout>
      <div className="attendance-container">

        {/* ======================================================
            PAGE HEADER
        ====================================================== */}

        <div
          style={{
            background:
              "linear-gradient(135deg,#1e3a8a,#2563eb)",

            color: "#fff",

            padding: "35px",

            borderRadius: "20px",

            marginBottom: "30px",

            boxShadow:
              "0 10px 30px rgba(37,99,235,.25)",
          }}
        >
          <h1
            style={{
              margin: 0,

              fontSize: "38px",
            }}
          >
            Attendance Management
          </h1>

          <p
            style={{
              marginTop: "10px",

              opacity: 0.9,
            }}
          >
            Record, update and monitor
            attendance for every course.
          </p>
        </div>

        {/* ======================================================
            SUCCESS MESSAGE
        ====================================================== */}

        {message && (
          <div
            style={{
              background:
                "#dcfce7",

              color:
                "#166534",

              padding:
                "15px",

              borderRadius:
                "12px",

              marginBottom:
                "20px",
            }}
          >
            ✅ {message}
          </div>
        )}

        {/* ======================================================
            ERROR MESSAGE
        ====================================================== */}

        {error && (
          <div
            style={{
              background:
                "#fee2e2",

              color:
                "#991b1b",

              padding:
                "15px",

              borderRadius:
                "12px",

              marginBottom:
                "20px",
            }}
          >
            ❌ {error}
          </div>
        )}

        {/* ======================================================
            ATTENDANCE SESSION
        ====================================================== */}

        <div
          style={{
            background:
              "#fff",

            padding:
              "30px",

            borderRadius:
              "18px",

            boxShadow:
              "0 8px 20px rgba(0,0,0,.08)",

            marginBottom:
              "30px",
          }}
        >
          <h2
            style={{
              marginBottom:
                "25px",
            }}
          >
            <FaCalendarAlt />{" "}
            Attendance Session
          </h2>

          <div
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "repeat(auto-fit,minmax(220px,1fr))",

              gap:
                "20px",
            }}
          >

            {/* ==================================================
                DEPARTMENT
            ================================================== */}

            <div>
              <label>
                Department
              </label>

              <select
                value={
                  selectedDepartment
                }
                onChange={(e) =>
                  handleDepartmentChange(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select Department
                </option>

                {departments.map(
                  (department) => (
                    <option
                      key={
                        department
                      }
                      value={
                        department
                      }
                    >
                      {
                        department
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            {/* ==================================================
                COURSE
            ================================================== */}

            <div>
              <label>
                Course
              </label>

              <select
                value={
                  selectedCourse
                }
                onChange={(e) =>
                  handleCourseChange(
                    e.target.value
                  )
                }
                disabled={
                  !selectedDepartment
                }
              >
                <option value="">
                  Select Course
                </option>

                {filteredCourses.map(
                  (course) => (
                    <option
                      key={
                        course._id
                      }
                      value={
                        course._id
                      }
                    >
                      {
                        course.code
                      }{" "}
                      -{" "}
                      {
                        course.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            {/* ==================================================
                WEEK
            ================================================== */}

            <div>
              <label>
                Week
              </label>

              <select
                value={week}
                onChange={(e) =>
                  setWeek(
                    Number(
                      e.target.value
                    )
                  )
                }
              >
                {Array.from(
                  {
                    length: 16,
                  },
                  (_, index) => (
                    <option
                      key={
                        index
                      }
                      value={
                        index + 1
                      }
                    >
                      Week{" "}
                      {index + 1}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* ==================================================
                PERIOD
            ================================================== */}

            <div>
              <label>
                Period
              </label>

              <select
                value={period}
                onChange={(e) =>
                  setPeriod(
                    Number(
                      e.target.value
                    )
                  )
                }
              >
                {[1, 2, 3, 4, 5].map(
                  (p) => (
                    <option
                      key={p}
                      value={p}
                    >
                      Period {p}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* ==================================================
                DATE
            ================================================== */}

            <div>
              <label>
                Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          {/* ====================================================
              LOAD STUDENTS BUTTON
          ==================================================== */}

          <button
            onClick={() =>
              loadStudents(
                week,
                period
              )
            }
            disabled={
              loading ||
              !selectedCourse
            }
            style={{
              marginTop:
                "25px",

              background:
                "#2563eb",

              color:
                "#fff",

              border:
                "none",

              padding:
                "12px 25px",

              borderRadius:
                "10px",

              cursor:
                loading ||
                !selectedCourse
                  ? "not-allowed"
                  : "pointer",

              fontWeight:
                "600",

              opacity:
                loading ||
                !selectedCourse
                  ? 0.6
                  : 1,
            }}
          >
            {loading
              ? "Loading Students..."
              : "Load Students"}
          </button>
        </div>

        {/* ======================================================
            ATTENDANCE HISTORY
        ====================================================== */}

        {history.length >
          0 && (
          <div
            style={{
              background:
                "#fff",

              padding:
                "25px",

              borderRadius:
                "18px",

              marginBottom:
                "30px",

              boxShadow:
                "0 8px 20px rgba(0,0,0,.08)",
            }}
          >
            <h2
              style={{
                marginBottom:
                  "20px",
              }}
            >
              <FaHistory />{" "}
              Attendance History
            </h2>

            <div
              style={{
                display:
                  "flex",

                flexWrap:
                  "wrap",

                gap:
                  "12px",
              }}
            >
              {history.map(
                (item) => (
                  <button
                    key={
                      item._id
                    }
                    onClick={() =>
                      handleHistoryClick(
                        item
                      )
                    }
                    style={{
                      padding:
                        "10px 18px",

                      border:
                        "none",

                      borderRadius:
                        "10px",

                      background:
                        "#eef4ff",

                      cursor:
                        "pointer",

                      fontWeight:
                        "600",
                    }}
                  >
                    Week{" "}
                    {
                      item.week
                    }

                    {" | "}

                    Period{" "}
                    {
                      item.period ||
                      1
                    }
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* ======================================================
            SUMMARY AND STUDENTS
        ====================================================== */}

        {students.length >
          0 && (
          <>
            {/* ==================================================
                SUMMARY CARDS
            ================================================== */}

            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "repeat(auto-fit,minmax(180px,1fr))",

                gap:
                  "20px",

                marginBottom:
                  "30px",
              }}
            >
              {/* TOTAL */}

              <div
                style={{
                  background:
                    "#fff",

                  borderRadius:
                    "16px",

                  padding:
                    "25px",

                  textAlign:
                    "center",

                  boxShadow:
                    "0 8px 20px rgba(0,0,0,.08)",
                }}
              >
                <FaUsers
                  size={28}
                />

                <h4>
                  Total Students
                </h4>

                <h1>
                  {
                    summary.total
                  }
                </h1>
              </div>

              {/* PRESENT */}

              <div
                style={{
                  background:
                    "#dcfce7",

                  borderRadius:
                    "16px",

                  padding:
                    "25px",

                  textAlign:
                    "center",
                }}
              >
                <FaCheckCircle
                  size={28}
                />

                <h4>
                  Present
                </h4>

                <h1>
                  {
                    summary.present
                  }
                </h1>
              </div>

              {/* ABSENT */}

              <div
                style={{
                  background:
                    "#fee2e2",

                  borderRadius:
                    "16px",

                  padding:
                    "25px",

                  textAlign:
                    "center",
                }}
              >
                <FaTimesCircle
                  size={28}
                />

                <h4>
                  Absent
                </h4>

                <h1>
                  {
                    summary.absent
                  }
                </h1>
              </div>

              {/* LATE */}

              <div
                style={{
                  background:
                    "#fef3c7",

                  borderRadius:
                    "16px",

                  padding:
                    "25px",

                  textAlign:
                    "center",
                }}
              >
                <FaClock
                  size={28}
                />

                <h4>
                  Late
                </h4>

                <h1>
                  {
                    summary.late
                  }
                </h1>
              </div>

              {/* RATE */}

              <div
                style={{
                  background:
                    "#dbeafe",

                  borderRadius:
                    "16px",

                  padding:
                    "25px",

                  textAlign:
                    "center",
                }}
              >
                <h4>
                  Attendance Rate
                </h4>

                <h1>
                  {
                    summary.percentage
                  }
                  %
                </h1>
              </div>
            </div>

            {/* ==================================================
                ATTENDANCE TABLE
            ================================================== */}

            <div
              style={{
                background:
                  "#fff",

                borderRadius:
                  "18px",

                padding:
                  "25px",

                boxShadow:
                  "0 8px 20px rgba(0,0,0,.08)",

                overflowX:
                  "auto",
              }}
            >
              <h2
                style={{
                  marginBottom:
                    "20px",
                }}
              >
                Student Attendance List
              </h2>

              <table
                style={{
                  width:
                    "100%",

                  borderCollapse:
                    "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background:
                        "#2563eb",

                      color:
                        "#fff",
                    }}
                  >
                    <th
                      style={{
                        padding:
                          "14px",
                      }}
                    >
                      #
                    </th>

                    <th
                      style={{
                        padding:
                          "14px",
                      }}
                    >
                      Student ID
                    </th>

                    <th
                      style={{
                        padding:
                          "14px",
                      }}
                    >
                      Student Name
                    </th>

                    <th
                      style={{
                        padding:
                          "14px",
                      }}
                    >
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {students.map(
                    (
                      student,
                      index
                    ) => (
                      <tr
                        key={
                          student.student ||
                          index
                        }
                        style={{
                          borderBottom:
                            "1px solid #eee",
                        }}
                      >
                        <td
                          style={{
                            padding:
                              "14px",

                            textAlign:
                              "center",
                          }}
                        >
                          {
                            index +
                            1
                          }
                        </td>

                        <td
                          style={{
                            padding:
                              "14px",
                          }}
                        >
                          {
                            student.studentId
                          }
                        </td>

                        <td
                          style={{
                            padding:
                              "14px",
                          }}
                        >
                          {
                            student.fullName
                          }
                        </td>

                        <td
                          style={{
                            padding:
                              "14px",
                          }}
                        >
                          <select
                            value={
                              student.status ||
                              "Present"
                            }
                            onChange={(
                              e
                            ) =>
                              handleStatusChange(
                                index,
                                e.target
                                  .value
                              )
                            }
                            style={{
                              width:
                                "100%",

                              padding:
                                "10px",

                              borderRadius:
                                "8px",

                              border:
                                "1px solid #ddd",

                              background:
                                student.status ===
                                "Present"
                                  ? "#dcfce7"
                                  : student.status ===
                                    "Absent"
                                  ? "#fee2e2"
                                  : "#fef3c7",

                              fontWeight:
                                "600",
                            }}
                          >
                            <option value="Present">
                              ✅ Present
                            </option>

                            <option value="Absent">
                              ❌ Absent
                            </option>

                            <option value="Late">
                              ⏰ Late
                            </option>
                          </select>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>

              {/* ==================================================
                  ACTION BUTTONS
              ================================================== */}

              <div
                style={{
                  display:
                    "flex",

                  justifyContent:
                    "flex-end",

                  flexWrap:
                    "wrap",

                  gap:
                    "15px",

                  marginTop:
                    "25px",
                }}
              >
                {/* EXPORT PDF */}

                <button
                  onClick={
                    exportPDF
                  }
                  style={{
                    background:
                      "#16a34a",

                    color:
                      "#fff",

                    border:
                      "none",

                    padding:
                      "12px 22px",

                    borderRadius:
                      "10px",

                    cursor:
                      "pointer",

                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap:
                      "8px",

                    fontWeight:
                      "600",
                  }}
                >
                  <FaFilePdf />

                  Export PDF
                </button>

                {/* SAVE */}

                <button
                  onClick={
                    saveAttendance
                  }
                  disabled={
                    saving
                  }
                  style={{
                    background:
                      "#2563eb",

                    color:
                      "#fff",

                    border:
                      "none",

                    padding:
                      "12px 22px",

                    borderRadius:
                      "10px",

                    cursor:
                      saving
                        ? "not-allowed"
                        : "pointer",

                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap:
                      "8px",

                    fontWeight:
                      "600",

                    opacity:
                      saving
                        ? 0.6
                        : 1,
                  }}
                >
                  <FaSave />

                  {saving
                    ? "Saving..."
                    : attendanceId
                    ? "Update Attendance"
                    : "Save Attendance"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default Attendance;