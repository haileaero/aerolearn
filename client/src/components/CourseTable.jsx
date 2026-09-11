import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaExternalLinkAlt, FaPen, FaTrash } from "react-icons/fa";

function CourseTable({ courses, editCourse, removeCourse }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredCourses = useMemo(() => {
    const keyword = search.toLowerCase();
    return (Array.isArray(courses) ? courses : []).filter((course) =>
      [course.code, course.name, course.department, course.program, course.year, course.semester]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [courses, search]);

  return (
    <section className="al-data-section">
      <div className="al-toolbar">
        <div className="al-searchbox">
          <FaSearch />
          <input
            type="text"
            placeholder="Search code, course, department, program, year..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="al-count-pill">{filteredCourses.length} courses</div>
      </div>

      <div className="al-table-shell">
        <table className="al-table al-table-blue">
          <thead>
            <tr>
              <th>Code</th><th>Course</th><th>Department</th><th>Program</th>
              <th>Year</th><th>Semester</th><th>Instructor</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.length === 0 ? (
              <tr><td colSpan="9" className="al-empty-cell">No courses found.</td></tr>
            ) : filteredCourses.map((course) => (
              <tr key={course._id}>
                <td><span className="al-id-chip">{course.code}</span></td>
                <td className="al-strong-cell">{course.name}</td>
                <td>{course.department || "—"}</td>
                <td>{course.program || "—"}</td>
                <td>{course.year || "—"}</td>
                <td>{course.semester || "—"}</td>
                <td>{typeof course.instructor === "object" ? course.instructor?.fullName : course.instructor || "—"}</td>
                <td><span className={`al-status ${String(course.status).toLowerCase() === "active" ? "is-active" : "is-inactive"}`}>{course.status || "Unknown"}</span></td>
                <td>
                  <div className="al-row-actions">
                    <button className="al-icon-btn al-open-btn" onClick={() => navigate(`/course/${course._id}`)} title="Open course"><FaExternalLinkAlt /></button>
                    <button className="al-icon-btn al-edit-btn" onClick={() => editCourse(course)} title="Edit course"><FaPen /></button>
                    <button className="al-icon-btn al-delete-btn" onClick={() => removeCourse(course._id)} title="Delete course"><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default CourseTable;
