import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api";

import {
  FaClipboardList,
  FaSearch,
  FaBook,
  FaPlus,
  FaTrash,
  FaClipboardCheck,
  FaCalendarAlt,
  FaChartBar,
  FaLayerGroup,
  FaPercentage,
  FaStar,
} from "react-icons/fa";

function Assessment() {
  const navigate = useNavigate();

  /* =====================================================
      STATES
  ===================================================== */

  const [courses, setCourses] = useState([]);
  const [assessments, setAssessments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  const [form, setForm] = useState({
    department: "",
    course: "",
    title: "",
    category: "Quiz",
    week: 1,
    dueDate: "",
    totalMark: 100,
    weight: 10,
    description: "",
  });

  /* =====================================================
      LOAD DATA
  ===================================================== */

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [courseRes, assessmentRes] =
        await Promise.all([
          api.get("/courses"),
          api.get("/assessment"),
        ]);

      setCourses(
        Array.isArray(courseRes.data.courses)
          ? courseRes.data.courses
          : Array.isArray(courseRes.data)
          ? courseRes.data
          : []
      );

      setAssessments(
        Array.isArray(assessmentRes.data)
          ? assessmentRes.data
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load assessment data."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
      HANDLE INPUT
  ===================================================== */

  const handleChange = (e) => {
  const { name, value } = e.target;

  setForm((prev) => ({
    ...prev,
    [name]: value,

    ...(name === "department"
      ? { course: "" }
      : {}),

    ...(name === "category"
      ? { title: "" }
      : {}),
  }));
};

  /* =====================================================
      SAVE ASSESSMENT
  ===================================================== */

  const saveAssessment = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await api.post("/assessment", form);

      setMessage(
        "Assessment created successfully."
      );

      setForm({
        department: "",
        course: "",
        title: "",
        category: "Quiz",
        week: 1,
        dueDate: "",
        totalMark: 100,
        weight: 10,
        description: "",
      });

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to create assessment."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
      DELETE
  ===================================================== */

  const deleteAssessment = async (id) => {
    if (
      !window.confirm(
        "Delete this assessment?"
      )
    )
      return;

    try {
      await api.delete(`/assessment/${id}`);

      setMessage(
        "Assessment deleted successfully."
      );

      loadData();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to delete assessment."
      );
    }
  };

  /* =====================================================
      SEARCH
  ===================================================== */

  const filteredAssessments = useMemo(() => {
    return assessments.filter((assessment) => {
      const text = `
        ${assessment.title || ""}
        ${assessment.category || ""}
        ${assessment.course?.code || ""}
        ${assessment.course?.name || ""}
      `
        .toLowerCase()
        .trim();

      return text.includes(
        search.toLowerCase()
      );
    });
  }, [assessments, search]);

  /* =====================================================
      STATISTICS
  ===================================================== */

  const stats = useMemo(() => {
    return {
      total: assessments.length,

      quizzes: assessments.filter(
        (a) => a.category === "Quiz"
      ).length,

      assignments: assessments.filter(
        (a) => a.category === "Assignment"
      ).length,

      exams: assessments.filter(
        (a) =>
          a.category === "Mid Exam" ||
          a.category === "Final Exam"
      ).length,
    };
  }, [assessments]);

  return (
    <Layout>

      {/* ==========================
          PAGE HEADER
      =========================== */}

      <div
        style={{
          background:
            "linear-gradient(135deg,#2563eb,#3b82f6)",
          color: "#fff",
          borderRadius: "22px",
          padding: "35px",
          marginBottom: "30px",
          boxShadow:
            "0 12px 30px rgba(37,99,235,.22)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "38px",
                fontWeight: "700",
              }}
            >
              <FaClipboardList
                style={{
                  marginRight: "12px",
                }}
              />
              Assessment Management
            </h1>

            <p
              style={{
                marginTop: "12px",
                fontSize: "17px",
                opacity: .95,
              }}
            >
              Create and manage quizzes,
              assignments,
              laboratories,
              projects and examinations.
            </p>
          </div>

          <div
            style={{
              background:
                "rgba(255,255,255,.18)",
              padding: "22px",
              borderRadius: "18px",
              textAlign: "center",
              minWidth: "170px",
            }}
          >
            <FaChartBar size={34} />

            <h2
              style={{
                margin:
                  "10px 0 5px",
              }}
            >
              {stats.total}
            </h2>

            <small>
              Total Assessments
            </small>
          </div>
        </div>
      </div>
            {/* ==========================
          NOTIFICATIONS
      =========================== */}

      {message && (
        <div
          style={{
            background: "#dcfce7",
            color: "#166534",
            padding: "16px",
            borderRadius: "14px",
            marginBottom: "22px",
            fontWeight: "600",
          }}
        >
          ✅ {message}
        </div>
      )}

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "16px",
            borderRadius: "14px",
            marginBottom: "22px",
            fontWeight: "600",
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* ==========================
          STATISTICS
      =========================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "22px",
          marginBottom: "30px",
        }}
      >
        {[
          {
            icon: (
              <FaClipboardList
                size={30}
                color="#2563eb"
              />
            ),
            title: "Total Assessments",
            value: stats.total,
          },
          {
            icon: (
              <FaClipboardCheck
                size={30}
                color="#7c3aed"
              />
            ),
            title: "Quizzes",
            value: stats.quizzes,
          },
          {
            icon: (
              <FaBook
                size={30}
                color="#16a34a"
              />
            ),
            title: "Assignments",
            value: stats.assignments,
          },
          {
            icon: (
              <FaCalendarAlt
                size={30}
                color="#dc2626"
              />
            ),
            title: "Exams",
            value: stats.exams,
          },
        ].map((item, index) => (
          <div
            key={index}
            style={{
              background: "#fff",
              borderRadius: "18px",
              padding: "25px",
              boxShadow:
                "0 10px 25px rgba(0,0,0,.08)",
            }}
          >
            {item.icon}

            <h3
              style={{
                marginTop: "15px",
                color: "#475569",
              }}
            >
              {item.title}
            </h3>

            <h1
              style={{
                margin: 0,
                color: "#1e293b",
              }}
            >
              {item.value}
            </h1>
          </div>
        ))}
      </div>

      {/* ==========================
          SEARCH
      =========================== */}

      <div
        style={{
          position: "relative",
          marginBottom: "35px",
        }}
      >
        <FaSearch
          style={{
            position: "absolute",
            top: "17px",
            left: "18px",
            color: "#94a3b8",
          }}
        />

        <input
          type="text"
          placeholder="Search assessments..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            width: "100%",
            padding:
              "15px 18px 15px 48px",
            borderRadius: "14px",
            border: "1px solid #d1d5db",
            fontSize: "15px",
          }}
        />
      </div>

      {/* ==========================
          CREATE ASSESSMENT
      =========================== */}

      <form
        onSubmit={saveAssessment}
        style={{
          background: "#fff",
          padding: "35px",
          borderRadius: "22px",
          boxShadow:
            "0 12px 30px rgba(0,0,0,.08)",
          marginBottom: "40px",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(280px,1fr))",
          gap: "22px",
        }}
      >

        {/* Department */}

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "700",
            }}
          >
            Department *
          </label>

          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "15px",
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
              fontWeight: "700",
            }}
          >
            Course *
          </label>

          <select
            name="course"
            value={form.course}
            onChange={handleChange}
            required
            disabled={!form.department}
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              background:
                !form.department
                  ? "#f3f4f6"
                  : "#fff",
            }}
          >
            <option value="">
              {form.department
                ? "Select Course"
                : "Select Department First"}
            </option>

            {courses
              .filter(
                (course) =>
                  course.department ===
                  form.department
              )
              .map((course) => (
                <option
                  key={course._id}
                  value={course._id}
                >
                  {course.code} - {course.name}
                </option>
              ))}
          </select>
        </div>

        {/* Assessment Title */}

       

        {/* Category */}

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "700",
            }}
          >
            Category *
          </label>

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
            }}
          >
            <option>Quiz</option>
            <option>Assignment</option>
            <option>Lab</option>
            <option>Project</option>
            <option>Mid Exam</option>
            <option>Final Exam</option>
          </select>
        </div>
        <div>
  <label
    style={{
      display: "block",
      marginBottom: "8px",
      fontWeight: "700",
    }}
  >
    Assessment Name *
  </label>

  <select
    name="title"
    value={form.title}
    onChange={handleChange}
    required
    style={{
      width: "100%",
      padding: "15px",
      borderRadius: "12px",
      border: "1px solid #d1d5db",
    }}
  >
    <option value="">Select Assessment</option>

    {form.category === "Quiz" &&
      [1,2,3,4,5,6,7,8].map((n)=>(
        <option key={n} value={`Quiz ${n}`}>
          Quiz {n}
        </option>
      ))}

    {form.category === "Assignment" &&
      [1,2,3,4,5,6,7,8].map((n)=>(
        <option key={n} value={`Assignment ${n}`}>
          Assignment {n}
        </option>
      ))}

    {form.category === "Lab" &&
      [1,2,3,4,5,6,7,8].map((n)=>(
        <option key={n} value={`Laboratory ${n}`}>
          Laboratory {n}
        </option>
      ))}

    {form.category === "Project" &&
      [1,2,3,4].map((n)=>(
        <option key={n} value={`Project ${n}`}>
          Project {n}
        </option>
      ))}

    {form.category === "Mid Exam" && (
      <option value="Mid Exam">
        Mid Exam
      </option>
    )}

    {form.category === "Final Exam" && (
      <option value="Final Exam">
        Final Exam
      </option>
    )}
  </select>
</div>
                {/* Week */}

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "700",
            }}
          >
            Week *
          </label>

          <input
            type="number"
            name="week"
            min="1"
            max="16"
            value={form.week}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
            }}
          />
        </div>

        {/* Due Date */}

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "700",
            }}
          >
            Due Date *
          </label>

          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
            }}
          />
        </div>

        {/* Total Marks */}

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "700",
            }}
          >
            Total Marks *
          </label>

          <input
            type="number"
            name="totalMark"
            min="1"
            value={form.totalMark}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
            }}
          />
        </div>

        {/* Weight */}

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "700",
            }}
          >
            Weight (%) *
          </label>

          <input
            type="number"
            name="weight"
            min="1"
            max="100"
            value={form.weight}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
            }}
          />
        </div>

        {/* Description */}

        <div
          style={{
            gridColumn: "1 / -1",
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "700",
            }}
          >
            Description
          </label>

          <textarea
            name="description"
            rows="5"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter assessment description..."
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              resize: "vertical",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            gridColumn: "1 / -1",
            background:
              "linear-gradient(135deg,#2563eb,#1d4ed8)",
            color: "#fff",
            border: "none",
            padding: "16px",
            borderRadius: "14px",
            fontSize: "16px",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <FaPlus />

          {saving
            ? "Creating Assessment..."
            : "Create Assessment"}
        </button>

      </form>

      {/* ======================================
            ASSESSMENT LIST
      ====================================== */}

      {loading ? (

        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "60px",
            textAlign: "center",
          }}
        >
          <h2>Loading assessments...</h2>
        </div>

      ) : filteredAssessments.length === 0 ? (

        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "70px",
            textAlign: "center",
          }}
        >
          <FaClipboardList
            size={65}
            color="#cbd5e1"
          />

          <h2
            style={{
              marginTop: "20px",
            }}
          >
            No Assessments Found
          </h2>

          <p
            style={{
              color: "#64748b",
            }}
          >
            Create your first assessment.
          </p>

        </div>

      ) : (

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(360px,1fr))",
            gap: "25px",
          }}
        >
          {filteredAssessments.map(
            (assessment) => (

              <div
                key={assessment._id}
                style={{
                  background: "#fff",
                  borderRadius: "18px",
                  padding: "24px",
                  boxShadow:
                    "0 10px 25px rgba(0,0,0,.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                    }}
                  >
                    {assessment.title}
                  </h2>

                  <span
                    style={{
                      background:
                        "#dbeafe",
                      color: "#2563eb",
                      padding:
                        "6px 12px",
                      borderRadius:
                        "20px",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
                    {assessment.category}
                  </span>
                </div>

                <hr
                  style={{
                    margin:
                      "18px 0",
                  }}
                />

                <p>
                  <strong>Course:</strong>{" "}
                  {typeof assessment.course === "object"
                    ? `${assessment.course?.code} - ${assessment.course?.name}`
                    : assessment.course}
                </p>

                <p>
                  <strong>Week:</strong>{" "}
                  {assessment.week}
                </p>

                <p>
                  <strong>Total Marks:</strong>{" "}
                  {assessment.totalMark}
                </p>

                <p>
                  <strong>Weight:</strong>{" "}
                  {assessment.weight}%
                </p>

                <p>
                  <strong>Due Date:</strong>{" "}
                  {assessment.dueDate
                    ? new Date(
                        assessment.dueDate
                      ).toLocaleDateString()
                    : "-"}
                </p>

                {assessment.description && (
                  <p
                    style={{
                      color:
                        "#64748b",
                      lineHeight:
                        "1.6",
                    }}
                  >
                    {assessment.description}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginTop: "24px",
                  }}
                >
                  <button
                    onClick={() =>
                      navigate(
                        `/assessment/${assessment._id}/scores`
                      )
                    }
                    style={{
                      flex: 1,
                      background:
                        "#2563eb",
                      color: "#fff",
                      border: "none",
                      padding:
                        "12px",
                      borderRadius:
                        "10px",
                      cursor:
                        "pointer",
                      fontWeight:
                        "700",
                    }}
                  >
                    Enter Scores
                  </button>

                  <button
                    onClick={() =>
                      deleteAssessment(
                        assessment._id
                      )
                    }
                    style={{
                      background:
                        "#dc2626",
                      color: "#fff",
                      border: "none",
                      padding:
                        "12px 16px",
                      borderRadius:
                        "10px",
                      cursor:
                        "pointer",
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            )
          )}
        </div>

      )}

    </Layout>
  );
}

export default Assessment;