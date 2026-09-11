import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import "../styles/attendance.css";

import api from "../api";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  FaCalendarAlt,
  FaClipboardCheck,
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
      <div className="ops-page">
        <header className="ops-header">
          <div>
            <span className="al-eyebrow">ACADEMIC OPERATIONS</span>
            <h1><FaCalendarAlt /> Attendance</h1>
            <p>Open a class session, record participation, review history and export a report.</p>
          </div>
          <div className="ops-session-badge">
            <span>{selectedCourseData?.code || "No course"}</span>
            <strong>{attendanceId ? "Editing session" : "New session"}</strong>
          </div>
        </header>
        <nav className="ops-flow" aria-label="Academic operations">
          <span className="active"><b>1</b> Attendance</span><span><b>2</b> Assessment</span><span><b>3</b> Scores</span><span><b>4</b> Results</span><span><b>5</b> Resources</span>
        </nav>
        {message && <div className="message-strip success">✓ {message}</div>}
        {error && <div className="message-strip error">{error}</div>}
        <section className="ops-card">
          <div className="ops-card-head"><div><h2>Session setup</h2><p>Choose the class and teaching period.</p></div>{history.length > 0 && <span className="pill pill-blue">{history.length} saved sessions</span>}</div>
          <div className="ops-filter-grid attendance-filter-grid">
            <div className="field"><label>Department</label><select value={selectedDepartment} onChange={(e) => handleDepartmentChange(e.target.value)}><option value="">Select department</option>{departments.map((department) => <option key={department} value={department}>{department}</option>)}</select></div>
            <div className="field"><label>Course</label><select value={selectedCourse} onChange={(e) => handleCourseChange(e.target.value)} disabled={!selectedDepartment}><option value="">{selectedDepartment ? "Select course" : "Department first"}</option>{filteredCourses.map((course) => <option key={course._id} value={course._id}>{course.code} — {course.name}</option>)}</select></div>
            <div className="field"><label>Week</label><select value={week} onChange={(e) => setWeek(Number(e.target.value))}>{Array.from({ length: 16 }, (_, index) => <option key={index + 1} value={index + 1}>Week {index + 1}</option>)}</select></div>
            <div className="field"><label>Period</label><select value={period} onChange={(e) => setPeriod(Number(e.target.value))}>{[1,2,3,4,5].map((item) => <option key={item} value={item}>Period {item}</option>)}</select></div>
            <div className="field"><label>Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div className="field ops-load-field"><label>&nbsp;</label><button className="btn-compact btn-primary ops-load-btn" onClick={() => loadStudents(week, period)} disabled={loading || !selectedCourse}><FaUsers /> {loading ? "Loading…" : "Open register"}</button></div>
          </div>
        </section>
        {history.length > 0 && <section className="ops-history"><div className="ops-history-title"><FaHistory /><span>Recent sessions</span></div><div className="ops-history-list">{history.slice(0,12).map((item) => <button key={item._id} className={item.week===week && (item.period||1)===period ? "active" : ""} onClick={() => handleHistoryClick(item)}><strong>W{item.week}</strong><span>P{item.period||1}</span></button>)}</div></section>}
        {students.length > 0 ? <>
          <div className="ops-metrics">
            <div className="blue"><span><FaUsers /></span><strong>{summary.total}</strong><small>Students</small></div><div className="green"><span><FaCheckCircle /></span><strong>{summary.present}</strong><small>Present</small></div><div className="red"><span><FaTimesCircle /></span><strong>{summary.absent}</strong><small>Absent</small></div><div className="amber"><span><FaClock /></span><strong>{summary.late}</strong><small>Late</small></div><div className="violet"><span>{summary.percentage}%</span><strong>Rate</strong><small>Attendance</small></div>
          </div>
          <section className="ops-card attendance-register">
            <div className="ops-card-head"><div><h2>Class register</h2><p>{selectedCourseData ? `${selectedCourseData.code} — ${selectedCourseData.name}` : "Selected course"} · Week {week} · Period {period}</p></div><div className="ops-quick-actions"><button className="btn-compact btn-soft-green" onClick={() => setStudents((prev) => prev.map((student) => ({...student,status:"Present"})))}><FaCheckCircle /> Mark all present</button><button className="btn-compact btn-soft" onClick={exportPDF}><FaFilePdf /> PDF</button></div></div>
            <div className="data-wrap"><table className="data-table attendance-modern-table"><thead><tr><th>#</th><th>Student ID</th><th>Student</th><th>Attendance status</th></tr></thead><tbody>{students.map((student,index)=><tr key={student.student||index}><td>{index+1}</td><td><span className="table-id">{student.studentId}</span></td><td><strong>{student.fullName}</strong></td><td><div className="attendance-status-switch">{["Present","Absent","Late"].map((status)=><button type="button" key={status} className={`${status.toLowerCase()} ${(student.status||"Present")===status?"active":""}`} onClick={() => handleStatusChange(index,status)}>{status}</button>)}</div></td></tr>)}</tbody></table></div>
            <div className="ops-save-bar"><div><span>{attendanceId ? "Existing attendance record" : "Unsaved attendance session"}</span><small>{date || "Choose a date before saving"}</small></div><button className="btn-compact btn-primary" onClick={saveAttendance} disabled={saving}><FaSave /> {saving ? "Saving…" : attendanceId ? "Update attendance" : "Save attendance"}</button></div>
          </section>
        </> : <section className="ops-empty"><FaClipboardCheck /><div><strong>No register open</strong><span>Select department, course, week and period, then open the register.</span></div></section>}
      </div>
    </Layout>
  );
}
export default Attendance;
