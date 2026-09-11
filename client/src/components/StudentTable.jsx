import { useMemo, useState } from "react";
import { FaPen, FaTrash, FaSearch, FaUsers, FaUserCheck, FaGraduationCap, FaUserSlash } from "react-icons/fa";

const departments = [
  "Aerospace Engineering", "Production Engineering", "Armament Engineering",
  "Computer Engineering", "Motor Vehicle Engineering", "Metallurgy and Materials Engineering",
  "Chemical Engineering", "Electrical Power Engineering", "Electronics Engineering", "Civil Engineering"
];

function StudentTable({ students, removeStudent, editStudent }) {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");

  const filteredStudents = useMemo(() => {
    const studentList = Array.isArray(students) ? students : [];
    const keyword = search.toLowerCase();
    return studentList.filter((student) => {
      const matchesSearch = [student.fullName, student.studentId, student.email, student.department]
        .filter(Boolean).some((value) => value.toLowerCase().includes(keyword));
      return matchesSearch && (!department || student.department === department);
    });
  }, [students, search, department]);

  const active = filteredStudents.filter((s) => s.status === "Active").length;
  const graduated = filteredStudents.filter((s) => s.status === "Graduated").length;
  const suspended = filteredStudents.filter((s) => s.status === "Suspended").length;

  return (
    <section className="al-data-section">
      <div className="al-mini-stats">
        <div className="al-mini-stat stat-blue"><span><FaUsers /></span><div><b>{filteredStudents.length}</b><small>Total</small></div></div>
        <div className="al-mini-stat stat-green"><span><FaUserCheck /></span><div><b>{active}</b><small>Active</small></div></div>
        <div className="al-mini-stat stat-violet"><span><FaGraduationCap /></span><div><b>{graduated}</b><small>Graduated</small></div></div>
        <div className="al-mini-stat stat-red"><span><FaUserSlash /></span><div><b>{suspended}</b><small>Suspended</small></div></div>
      </div>

      <div className="al-toolbar">
        <div className="al-searchbox"><FaSearch /><input type="text" placeholder="Search ID, name, email or department..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <select className="al-compact-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>

      <div className="al-table-shell">
        <table className="al-table al-table-blue al-wide-table">
          <thead><tr>
            <th>Student ID</th><th>Full Name</th><th>Gender</th><th>Email</th><th>Phone</th>
            <th>Department</th><th>Program</th><th>Year</th><th>Semester</th><th>Section</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {filteredStudents.length === 0 ? <tr><td colSpan="12" className="al-empty-cell">No students found.</td></tr> :
              filteredStudents.map((student) => <tr key={student._id}>
                <td><span className="al-id-chip">{student.studentId}</span></td>
                <td className="al-strong-cell">{student.fullName}</td>
                <td>{student.gender || "—"}</td><td>{student.email || "—"}</td><td>{student.phone || "—"}</td>
                <td>{student.department || "—"}</td><td>{student.program || "—"}</td><td>{student.year || "—"}</td>
                <td>{student.semester || "—"}</td><td>{student.section || "—"}</td>
                <td><span className={`al-status ${student.status === "Active" ? "is-active" : student.status === "Graduated" ? "is-graduated" : "is-inactive"}`}>{student.status || "Unknown"}</span></td>
                <td><div className="al-row-actions">
                  <button className="al-icon-btn al-edit-btn" onClick={() => editStudent(student)} title="Edit student"><FaPen /></button>
                  <button className="al-icon-btn al-delete-btn" onClick={() => removeStudent(student._id)} title="Delete student"><FaTrash /></button>
                </div></td>
              </tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default StudentTable;
