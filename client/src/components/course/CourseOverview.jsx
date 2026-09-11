import { FaBookOpen, FaClipboardCheck, FaFileAlt, FaGraduationCap } from "react-icons/fa";
import "./course.css";

function CourseOverview({ course, statistics, user }) {
  const isStudent = user?.role === "Student";

  const statItems = [
    {
      icon: <FaBookOpen />,
      label: "Learning materials",
      value: statistics.materials,
      note: "Resources available",
      tone: "blue",
    },
    {
      icon: <FaFileAlt />,
      label: "Assessments",
      value: statistics.assessments,
      note: "Course activities",
      tone: "violet",
    },
    {
      icon: <FaClipboardCheck />,
      label: "Attendance sessions",
      value: statistics.attendance,
      note: "Recorded sessions",
      tone: "green",
    },
    {
      icon: <FaGraduationCap />,
      label: isStudent ? "Credit hours" : "Enrolled students",
      value: isStudent ? (course.creditHours || "—") : statistics.students,
      note: isStudent ? "Course weight" : "Current roster",
      tone: "amber",
    },
  ];

  return (
    <section className="course-overview course-overview-pro">
      <div className="course-overview-heading">
        <div>
          <span className="course-section-kicker">Course briefing</span>
          <h2>About this course</h2>
        </div>
        <span className="course-overview-code">{course.code || "Course"}</span>
      </div>

      <div className="course-about-panel">
        <div className="course-about-mark"><FaBookOpen /></div>
        <p className="course-description">
          {course.description || "No description has been added for this course yet."}
        </p>
      </div>

      <div className="overview-grid overview-grid-pro">
        {statItems.map((item) => (
          <article className={`overview-card overview-card-pro overview-tone-${item.tone}`} key={item.label}>
            <div className="overview-card-icon">{item.icon}</div>
            <div>
              <span>{item.label}</span>
              <h3>{item.value}</h3>
              <small>{item.note}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CourseOverview;
