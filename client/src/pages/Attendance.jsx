import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import "../styles/attendance.css";
import api from "../api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useUI } from "../context/UIContext";
import {
  FaCalendarAlt,
  FaClipboardCheck,
  FaHistory,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaFilePdf,
  FaDownload,
  FaSave,
  FaIdCard,
  FaGraduationCap,
} from "react-icons/fa";

const DEPARTMENTS = [
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

const STATUS_OPTIONS = ["Present", "Absent", "Late"];

const asArray = (value) => (Array.isArray(value) ? value : []);
const getEntityId = (value) => (value && typeof value === "object" ? value._id : value) || "";
const clean = (value) => String(value ?? "").trim();

function Attendance() {
  const { toast } = useUI();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [week, setWeek] = useState(1);
  const [period, setPeriod] = useState(1);
  const [date, setDate] = useState("");
  const [attendanceId, setAttendanceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [rosterWarning, setRosterWarning] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await api.get("/courses", { params: { limit: 500 } });
        setCourses(asArray(response.data) .length ? response.data : asArray(response.data?.courses));
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load courses.");
      }
    };
    loadCourses();
  }, []);

  const filteredCourses = useMemo(
    () => selectedDepartment ? courses.filter((course) => course.department === selectedDepartment) : [],
    [courses, selectedDepartment]
  );

  const selectedCourseData = useMemo(
    () => courses.find((course) => course._id === selectedCourse),
    [courses, selectedCourse]
  );

  const summary = useMemo(() => {
    const counts = students.reduce(
      (acc, student) => {
        if (student.status === "Present") acc.present += 1;
        if (student.status === "Absent") acc.absent += 1;
        if (student.status === "Late") acc.late += 1;
        return acc;
      },
      { present: 0, absent: 0, late: 0 }
    );
    return {
      total: students.length,
      ...counts,
      percentage: students.length ? ((counts.present / students.length) * 100).toFixed(1) : "0.0",
    };
  }, [students]);

  const loadHistory = async (courseId) => {
    if (!courseId) {
      setHistory([]);
      return;
    }
    try {
      const response = await api.get(`/attendance/history/${courseId}`);
      setHistory(asArray(response.data));
    } catch {
      setHistory([]);
    }
  };

  const normalizeRosterStudent = (student) => ({
    student: getEntityId(student),
    studentId: clean(student?.studentId) || "—",
    fullName: clean(student?.fullName) || "Student record unavailable",
    section: clean(student?.section) || "—",
    year: clean(student?.year) || "—",
    status: "Present",
  });

  const normalizeAttendanceStudent = (item) => ({
    student: getEntityId(item?.student),
    studentId: clean(item?.student?.studentId || item?.studentId) || "—",
    fullName: clean(item?.student?.fullName || item?.studentName) || "Student record unavailable",
    section: clean(item?.student?.section || item?.section) || "—",
    year: clean(item?.student?.year || item?.year) || "—",
    status: STATUS_OPTIONS.includes(item?.status) ? item.status : "Present",
  });

  const mergeRosterWithAttendance = (courseRoster, attendanceRows) => {
    const roster = asArray(courseRoster).map(normalizeRosterStudent);
    const saved = asArray(attendanceRows).map(normalizeAttendanceStudent);
    const savedByStudent = new Map(saved.filter((row) => row.student).map((row) => [String(row.student), row]));

    if (!roster.length) return saved;

    const merged = roster.map((rosterStudent) => {
      const savedRow = savedByStudent.get(String(rosterStudent.student));
      return savedRow ? { ...rosterStudent, ...savedRow, studentId: rosterStudent.studentId, fullName: rosterStudent.fullName, section: rosterStudent.section, year: rosterStudent.year } : rosterStudent;
    });

    const orphaned = saved.filter((row) => !row.student || !roster.some((r) => String(r.student) === String(row.student)));
    const usefulOrphans = orphaned.filter((row) => row.studentId !== "—" || row.fullName !== "Student record unavailable");
    return [...merged, ...usefulOrphans];
  };

  const loadStudents = async (selectedWeek = week, selectedPeriod = period) => {
    if (!selectedDepartment) return setError("Please select a department.");
    if (!selectedCourse) return setError("Please select a course.");

    setLoading(true);
    setError("");
    setMessage("");
    setRosterWarning("");

    try {
      const courseResponse = await api.get(`/courses/${selectedCourse}`);
      const course = courseResponse.data;
      const courseRoster = asArray(course?.students).filter((student) => student && student.status !== "Suspended");

      try {
        const attendanceResponse = await api.get(
          `/attendance/course/${selectedCourse}/week/${selectedWeek}?period=${selectedPeriod}`
        );
        const attendance = attendanceResponse.data;
        const savedRows = asArray(attendance?.students);
        const mergedRows = mergeRosterWithAttendance(courseRoster, savedRows);

        setAttendanceId(attendance?._id || null);
        setDate(attendance?.date ? String(attendance.date).substring(0, 10) : "");
        setStudents(mergedRows);

        const missingSavedIdentity = savedRows.some(
          (item) => !getEntityId(item?.student) && !clean(item?.studentId) && !clean(item?.studentName)
        );
        if (missingSavedIdentity) {
          setRosterWarning("An older attendance record contained a missing student reference. The current course roster has been restored so names and IDs remain usable.");
        }
        setMessage("Saved attendance session loaded.");
        return;
      } catch (attendanceError) {
        if (attendanceError.response?.status !== 404) throw attendanceError;
      }

      const roster = courseRoster.map(normalizeRosterStudent);
      setStudents(roster);
      setAttendanceId(null);
      if (!date) setDate(new Date().toISOString().slice(0, 10));

      if (!roster.length) {
        setError("No students are enrolled in this course. Add students to the course before recording attendance.");
      } else {
        setMessage(`Register opened with ${roster.length} enrolled student${roster.length === 1 ? "" : "s"}.`);
      }
    } catch (err) {
      setStudents([]);
      setAttendanceId(null);
      setError(err.response?.data?.message || "Unable to load the class register.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (index, status) => {
    setStudents((previous) => previous.map((student, i) => (i === index ? { ...student, status } : student)));
  };

  const saveAttendance = async () => {
    if (!selectedDepartment) return setError("Please select a department.");
    if (!selectedCourse) return setError("Please select a course.");
    if (!date) return setError("Please select attendance date.");
    if (!students.length) return setError("No students are available in this register.");

    const validStudents = students.filter((student) => student.student);
    if (!validStudents.length) return setError("The register does not contain valid student records. Reopen the class register.");

    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        course: selectedCourse,
        week,
        period,
        date,
        students: validStudents.map((student) => ({ student: student.student, status: student.status })),
      };

      if (attendanceId) {
        const response = await api.put(`/attendance/${attendanceId}`, payload);
        setStudents(mergeRosterWithAttendance(students, response.data?.students));
        setMessage("Attendance updated successfully.");
        toast("Attendance updated successfully.");
      } else {
        const response = await api.post("/attendance", payload);
        setAttendanceId(response.data?._id || null);
        setStudents(mergeRosterWithAttendance(students, response.data?.students));
        setMessage("Attendance saved successfully.");
        toast("Attendance saved successfully.");
      }
      await loadHistory(selectedCourse);
    } catch (err) {
      const text = err.response?.data?.message || "Unable to save attendance.";
      setError(text);
      toast(text, "error");
    } finally {
      setSaving(false);
    }
  };

  const buildAttendancePDF = () => {
    if (!students.length) {
      setError("No attendance is available to export.");
      return null;
    }

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const navy = [15, 45, 87];
    const blue = [37, 99, 235];
    const slate = [71, 85, 105];

    doc.setFillColor(...navy);
    doc.roundedRect(margin, 12, pageWidth - margin * 2, 25, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.text("AeroLearn Academic Cloud", margin + 7, 22);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("OFFICIAL CLASS ATTENDANCE REGISTER", margin + 7, 29);
    doc.setFillColor(...blue);
    doc.roundedRect(pageWidth - margin - 34, 17, 27, 14, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(attendanceId ? "SAVED" : "DRAFT", pageWidth - margin - 20.5, 25.5, { align: "center" });

    doc.setTextColor(...navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Attendance Report", margin, 48);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...slate);
    doc.text("Generated from the AeroLearn attendance workspace", margin, 53.5);

    const metaY = 60;
    const metaWidth = (pageWidth - margin * 2 - 6) / 2;
    const drawMeta = (x, y, label, value, width = metaWidth) => {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, y, width, 13, 2, 2, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      doc.setTextColor(100, 116, 139);
      doc.text(label.toUpperCase(), x + 4, y + 4.6);
      doc.setFontSize(8.8);
      doc.setTextColor(30, 41, 59);
      const valueLines = doc.splitTextToSize(value || "—", width - 8);
      doc.text(valueLines.slice(0, 1), x + 4, y + 9.5);
    };

    drawMeta(margin, metaY, "Department", selectedDepartment);
    drawMeta(margin + metaWidth + 6, metaY, "Course", `${selectedCourseData?.code || "—"} - ${selectedCourseData?.name || "—"}`);
    drawMeta(margin, metaY + 16, "Academic placement", `${selectedCourseData?.studyYear || "—"} • ${selectedCourseData?.semester || "—"}`);
    drawMeta(margin + metaWidth + 6, metaY + 16, "Session", `Week ${week} • Period ${period} • ${date || "No date"}`);

    autoTable(doc, {
      startY: metaY + 35,
      margin: { left: margin, right: margin, bottom: 24 },
      head: [["#", "Student ID", "Student Name", "Year", "Section", "Status"]],
      body: students.map((student, index) => [
        index + 1,
        student.studentId || "—",
        student.fullName || "Student record unavailable",
        student.year || "—",
        student.section || "—",
        student.status || "Present",
      ]),
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8.5,
        cellPadding: 3.2,
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
        textColor: [30, 41, 59],
        valign: "middle",
      },
      headStyles: {
        fillColor: navy,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7.8,
        halign: "left",
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 9, halign: "center" },
        1: { cellWidth: 28 },
        2: { cellWidth: 55 },
        3: { cellWidth: 22 },
        4: { cellWidth: 20 },
        5: { cellWidth: 27, halign: "center", fontStyle: "bold" },
      },
      didParseCell(data) {
        if (data.section === "body" && data.column.index === 5) {
          const status = String(data.cell.raw || "");
          if (status === "Present") {
            data.cell.styles.fillColor = [220, 252, 231];
            data.cell.styles.textColor = [21, 128, 61];
          } else if (status === "Absent") {
            data.cell.styles.fillColor = [254, 226, 226];
            data.cell.styles.textColor = [185, 28, 28];
          } else if (status === "Late") {
            data.cell.styles.fillColor = [254, 243, 199];
            data.cell.styles.textColor = [180, 83, 9];
          }
        }
      },
      didDrawPage() {
        const height = doc.internal.pageSize.getHeight();
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, height - 15, pageWidth - margin, height - 15);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.2);
        doc.setTextColor(100, 116, 139);
        doc.text("AeroLearn Academic Cloud • Attendance Register", margin, height - 9);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - margin, height - 9, { align: "right" });
      },
    });

    let y = (doc.lastAutoTable?.finalY || 105) + 8;
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y > pageHeight - 48) {
      doc.addPage();
      y = 24;
    }

    const cards = [
      ["TOTAL", summary.total, [219, 234, 254], [30, 64, 175]],
      ["PRESENT", summary.present, [220, 252, 231], [21, 128, 61]],
      ["ABSENT", summary.absent, [254, 226, 226], [185, 28, 28]],
      ["LATE", summary.late, [254, 243, 199], [180, 83, 9]],
      ["RATE", `${summary.percentage}%`, [237, 233, 254], [109, 40, 217]],
    ];
    const gap = 3;
    const cardWidth = (pageWidth - margin * 2 - gap * 4) / 5;
    cards.forEach(([label, value, fill, text], index) => {
      const x = margin + index * (cardWidth + gap);
      doc.setFillColor(...fill);
      doc.roundedRect(x, y, cardWidth, 18, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...text);
      doc.setFontSize(12);
      doc.text(String(value), x + cardWidth / 2, y + 8, { align: "center" });
      doc.setFontSize(6.4);
      doc.text(label, x + cardWidth / 2, y + 13.5, { align: "center" });
    });

    y += 25;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...slate);
    doc.text(`Report generated: ${new Date().toLocaleString()}`, margin, y);
    doc.text("Instructor signature: __________________________", pageWidth - margin, y, { align: "right" });
    return doc;
  };

  const fileName = `${selectedCourseData?.code || "Attendance"}_Week_${week}_Period_${period}.pdf`.replace(/[^a-zA-Z0-9._-]+/g, "_");

  const previewPDF = () => {
    setError("");
    const doc = buildAttendancePDF();
    if (!doc) return;
    const blobUrl = URL.createObjectURL(doc.output("blob"));
    const opened = window.open(blobUrl, "_blank", "noopener,noreferrer");
    if (!opened) {
      URL.revokeObjectURL(blobUrl);
      setError("Your browser blocked the PDF preview. Allow pop-ups for AeroLearn and try again.");
      return;
    }
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  };

  const downloadPDF = () => {
    setError("");
    const doc = buildAttendancePDF();
    if (doc) doc.save(fileName);
  };

  const handleDepartmentChange = (value) => {
    setSelectedDepartment(value);
    setSelectedCourse("");
    setStudents([]);
    setHistory([]);
    setAttendanceId(null);
    setDate("");
    setMessage("");
    setError("");
    setRosterWarning("");
  };

  const handleCourseChange = async (courseId) => {
    setSelectedCourse(courseId);
    setStudents([]);
    setAttendanceId(null);
    setDate("");
    setMessage("");
    setError("");
    setRosterWarning("");
    if (courseId) await loadHistory(courseId);
    else setHistory([]);
  };

  const handleHistoryClick = async (item) => {
    const selectedWeek = item.week || 1;
    const selectedPeriod = item.period || 1;
    setWeek(selectedWeek);
    setPeriod(selectedPeriod);
    await loadStudents(selectedWeek, selectedPeriod);
  };

  return (
    <Layout>
      <div className="ops-page attendance-workspace">
        <header className="ops-header">
          <div>
            <span className="al-eyebrow">ACADEMIC OPERATIONS</span>
            <h1><FaCalendarAlt /> Attendance</h1>
            <p>Open the enrolled class roster, mark each learner, review saved sessions and produce a formal report.</p>
          </div>
          <div className="ops-session-badge">
            <span>{selectedCourseData?.code || "No course"}</span>
            <strong>{attendanceId ? "Saved session" : students.length ? "Unsaved session" : "Ready"}</strong>
          </div>
        </header>

        <nav className="ops-flow" aria-label="Academic operations">
          <span className="active"><b>1</b> Attendance</span><span><b>2</b> Assessment</span><span><b>3</b> Scores</span><span><b>4</b> Results</span><span><b>5</b> Resources</span>
        </nav>

        {message && <div className="message-strip success">✓ {message}</div>}
        {error && <div className="message-strip error">{error}</div>}
        {rosterWarning && <div className="message-strip warning">{rosterWarning}</div>}

        <section className="ops-card">
          <div className="ops-card-head">
            <div><h2>Session setup</h2><p>Select the exact class meeting before opening the register.</p></div>
            {history.length > 0 && <span className="pill pill-blue">{history.length} saved session{history.length === 1 ? "" : "s"}</span>}
          </div>
          <div className="ops-filter-grid attendance-filter-grid">
            <div className="field"><label>Department</label><select value={selectedDepartment} onChange={(e) => handleDepartmentChange(e.target.value)}><option value="">Select department</option>{DEPARTMENTS.map((department) => <option key={department} value={department}>{department}</option>)}</select></div>
            <div className="field"><label>Course</label><select value={selectedCourse} onChange={(e) => handleCourseChange(e.target.value)} disabled={!selectedDepartment}><option value="">{selectedDepartment ? "Select course" : "Department first"}</option>{filteredCourses.map((course) => <option key={course._id} value={course._id}>{course.code} — {course.name}</option>)}</select></div>
            <div className="field"><label>Week</label><select value={week} onChange={(e) => setWeek(Number(e.target.value))}>{Array.from({ length: 16 }, (_, index) => <option key={index + 1} value={index + 1}>Week {index + 1}</option>)}</select></div>
            <div className="field"><label>Period</label><select value={period} onChange={(e) => setPeriod(Number(e.target.value))}>{[1, 2, 3, 4, 5].map((item) => <option key={item} value={item}>Period {item}</option>)}</select></div>
            <div className="field"><label>Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div className="field ops-load-field"><label>&nbsp;</label><button className="btn-compact btn-primary ops-load-btn" onClick={() => loadStudents(week, period)} disabled={loading || !selectedCourse}><FaUsers /> {loading ? "Opening…" : "Open register"}</button></div>
          </div>
        </section>

        {selectedCourseData && (
          <section className="attendance-class-strip">
            <div><FaGraduationCap /><span>Course</span><strong>{selectedCourseData.code} — {selectedCourseData.name}</strong></div>
            <div><FaIdCard /><span>Study year</span><strong>{selectedCourseData.studyYear || "—"}</strong></div>
            <div><FaCalendarAlt /><span>Semester</span><strong>{selectedCourseData.semester || "—"}</strong></div>
            <div><FaUsers /><span>Enrolled</span><strong>{asArray(selectedCourseData.students).length || students.length || "—"}</strong></div>
          </section>
        )}

        {history.length > 0 && <section className="ops-history"><div className="ops-history-title"><FaHistory /><span>Recent sessions</span></div><div className="ops-history-list">{history.slice(0, 12).map((item) => <button key={item._id} className={item.week === week && (item.period || 1) === period ? "active" : ""} onClick={() => handleHistoryClick(item)}><strong>W{item.week}</strong><span>P{item.period || 1}</span><small>{item.date ? String(item.date).slice(5, 10) : ""}</small></button>)}</div></section>}

        {students.length > 0 ? <>
          <div className="ops-metrics">
            <div className="blue"><span><FaUsers /></span><strong>{summary.total}</strong><small>Students</small></div>
            <div className="green"><span><FaCheckCircle /></span><strong>{summary.present}</strong><small>Present</small></div>
            <div className="red"><span><FaTimesCircle /></span><strong>{summary.absent}</strong><small>Absent</small></div>
            <div className="amber"><span><FaClock /></span><strong>{summary.late}</strong><small>Late</small></div>
            <div className="violet"><span>{summary.percentage}%</span><strong>Rate</strong><small>Attendance</small></div>
          </div>

          <section className="ops-card attendance-register">
            <div className="ops-card-head">
              <div><h2>Class register</h2><p>{selectedCourseData ? `${selectedCourseData.code} — ${selectedCourseData.name}` : "Selected course"} · Week {week} · Period {period} · {date || "No date selected"}</p></div>
              <div className="ops-quick-actions attendance-report-actions">
                <button className="btn-compact btn-soft-green" onClick={() => setStudents((prev) => prev.map((student) => ({ ...student, status: "Present" })))}><FaCheckCircle /> Mark all present</button>
                <button className="btn-compact btn-soft" onClick={previewPDF}><FaFilePdf /> Preview PDF</button>
                <button className="btn-compact btn-soft" onClick={downloadPDF} title="Download attendance PDF"><FaDownload /> Download</button>
              </div>
            </div>

            <div className="attendance-status-legend"><span><i className="present-dot" /> Present</span><span><i className="absent-dot" /> Absent</span><span><i className="late-dot" /> Late</span><small>Choose one status for every student.</small></div>

            <div className="data-wrap">
              <table className="data-table attendance-modern-table">
                <thead><tr><th>#</th><th>Student ID</th><th>Student</th><th>Year</th><th>Section</th><th>Attendance status</th></tr></thead>
                <tbody>{students.map((student, index) => <tr key={student.student || `${student.studentId}-${index}`} className={!student.student ? "attendance-row-warning" : ""}>
                  <td>{index + 1}</td>
                  <td><span className="table-id">{student.studentId || "—"}</span></td>
                  <td><strong className="attendance-student-name">{student.fullName || "Student record unavailable"}</strong></td>
                  <td>{student.year || "—"}</td>
                  <td>{student.section || "—"}</td>
                  <td><div className="attendance-status-switch" role="group" aria-label={`Attendance status for ${student.fullName || "student"}`}>{STATUS_OPTIONS.map((status) => <button type="button" key={status} className={`${status.toLowerCase()} ${(student.status || "Present") === status ? "active" : ""}`} aria-pressed={(student.status || "Present") === status} onClick={() => handleStatusChange(index, status)}>{status}</button>)}</div></td>
                </tr>)}</tbody>
              </table>
            </div>

            <div className="ops-save-bar">
              <div><span>{attendanceId ? "Saved attendance session" : "Unsaved attendance session"}</span><small>{date ? `${date} · ${summary.total} student${summary.total === 1 ? "" : "s"} · ${summary.percentage}% present` : "Choose a date before saving"}</small></div>
              <button className="btn-compact btn-primary" onClick={saveAttendance} disabled={saving}><FaSave /> {saving ? "Saving…" : attendanceId ? "Update attendance" : "Save attendance"}</button>
            </div>
          </section>
        </> : <section className="ops-empty"><FaClipboardCheck /><div><strong>No register open</strong><span>Select department, course, week and period, then open the register.</span></div></section>}
      </div>
    </Layout>
  );
}

export default Attendance;
