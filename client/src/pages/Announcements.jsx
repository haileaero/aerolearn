import { useContext, useEffect, useMemo, useState } from "react";
import { FaBullhorn, FaClock, FaPen, FaPlus, FaTimes, FaTrash, FaUsers, FaThumbtack, FaBook } from "react-icons/fa";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import { useUI } from "../context/UIContext";
import { getCourses } from "../services/courseService";
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from "../services/announcementService";

const emptyForm = { title: "", message: "", audience: "All", priority: "Normal", expiryDate: "", isPinned: false, course: "" };
const courseIdOf = (course) => String(course?._id || course || "");

function Announcements() {
  const { user } = useContext(AuthContext);
  const { confirm, toast } = useUI();
  const canManage = user?.role === "Admin" || user?.role === "Instructor";
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
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
      const [announcementData, courseData] = await Promise.all([getAnnouncements(), getCourses()]);
      setAnnouncements(Array.isArray(announcementData) ? announcementData : []);
      setCourses(Array.isArray(courseData) ? courseData : []);
    } catch (error) {
      toast(error?.response?.data?.message || "Unable to load announcements.", "error");
    } finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const submitAnnouncement = async (e) => {
    e.preventDefault();
    try {
      if (!form.course) return toast("Choose a course for this announcement.", "error");
      if (editingId) await updateAnnouncement(editingId, form);
      else await createAnnouncement(form);
      toast(editingId ? "Announcement updated." : "Announcement published.");
      setEditingId(null); setShowComposer(false); setForm(emptyForm);
      await loadData();
    } catch (error) { toast(error?.response?.data?.message || "Unable to save announcement.", "error"); }
  };

  const editAnnouncement = (announcement) => {
    setEditingId(announcement._id); setShowComposer(true);
    setForm({
      title: announcement.title || "", message: announcement.message || "", audience: announcement.audience || "All",
      priority: announcement.priority || "Normal", expiryDate: announcement.expiryDate ? announcement.expiryDate.substring(0, 10) : "",
      isPinned: Boolean(announcement.isPinned), course: courseIdOf(announcement.course),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeAnnouncement = async (id) => {
    const approved = await confirm({ title: "Delete this announcement?", message: "This removes the announcement from the intended course feed.", confirmText: "Delete announcement" });
    if (!approved) return;
    try { await deleteAnnouncement(id); await loadData(); toast("Announcement deleted."); }
    catch { toast("Unable to delete announcement.", "error"); }
  };

  const filtered = useMemo(() => announcements
    .filter((a) => priorityFilter === "All" || a.priority === priorityFilter)
    .filter((a) => courseFilter === "All" || courseIdOf(a.course) === courseFilter)
    .filter((a) => `${a.title || ""} ${a.message || ""} ${a.audience || ""} ${a.priority || ""} ${a.course?.code || ""} ${a.course?.name || ""}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned)) || new Date(b.createdAt) - new Date(a.createdAt)),
  [announcements, search, priorityFilter, courseFilter]);

  const counts = useMemo(() => ({ total: announcements.length, high: announcements.filter(a => a.priority === "High").length, pinned: announcements.filter(a => a.isPinned).length }), [announcements]);

  return <Layout><div className="al-control-page announcement-studio">
    <header className="al-control-header announcement-hero"><div><span className="al-eyebrow">CAMPUS COMMUNICATION</span><h1><FaBullhorn /> Announcement Center</h1><p>{canManage ? "Publish course-specific updates that reach the right learners." : "Important updates from your current courses, organized in one feed."}</p></div>{canManage && <button className={`al-primary-action ${showComposer ? "is-close" : ""}`} onClick={() => { setShowComposer(v => !v); setEditingId(null); setForm(emptyForm); }}>{showComposer ? <><FaTimes/> Close</> : <><FaPlus/> Publish update</>}</button>}</header>

    <div className="announcement-kpis"><div><FaBullhorn/><span><strong>{counts.total}</strong><small>Active updates</small></span></div><div><FaThumbtack/><span><strong>{counts.pinned}</strong><small>Pinned</small></span></div><div><FaClock/><span><strong>{counts.high}</strong><small>High priority</small></span></div><div><FaBook/><span><strong>{courses.length}</strong><small>Course feeds</small></span></div></div>

    {canManage && showComposer && <form className="announcement-composer" onSubmit={submitAnnouncement}>
      <div className="composer-head"><div><span>{editingId ? "EDIT UPDATE" : "NEW UPDATE"}</span><h2>{editingId ? "Update announcement" : "Publish to a course"}</h2></div><FaBullhorn/></div>
      <div className="composer-grid">
        <label className="span-2">Title<input name="title" value={form.title} onChange={handleChange} placeholder="Clear announcement title" required /></label>
        <label>Course<select name="course" value={form.course} onChange={handleChange} required><option value="">Select course</option>{courses.map(c => <option key={c._id} value={c._id}>{c.code} — {c.name}</option>)}</select></label>
        <label>Audience<select name="audience" value={form.audience} onChange={handleChange}><option>All</option><option>Students</option><option>Instructors</option></select></label>
        <label>Priority<select name="priority" value={form.priority} onChange={handleChange}><option>Low</option><option>Normal</option><option>High</option></select></label>
        <label>Expiry date<input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange}/></label>
        <label className="span-2">Message<textarea rows="4" name="message" value={form.message} onChange={handleChange} placeholder="Write the update students should see..." required/></label>
      </div>
      <div className="composer-actions"><label className="pin-check"><input type="checkbox" name="isPinned" checked={form.isPinned} onChange={handleChange}/><FaThumbtack/> Pin this update</label><button className="btn-compact btn-primary" type="submit">{editingId ? "Save changes" : "Publish announcement"}</button></div>
    </form>}

    <section className="announcement-toolbar"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search updates, course or message..."/><select value={courseFilter} onChange={e=>setCourseFilter(e.target.value)}><option value="All">All course feeds</option>{courses.map(c=><option value={c._id} key={c._id}>{c.code}</option>)}</select><div className="announcement-priority-tabs">{["All","High","Normal","Low"].map(p=><button key={p} className={priorityFilter===p?"active":""} onClick={()=>setPriorityFilter(p)}>{p}</button>)}</div></section>

    {loading ? <div className="student-empty-state">Loading course updates…</div> : filtered.length === 0 ? <div className="student-empty-state"><FaBullhorn/><strong>No announcements found</strong><span>Try another filter or check back later.</span></div> : <div className="announcement-feed">{filtered.map(a => <article className={`announcement-card priority-${String(a.priority || "normal").toLowerCase()} ${a.isPinned ? "is-pinned" : ""}`} key={a._id}>
      <div className="announcement-card-top"><div className="announcement-course"><FaBook/><span>{a.course?.code || "Course"}</span><small>{a.course?.name || "Course update"}</small></div><div className="announcement-badges">{a.isPinned && <span className="pin-badge"><FaThumbtack/> Pinned</span>}<span className={`priority-badge ${String(a.priority).toLowerCase()}`}>{a.priority}</span></div></div>
      <h3>{a.title}</h3><p>{a.message}</p>
      <footer><span><FaUsers/> {a.audience}</span><span><FaClock/> {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ""}</span>{canManage && <div className="announcement-actions"><button onClick={()=>editAnnouncement(a)}><FaPen/> Edit</button><button className="danger" onClick={()=>removeAnnouncement(a._id)}><FaTrash/> Delete</button></div>}</footer>
    </article>)}</div>}
  </div></Layout>;
}
export default Announcements;
