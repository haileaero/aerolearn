function AttendanceTable({ records, removeRecord }) {
  return (
    <table className="student-table">

      <thead>

        <tr>
          <th>Student</th>
          <th>Course</th>
          <th>Date</th>
          <th>Status</th>
          <th>Action</th>
        </tr>

      </thead>

      <tbody>

        {records.map((record, index) => (

          <tr key={index}>

            <td>{record.student}</td>

            <td>{record.course}</td>

            <td>{record.date}</td>

            <td>{record.status}</td>

            <td>

              <button
                className="delete-btn"
                onClick={() => removeRecord(index)}
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

export default AttendanceTable;