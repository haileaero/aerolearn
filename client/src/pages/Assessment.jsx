import { Fragment, useContext, useEffect, useMemo, useRef, useState } from "react";
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
import { AuthContext } from "../context/AuthContext";
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
  const { user } = useContext(AuthContext);
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
  const [studyYearFilter, setStudyYearFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(legacyId || "");
  const [expandedCourseId, setExpandedCourseId] = useState("");
  const [deskTab, setDeskTab] = useState("scores");
  const [scoreSearch, setScoreSearch] = useState("");
  const [scores, setScores] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [templates, setTemplates] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [templateComponents, setTemplateComponents] = useState([
    { title: "Quiz 1", category: "Quiz", weight: 10, week: 3 },
    { title: "Assignment 1", category: "Assignment", weight: 10, week: 6 },
    { title: "Final Exam", category: "Final Exam", weight: 80, week: 16 },
  ]);
  const [assignTemplate, setAssignTemplate] = useState("");
  const [assignCourse, setAssignCourse] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [courseRes, assessmentRes, templateRes] = await Promise.all([
        api.get("/courses?limit=200"),
        api.get("/assessment"),
        api.get("/assessment-templates"),
      ]);
      setCourses(
        Array.isArray(courseRes.data?.courses)
          ? courseRes.data.courses
          : Array.isArray(courseRes.data)
            ? courseRes.data
            : []
      );
      setAssessments(asArray(assessmentRes.data));
      setTemplates(asArray(templateRes.data));
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


  const templateTotal = templateComponents.reduce((sum, item) => sum + Number(item.weight || 0), 0);
  const addTemplateComponent = () => setTemplateComponents((prev) => [...prev, { title: `Quiz ${prev.length + 1}`, category: "Quiz", weight: 10, week: 1 }]);
  const updateTemplateComponent = (index, key, value) => setTemplateComponents((prev) => prev.map((item, i) => i === index ? { ...item, [key]: value } : item));
  const removeTemplateComponent = (index) => setTemplateComponents((prev) => prev.filter((_, i) => i !== index));
  const saveTemplate = async () => {
    if (!templateName.trim() || templateTotal !== 100 || !templateComponents.length) { toast("Give the assessment type a name and make the weights total exactly 100%.", "error"); return; }
    try { setSaving(true); await api.post("/assessment-templates", { name: templateName.trim(), components: templateComponents }); setTemplateName(""); toast("Assessment type saved."); await loadData(); }
    catch (err) { toast(err.response?.data?.message || "Unable to save assessment type.", "error"); } finally { setSaving(false); }
  };
  const applyTemplate = async () => {
    if (!assignTemplate || !assignCourse) { toast("Choose an assessment type and a course.", "error"); return; }
    try { setSaving(true); const response = await api.post(`/assessment-templates/${assignTemplate}/assign`, { courseId: assignCourse }); toast(response.data?.message || "Assessment type assigned."); setAssignCourse(""); await loadData(); }
    catch (err) { toast(err.response?.data?.message || "Unable to assign assessment type.", "error"); } finally { setSaving(false); }
  };
  const removeTemplate = async (id) => { const ok = await confirm({title:"Delete assessment type?",message:"Existing course assessments will stay unchanged.",confirmText:"Delete type"}); if(!ok)return; try{await api.delete(`/assessment-templates/${id}`); await loadData(); toast("Assessment type deleted.");}catch(err){toast(err.response?.data?.message||"Unable to delete assessment type.","error");} };

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
      const response = await api.post("/assessment", { ...form, totalMark: Number(form.weight) });
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

  const studyYears = ["Year I", "Year II", "Year III", "Year IV", "Year V"];
  const departmentsForYear = useMemo(() => [...new Set(
    courses
      .filter((course) => studyYearFilter === "All" || course.studyYear === studyYearFilter)
      .map((course) => course.department)
      .filter(Boolean)
  )].sort(), [courses, studyYearFilter]);
  const coursesForContext = useMemo(() => courses.filter((course) =>
    (studyYearFilter === "All" || course.studyYear === studyYearFilter) &&
    (departmentFilter === "All" || course.department === departmentFilter)
  ), [courses, studyYearFilter, departmentFilter]);

  useEffect(() => {
    if (departmentFilter !== "All" && !departmentsForYear.includes(departmentFilter)) {
      setDepartmentFilter("All");
      setCourseFilter("All");
    }
  }, [departmentsForYear, departmentFilter]);

  useEffect(() => {
    if (courseFilter !== "All" && !coursesForContext.some((course) => course._id === courseFilter)) {
      setCourseFilter("All");
    }
  }, [coursesForContext, courseFilter]);

  const filtered = useMemo(
    () => assessments.filter((item) => {
      const course = item.course && typeof item.course === "object" ? item.course : null;
      const courseId = courseIdOf(item.course);
      const resolvedCourse = course || courses.find((entry) => entry._id === courseId);
      const matchesYear = studyYearFilter === "All" || resolvedCourse?.studyYear === studyYearFilter;
      const matchesDepartment = departmentFilter === "All" || resolvedCourse?.department === departmentFilter;
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
      const matchesCourse = courseFilter === "All" || courseId === courseFilter;
      const haystack = `${item.title || ""} ${item.category || ""} ${resolvedCourse?.code || ""} ${resolvedCourse?.name || ""} ${resolvedCourse?.department || ""}`.toLowerCase();
      return matchesYear && matchesDepartment && matchesCategory && matchesCourse && haystack.includes(search.toLowerCase());
    }),
    [assessments, courses, search, studyYearFilter, departmentFilter, categoryFilter, courseFilter]
  );

  const groupedPlans = useMemo(() => {
    const map = new Map();
    for (const item of filtered) {
      const id = courseIdOf(item.course) || "unassigned";
      if (!map.has(id)) map.set(id, { id, course: item.course, items: [] });
      map.get(id).items.push(item);
    }
    return [...map.values()];
  }, [filtered]);

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
      const maxScore = Number(selectedAssessment?.weight) || 0;
      if (numeric < 0 || numeric > maxScore) return;
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
  const assessmentMax = Number(selectedAssessment?.weight) || 0;
  const passMark = assessmentMax / 2;
  const passCount = enteredRows.filter((item) => Number(item.score) >= passMark).length;

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
            {showCreate ? <><FaTimes /> Close</> : <><FaPlus /> Custom assessment</>}
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

        <section className="assessment-template-studio">
          <div className="template-studio-head"><div><span className="al-eyebrow">REUSABLE ASSESSMENT TYPES</span><h2>Assessment type library</h2><p>Build the grading structure once, then assign it to any course.</p></div><strong className={templateTotal === 100 ? "template-total good" : "template-total"}>{templateTotal}% / 100%</strong></div>
          <div className="template-builder">
            <div className="template-name-row"><input value={templateName} onChange={(e)=>setTemplateName(e.target.value)} placeholder="Type name, e.g. Quiz + Assignment + Final"/><button type="button" onClick={addTemplateComponent}><FaPlus/> Component</button></div>
            <div className="template-component-list">{templateComponents.map((component,index)=><div className="template-component-row" key={index}><select value={component.category} onChange={(e)=>updateTemplateComponent(index,"category",e.target.value)}><option>Quiz</option><option>Assignment</option><option>Lab</option><option>Project</option><option>Mid Exam</option><option>Final Exam</option></select><input value={component.title} onChange={(e)=>updateTemplateComponent(index,"title",e.target.value)} placeholder="Name"/><label>Week <input type="number" min="1" max="52" value={component.week} onChange={(e)=>updateTemplateComponent(index,"week",e.target.value)}/></label><label>Weight <input type="number" min="1" max="100" value={component.weight} onChange={(e)=>updateTemplateComponent(index,"weight",e.target.value)}/>%</label><button className="template-remove" type="button" onClick={()=>removeTemplateComponent(index)}><FaTrash/></button></div>)}</div>
            <button className="template-save" type="button" disabled={saving || templateTotal !== 100 || !templateName.trim()} onClick={saveTemplate}><FaSave/> Save assessment type</button>
          </div>
          <div className="template-library">{templates.map(t=><article key={t._id}><div><strong>{t.name}</strong><span>{asArray(t.components).map(c=>`${c.title} ${c.weight}%`).join(" · ")}</span></div><button onClick={()=>removeTemplate(t._id)} title="Delete type"><FaTrash/></button></article>)}{!templates.length&&<p className="template-empty">No saved assessment types yet.</p>}</div>
          <div className="template-assign"><select value={assignTemplate} onChange={(e)=>setAssignTemplate(e.target.value)}><option value="">Choose assessment type</option>{templates.map(t=><option key={t._id} value={t._id}>{t.name}</option>)}</select><select value={assignCourse} onChange={(e)=>setAssignCourse(e.target.value)}><option value="">Choose assigned course</option>{courses.map(c=><option key={c._id} value={c._id}>{c.code} — {c.name} · {c.department}</option>)}</select><button onClick={applyTemplate} disabled={saving || !assignTemplate || !assignCourse}>Apply to course</button></div>
        </section>

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
            <div><h2>Assessment plan</h2><span>Courses are grouped below. Choose a course, then manage its assessment components.</span></div>
            <div className="assessment-tools">
              <div className="assessment-search"><FaSearch /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" /></div>
              <div className="assessment-filter"><FaFilter /><select value={studyYearFilter} onChange={(e) => { setStudyYearFilter(e.target.value); setDepartmentFilter("All"); setCourseFilter("All"); }}><option value="All">All study years</option>{studyYears.map((year) => <option key={year} value={year}>{year}</option>)}</select></div>
              <div className="assessment-filter"><select value={departmentFilter} onChange={(e) => { setDepartmentFilter(e.target.value); setCourseFilter("All"); }}><option value="All">All departments</option>{departmentsForYear.map((department) => <option key={department} value={department}>{department}</option>)}</select></div>
              <div className="assessment-filter"><select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}><option value="All">All assigned courses</option>{coursesForContext.map((course) => <option key={course._id} value={course._id}>{course.code} — {course.name}</option>)}</select></div>
              <div className="assessment-filter"><select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}><option>All</option><option>Quiz</option><option>Assignment</option><option>Lab</option><option>Project</option><option>Mid Exam</option><option>Final Exam</option></select></div>
            </div>
          </div>

          {loading ? (
            <div className="assessment-empty"><strong>Loading assessments…</strong></div>
          ) : filtered.length === 0 ? (
            <div className="assessment-empty"><FaClipboardList /><strong>No assessments found</strong><span>Create one or change the filters.</span></div>
          ) : (
            <div className="assessment-table-wrap">
              <table className="assessment-table onepage-plan-table course-plan-table">
                <thead><tr><th>Course</th><th>Assessment structure</th><th>Components</th><th>Total</th><th>Manage</th></tr></thead>
                <tbody>
                  {groupedPlans.map((group) => {
                    const courseMeta = courseLabelOf(group.course, courses);
                    const totalWeight = group.items.reduce((sum,item)=>sum+Number(item.weight||0),0);
                    const complete = group.items.filter(item => asArray(item.scores).length > 0 && asArray(item.scores).every(scoreIsEntered)).length;
                    const expanded = expandedCourseId === group.id;
                    return <Fragment key={group.id}>
                      <tr className={expanded ? "selected" : ""}>
                        <td><strong>{courseMeta.code}</strong><small className="course-plan-sub">{courseMeta.name}{courseMeta.department ? ` · ${courseMeta.department}` : ""}</small></td>
                        <td><span className="pill pill-blue">Course plan</span><small className="course-plan-sub">{complete}/{group.items.length} components scored</small></td>
                        <td><strong>{group.items.length}</strong><small className="course-plan-sub">{group.items.map(i=>i.title).join(" · ")}</small></td>
                        <td><span className={`weight-chip ${totalWeight===100?"complete":""}`}>{totalWeight}%</span></td>
                        <td><button className="manage-action" onClick={()=>setExpandedCourseId(expanded ? "" : group.id)}>{expanded ? "Close" : "Manage"}</button></td>
                      </tr>
                      {expanded && <tr className="course-plan-components-row"><td colSpan="5"><div className="course-plan-components">{group.items.map(item=>{const entered=asArray(item.scores).filter(scoreIsEntered).length;return <article key={item._id}><span className={`pill ${categoryPill(item.category)}`}>{item.category}</span><div><strong>{item.title}</strong><small>Week {item.week} · {item.weight}% · {entered}/{asArray(item.scores).length} entered</small></div><button onClick={()=>openDesk(item._id,"scores")}>Enter / edit scores</button><button className="delete-action" onClick={()=>deleteAssessment(item._id)}><FaTrash/></button></article>})}</div></td></tr>}
                    </Fragment>;
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
                <div><span>✓</span><strong>{classAverage.toFixed(1)} / {assessmentMax}</strong><small>Score</small></div>
                <div><span><FaChartBar /></span><strong>{deskTab === "results" ? passCount : `${Math.max(scores.length - enteredRows.length, 0)}`}</strong><small>{deskTab === "results" ? "Passed" : "Remaining"}</small></div>
              </div>

              {deskTab === "scores" ? (
                <div className="desk-body">
                  <div className="desk-toolbar">
                    <div><strong>Score sheet</strong><span>Enter weighted points from 0 to the assessment maximum. A real zero is recorded correctly.</span></div>
                    <div className="desk-search"><FaSearch /><input value={scoreSearch} onChange={(e) => setScoreSearch(e.target.value)} placeholder="Search student or ID" /></div>
                  </div>
                  <div className="score-table-wrap">
                    <table className="score-entry-table">
                      <thead><tr><th>#</th><th>Student ID</th><th>Student</th><th>Score</th><th>Status</th></tr></thead>
                      <tbody>{scoreRows.map((item, index) => <tr key={item.student || index}><td>{index + 1}</td><td><span className="table-id">{item.studentData?.studentId || "—"}</span></td><td><strong>{item.studentData?.fullName || "Student record unavailable"}</strong></td><td><div className="score-input-wrap"><input type="number" min="0" max={assessmentMax} step="0.1" value={item.score} onChange={(e) => updateScore(item.sourceIndex, e.target.value)} placeholder="—" /><span>/ {assessmentMax}</span></div></td><td>{item.entered ? <span className="pill pill-green">Entered</span> : <span className="pill pill-amber">Pending</span>}</td></tr>)}</tbody>
                    </table>
                  </div>
                  <div className="desk-save-bar"><span>{enteredRows.length} of {scores.length} scores entered</span><button onClick={saveScores} disabled={saving}><FaSave /> {saving ? "Saving…" : "Save scores"}</button></div>
                </div>
              ) : (
                <div className="desk-body results-body">
                  <div className="results-summary-line"><div><strong>{classAverage.toFixed(1)} / {assessmentMax}</strong><span>Score</span></div><div><strong>{passCount}</strong><span>Passed</span></div><div><strong>{Math.max(enteredRows.length - passCount, 0)}</strong><span>Below half mark</span></div><div><strong>{assessmentMax}</strong><span>Maximum score</span></div></div>
                  <div className="score-table-wrap">
                    <table className="score-entry-table results-onepage-table">
                      <thead><tr><th>#</th><th>Student ID</th><th>Student</th><th>Score</th><th>Contribution</th><th>Result</th></tr></thead>
                      <tbody>{scores.map((item, index) => {
                        const score = Number(item.score) || 0;
                        const contribution = score;
                        return <tr key={item.student || index}><td>{index + 1}</td><td><span className="table-id">{item.studentData?.studentId || "—"}</span></td><td><strong>{item.studentData?.fullName || "Student record unavailable"}</strong></td><td>{item.entered ? `${score.toFixed(1)} / ${assessmentMax}` : "—"}</td><td>{item.entered ? `${contribution.toFixed(1)} / ${assessmentMax}` : "—"}</td><td>{!item.entered ? <span className="pill pill-amber">Pending</span> : score >= passMark ? <span className="pill pill-green">Pass</span> : <span className="pill pill-red">Below half mark</span>}</td></tr>;
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
