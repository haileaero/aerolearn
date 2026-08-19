import "./course.css";

function StudentsTab({ students }) {
  if (students.length === 0) {
    return (
      <div className="empty-state">
        <h2>👨‍🎓 No Students Enrolled</h2>
        <p>No students are enrolled in this course.</p>
      </div>
    );
  }

  return (
    <div className="students-grid">
      {students.map((student) => (
        <div
          key={student._id}
          className="student-card"
        >
          <div className="student-avatar">
            {student.fullName
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </div>

          <h3>{student.fullName}</h3>

          <p>{student.email}</p>

          <div className="student-info">

            <div>
              <strong>ID</strong>
              <span>
                {student.studentId || "-"}
              </span>
            </div>

            <div>
              <strong>Department</strong>
              <span>
                {student.department || "-"}
              </span>
            </div>

          </div>

          <span className="student-status">
            Active
          </span>

        </div>
      ))}
    </div>
  );
}

export default StudentsTab;