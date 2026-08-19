import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CourseTable({
  courses,
  editCourse,
  removeCourse,
}) {
  const navigate = useNavigate();

  const [search, setSearch] =
    useState("");

  const courseList = Array.isArray(courses)
  ? courses
  : [];

const filteredCourses = courseList.filter((course) => {
      const keyword =
        search.toLowerCase();

      return (
        (course.code || "")
          .toLowerCase()
          .includes(keyword) ||

        (course.name || "")
          .toLowerCase()
          .includes(keyword) ||

        (course.department || "")
          .toLowerCase()
          .includes(keyword) ||

        (course.program || "")
          .toLowerCase()
          .includes(keyword) ||

        (course.year || "")
          .toLowerCase()
          .includes(keyword) ||

        (course.semester || "")
          .toLowerCase()
          .includes(keyword)
      );
    });

  return (
    <>
      <input
        type="text"
        placeholder="Search Courses..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "25px",
          borderRadius: "8px",
        }}
      />

      <table
        className="course-table"
      >
        <thead>
          <tr>
            <th>Code</th>

            <th>Course</th>

            <th>Department</th>

            <th>Program</th>

            <th>Year</th>

            <th>Semester</th>

            <th>Instructor</th>

            <th>Status</th>

            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredCourses.length ===
          0 ? (
            <tr>
              <td
                colSpan="9"
                style={{
                  textAlign:
                    "center",
                }}
              >
                No Courses Found
              </td>
            </tr>
          ) : (
            filteredCourses.map(
              (course) => (
                <tr
                  key={course._id}
                >
                  <td>
                    {course.code}
                  </td>

                  <td>
                    {course.name}
                  </td>

                  <td>
                    {
                      course.department
                    }
                  </td>

                  <td>
                    {course.program}
                  </td>

                  <td>
                    {course.year}
                  </td>

                  <td>
                    {
                      course.semester
                    }
                  </td>

                  <td>
                    {typeof course.instructor ===
                    "object"
                      ? course
                          .instructor
                          ?.fullName
                      : course.instructor}
                  </td>

                  <td>
                    {course.status}
                  </td>

                  <td
                    style={{
                      display:
                        "flex",
                      gap: "6px",
                    }}
                  >
                    <button
                      onClick={() =>
                        navigate(
                          `/course/${course._id}`
                        )
                      }
                    >
                      Open
                    </button>

                    <button
                      onClick={() =>
                        editCourse(
                          course
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      style={{
                        background:
                          "#dc3545",
                        color:
                          "white",
                      }}
                      onClick={() =>
                        removeCourse(
                          course._id
                        )
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            )
          )}
        </tbody>
      </table>
    </>
  );
}

export default CourseTable;