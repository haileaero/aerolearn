import { useContext, useEffect, useMemo, useState } from "react";
import { FaBullhorn, FaClock, FaPen, FaPlus, FaTimes, FaTrash, FaUsers, FaThumbtack, FaBook } from "react-icons/fa";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import { useUI } from "../context/UIContext";
import { getCourses } from "../services/courseService";
import { getStudents } from "../services/studentService";
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, markVisibleAnnouncementsRead } from "../services/announcementService";
import { canManageAcademic, isStudent } from "../utils/roles";

const emptyForm = { title: "", message: "", audience: "All", priority: "Normal", expiryDate: "", isPinned: false, studyYear: "", department: "", section: "", course: "" };
const courseIdOf = (course) => String(course?._id || course || "");
const norm = (value) => String(value ?? "").trim();

function Announcements() {
  const { user } = useContext(AuthContext);
  const { confirm, toast } = useUI();
  const canManage = canManageAcademic(user);
  const studentView = isStudent(user);
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showComposer, setShowComposer] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [courseFilter, setCourseFilter] = useState("All");
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const tasks = [getAnnouncements(), getCourses()];
      if (canManage) tasks.push(getStudents());
      const results = await Promise.all(tasks);
      setAnnouncements(Array.isArray(results[0]) ? results[0] : []);
      // Visiting this page counts as seeing the announcements currently available to this account.
      markVisibleAnnouncementsRead().catch(() => {});
      setCourses(Array.isArray(results[1]) ? results[1] : []);
      setStudents(Array.isArray(results[2]) ? results[2] : Array.isArray(results[2]?.students) ? results[2].students : []);
    } catch (error) { toast(error?.response?.data?.message || "Unable to load announcements.", "error"); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const departments = useMemo(() => [...new Set(courses.map(c => norm(c.department)).filter(Boolean))].sort(), [courses]);
  const years = useMemo(() => [...new Set(courses.filter(c => !form.department || c.department === form.department).map(c => norm(c.studyYear)).filter(Boolean))].sort(), [courses, form.department]);
  // Keep the section list independent of the students API's pagination. Some
  // deployments return only one page of students, which must not limit this dropdown.
  // Include common stored formats and merge in any additional values from student records.
  const sections = useMemo(() => {
    const registered = students
      .filter(s => (!form.department || norm(s.department) === form.department) && (!form.studyYear || norm(s.year) === form.studyYear))
      .map(s => norm(s.section))
      .filter(Boolean);
    const common = [
      ...Array.from({ length: 10 }, (_, i) => String(i + 1)),
      ...Array.from({ length: 10 }, (_, i) => `Section ${i + 1}`),
      ...Array.from({ length: 10 }, (_, i) => String.fromCharCode(65 + i)),
      ...Array.from({ length: 10 }, (_, i) => `Section ${String.fromCharCode(65 + i)}`),
    ];
    const values = new Map();
    [...common, ...registered].forEach(value => {
      const key = value.trim().toLocaleLowerCase();
      if (key && !values.has(key)) values.set(key, value.trim());
    });
    return [...values.values()].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
  }, [students, form.department, form.studyYear]);
  const matchingCourses = useMemo(() => courses.filter(c => (!form.department || c.department === form.department) && (!form.studyYear || c.studyYear === form.studyYear)), [courses, form.department, form.studyYear]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };
      if (name === "department") { next.studyYear = ""; next.section = ""; next.course = ""; }
      if (name === "studyYear") { next.section = ""; next.course = ""; }
      if (name === "section") next.course = "";
      if (name === "course") {
        const selected = courses.find(c => String(c._id) === value);
        if (selected) { next.department = selected.department || next.department; next.studyYear = selected.studyYear || next.studyYear; }
      }
      return next;
    });
  };

  const submitAnnouncement = async (e) => {
    e.preventDefault();
    if (!form.studyYear || !form.department || !form.section || !form.course) return toast("Choose study year, department, section and course.", "error");
    try {
      if (editingId) await updateAnnouncement(editingId, form); else await createAnnouncement(form);
      toast(editingId ? "Announcement updated." : "Announcement published.");
      setEditingId(null); setShowComposer(false); setForm(emptyForm); await loadData();
    } catch (error) { toast(error?.response?.data?.message || "Unable to save announcement.", "error"); }
  };

  const editAnnouncement = (a) => {
    const course = a.course || {};
    setEditingId(a._id); setShowComposer(true);
    setForm({ title: a.title || "", message: a.message || "", audience: a.audience || "All", priority: a.priority || "Normal", expiryDate: a.expiryDate ? a.expiryDate.substring(0,10) : "", isPinned: Boolean(a.isPinned), department: a.department || course.department || "", studyYear: a.studyYear || course.studyYear || "", section: a.section || "", course: courseIdOf(course) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const removeAnnouncement = async (id) => {
    const approved = await confirm({ title: "Delete this announcement?", message: "This removes the announcement from the intended student group.", confirmText: "Delete announcement" });
    if (!approved) return;
    try { await deleteAnnouncement(id); await loadData(); toast("Announcement deleted."); } catch { toast("Unable to delete announcement.", "error"); }
  };
  const filtered = useMemo(() => announcements.filter(a => priorityFilter === "All" || a.priority === priorityFilter).filter(a => courseFilter === "All" || courseIdOf(a.course) === courseFilter).filter(a => `${a.title||""} ${a.message||""} ${a.audience||""} ${a.priority||""} ${a.course?.code||""} ${a.course?.name||""} ${a.department||""} ${a.studyYear||""} ${a.section||""}`.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>Number(Boolean(b.isPinned))-Number(Boolean(a.isPinned)) || new Date(b.createdAt)-new Date(a.createdAt)), [announcements, search, priorityFilter, courseFilter]);
  const counts = useMemo(() => ({ total: announcements.length, high: announcements.filter(a=>a.priority==="High").length, pinned: announcements.filter(a=>a.isPinned).length }), [announcements]);

  return <Layout><div className="al-control-page announcement-studio">
    <header className={`al-control-header announcement-hero ${studentView ? "student-announcement-hero" : ""}`}><div><span className="al-eyebrow">{studentView ? "COURSE UPDATES" : "CAMPUS COMMUNICATION"}</span><h1><FaBullhorn /> {studentView ? "Announcements" : "Announcement Center"}</h1><p>{canManage ? "Publish updates for a specific study year, department, section and course." : "Stay updated with important information for your class."}</p></div>{canManage && <button className={`al-primary-action staff-only ${showComposer ? "is-close" : ""}`} onClick={() => { setShowComposer(v=>!v); setEditingId(null); setForm(emptyForm); }}>{showComposer ? <><FaTimes/> Close</> : <><FaPlus/> Publish update</>}</button>}</header>
    {canManage && <div className="announcement-kpis staff-only"><div><FaBullhorn/><span><strong>{counts.total}</strong><small>Active updates</small></span></div><div><FaThumbtack/><span><strong>{counts.pinned}</strong><small>Pinned</small></span></div><div><FaClock/><span><strong>{counts.high}</strong><small>High priority</small></span></div><div><FaBook/><span><strong>{courses.length}</strong><small>Course feeds</small></span></div></div>}
    {canManage && showComposer && <form className="announcement-composer" onSubmit={submitAnnouncement}>
      <div className="composer-head"><div><span>{editingId ? "EDIT UPDATE" : "NEW UPDATE"}</span><h2>{editingId ? "Update announcement" : "Publish to a student group"}</h2></div><FaBullhorn/></div>
      <div className="composer-grid">
        <label className="span-2">Title<input name="title" value={form.title} onChange={handleChange} placeholder="Clear announcement title" required /></label>
        <label>Study Year<select name="studyYear" value={form.studyYear} onChange={handleChange} required><option value="">Select study year</option>{years.map(y=><option key={y} value={y}>{y}</option>)}</select></label>
        <label>Department<select name="department" value={form.department} onChange={handleChange} required><option value="">Select department</option>{departments.map(d=><option key={d} value={d}>{d}</option>)}</select></label>
        <label>Section<select name="section" value={form.section} onChange={handleChange} required disabled={!form.department || !form.studyYear}><option value="">Select section</option><option value="All">All sections</option>{sections.map(s=><option key={s} value={s}>{s}</option>)}</select></label>
        <label>Course<select name="course" value={form.course} onChange={handleChange} required disabled={!form.department || !form.studyYear}><option value="">Select course</option>{matchingCourses.map(c=><option key={c._id} value={c._id}>{c.code} — {c.name}</option>)}</select></label>
        <label>Audience<select name="audience" value={form.audience} onChange={handleChange}><option>All</option><option>Students</option><option>Instructors</option></select></label>
        <label>Priority<select name="priority" value={form.priority} onChange={handleChange}><option>Low</option><option>Normal</option><option>High</option></select></label>
        <label>Expiry date<input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange}/></label>
        <label className="span-2">Message<textarea rows="4" name="message" value={form.message} onChange={handleChange} placeholder="Write the update students should see..." required/></label>
      </div>
      <div className="composer-actions"><label className="pin-check"><input type="checkbox" name="isPinned" checked={form.isPinned} onChange={handleChange}/><FaThumbtack/> Pin this update</label><button className="btn-compact btn-primary" type="submit">{editingId ? "Save changes" : "Publish announcement"}</button></div>
    </form>}
    <section className={`announcement-toolbar ${studentView ? "student-toolbar" : ""}`}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search announcements..."/>{canManage && <select className="staff-only" value={courseFilter} onChange={e=>setCourseFilter(e.target.value)}><option value="All">All course feeds</option>{courses.map(c=><option value={c._id} key={c._id}>{c.code}</option>)}</select>}<div className="announcement-priority-tabs">{["All","High","Normal","Low"].map(p=><button type="button" key={p} className={priorityFilter===p?"active":""} onClick={()=>setPriorityFilter(p)}>{p}</button>)}</div></section>
    {loading ? <div className="student-empty-state">Loading course updates…</div> : filtered.length===0 ? <div className="student-empty-state"><FaBullhorn/><strong>No announcements found</strong><span>Try another filter or check back later.</span></div> : <div className="announcement-feed">{filtered.map(a=><article className={`announcement-card priority-${String(a.priority||"normal").toLowerCase()} ${a.isPinned?"is-pinned":""}`} key={a._id}><div className="announcement-card-top"><div className="announcement-course"><FaBook/><span>{a.course?.code||"Course"}</span><small>{a.course?.name||"Course update"} · {a.studyYear||a.course?.studyYear||""} · {a.department||a.course?.department||""} · Section {a.section||"All"}</small></div><div className="announcement-badges">{a.isPinned&&<span className="pin-badge"><FaThumbtack/> Pinned</span>}<span className={`priority-badge ${String(a.priority).toLowerCase()}`}>{a.priority}</span></div></div><h3>{a.title}</h3><p>{a.message}</p><footer><span><FaUsers/> {a.audience}</span><span><FaClock/> {a.createdAt?new Date(a.createdAt).toLocaleDateString():""}</span>{canManage&&<div className="announcement-actions"><button onClick={()=>editAnnouncement(a)}><FaPen/> Edit</button><button className="danger" onClick={()=>removeAnnouncement(a._id)}><FaTrash/> Delete</button></div>}</footer></article>)}</div>}
  </div></Layout>;
}
export default Announcements;
