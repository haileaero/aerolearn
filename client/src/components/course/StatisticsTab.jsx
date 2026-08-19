import "./course.css";

function StatisticsTab({
  students,
  materials,
  assessments,
  attendance,
}) {
  const completion = 65;

  const materialProgress = Math.min(
    materials.length * 10,
    100
  );

  const assessmentProgress = Math.min(
    assessments.length * 15,
    100
  );

  return (
    <div className="statistics-container">

      <div className="statistics-card">

        <h2>📊 Course Summary</h2>

        <div className="statistics-grid">

          <div className="statistics-item">
            <span>Students</span>
            <h2>{students.length}</h2>
          </div>

          <div className="statistics-item">
            <span>Materials</span>
            <h2>{materials.length}</h2>
          </div>

          <div className="statistics-item">
            <span>Assessments</span>
            <h2>{assessments.length}</h2>
          </div>

          <div className="statistics-item">
            <span>Attendance</span>
            <h2>{attendance.length}</h2>
          </div>

        </div>

      </div>

      <div className="statistics-card">

        <h2>📈 Course Progress</h2>

        <div className="progress-box">

          <p>Overall Completion</p>

          <div className="progress-bar">
            <div
              className="progress-fill blue"
              style={{
                width: `${completion}%`,
              }}
            />
          </div>

          <strong>{completion}%</strong>

        </div>

        <div className="progress-box">

          <p>Learning Materials</p>

          <div className="progress-bar">
            <div
              className="progress-fill green"
              style={{
                width: `${materialProgress}%`,
              }}
            />
          </div>

        </div>

        <div className="progress-box">

          <p>Assessment Coverage</p>

          <div className="progress-bar">
            <div
              className="progress-fill red"
              style={{
                width: `${assessmentProgress}%`,
              }}
            />
          </div>

        </div>

      </div>

    </div>
  );
}

export default StatisticsTab;