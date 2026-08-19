import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api";

function ViewResults() {

  const departments = [
    "Aerospace Engineering",
    "Armament Engineering",
    "Computer Engineering",
    "Software Engineering",
    "Information Technology",
    "Computer Science",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
  ];

  const [courses, setCourses] = useState([]);
  const [assessments, setAssessments] = useState([]);

  const [department, setDepartment] = useState("");
  const [course, setCourse] = useState("");
  const [assessment, setAssessment] = useState("");

  const [selectedAssessment, setSelectedAssessment] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (assessment) {
      loadAssessment();
    } else {
      setSelectedAssessment(null);
    }
  }, [assessment]);

  const loadData = async () => {
    try {

      const [courseRes, assessmentRes] =
        await Promise.all([
          api.get("/courses"),
          api.get("/assessment"),
        ]);

      setCourses(
        Array.isArray(courseRes.data.courses)
          ? courseRes.data.courses
          : []
      );

      setAssessments(
        Array.isArray(assessmentRes.data)
          ? assessmentRes.data
          : []
      );

    } catch (err) {
      console.error(err);
    }
  };

  const loadAssessment = async () => {
    try {

      const res =
        await api.get(`/assessment/${assessment}`);

      setSelectedAssessment(res.data);

    } catch (err) {
      console.error(err);
    }
  };

  const filteredCourses =
    courses.filter(
      (c) =>
        c.department === department
    );

  const filteredAssessments =
    assessments.filter((a) => {

      if (!a.course) return false;

      if (typeof a.course === "object") {
        return a.course._id === course;
      }

      return a.course === course;

    });

  return (
    <Layout>

      <div
        style={{
          background:
            "linear-gradient(135deg,#2563eb,#3b82f6)",
          color: "#fff",
          padding: "35px",
          borderRadius: "20px",
          marginBottom: "30px",
        }}
      >
        <h1>Assessment Results</h1>

        <p>
          View submitted student scores.
        </p>
      </div>
            <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "18px",
          boxShadow: "0 8px 20px rgba(0,0,0,.08)",
        }}
      >

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,minmax(250px,1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >

          {/* Department */}

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Department
            </label>

            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setCourse("");
                setAssessment("");
              }}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
              }}
            >
              <option value="">
                Select Department
              </option>

              {departments.map((dept) => (
                <option
                  key={dept}
                  value={dept}
                >
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Course */}

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Course
            </label>

            <select
              value={course}
              onChange={(e) => {
                setCourse(e.target.value);
                setAssessment("");
              }}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
              }}
            >
              <option value="">
                Select Course
              </option>

              {filteredCourses.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                >
                  {item.code} - {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assessment */}

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Assessment
            </label>

            <select
              value={assessment}
              onChange={(e) =>
                setAssessment(e.target.value)
              }
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
              }}
            >
              <option value="">
                Select Assessment
              </option>

              {filteredAssessments.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                >
                  {item.title || item.category}
                </option>
              ))}
            </select>
          </div>

        </div>

        {!selectedAssessment ? (

          <div
            style={{
              padding: "50px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            <h2>No Assessment Selected</h2>

            <p>
              Select an assessment to view results.
            </p>
          </div>

        ) : (

          <div
            style={{
              overflowX: "auto",
            }}
          >

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
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
                    Student Name
                  </th>

                  <th style={{ padding: "14px" }}>
                    Score
                  </th>

                  <th style={{ padding: "14px" }}>
                    Total
                  </th>

                  <th style={{ padding: "14px" }}>
                    Percentage
                  </th>

                  <th style={{ padding: "14px" }}>
                    Result
                  </th>
                </tr>

              </thead>

              <tbody>

                {selectedAssessment.scores.map((item) => {

                  const percentage =
                    (
                      item.score /
                      selectedAssessment.totalMark
                    ) * 100;

                  return (

                    <tr key={item.student._id}>

                      <td
                        style={{
                          padding: "14px",
                          borderBottom:
                            "1px solid #e5e7eb",
                        }}
                      >
                        {item.student.studentId}
                      </td>

                      <td
                        style={{
                          padding: "14px",
                          borderBottom:
                            "1px solid #e5e7eb",
                        }}
                      >
                        {item.student.fullName}
                      </td>

                      <td
                        style={{
                          padding: "14px",
                          borderBottom:
                            "1px solid #e5e7eb",
                        }}
                      >
                        {item.score}
                      </td>

                      <td
                        style={{
                          padding: "14px",
                          borderBottom:
                            "1px solid #e5e7eb",
                        }}
                      >
                        {selectedAssessment.totalMark}
                      </td>

                      <td
                        style={{
                          padding: "14px",
                          borderBottom:
                            "1px solid #e5e7eb",
                        }}
                      >
                        {percentage.toFixed(1)}%
                      </td>

                      <td
                        style={{
                          padding: "14px",
                          borderBottom:
                            "1px solid #e5e7eb",
                          fontWeight: "700",
                          color:
                            percentage >= 50
                              ? "#16a34a"
                              : "#dc2626",
                        }}
                      >
                        {percentage >= 50
                          ? "PASS"
                          : "FAIL"}
                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </Layout>
  );
}

export default ViewResults;