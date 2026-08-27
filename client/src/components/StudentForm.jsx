import { useEffect, useState } from "react";
import api from "../api";

function StudentForm({
  onAdd,
  onUpdate,
  editingStudent,
}) {
  const emptyStudent = {
    user: "",
    studentId: "",
    fullName: "",
    gender: "",
    email: "",
    phone: "",
    department: "",
    program: "",
    year: "",
    semester: "",
    section: "",
    status: "Active",
  };

  const [student, setStudent] =
    useState(emptyStudent);

  const [studentUsers, setStudentUsers] =
    useState([]);

  const [
    selectedDepartment,
    setSelectedDepartment,
  ] = useState("");

  // ===============================
  // Load Student Users
  // ===============================

  useEffect(() => {
    loadStudentUsers();
  }, []);

  const loadStudentUsers = async () => {
    try {
      const res = await api.get("/users");

      const allUsers = Array.isArray(res.data)
        ? res.data
        : res.data.users || [];

      const students = allUsers.filter(
        (user) =>
          user.role &&
          user.role.toLowerCase() ===
            "student"
      );

      setStudentUsers(students);

      console.log(
        "Student Users:",
        students
      );
    } catch (err) {
      console.error(
        "Unable to load student users",
        err
      );
    }
  };

  // ===============================
  // Filter by Department
  // ===============================

  const filteredStudentUsers =
    studentUsers.filter(
      (user) =>
        user.department ===
        selectedDepartment
    );

  // ===============================
  // Editing Existing Student
  // ===============================

  useEffect(() => {
    if (editingStudent) {
      setStudent({
        ...emptyStudent,
        ...editingStudent,
      });

      setSelectedDepartment(
        editingStudent.department || ""
      );
    } else {
      setStudent(emptyStudent);
      setSelectedDepartment("");
    }
  }, [editingStudent]);

  // ===============================
  // Input Change
  // ===============================

  const handleChange = (e) => {
    setStudent((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.value,
    }));
  };

  // ===============================
  // Existing User Selected
  // ===============================

  const handleStudentSelect = (e) => {
    const selected =
      studentUsers.find(
        (user) =>
          user._id ===
          e.target.value
      );

    if (!selected) return;

    setStudent((prev) => ({
  ...prev,
  user: selected._id,
  studentId: selected.studentId || "",
  fullName: selected.fullName || "",
  gender: selected.gender || "",
  email: selected.email || "",
  phone: selected.phone || "",
  department: selected.department || "",
}));
  };
  // ===============================
// Submit Student
// ===============================

const submit = async (e) => {
  e.preventDefault();

 const missingFields = [];

if (!student.user) missingFields.push("Existing User");
if (!student.studentId) missingFields.push("Student ID");
if (!student.fullName) missingFields.push("Full Name");
if (!student.gender) missingFields.push("Gender");
if (!student.email) missingFields.push("Email");
if (!student.department) missingFields.push("Department");

if (missingFields.length > 0) {
  alert(
    `Please complete the following required fields:\n${missingFields.join(", ")}`
  );
  return;
}

  if (editingStudent) {
    await onUpdate(student);
  } else {
    await onAdd(student);
  }

  setStudent(emptyStudent);
  setSelectedDepartment("");
};

// ===============================
// User Interface
// ===============================

return (
  <div
    style={{
      background: "#fff",
      padding: "30px",
      borderRadius: "18px",
      boxShadow: "0 8px 25px rgba(0,0,0,.08)",
      marginBottom: "35px",
    }}
  >
    <h2
      style={{
        marginBottom: "25px",
        color: "#1e3a8a",
      }}
    >
      {editingStudent
        ? "Update Student"
        : "Register New Student"}
    </h2>

    <form onSubmit={submit}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(260px,1fr))",
          gap: "18px",
        }}
      >
        {/* Department Selection */}

<select
  value={selectedDepartment}
  onChange={(e) => {
    const department = e.target.value;

    setSelectedDepartment(department);

    setStudent({
      ...emptyStudent,
      department,
    });
  }}
>
  <option value="">
    Select Department
  </option>

  <option value="Aerospace Engineering">
    Aerospace Engineering
  </option>

  <option value="Production Engineering">
    Production Engineering
  </option>

  <option value="Armament Engineering">
    Armament Engineering
  </option>

  <option value="Computer Engineering">
    Computer Engineering
  </option>

  <option value="Motor Vehicle Engineering">
    Motor Vehicle Engineering
  </option>

  <option value="Metallurgy and Materials Engineering">
    Metallurgy and Materials Engineering
  </option>

  <option value="Chemical Engineering">
    Chemical Engineering
  </option>

  <option value="Electrical Power Engineering">
    Electrical Power Engineering
  </option>

  <option value="Electronics Engineering">
    Electronics Engineering
  </option>

  <option value="Civil Engineering">
    Civil Engineering
  </option>
</select>

{/* Existing Student User */}

<select
  value={student.user}
  onChange={handleStudentSelect}
  disabled={!selectedDepartment}
>
  <option value="">
    Select Existing Student User
  </option>

  {filteredStudentUsers.map((user) => (
    <option
      key={user._id}
      value={user._id}
    >
      {user.studentId} - {user.fullName}
    </option>
  ))}
</select>

<input
  name="studentId"
  placeholder="Student ID"
  value={student.studentId}
  readOnly
/>

<input
  name="fullName"
  placeholder="Full Name"
  value={student.fullName}
  readOnly
/>

<select
  name="gender"
  value={student.gender}
  onChange={handleChange}
  required
>
  <option value="">
    Select Gender
  </option>

  <option value="Male">
    Male
  </option>

  <option value="Female">
    Female
  </option>
</select>

<input
  type="email"
  name="email"
  placeholder="Email"
  value={student.email}
  readOnly
/>

<input
  name="phone"
  placeholder="Phone"
  value={student.phone}
  readOnly
/>

<input
  name="department"
  placeholder="Department"
  value={student.department}
  readOnly
/>

<select
  name="program"
  value={student.program}
  onChange={handleChange}
>
  <option value="">
    Select Program
  </option>

  <option value="Regular">
    Regular
  </option>

  <option value="Extension">
    Extension
  </option>

  <option value="Weekend">
    Weekend
  </option>

  <option value="Summer">
    Summer
  </option>
</select>

<select
  name="year"
  value={student.year}
  onChange={handleChange}
>
  <option value="">
    Select Year
  </option>

  <option value="Year I">
    Year I
  </option>

  <option value="Year II">
    Year II
  </option>

  <option value="Year III">
    Year III
  </option>

  <option value="Year IV">
    Year IV
  </option>

  <option value="Year V">
    Year V
  </option>
</select>

<select
  name="semester"
  value={student.semester}
  onChange={handleChange}
>
  <option value="">
    Select Semester
  </option>

  <option value="Semester I">
    Semester I
  </option>

  <option value="Semester II">
    Semester II
  </option>
</select>

<input
  name="section"
  placeholder="Section"
  value={student.section}
  onChange={handleChange}
/>

<select
  name="status"
  value={student.status}
  onChange={handleChange}
>
  <option value="Active">
    Active
  </option>

  <option value="Graduated">
    Graduated
  </option>

  <option value="Suspended">
    Suspended
  </option>
</select>
      </div>

      <button
        type="submit"
        style={{
          marginTop: "30px",
          background: editingStudent
            ? "#f59e0b"
            : "#2563eb",
          color: "#fff",
          border: "none",
          padding: "14px 28px",
          borderRadius: "10px",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "15px",
        }}
      >
        {editingStudent
          ? "Update Student"
          : "Register Student"}
      </button>
    </form>
  </div>
);
}

export default StudentForm;