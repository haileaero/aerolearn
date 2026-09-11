import { useContext, useEffect, useMemo, useState } from "react";
import { FaAward, FaBookOpen, FaChartLine, FaCheckCircle, FaClipboardCheck } from "react-icons/fa";
import Layout from "../components/Layout";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

function MyResults() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!user?.studentId) return;
      try {
        setLoading(true);
        const [profileRes, assessmentRes] = await Promise.all([
          api.get(`/students/profile/${user.studentId}`),
          api.get("/assessment"),
        ]);
        const myCourses = Array.isArray(profileRes.data.courses) ? profileRes.data.courses : [];
        setCourses(myCourses);
        const ids = myCourses.map((course) => String(course._id || course));
        const myAssessments = (Array.isArray(assessmentRes.data) ? assessmentRes.data : []).filter((assessment) => {
          const courseId = typeof assessment.course === "object" ? assessment.course?._id : assessment.course;
          return ids.includes(String(courseId));
        });
        setAssessments(myAssessments);
        if (myCourses.length) setSelectedCourse(String(myCourses[0]._id || myCourses[0]));
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load results.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const courseResults = useMemo(() => assessments.filter((assessment) => {
    const courseId = typeof assessment.course === "object" ? assessment.course?._id : assessment.course;
    return String(courseId) === String(selectedCourse);
  }), [assessments, selectedCourse]);

  const rows = useMemo(() => courseResults.map((assessment) => {
    const myScore = (assessment.scores || []).find((item) => String(item.student?._id || item.student) === String(user?.studentId) || String(item.student?.studentId || "") === String(user?.studentId));
    const score = Number(myScore?.score ?? myScore?.marks ?? 0);
    const total = Number(assessment.totalMarks || assessment.totalMark || 100);
    const percentage = total ? Math.round((score / total) * 100) : 0;
    return { assessment, score, total, percentage };
  }), [courseResults, user]);

  const completed = rows.filter((row) => row.score > 0 || row.assessment?.scores?.length).length;
  const average = rows.length ? Math.round(rows.reduce((sum, row) => sum + row.percentage, 0) / rows.length) : 0;
  const passed = rows.filter((row) => row.percentage >= 50).length;

  return (
    <Layout>
      <div className="student-results-page">
        <header className="student-page-banner compact-banner">
          <div>
            <span className="student-eyebrow"><FaChartLine /> Academic performance</span>
            <h1>My Results</h1>
            <p>Review scores, progress and performance by course.</p>
          </div>
          <div className="student-banner-mark"><FaAward /></div>
        </header>

        {error && <div className="student-alert error">{error}</div>}

        <div className="student-result-stats">
          <div><span className="metric-icon blue"><FaBookOpen /></span><strong>{courses.length}</strong><small>Courses</small></div>
          <div><span className="metric-icon violet"><FaClipboardCheck /></span><strong>{completed}</strong><small>Assessed</small></div>
          <div><span className="metric-icon green"><FaCheckCircle /></span><strong>{passed}</strong><small>Passed</small></div>
          <div><span className="metric-icon amber"><FaChartLine /></span><strong>{average}%</strong><small>Average</small></div>
        </div>

        <div className="student-filter-strip">
          <label>Course</label>
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
            <option value="">Select course</option>
            {courses.map((course) => <option key={course._id} value={course._id}>{course.code} — {course.name}</option>)}
          </select>
          <span>{rows.length} assessments</span>
        </div>

        {loading ? <div className="student-empty-state">Loading your results…</div> : !selectedCourse ? (
          <div className="student-empty-state">Choose a course to view results.</div>
        ) : (
          <div className="al-table-shell student-results-table">
            <table className="al-table al-table-blue">
              <thead><tr><th>Assessment</th><th>Category</th><th>Score</th><th>Weight</th><th>Performance</th></tr></thead>
              <tbody>
                {rows.length === 0 ? <tr><td colSpan="5" className="al-empty-cell">No results published for this course yet.</td></tr> : rows.map(({ assessment, score, total, percentage }) => (
                  <tr key={assessment._id}>
                    <td className="al-strong-cell">{assessment.title || assessment.category}</td>
                    <td><span className="student-category-pill">{assessment.category || "Assessment"}</span></td>
                    <td><strong>{score}</strong> / {total}</td>
                    <td>{assessment.weight || 0}%</td>
                    <td><span className={`student-performance ${percentage >= 80 ? "excellent" : percentage >= 50 ? "pass" : "risk"}`}>{percentage}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default MyResults;
