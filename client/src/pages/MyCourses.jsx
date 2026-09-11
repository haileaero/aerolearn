import { useContext, useEffect, useState } from "react";
import Layout from "../components/Layout";
import StudentCourses from "../components/StudentCourses";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import { FaBook, FaGraduationCap, FaLayerGroup, FaPlane } from "react-icons/fa";

function MyCourses() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const loadMyCourses = async () => {
      try {
        const profileRes = await api.get(`/students/profile/${user.studentId}`);
        const student = profileRes.data;
        setProfile(student);

        const enrolledCourses = Array.isArray(student.courses) ? student.courses : [];
        const fullCourses = await Promise.all(
          enrolledCourses.map(async (course) => {
            if (course && typeof course === "object" && course.name) return course;
            if (!course) return null;
            try {
              const response = await api.get(`/courses/${course}`);
              return response.data;
            } catch {
              return null;
            }
          })
        );
        setCourses(fullCourses.filter(Boolean));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.studentId) loadMyCourses();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [user]);

  return (
    <Layout>
      <div className="dashboard-page">
        <section className="dashboard-hero">
          <div>
            <span className="dashboard-kicker"><FaPlane /> Student learning space</span>
            <h1>Ready to continue, {user?.fullName?.split(" ")[0] || "student"}?</h1>
            <p>
              Pick up where you left off, open your course workspaces and keep your academic progress organized from one personalized learning hub.
            </p>
            <div className="dashboard-meta">
              {profile?.department && <span>{profile.department}</span>}
              {profile?.year && <span>{profile.year}</span>}
              {profile?.semester && <span>{profile.semester}</span>}
            </div>
          </div>
          <div className="dashboard-clock">
            <span className="dashboard-clock-label">Your local study time</span>
            <div className="dashboard-clock-time">{currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
            <div className="dashboard-clock-date">{currentTime.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</div>
          </div>
        </section>

        <div className="dashboard-stats">
          <article className="dashboard-stat stat-blue">
            <div className="dashboard-stat-icon"><FaBook /></div>
            <div className="dashboard-stat-copy"><span className="dashboard-stat-value">{courses.length}</span><span className="dashboard-stat-label">My courses</span><span className="dashboard-stat-trend">Current enrollment</span></div>
          </article>
          <article className="dashboard-stat stat-violet">
            <div className="dashboard-stat-icon"><FaGraduationCap /></div>
            <div className="dashboard-stat-copy"><span className="dashboard-stat-value">{profile?.year || "—"}</span><span className="dashboard-stat-label">Study level</span><span className="dashboard-stat-trend">Academic progression</span></div>
          </article>
          <article className="dashboard-stat stat-green">
            <div className="dashboard-stat-icon"><FaLayerGroup /></div>
            <div className="dashboard-stat-copy"><span className="dashboard-stat-value">{profile?.semester || "—"}</span><span className="dashboard-stat-label">Semester</span><span className="dashboard-stat-trend">Current academic period</span></div>
          </article>
        </div>

        {loading ? <div className="dashboard-loading">Loading your courses…</div> : <StudentCourses courses={courses} />}
      </div>
    </Layout>
  );
}

export default MyCourses;
