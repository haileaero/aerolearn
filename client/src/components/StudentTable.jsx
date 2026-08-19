import { useMemo, useState } from "react";

function StudentTable({
  students,
  removeStudent,
  editStudent,
}) {
  const [search, setSearch] =
    useState("");

  const [department, setDepartment] =
    useState("");

  const filteredStudents = useMemo(() => {
  const studentList = Array.isArray(students)
    ? students
    : [];

  return studentList.filter((student) => {
        const keyword =
          search.toLowerCase();

        const matchesSearch =
          student.fullName
            ?.toLowerCase()
            .includes(keyword) ||
          student.studentId
            ?.toLowerCase()
            .includes(keyword) ||
          student.email
            ?.toLowerCase()
            .includes(keyword) ||
          student.department
            ?.toLowerCase()
            .includes(keyword);

        const matchesDepartment =
          department === "" ||
          student.department ===
            department;

        return (
          matchesSearch &&
          matchesDepartment
        );
      });
    }, [
      students,
      search,
      department,
    ]);

  const total =
    filteredStudents.length;

  const active =
    filteredStudents.filter(
      (s) => s.status === "Active"
    ).length;

  const graduated =
    filteredStudents.filter(
      (s) =>
        s.status === "Graduated"
    ).length;

  const suspended =
    filteredStudents.filter(
      (s) =>
        s.status === "Suspended"
    ).length;

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "22px",
            borderRadius: "14px",
            textAlign: "center",
            boxShadow:
              "0 5px 15px rgba(0,0,0,.08)",
          }}
        >
          <h4>Total Students</h4>
          <h1>{total}</h1>
        </div>

        <div
          style={{
            background: "#dcfce7",
            padding: "22px",
            borderRadius: "14px",
            textAlign: "center",
          }}
        >
          <h4>Active</h4>
          <h1>{active}</h1>
        </div>

        <div
          style={{
            background: "#dbeafe",
            padding: "22px",
            borderRadius: "14px",
            textAlign: "center",
          }}
        >
          <h4>Graduated</h4>
          <h1>{graduated}</h1>
        </div>

        <div
          style={{
            background: "#fee2e2",
            padding: "22px",
            borderRadius: "14px",
            textAlign: "center",
          }}
        >
          <h4>Suspended</h4>
          <h1>{suspended}</h1>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          marginBottom: "25px",
        }}
      >
        <input
          type="text"
          placeholder="Search by ID, name, email or department..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            flex: 2,
            padding: "12px",
            borderRadius: "10px",
            border:
              "1px solid #ddd",
          }}
        />

        <select
          value={department}
          onChange={(e) =>
            setDepartment(
              e.target.value
            )
          }
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "10px",
          }}
        >
          <option value="">
            All Departments
          </option>

          <option>
            Aerospace Engineering
          </option>

          <option>
            Production Engineering
          </option>

          <option>
            Armament Engineering
          </option>

          <option>
            Computer Engineering
          </option>

          <option>
            Motor Vehicle Engineering
          </option>

          <option>
            Metallurgy and Materials Engineering
          </option>

          <option>
            Chemical Engineering
          </option>

          <option>
            Electrical Power Engineering
          </option>

          <option>
            Electronics Engineering
          </option>

          <option>
            Civil Engineering
          </option>
        </select>
      </div>

      <div
        style={{
          overflowX: "auto",
          background: "#fff",
          borderRadius: "15px",
          boxShadow:
            "0 5px 15px rgba(0,0,0,.08)",
        }}
      >
        <table
          className="student-table"
          style={{
            width: "100%",
            borderCollapse:
              "collapse",
          }}
        >
                    <thead>
            <tr
              style={{
                background: "#2563eb",
                color: "#fff",
              }}
            >
              <th style={{ padding: "14px" }}>
                Student ID
              </th>

              <th style={{ padding: "14px" }}>
                Full Name
              </th>

              <th style={{ padding: "14px" }}>
                Gender
              </th>

              <th style={{ padding: "14px" }}>
                Email
              </th>

              <th style={{ padding: "14px" }}>
                Phone
              </th>

              <th style={{ padding: "14px" }}>
                Department
              </th>

              <th style={{ padding: "14px" }}>
                Program
              </th>

              <th style={{ padding: "14px" }}>
                Year
              </th>

              <th style={{ padding: "14px" }}>
                Semester
              </th>

              <th style={{ padding: "14px" }}>
                Section
              </th>

              <th style={{ padding: "14px" }}>
                Status
              </th>

              <th style={{ padding: "14px" }}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.length ===
            0 ? (
              <tr>
                <td
                  colSpan="12"
                  style={{
                    padding: "30px",
                    textAlign: "center",
                    color: "#777",
                  }}
                >
                  No students found.
                </td>
              </tr>
            ) : (
              filteredStudents.map(
                (student) => (
                  <tr
                    key={student._id}
                    style={{
                      borderBottom:
                        "1px solid #eee",
                    }}
                  >
                    <td
                      style={{
                        padding: "14px",
                      }}
                    >
                      {student.studentId}
                    </td>

                    <td
                      style={{
                        padding: "14px",
                        fontWeight: "600",
                      }}
                    >
                      {student.fullName}
                    </td>

                    <td
                      style={{
                        padding: "14px",
                      }}
                    >
                      {student.gender}
                    </td>

                    <td
                      style={{
                        padding: "14px",
                      }}
                    >
                      {student.email}
                    </td>

                    <td
                      style={{
                        padding: "14px",
                      }}
                    >
                      {student.phone}
                    </td>

                    <td
                      style={{
                        padding: "14px",
                      }}
                    >
                      {student.department}
                    </td>

                    <td
                      style={{
                        padding: "14px",
                      }}
                    >
                      {student.program}
                    </td>

                    <td
                      style={{
                        padding: "14px",
                      }}
                    >
                      {student.year}
                    </td>

                    <td
                      style={{
                        padding: "14px",
                      }}
                    >
                      {student.semester}
                    </td>

                    <td
                      style={{
                        padding: "14px",
                      }}
                    >
                      {student.section}
                    </td>

                    <td
                      style={{
                        padding: "14px",
                      }}
                    >
                      <span
                        style={{
                          padding:
                            "6px 14px",
                          borderRadius:
                            "20px",
                          color: "#fff",
                          fontWeight:
                            "600",
                          background:
                            student.status ===
                            "Active"
                              ? "#16a34a"
                              : student.status ===
                                "Graduated"
                              ? "#2563eb"
                              : "#dc2626",
                        }}
                      >
                        {student.status}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: "14px",
                      }}
                    >
                                            <button
                        onClick={() =>
                          editStudent(student)
                        }
                        style={{
                          background:
                            "#2563eb",
                          color: "#fff",
                          border: "none",
                          padding:
                            "8px 14px",
                          borderRadius:
                            "8px",
                          cursor: "pointer",
                          marginRight:
                            "10px",
                          fontWeight:
                            "600",
                        }}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          removeStudent(
                            student._id
                          )
                        }
                        style={{
                          background:
                            "#dc2626",
                          color: "#fff",
                          border: "none",
                          padding:
                            "8px 14px",
                          borderRadius:
                            "8px",
                          cursor: "pointer",
                          fontWeight:
                            "600",
                        }}
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
      </div>
    </>
  );
}

export default StudentTable;