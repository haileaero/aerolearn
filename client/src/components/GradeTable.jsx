function GradeTable({ grades, removeGrade }) {
  return (
    <table className="student-table">
      <thead>
        <tr>
          <th>Student</th>
          <th>Course</th>
          <th>Quiz</th>
          <th>Assignment</th>
          <th>Mid</th>
          <th>Final</th>
          <th>Total</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {grades.map((grade, index) => (
          <tr key={index}>
            <td>{grade.student}</td>
            <td>{grade.course}</td>
            <td>{grade.quiz}</td>
            <td>{grade.assignment}</td>
            <td>{grade.mid}</td>
            <td>{grade.final}</td>
            <td>{grade.total}</td>

            <td>
              <button
                className="delete-btn"
                onClick={() => removeGrade(index)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default GradeTable;