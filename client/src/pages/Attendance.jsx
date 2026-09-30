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
  FaEye,
  FaEdit,
  FaPrint,
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
  const [selectedStudyYear, setSelectedStudyYear] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [searchStudyYear, setSearchStudyYear] = useState("");
  const [searchDepartment, setSearchDepartment] = useState("");
  const [searchCourse, setSearchCourse] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchPeriod, setSearchPeriod] = useState("");
  const [searchedHistory, setSearchedHistory] = useState([]);
  const [searchingHistory, setSearchingHistory] = useState(false);
  const [week, setWeek] = useState(1);
  const [period, setPeriod] = useState(1);
  const [date, setDate] = useState("");
  const [attendanceId, setAttendanceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [rosterWarning, setRosterWarning] = useState("");
  const [registerMode, setRegisterMode] = useState("edit");

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

  const studyYears = useMemo(() => Array.from(new Set(courses.map((course) => clean(course.studyYear)).filter(Boolean))).sort(), [courses]);
  const registerDepartments = useMemo(() => Array.from(new Set(courses.filter((course) => !selectedStudyYear || clean(course.studyYear) === selectedStudyYear).map((course) => course.department).filter(Boolean))).sort(), [courses, selectedStudyYear]);
  const filteredCourses = useMemo(
    () => selectedStudyYear && selectedDepartment ? courses.filter((course) => clean(course.studyYear) === selectedStudyYear && course.department === selectedDepartment) : [],
    [courses, selectedStudyYear, selectedDepartment]
  );
  const searchDepartments = useMemo(() => Array.from(new Set(courses.filter((course) => !searchStudyYear || clean(course.studyYear) === searchStudyYear).map((course) => course.department).filter(Boolean))).sort(), [courses, searchStudyYear]);
  const searchCourses = useMemo(() => courses.filter((course) => (!searchStudyYear || clean(course.studyYear) === searchStudyYear) && (!searchDepartment || course.department === searchDepartment)), [courses, searchStudyYear, searchDepartment]);

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
    if (!courseId) return [];
    try {
      const response = await api.get(`/attendance/history/${courseId}`);
      const rows = asArray(response.data);
      setHistory(rows);
      return rows;
    } catch {
      setHistory([]);
      return [];
    }
  };

  const searchSavedAttendance = async () => {
    if (!searchStudyYear) return setError("Select a study year to search saved attendance.");
    if (!searchDepartment) return setError("Select a department to search saved attendance.");
    if (!searchCourse) return setError("Select a course to search saved attendance.");
    setSearchingHistory(true); setError(""); setMessage("");
    try {
      const params = { course: searchCourse, studyYear: searchStudyYear, department: searchDepartment };
      if (searchDate) params.date = searchDate;
      if (searchPeriod) params.period = searchPeriod;
      const response = await api.get("/attendance", { params });
      const rows = asArray(response.data);
      setSearchedHistory(rows);
      setMessage(rows.length ? `${rows.length} saved attendance session${rows.length === 1 ? "" : "s"} found.` : "No saved attendance matches these filters.");
    } catch (err) {
      setSearchedHistory([]);
      setError(err.response?.data?.message || "Unable to search saved attendance.");
    } finally { setSearchingHistory(false); }
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
    const uniqueByStudent = (rows) => Array.from(new Map(asArray(rows).filter(Boolean).map((row) => [String(getEntityId(row?.student || row) || row?.studentId || row?._id || ""), row])).values());
    const roster = uniqueByStudent(courseRoster).map(normalizeRosterStudent);
    const saved = uniqueByStudent(attendanceRows).map(normalizeAttendanceStudent);
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
    if (!selectedStudyYear) return setError("Please select a study year.");
    if (!selectedDepartment) return setError("Please select a department.");
    if (!selectedCourse) return setError("Please select a course.");
    if (!date) return setError("Please select the attendance date.");

    setLoading(true);
    setError("");
    setMessage("");
    setRosterWarning("");
    setRegisterMode("edit");

    try {
      const courseResponse = await api.get(`/courses/${selectedCourse}`);
      const course = courseResponse.data;
      const courseRoster = asArray(course?.students).filter((student) => student && student.status !== "Suspended");

      try {
        const existingResponse = await api.get("/attendance/check", { params: { course: selectedCourse, date, period: selectedPeriod } });
        if (existingResponse.data?.exists) {
          setStudents([]);
          setAttendanceId(null);
          setError(`Attendance already exists for this class on ${date}, Period ${selectedPeriod}. Use Saved Attendance to view or edit it.`);
          return;
        }
      } catch (attendanceError) {
        if (attendanceError.response?.status !== 404) throw attendanceError;
      }

      const roster = courseRoster.map(normalizeRosterStudent);
      setStudents(roster);
      setAttendanceId(null);

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
        await api.put(`/attendance/${attendanceId}`, payload);
        setMessage("Attendance updated successfully. The saved session is listed below.");
        toast("Attendance updated successfully.");
      } else {
        await api.post("/attendance", payload);
        setMessage("Attendance saved successfully. The register is closed and the session is listed below.");
        toast("Attendance saved successfully.");
      }
      setStudents([]);
      setAttendanceId(null);
      setRegisterMode("edit");
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

  const handleStudyYearChange = (value) => {
    setSelectedStudyYear(value); setSelectedDepartment(""); setSelectedCourse(""); setStudents([]); setAttendanceId(null); setMessage(""); setError("");
  };

  const handleDepartmentChange = (value) => {
    setSelectedDepartment(value); setSelectedCourse(""); setStudents([]); setAttendanceId(null); setMessage(""); setError(""); setRosterWarning("");
  };

  const handleCourseChange = (courseId) => {
    setSelectedCourse(courseId); setStudents([]); setAttendanceId(null); setMessage(""); setError(""); setRosterWarning("");
  };

  const openSavedSession = async (item, mode = "view") => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/attendance/${item._id}`);
      const session = response.data;
      const sessionCourse = session.course || {};
      setSelectedStudyYear(clean(session.year || sessionCourse.studyYear));
      setSelectedDepartment(clean(session.department || sessionCourse.department));
      setSelectedCourse(getEntityId(sessionCourse));
      setWeek(session.week || 1);
      setPeriod(session.period || 1);
      setDate(session.date ? String(session.date).slice(0, 10) : "");
      setAttendanceId(session._id);
      setStudents(asArray(session.students).map(normalizeAttendanceStudent));
      setRegisterMode(mode);
      setMessage(mode === "edit" ? "Attendance session opened for editing." : "Attendance session opened in view mode.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to open attendance session.");
    } finally {
      setLoading(false);
    }
  };

  const printSavedSession = async (item) => {
    try {
      const response = await api.get(`/attendance/${item._id}`);
      const session = response.data;
      const rows = asArray(session.students).map(normalizeAttendanceStudent);
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.text("AeroLearn Attendance Report", 14, 18);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      doc.text(`${session.course?.code || ""} — ${session.course?.name || ""}`, 14, 26);
      doc.text(`${session.department || session.course?.department || "—"} | ${session.year || session.course?.studyYear || "—"} | ${String(session.date || "").slice(0,10)}`, 14, 32);
      autoTable(doc, { startY: 39, head: [["#","Student ID","Student","Year","Section","Status"]], body: rows.map((r,i)=>[i+1,r.studentId,r.fullName,r.year,r.section,r.status]), theme: "grid" });
      doc.autoPrint();
      window.open(doc.output("bloburl"), "_blank", "noopener,noreferrer");
    } catch (err) { setError(err.response?.data?.message || "Unable to print attendance session."); }
  };

  const sessionCounts = (item) => {
    const rows = asArray(item.students).filter((row) => row?.student);
    return rows.reduce((acc,row) => { acc.total++; if(row.status === "Present") acc.present++; else if(row.status === "Absent") acc.absent++; else if(row.status === "Late") acc.late++; return acc; }, {total:0,present:0,absent:0,late:0});
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

        <section className="ops-card attendance-register-setup">
          <div className="ops-card-head"><div><span className="al-eyebrow">REGISTER ATTENDANCE</span><h2>New class attendance</h2><p>Choose the class meeting. Only then will the enrolled student register open.</p></div></div>
          <div className="ops-filter-grid attendance-filter-grid attendance-six-filters">
            <div className="field"><label>Study year</label><select value={selectedStudyYear} onChange={(e)=>handleStudyYearChange(e.target.value)}><option value="">Select year</option>{studyYears.map((y)=><option key={y} value={y}>{y}</option>)}</select></div>
            <div className="field"><label>Department</label><select value={selectedDepartment} onChange={(e)=>handleDepartmentChange(e.target.value)} disabled={!selectedStudyYear}><option value="">{selectedStudyYear ? "Select department" : "Study year first"}</option>{registerDepartments.map((d)=><option key={d} value={d}>{d}</option>)}</select></div>
            <div className="field"><label>Course</label><select value={selectedCourse} onChange={(e)=>handleCourseChange(e.target.value)} disabled={!selectedDepartment}><option value="">{selectedDepartment ? "Select course" : "Department first"}</option>{filteredCourses.map((c)=><option key={c._id} value={c._id}>{c.code} — {c.name}</option>)}</select></div>
            <div className="field"><label>Week</label><select value={week} onChange={(e)=>setWeek(Number(e.target.value))}>{Array.from({length:16},(_,i)=><option key={i+1} value={i+1}>Week {i+1}</option>)}</select></div>
            <div className="field"><label>Period</label><select value={period} onChange={(e)=>setPeriod(Number(e.target.value))}>{[1,2,3,4,5].map((p)=><option key={p} value={p}>Period {p}</option>)}</select></div>
            <div className="field"><label>Date</label><input type="date" value={date} onChange={(e)=>setDate(e.target.value)}/></div>
          </div>
          <div className="attendance-open-row"><span>Duplicate protection: one session per course, date and period.</span><button className="btn-compact btn-primary" onClick={()=>loadStudents(week,period)} disabled={loading || !selectedCourse || !date}><FaUsers/> {loading ? "Checking…" : "Open register"}</button></div>
        </section>

        {selectedCourseData && <section className="attendance-class-strip"><div><FaGraduationCap/><span>Course</span><strong>{selectedCourseData.code} — {selectedCourseData.name}</strong></div><div><FaIdCard/><span>Study year</span><strong>{selectedCourseData.studyYear || "—"}</strong></div><div><FaCalendarAlt/><span>Semester</span><strong>{selectedCourseData.semester || "—"}</strong></div><div><FaUsers/><span>Enrolled</span><strong>{asArray(selectedCourseData.students).length || students.length || "—"}</strong></div></section>}

        <section className="ops-card attendance-sessions-card attendance-search-card">
          <div className="ops-card-head"><div><span className="al-eyebrow">SAVED ATTENDANCE</span><h2><FaHistory/> Search attendance</h2><p>These filters are independent from Register Attendance. Search existing sessions, then view, edit or print.</p></div></div>
          <div className="ops-filter-grid attendance-filter-grid attendance-search-grid">
            <div className="field"><label>Study year</label><select value={searchStudyYear} onChange={(e)=>{setSearchStudyYear(e.target.value);setSearchDepartment("");setSearchCourse("");setSearchedHistory([])}}><option value="">Select year</option>{studyYears.map((y)=><option key={y} value={y}>{y}</option>)}</select></div>
            <div className="field"><label>Department</label><select value={searchDepartment} onChange={(e)=>{setSearchDepartment(e.target.value);setSearchCourse("");setSearchedHistory([])}} disabled={!searchStudyYear}><option value="">{searchStudyYear ? "Select department" : "Study year first"}</option>{searchDepartments.map((d)=><option key={d} value={d}>{d}</option>)}</select></div>
            <div className="field"><label>Course</label><select value={searchCourse} onChange={(e)=>{setSearchCourse(e.target.value);setSearchedHistory([])}} disabled={!searchDepartment}><option value="">{searchDepartment ? "Select course" : "Department first"}</option>{searchCourses.map((c)=><option key={c._id} value={c._id}>{c.code} — {c.name}</option>)}</select></div>
            <div className="field"><label>Date <small>(optional)</small></label><input type="date" value={searchDate} onChange={(e)=>setSearchDate(e.target.value)}/></div>
            <div className="field"><label>Period <small>(optional)</small></label><select value={searchPeriod} onChange={(e)=>setSearchPeriod(e.target.value)}><option value="">All periods</option>{[1,2,3,4,5].map((p)=><option key={p} value={p}>Period {p}</option>)}</select></div>
            <div className="field ops-load-field"><label>&nbsp;</label><button className="btn-compact btn-primary ops-load-btn" onClick={searchSavedAttendance} disabled={searchingHistory || !searchCourse}><FaHistory/> {searchingHistory ? "Searching…" : "Search attendance"}</button></div>
          </div>
          {searchedHistory.length > 0 ? <div className="data-wrap"><table className="data-table attendance-session-table"><thead><tr><th>Date</th><th>Period</th><th>Department</th><th>Study year</th><th>Course</th><th>Students</th><th>Present</th><th>Absent</th><th>Late</th><th>Actions</th></tr></thead><tbody>{searchedHistory.map((item)=>{const counts=sessionCounts(item);return <tr key={item._id}><td><strong>{item.date ? String(item.date).slice(0,10) : "—"}</strong><small>Week {item.week}</small></td><td><strong>Period {item.period || 1}</strong></td><td>{item.department || item.course?.department || "—"}</td><td>{item.year || item.course?.studyYear || "—"}</td><td><strong>{item.course?.code || "—"}</strong><small>{item.course?.name || ""}</small></td><td>{counts.total}</td><td>{counts.present}</td><td>{counts.absent}</td><td>{counts.late}</td><td><div className="attendance-session-actions"><button onClick={()=>openSavedSession(item,"view")}><FaEye/> View</button><button onClick={()=>openSavedSession(item,"edit")}><FaEdit/> Edit</button><button onClick={()=>printSavedSession(item)}><FaPrint/> Print</button></div></td></tr>})}</tbody></table></div> : <div className="attendance-search-empty">Choose the saved-attendance filters and press <strong>Search attendance</strong>.</div>}
        </section>

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
                {registerMode === "edit" && <button className="btn-compact btn-soft-green" onClick={() => setStudents((prev) => prev.map((student) => ({ ...student, status: "Present" })))}><FaCheckCircle /> Mark all present</button>}
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
                  <td><div className="attendance-status-switch" role="group" aria-label={`Attendance status for ${student.fullName || "student"}`}>{STATUS_OPTIONS.map((status) => <button type="button" key={status} className={`${status.toLowerCase()} ${(student.status || "Present") === status ? "active" : ""}`} aria-pressed={(student.status || "Present") === status} onClick={() => registerMode === "edit" && handleStatusChange(index, status)} disabled={registerMode === "view"}>{status}</button>)}</div></td>
                </tr>)}</tbody>
              </table>
            </div>

            <div className="ops-save-bar">
              <div><span>{attendanceId ? "Saved attendance session" : "Unsaved attendance session"}</span><small>{date ? `${date} · ${summary.total} student${summary.total === 1 ? "" : "s"} · ${summary.percentage}% present` : "Choose a date before saving"}</small></div>
              <div className="attendance-save-actions"><button className="btn-compact btn-soft" onClick={() => { setStudents([]); setAttendanceId(null); setRegisterMode("edit"); }} type="button">Close</button>{registerMode === "edit" && <button className="btn-compact btn-primary" onClick={saveAttendance} disabled={saving}><FaSave /> {saving ? "Saving…" : attendanceId ? "Update attendance" : "Save attendance"}</button>}</div>
            </div>
          </section>
        </> : <section className="ops-empty"><FaClipboardCheck /><div><strong>No register open</strong><span>Select study year, department, course, date and period, then open the register.</span></div></section>}
      </div>
    </Layout>
  );
}

export default Attendance;
