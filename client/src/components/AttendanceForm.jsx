import { useState } from "react";

function AttendanceForm({ onAdd }) {
  const [attendance, setAttendance] = useState({
    student: "",
    course: "",
    date: "",
    status: "Present",
  });

  const handleChange = (e) => {
    setAttendance({
      ...attendance,
      [e.target.name]: e.target.value,
    });
  };

  const submit = (e) => {
    e.preventDefault();

    if (
      !attendance.student ||
      !attendance.course ||
      !attendance.date
    )
      return;

    onAdd(attendance);

    setAttendance({
      student: "",
      course: "",
      date: "",
      status: "Present",
    });
  };

  return (
    <form className="attendance-form" onSubmit={submit}>

      <input
        name="student"
        placeholder="Student Name"
        value={attendance.student}
        onChange={handleChange}
      />

      <input
        name="course"
        placeholder="Course"
        value={attendance.course}
        onChange={handleChange}
      />

      <input
        type="date"
        name="date"
        value={attendance.date}
        onChange={handleChange}
      />

      <select
        name="status"
        value={attendance.status}
        onChange={handleChange}
      >
        <option>Present</option>
        <option>Absent</option>
        <option>Late</option>
      </select>

      <button>Save Attendance</button>

    </form>
  );
}

export default AttendanceForm;