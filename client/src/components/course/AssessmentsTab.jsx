import { FaClipboardList, FaPercent, FaTasks } from "react-icons/fa";
import "./course.css";
function AssessmentsTab({ assessments = [] }) {
  if (!assessments.length) return <div className="student-empty-state"><FaTasks /> No quizzes, assignments or exams have been published yet.</div>;
  return <section className="course-library"><div className="course-library-head"><div><span className="student-eyebrow">Evaluation center</span><h2>Assessments</h2><p>Keep track of every graded activity in this course.</p></div><span className="student-count-badge">{assessments.length} published</span></div><div className="assessment-pro-list">{assessments.map((a,i)=><article key={a._id} className={`assessment-pro-row tone-${i%4}`}><span className="assessment-pro-icon"><FaClipboardList /></span><div><h3>{a.title}</h3><p>{a.description || "Published course assessment"}</p></div><span className="assessment-type-pill">{a.category || "Assessment"}</span><strong><FaPercent /> {a.weight ?? 0}</strong></article>)}</div></section>;
}
export default AssessmentsTab;
