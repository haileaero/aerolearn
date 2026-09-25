import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaChartBar,
  FaCheckCircle,
  FaClipboardCheck,
  FaClipboardList,
  FaFilter,
  FaPlus,
  FaSave,
  FaSearch,
  FaTimes,
  FaTrash,
  FaUsers,
} from "react-icons/fa";
import Layout from "../components/Layout";
import api from "../api";
import { useUI } from "../context/UIContext";
import "../styles/workspace.css";

const initialForm = {
  course: "",
  title: "",
  category: "Quiz",
  week: 1,
  dueDate: "",
  weight: 10,
  description: "",
};

const asArray = (value) => Array.isArray(value) ? value : [];
const courseIdOf = (value) => value && typeof value === "object" ? value._id || "" : typeof value === "string" ? value : "";
const courseLabelOf = (value, courses) => {
  const direct = value && typeof value === "object" ? value : null;
  const resolved = direct || courses.find((course) => course._id === courseIdOf(value));
  if (!resolved) return { code: "Unassigned", name: "Course unavailable", department: "" };
  return { code: resolved.code || "Course", name: resolved.name || "Untitled course", department: resolved.department || "" };
};
const scoreIsEntered = (score) => Boolean(score && (score.entered === true || Number(score.score) > 0));

function Assessment() {
  const { confirm, toast } = useUI();
  const { id: legacyId } = useParams();
  const deskRef = useRef(null);
  const [courses, setCourses] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [courseFilter, setCourseFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(legacyId || "");
  const [deskTab, setDeskTab] = useState("scores");
  const [scoreSearch, setScoreSearch] = useState("");
  const [scores, setScores] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [courseRes, assessmentRes] = await Promise.all([
        api.get("/courses"),
        api.get("/assessment"),
      ]);
      setCourses(
        Array.isArray(courseRes.data?.courses)
          ? courseRes.data.courses
          : Array.isArray(courseRes.data)
            ? courseRes.data
            : []
      );
      setAssessments(asArray(assessmentRes.data));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load assessment data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedAssessment = useMemo(
    () => assessments.find((item) => item._id === selectedId) || null,
    [assessments, selectedId]
  );

  useEffect(() => {
    if (!selectedAssessment) {
      setScores([]);
      return;
    }
    setScores(
      asArray(selectedAssessment.scores).filter(Boolean).map((item) => ({
        student: item.student && typeof item.student === "object" ? item.student._id : item.student,
        studentData: item.student && typeof item.student === "object" ? item.student : null,
        score: scoreIsEntered(item) ? item.score : "",
        entered: scoreIsEntered(item),
        remark: item.remark || "",
      }))
    );
  }, [selectedAssessment]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" ? { title: "" } : {}),
    }));
  };

  const saveAssessment = async (event) => {
    event.preventDefault();
    const existingWeight = assessments
      .filter((item) => courseIdOf(item.course) === form.course)
      .reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
    if (existingWeight + Number(form.weight || 0) > 100) {
      setError(`This course already uses ${existingWeight}% of its assessment contribution. The new assessment would exceed 100%.`);
      return;
    }
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const response = await api.post("/assessment", { ...form, totalMark: 100 });
      setMessage("Assessment created and ready for score entry.");
      setForm(initialForm);
      setShowCreate(false);
      await loadData();
      if (response.data?._id) {
        setSelectedId(response.data._id);
        setDeskTab("scores");
        setTimeout(() => deskRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create assessment.");
      toast(err.response?.data?.message || "Unable to create assessment.", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteAssessment = async (assessmentId) => {
    const approved = await confirm({ title: "Delete this assessment?", message: "This also removes the linked score sheet. This action cannot be undone.", confirmText: "Delete assessment" });
    if (!approved) return;
    try {
      await api.delete(`/assessment/${assessmentId}`);
      if (selectedId === assessmentId) setSelectedId("");
      setMessage("Assessment deleted successfully."); toast("Assessment deleted.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete assessment.");
    }
  };

  const filtered = useMemo(
    () => assessments.filter((item) => {
      const course = item.course && typeof item.course === "object" ? item.course : null;
      const courseId = courseIdOf(item.course);
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
      const matchesCourse = courseFilter === "All" || courseId === courseFilter;
      const haystack = `${item.title || ""} ${item.category || ""} ${course?.code || ""} ${course?.name || ""}`.toLowerCase();
      return matchesCategory && matchesCourse && haystack.includes(search.toLowerCase());
    }),
    [assessments, search, categoryFilter, courseFilter]
  );

  const titleOptions =
    form.category === "Quiz"
      ? [1,2,3,4,5,6,7,8].map((n) => `Quiz ${n}`)
      : form.category === "Assignment"
        ? [1,2,3,4,5,6,7,8].map((n) => `Assignment ${n}`)
        : form.category === "Lab"
          ? [1,2,3,4,5,6,7,8].map((n) => `Laboratory ${n}`)
          : form.category === "Project"
            ? [1,2,3,4].map((n) => `Project ${n}`)
            : [form.category];

  const stats = {
    total: assessments.length,
    open: assessments.filter((item) => asArray(item.scores).some((score) => !scoreIsEntered(score))).length,
    complete: assessments.filter((item) => asArray(item.scores).length > 0 && asArray(item.scores).every(scoreIsEntered)).length,
  };

  const selectedCourseId = courseFilter !== "All" ? courseFilter : "";
  const selectedCourse = courses.find((course) => course._id === selectedCourseId);
  const courseWeight = selectedCourseId
    ? assessments
        .filter((item) => courseIdOf(item.course) === selectedCourseId)
        .reduce((sum, item) => sum + (Number(item.weight) || 0), 0)
    : 0;
  const formCourseWeight = form.course
    ? assessments
        .filter((item) => courseIdOf(item.course) === form.course)
        .reduce((sum, item) => sum + (Number(item.weight) || 0), 0)
    : 0;

  const categoryPill = (category) =>
    category?.includes("Exam") ? "pill-red" :
    category === "Assignment" ? "pill-green" :
    category === "Quiz" ? "pill-violet" :
    category === "Lab" ? "pill-blue" : "pill-amber";

  const openDesk = (assessmentId, tab = "scores") => {
    setSelectedId(assessmentId);
    setDeskTab(tab);
    setScoreSearch("");
    setTimeout(() => deskRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const updateScore = (index, value) => {
    if (value !== "") {
      const numeric = Number(value);
      if (numeric < 0 || numeric > 100) return;
    }
    setScores((prev) => prev.map((item, itemIndex) =>
      itemIndex === index ? { ...item, score: value, entered: value !== "" } : item
    ));
  };

  const saveScores = async () => {
    if (!selectedAssessment) return;
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const payload = scores.map((item) => ({
        student: item.student,
        score: item.score === "" ? 0 : Number(item.score),
        entered: item.score !== "",
        remark: item.remark || "",
      }));
      const response = await api.put(`/assessment/${selectedAssessment._id}/scores`, { scores: payload });
      setAssessments((prev) => prev.map((item) => item._id === response.data._id ? response.data : item));
      setMessage("Score sheet saved. Results are updated immediately.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save scores.");
    } finally {
      setSaving(false);
    }
  };

  const scoreRows = useMemo(() => {
    const term = scoreSearch.toLowerCase();
    return scores
      .map((item, index) => ({ ...item, sourceIndex: index }))
      .filter((item) => `${item.studentData?.studentId || ""} ${item.studentData?.fullName || ""}`.toLowerCase().includes(term));
  }, [scores, scoreSearch]);

  const enteredRows = scores.filter((item) => item.entered);
  const classAverage = enteredRows.length
    ? enteredRows.reduce((sum, item) => sum + (Number(item.score) || 0), 0) / enteredRows.length
    : 0;
  const passCount = enteredRows.filter((item) => Number(item.score) >= 50).length;
  const weightedAverage = selectedAssessment ? classAverage * (Number(selectedAssessment.weight) || 0) / 100 : 0;

  return (
    <Layout>
      <div className="assessment-hub">
        <header className="assessment-hub-head">
          <div>
            <span className="al-eyebrow">ONE-PAGE ASSESSMENT HUB</span>
            <h1>Assessment</h1>
            <p>Create assessments, enter scores and review results without leaving this workspace.</p>
          </div>
          <button className={`assessment-new-btn ${showCreate ? "close" : ""}`} onClick={() => setShowCreate((value) => !value)}>
            {showCreate ? <><FaTimes /> Close</> : <><FaPlus /> New assessment</>}
          </button>
        </header>

        <div className="assessment-hub-kpis">
          <div><span className="blue"><FaClipboardList /></span><strong>{stats.total}</strong><small>Assessments</small></div>
          <div><span className="amber"><FaClipboardCheck /></span><strong>{stats.open}</strong><small>Need scores</small></div>
          <div><span className="green"><FaCheckCircle /></span><strong>{stats.complete}</strong><small>Complete</small></div>
          <div className={`weight-health ${courseWeight === 100 ? "good" : courseWeight > 100 ? "bad" : ""}`}>
            <span>{courseWeight}%</span><strong>{selectedCourse ? selectedCourse.code : "Course"}</strong><small>{selectedCourse ? (courseWeight === 100 ? "Contribution complete" : courseWeight > 100 ? "Over 100%" : `${100 - courseWeight}% remaining`) : "Select a course"}</small>
          </div>
        </div>

        {message && <div className="message-strip success">✓ {message}</div>}
        {error && <div className="message-strip error">{error}</div>}
        {assessments.some((item) => !courseIdOf(item.course)) && (
          <div className="message-strip warning">Some older assessment records are missing their course link. They remain visible as “Unassigned” and will no longer crash this page.</div>
        )}

        {showCreate && (
          <section className="assessment-create-onepage">
            <div className="create-onepage-head">
              <div><span>CREATE</span><h2>New assessment</h2></div>
              <p>Course determines the department. Scores use the standard 0–100 scale.</p>
            </div>
            <form onSubmit={saveAssessment}>
              <div className="create-onepage-grid">
                <div className="field course-field"><label>Course</label><select name="course" value={form.course} onChange={handleChange} required><option value="">Select course</option>{courses.map((course) => <option key={course._id} value={course._id}>{course.code} — {course.name} · {course.department}</option>)}</select></div>
                <div className="field"><label>Type</label><select name="category" value={form.category} onChange={handleChange}><option>Quiz</option><option>Assignment</option><option>Lab</option><option>Project</option><option>Mid Exam</option><option>Final Exam</option></select></div>
                <div className="field"><label>Name</label><select name="title" value={form.title} onChange={handleChange} required><option value="">Select name</option>{titleOptions.map((title) => <option key={title}>{title}</option>)}</select></div>
                <div className="field"><label>Week</label><input type="number" name="week" min="1" max="52" value={form.week} onChange={handleChange} required /></div>
                <div className="field"><label>Due date</label><input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} required /></div>
                <div className="field"><label>Contribution</label><div className="weight-input-wrap"><input type="number" name="weight" min="1" max="100" value={form.weight} onChange={handleChange} required /><span>%</span></div></div>
                <div className="field note-field"><label>Optional note</label><input name="description" value={form.description} onChange={handleChange} placeholder="Instructions or short description" /></div>
              </div>
              <div className="assessment-create-actions">
                <span>{form.course ? "Ready to create this assessment. Student enrollment is not required." : "Select a course to continue."}</span>
                <button type="submit" className="create-onepage-submit" disabled={saving || !form.course || !form.title || !form.dueDate}><FaSave /> {saving ? "Saving assessment…" : "Save assessment"}</button>
              </div>
              {form.course && (
                <div className={`contribution-preview ${formCourseWeight + Number(form.weight || 0) > 100 ? "over" : formCourseWeight + Number(form.weight || 0) === 100 ? "complete" : ""}`}>
                  <span>Course contribution after creation</span>
                  <strong>{formCourseWeight + Number(form.weight || 0)}%</strong>
                  <div><i style={{ width: `${Math.min(formCourseWeight + Number(form.weight || 0), 100)}%` }} /></div>
                </div>
              )}
            </form>
          </section>
        )}

        <section className="assessment-plan-onepage">
          <div className="assessment-plan-toolbar">
            <div><h2>Assessment plan</h2><span>Select Manage to work with scores and results below.</span></div>
            <div className="assessment-tools">
              <div className="assessment-search"><FaSearch /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" /></div>
              <div className="assessment-filter"><FaFilter /><select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}><option value="All">All courses</option>{courses.map((course) => <option key={course._id} value={course._id}>{course.code} — {course.name}</option>)}</select></div>
              <div className="assessment-filter"><select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}><option>All</option><option>Quiz</option><option>Assignment</option><option>Lab</option><option>Project</option><option>Mid Exam</option><option>Final Exam</option></select></div>
            </div>
          </div>

          {loading ? (
            <div className="assessment-empty"><strong>Loading assessments…</strong></div>
          ) : filtered.length === 0 ? (
            <div className="assessment-empty"><FaClipboardList /><strong>No assessments found</strong><span>Create one or change the filters.</span></div>
          ) : (
            <div className="assessment-table-wrap">
              <table className="assessment-table onepage-plan-table">
                <thead><tr><th>Assessment</th><th>When</th><th>Contribution</th><th>Progress</th><th>Class avg.</th><th>Manage</th></tr></thead>
                <tbody>
                  {filtered.map((item) => {
                    const itemScores = asArray(item.scores);
                    const entered = itemScores.filter(scoreIsEntered);
                    const courseMeta = courseLabelOf(item.course, courses);
                    const average = entered.length ? entered.reduce((sum, score) => sum + (Number(score.score) || 0), 0) / entered.length : 0;
                    return (
                      <tr key={item._id} className={selectedId === item._id ? "selected" : ""}>
                        <td><div className="assessment-name-cell"><span className={`pill ${categoryPill(item.category)}`}>{item.category}</span><div><strong>{item.title}</strong><small>{`${courseMeta.code} · ${courseMeta.name}`}</small></div></div></td>
                        <td><div className="assessment-date-cell"><strong>Week {item.week}</strong><span>{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "—"}</span></div></td>
                        <td><span className="weight-chip">{item.weight}%</span></td>
                        <td><div className="plan-progress"><strong>{entered.length}/{itemScores.length}</strong><span>{entered.length === itemScores.length && itemScores.length ? "Complete" : "Entered"}</span></div></td>
                        <td><strong className="class-average-cell">{entered.length ? `${average.toFixed(1)}%` : "—"}</strong></td>
                        <td><div className="assessment-row-actions"><button className="manage-action" onClick={() => openDesk(item._id, "scores")}>Manage</button><button className="delete-action" onClick={() => deleteAssessment(item._id)} title="Delete assessment"><FaTrash /></button></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="assessment-desk" ref={deskRef}>
          {!selectedAssessment ? (
            <div className="assessment-desk-empty"><FaClipboardCheck /><div><strong>Select an assessment to continue</strong><span>Use Manage in the assessment plan. Score entry and results will appear here.</span></div></div>
          ) : (
            <>
              <div className="assessment-desk-head">
                <div>
                  <span className={`pill ${categoryPill(selectedAssessment.category)}`}>{selectedAssessment.category}</span>
                  <h2>{selectedAssessment.title}</h2>
                  <p>{courseLabelOf(selectedAssessment.course, courses).code} — {courseLabelOf(selectedAssessment.course, courses).name} · Week {selectedAssessment.week} · {selectedAssessment.weight}% contribution</p>
                </div>
                <div className="assessment-desk-tabs">
                  <button className={deskTab === "scores" ? "active" : ""} onClick={() => setDeskTab("scores")}><FaClipboardCheck /> Score entry</button>
                  <button className={deskTab === "results" ? "active" : ""} onClick={() => setDeskTab("results")}><FaChartBar /> Results</button>
                </div>
              </div>

              <div className="desk-kpis">
                <div><span><FaUsers /></span><strong>{scores.length}</strong><small>Students</small></div>
                <div><span><FaCheckCircle /></span><strong>{enteredRows.length}</strong><small>Entered</small></div>
                <div><span>%</span><strong>{classAverage.toFixed(1)}</strong><small>Class average</small></div>
                <div><span><FaChartBar /></span><strong>{deskTab === "results" ? passCount : `${Math.max(scores.length - enteredRows.length, 0)}`}</strong><small>{deskTab === "results" ? "Passed" : "Remaining"}</small></div>
              </div>

              {deskTab === "scores" ? (
                <div className="desk-body">
                  <div className="desk-toolbar">
                    <div><strong>Score sheet</strong><span>Enter percentages from 0 to 100. A real zero is recorded correctly.</span></div>
                    <div className="desk-search"><FaSearch /><input value={scoreSearch} onChange={(e) => setScoreSearch(e.target.value)} placeholder="Search student or ID" /></div>
                  </div>
                  <div className="score-table-wrap">
                    <table className="score-entry-table">
                      <thead><tr><th>#</th><th>Student ID</th><th>Student</th><th>Score (%)</th><th>Status</th></tr></thead>
                      <tbody>{scoreRows.map((item, index) => <tr key={item.student || index}><td>{index + 1}</td><td><span className="table-id">{item.studentData?.studentId || "—"}</span></td><td><strong>{item.studentData?.fullName || "Student record unavailable"}</strong></td><td><div className="score-input-wrap"><input type="number" min="0" max="100" step="0.1" value={item.score} onChange={(e) => updateScore(item.sourceIndex, e.target.value)} placeholder="—" /><span>%</span></div></td><td>{item.entered ? <span className="pill pill-green">Entered</span> : <span className="pill pill-amber">Pending</span>}</td></tr>)}</tbody>
                    </table>
                  </div>
                  <div className="desk-save-bar"><span>{enteredRows.length} of {scores.length} scores entered</span><button onClick={saveScores} disabled={saving}><FaSave /> {saving ? "Saving…" : "Save scores"}</button></div>
                </div>
              ) : (
                <div className="desk-body results-body">
                  <div className="results-summary-line"><div><strong>{classAverage.toFixed(1)}%</strong><span>Class average</span></div><div><strong>{passCount}</strong><span>Passed</span></div><div><strong>{Math.max(enteredRows.length - passCount, 0)}</strong><span>Below 50%</span></div><div><strong>{weightedAverage.toFixed(1)}</strong><span>Average contribution</span></div></div>
                  <div className="score-table-wrap">
                    <table className="score-entry-table results-onepage-table">
                      <thead><tr><th>#</th><th>Student ID</th><th>Student</th><th>Score</th><th>Contribution</th><th>Result</th></tr></thead>
                      <tbody>{scores.map((item, index) => {
                        const score = Number(item.score) || 0;
                        const contribution = selectedAssessment ? score * (Number(selectedAssessment.weight) || 0) / 100 : 0;
                        return <tr key={item.student || index}><td>{index + 1}</td><td><span className="table-id">{item.studentData?.studentId || "—"}</span></td><td><strong>{item.studentData?.fullName || "Student record unavailable"}</strong></td><td>{item.entered ? `${score.toFixed(1)}%` : "—"}</td><td>{item.entered ? `${contribution.toFixed(1)} / ${selectedAssessment.weight}` : "—"}</td><td>{!item.entered ? <span className="pill pill-amber">Pending</span> : score >= 50 ? <span className="pill pill-green">Pass</span> : <span className="pill pill-red">Below 50%</span>}</td></tr>;
                      })}</tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </Layout>
  );
}

export default Assessment;
