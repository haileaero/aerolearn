import "./course.css";

function CourseOverview({ course, statistics }) {
  return (
    <div className="course-overview">

      <h2>Course Overview</h2>

      <p className="course-description">
        {course.description || "No description available."}
      </p>

      <div className="overview-grid">

        <div className="overview-card">
          <span>📚 Students</span>
          <h2>{statistics.students}</h2>
        </div>

        <div className="overview-card">
          <span>📂 Materials</span>
          <h2>{statistics.materials}</h2>
        </div>

        <div className="overview-card">
          <span>📝 Assessments</span>
          <h2>{statistics.assessments}</h2>
        </div>

        <div className="overview-card">
          <span>✅ Attendance</span>
          <h2>{statistics.attendance}</h2>
        </div>

      </div>

    </div>
  );
}

export default CourseOverview;