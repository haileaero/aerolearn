import { FaPen, FaTrash, FaSearch, FaUsers, FaUserCheck, FaGraduationCap, FaUserSlash, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const departments = [
  "Aerospace Engineering", "Production Engineering", "Armament Engineering",
  "Computer Engineering", "Motor Vehicle Engineering", "Metallurgy and Materials Engineering",
  "Chemical Engineering", "Electrical Power Engineering", "Electronics Engineering", "Civil Engineering"
];

function StudentTable({ students, statistics, pagination, filters, onFiltersChange, onPageChange, removeStudent, editStudent }) {
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.pages || 1;
  const total = pagination?.total || 0;
  const limit = pagination?.limit || 20;
  const start = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, total);

  const changeFilter = (key, value) => onFiltersChange({ ...filters, [key]: value });

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
    const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
    if (currentPage <= 3) [2, 3, 4].forEach((page) => pages.add(page));
    if (currentPage >= totalPages - 2) [totalPages - 3, totalPages - 2, totalPages - 1].forEach((page) => pages.add(page));
    return Array.from(pages).filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  };

  const pageNumbers = getPageNumbers();

  return (
    <section className="al-data-section">
      <div className="al-mini-stats">
        <div className="al-mini-stat stat-blue"><span><FaUsers /></span><div><b>{statistics?.totalStudents ?? total}</b><small>Total</small></div></div>
        <div className="al-mini-stat stat-green"><span><FaUserCheck /></span><div><b>{statistics?.activeStudents ?? 0}</b><small>Active</small></div></div>
        <div className="al-mini-stat stat-violet"><span><FaGraduationCap /></span><div><b>{statistics?.graduatedStudents ?? 0}</b><small>Graduated</small></div></div>
        <div className="al-mini-stat stat-red"><span><FaUserSlash /></span><div><b>{statistics?.suspendedStudents ?? 0}</b><small>Suspended</small></div></div>
      </div>

      <div className="al-toolbar">
        <div className="al-searchbox"><FaSearch /><input type="text" placeholder="Search ID, name, email or department..." value={filters?.search || ""} onChange={(e) => changeFilter("search", e.target.value)} /></div>
        <select className="al-compact-select" value={filters?.department || ""} onChange={(e) => changeFilter("department", e.target.value)}>
          <option value="">All Departments</option>{departments.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>

      <div className="al-table-meta"><span>{total === 0 ? "No students" : `Showing ${start}–${end} of ${total} students`}</span>{totalPages > 1 && <span>20 students per page</span>}</div>

      <div className="al-table-shell">
        <table className="al-table al-table-blue al-wide-table">
          <thead><tr><th>Student ID</th><th>Full Name</th><th>Gender</th><th>Email</th><th>Phone</th><th>Department</th><th>Program</th><th>Year</th><th>Semester</th><th>Section</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {students.length === 0 ? <tr><td colSpan="12" className="al-empty-cell">No students found.</td></tr> : students.map((student) => <tr key={student._id}>
              <td><span className="al-id-chip">{student.studentId}</span></td><td className="al-strong-cell">{student.fullName}</td><td>{student.gender || "—"}</td><td>{student.email || "—"}</td><td>{student.phone || "—"}</td><td>{student.department || "—"}</td><td>{student.program || "—"}</td><td>{student.year || "—"}</td><td>{student.semester || "—"}</td><td>{student.section || "—"}</td>
              <td><span className={`al-status ${student.status === "Active" ? "is-active" : student.status === "Graduated" ? "is-graduated" : "is-inactive"}`}>{student.status || "Unknown"}</span></td>
              <td><div className="al-row-actions"><button className="al-icon-btn al-edit-btn" onClick={() => editStudent(student)} title="Edit student"><FaPen /></button><button className="al-icon-btn al-delete-btn" onClick={() => removeStudent(student._id)} title="Delete student"><FaTrash /></button></div></td>
            </tr>)}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && <div className="al-pagination" aria-label="Student directory pagination">
        <button className="al-page-nav" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}><FaChevronLeft /><span>Previous</span></button>
        <div className="al-page-numbers">{pageNumbers.map((page, index) => { const previous = pageNumbers[index - 1]; const gap = previous && page - previous > 1; return <span key={page} className="al-page-group">{gap && <i>…</i>}<button className={page === currentPage ? "active" : ""} onClick={() => onPageChange(page)}>{page}</button></span>; })}</div>
        <button className="al-page-nav" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}><span>Next</span><FaChevronRight /></button>
      </div>}
    </section>
  );
}

export default StudentTable;
