import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api";

function SubmitAssessment() {
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
  const [students, setStudents] = useState([]);

  const [department, setDepartment] = useState("");
  const [course, setCourse] = useState("");
  const [assessment, setAssessment] = useState("");

  const [scores, setScores] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (course) {
      loadStudents();
    } else {
      setStudents([]);
      setScores([]);
    }
  }, [course]);

  const loadData = async () => {
    try {
      setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const res = await api.get(`/courses/${course}`);

      const studentList = res.data.students || [];

      setStudents(studentList);

      setScores(
        studentList.map((student) => ({
          student: student._id,
          score: "",
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCourses = courses.filter(
    (c) => c.department === department
  );

  const filteredAssessments = assessments.filter(
    (a) => {
      if (!a.course) return false;

      if (typeof a.course === "object") {
        return a.course._id === course;
      }

      return a.course === course;
    }
  );

  const handleScoreChange = (index, value) => {
    const updated = [...scores];

    updated[index].score = value;

    setScores(updated);
  };

  const saveScores = async () => {
    if (!assessment) {
      alert("Please select an assessment.");
      return;
    }

    try {
      setSaving(true);

     await api.put(`/assessment/${assessment}/scores`, {
  scores,
});

      alert("Scores saved successfully.");
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Unable to save scores."
      );
    } finally {
      setSaving(false);
    }
  };

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
        <h1
          style={{
            margin: 0,
            fontSize: "38px",
          }}
        >
          Submit Assessment
        </h1>

        <p
          style={{
            marginTop: "10px",
            opacity: 0.9,
          }}
        >
          Select a department, course and assessment,
          then submit student scores.
        </p>
      </div>

      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "18px",
          boxShadow:
            "0 8px 20px rgba(0,0,0,.08)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3,minmax(250px,1fr))",
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
                color: "#374151",
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
                color: "#374151",
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
                color: "#374151",
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

        <hr style={{ marginBottom: "30px" }} />

        {!assessment ? (

          <div
            style={{
              textAlign: "center",
              padding: "50px",
              color: "#64748b",
            }}
          >
            <h2>No Assessment Selected</h2>

            <p>
              Select a department, course and
              assessment to load students.
            </p>
          </div>

        ) : (

          <>

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
                  <th
                    style={{
                      padding: "14px",
                    }}
                  >
                    Student ID
                  </th>

                  <th
                    style={{
                      padding: "14px",
                    }}
                  >
                    Student Name
                  </th>

                  <th
                    style={{
                      padding: "14px",
                    }}
                  >
                    Score
                  </th>
                </tr>

              </thead>

              <tbody>

                {students.map((student, index) => (

                  <tr key={student._id}>

                    <td
                      style={{
                        padding: "14px",
                        borderBottom:
                          "1px solid #e5e7eb",
                      }}
                    >
                      {student.studentId}
                    </td>

                    <td
                      style={{
                        padding: "14px",
                        borderBottom:
                          "1px solid #e5e7eb",
                      }}
                    >
                      {student.fullName}
                    </td>

                    <td
                      style={{
                        padding: "14px",
                        borderBottom:
                          "1px solid #e5e7eb",
                      }}
                    >
                      <input
                        type="number"
                        min="0"
                        value={
                          scores[index]?.score || ""
                        }
                        onChange={(e) =>
                          handleScoreChange(
                            index,
                            e.target.value
                          )
                        }
                        style={{
                          width: "100px",
                          padding: "10px",
                          borderRadius: "8px",
                          border:
                            "1px solid #d1d5db",
                        }}
                      />
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "30px",
              }}
            >
              <button
                onClick={saveScores}
                disabled={saving}
                style={{
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  padding: "14px 40px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "16px",
                }}
              >
                {saving
                  ? "Saving..."
                  : "Save Scores"}
              </button>
            </div>

          </>

        )}

      </div>

    </Layout>
  );
}

export default SubmitAssessment;