import "./course.css";

function AttendanceTab({ attendance, user }) {
  if (attendance.length === 0) {
    return (
      <div className="empty-state">
        <h2>📅 No Attendance Records</h2>
        <p>No attendance has been recorded for this course yet.</p>
      </div>
    );
  }

  const getStudentStatus = (record) => {
    const studentRecord = record.students?.find(
      (item) => {
        const student = item.student;

        if (!student) return false;

        const studentId =
          typeof student === "object"
            ? student.studentId
            : student;

        return (
          String(studentId) ===
          String(user?.studentId)
        );
      }
    );

    return studentRecord?.status || "-";
  };

  return (
    <div className="attendance-card">

      <table className="attendance-table">

        <thead>
          <tr>
            <th>Week</th>
            <th>Period</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>

          {attendance.map((record) => (

            <tr key={record._id}>

              <td>
                {record.week}
              </td>

              <td>
                {record.period}
              </td>

              <td>
                {record.date
                  ? new Date(
                      record.date
                    ).toLocaleDateString()
                  : "-"}
              </td>

              <td>
                {getStudentStatus(record)}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default AttendanceTab;