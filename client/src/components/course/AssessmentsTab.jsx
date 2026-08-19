import "./course.css";

function AssessmentsTab({ assessments }) {
  if (assessments.length === 0) {
    return (
      <div className="empty-state">
        <h2>📝 No Assessments Available</h2>
        <p>No quizzes, assignments or exams have been published yet.</p>
      </div>
    );
  }

  return (
    <div className="assessments-grid">
      {assessments.map((assessment) => (
        <div
          key={assessment._id}
          className="assessment-card"
        >
          <div className="assessment-header">
            <h2>{assessment.title}</h2>
          </div>

          <div className="assessment-body">

            <div>
              <strong>Type</strong>
              <p>{assessment.category}</p>
            </div>

            <div>
              <strong>Weight</strong>
              <p>{assessment.weight}%</p>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}

export default AssessmentsTab;