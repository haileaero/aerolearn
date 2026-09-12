import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import { isAdmin } from "../utils/roles";
import api from "../api";
import { FaUsers, FaUserGraduate, FaBook, FaClipboardCheck, FaClipboardList, FaBullhorn, FaFolderOpen, FaArrowRight, FaPlane, FaCheckCircle, FaExclamationTriangle, FaClock } from "react-icons/fa";

const normalize = (data, key) => Array.isArray(data) ? data : data?.[key] || [];

function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, students: 0, courses: 0, attendance: 0, assessments: 0, announcements: 0, materials: 0 });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!user) return undefined;
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const common = [api.get("/students"), api.get("/courses"), api.get("/attendance"), api.get("/assessment"), api.get("/announcements"), api.get("/learning-materials")];
        const results = await Promise.all(isAdmin(user) ? [api.get("/users"), ...common] : common);
        const offset = isAdmin(user) ? 1 : 0;
        setStats({
          users: isAdmin(user) ? normalize(results[0].data, "users").length : 0,
          students: normalize(results[offset].data, "students").length,
          courses: normalize(results[offset + 1].data, "courses").length,
          attendance: normalize(results[offset + 2].data, "attendance").length,
          assessments: normalize(results[offset + 3].data, "assessments").length,
          announcements: normalize(results[offset + 4].data, "announcements").length,
          materials: normalize(results[offset + 5].data, "materials").length,
        });
      } catch (error) { console.error("Dashboard Error:", error); }
      finally { setLoading(false); }
    };
    loadDashboard();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [user]);

  const cards = useMemo(() => [
    ...(isAdmin(user) ? [{ title: "Users", value: stats.users, icon: <FaUsers />, tone: "blue", link: "/users" }] : []),
    { title: "Students", value: stats.students, icon: <FaUserGraduate />, tone: "green", link: isAdmin(user) ? "/students" : null },
    { title: "Courses", value: stats.courses, icon: <FaBook />, tone: "violet", link: "/courses" },
    { title: "Attendance", value: stats.attendance, icon: <FaClipboardCheck />, tone: "amber", link: "/attendance" },
    { title: "Assessments", value: stats.assessments, icon: <FaClipboardList />, tone: "red", link: "/assessment" },
    { title: "Materials", value: stats.materials, icon: <FaFolderOpen />, tone: "cyan", link: "/learning-materials" },
  ], [stats, user]);

  const maxValue = Math.max(...cards.map(c => c.value), 1);
  const actions = [
    { title: "Record attendance", text: "Open today’s register", icon: <FaClipboardCheck />, link: "/attendance", tone: "green" },
    { title: "Assessment hub", text: "Create, score and review results", icon: <FaClipboardList />, link: "/assessment", tone: "violet" },
    { title: "Share material", text: "Add a learning resource", icon: <FaFolderOpen />, link: "/learning-materials", tone: "blue" },
    { title: "Post announcement", text: "Notify the learning community", icon: <FaBullhorn />, link: "/announcements", tone: "amber" },
  ];

  return <Layout><div className="command-page">
    <section className="command-topbar">
      <div><span className="command-eyebrow"><FaPlane/> AEROLEARN CONTROL CENTER</span><h1>{user?.role} Command Center</h1><p>Good {currentTime.getHours() < 12 ? "morning" : currentTime.getHours() < 18 ? "afternoon" : "evening"}, {user?.fullName?.split(" ")[0] || "there"}. Here is your academic pulse.</p></div>
      <div className="command-date"><FaClock/><div><strong>{currentTime.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</strong><span>{currentTime.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})}</span></div></div>
    </section>

    {loading ? <div className="dashboard-loading">Preparing command center…</div> : <>
      <div className="command-metrics">{cards.map(c => <button key={c.title} className={`command-metric metric-${c.tone}`} onClick={() => c.link && navigate(c.link)} disabled={!c.link}><span className="command-metric-icon">{c.icon}</span><span><strong>{c.value}</strong><small>{c.title}</small></span><i style={{width:`${Math.max(12,(c.value/maxValue)*100)}%`}}/></button>)}</div>

      <div className="command-grid">
        <section className="command-card command-pulse"><div className="command-card-head"><div><h2>Academic pulse</h2><p>Relative activity across your workspace</p></div><span className="live-badge"><i/> LIVE</span></div>
          <div className="pulse-list">{cards.slice(isAdmin(user) ? 1 : 0).map(c => <div className="pulse-row" key={c.title}><span>{c.title}</span><div><i className={`pulse-${c.tone}`} style={{width:`${Math.max(8,(c.value/maxValue)*100)}%`}}/></div><strong>{c.value}</strong></div>)}</div>
        </section>
        <section className="command-card"><div className="command-card-head"><div><h2>Priority desk</h2><p>Fast routes for today’s work</p></div></div>
          <div className="priority-list">{actions.map(a => <Link to={a.link} key={a.title} className={`priority-item priority-${a.tone}`}><span>{a.icon}</span><div><strong>{a.title}</strong><small>{a.text}</small></div><FaArrowRight/></Link>)}</div>
        </section>
      </div>

      <div className="command-grid command-grid-bottom">
        <section className="command-card"><div className="command-card-head"><div><h2>Workspace health</h2><p>At-a-glance operational checks</p></div><span className="health-score">GOOD</span></div>
          <div className="health-grid"><div><FaCheckCircle/><strong>Academic data</strong><span>Connected and available</span></div><div><FaCheckCircle/><strong>Role access</strong><span>Protected by permissions</span></div><div><FaCheckCircle/><strong>Course resources</strong><span>{stats.materials} materials available</span></div><div className={stats.announcements ? "" : "health-warn"}><FaExclamationTriangle/><strong>Communications</strong><span>{stats.announcements} published announcements</span></div></div>
        </section>
        <section className="command-card command-focus"><div><span>TODAY’S FOCUS</span><h2>Keep the learning cycle moving.</h2><p>Attendance → learning resources → assessment → feedback. AeroLearn keeps each stage one click away.</p></div><Link to="/courses">Open course workspace <FaArrowRight/></Link></section>
      </div>
    </>}
  </div></Layout>;
}
export default Dashboard;
