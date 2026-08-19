import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api";

import {
  FaClipboardCheck,
  FaUsers,
  FaChartBar,
  FaSearch,
  FaSave,
  FaGraduationCap,
} from "react-icons/fa";

function AssessmentScores() {
  const { id } = useParams();

  const [assessment, setAssessment] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadAssessment();
  }, []);
    const loadAssessment = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/assessment/${id}`);

      setAssessment(res.data);
    } catch (err) {
      console.log(err);

      setMessage("Unable to load assessment.");
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (index, value) => {
    const updated = { ...assessment };

    updated.scores[index].score = Number(value);

    setAssessment(updated);
  };

  const saveScores = async () => {
    try {
      setSaving(true);

      await api.put(
        `/assessment/${id}/scores`,
        {
          scores: assessment.scores,
        }
      );

      setMessage(
        "✅ Scores saved successfully."
      );
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Unable to save scores."
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!assessment) return [];

    return assessment.scores.filter((student) =>
      (
        student.student.fullName +
        student.student.studentId
      )
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [assessment, search]);

  const statistics = useMemo(() => {
    if (!assessment)
      return {
        total: 0,
        average: 0,
        highest: 0,
        lowest: 0,
        passRate: 0,
      };

    const scores =
      assessment.scores.map(
        (s) => Number(s.score) || 0
      );

    const total = scores.length;

    const average =
      total === 0
        ? 0
        : (
            scores.reduce(
              (a, b) => a + b,
              0
            ) / total
          ).toFixed(1);

    const highest =
      total === 0 ? 0 : Math.max(...scores);

    const lowest =
      total === 0 ? 0 : Math.min(...scores);

    const passRate =
      total === 0
        ? 0
        : Math.round(
            (scores.filter(
              (score) =>
                score >=
                assessment.totalMark * 0.5
            ).length /
              total) *
              100
          );

    return {
      total,
      average,
      highest,
      lowest,
      passRate,
    };
  }, [assessment]);
    if (loading) {
    return (
      <Layout>
        <div
          style={{
            background: "#fff",
            padding: "60px",
            borderRadius: "20px",
            textAlign: "center",
          }}
        >
          <h2>Loading assessment...</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>

      {/* ==========================
          Header
      ========================== */}

      <div
        style={{
          background:
            "linear-gradient(135deg,#2563eb,#3b82f6)",
          color: "#fff",
          padding: "35px",
          borderRadius: "20px",
          marginBottom: "30px",
          boxShadow:
            "0 12px 30px rgba(37,99,235,.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "25px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <FaClipboardCheck />

              {assessment.title}
            </h1>

            <p
              style={{
                marginTop: "15px",
                opacity: ".9",
              }}
            >
              {assessment.course?.code}
              {" • "}
              {assessment.course?.name}
            </p>
          </div>

          <div
            style={{
              background:
                "rgba(255,255,255,.15)",
              padding: "20px",
              borderRadius: "16px",
              textAlign: "center",
              minWidth: "180px",
            }}
          >
            <FaGraduationCap
              size={35}
            />

            <h2
              style={{
                margin: "10px 0 5px",
              }}
            >
              {assessment.totalMark}
            </h2>

            <small>Total Marks</small>
          </div>
        </div>
      </div>

      {/* ==========================
          Notification
      ========================== */}

      {message && (
        <div
          style={{
            background: "#ecfeff",
            color: "#0f766e",
            padding: "16px",
            borderRadius: "12px",
            marginBottom: "25px",
            border:
              "1px solid #99f6e4",
          }}
        >
          {message}
        </div>
      )}

      {/* ==========================
          Statistics
      ========================== */}

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
            padding: "25px",
            borderRadius: "16px",
            boxShadow:
              "0 8px 20px rgba(0,0,0,.08)",
          }}
        >
          <FaUsers
            color="#2563eb"
            size={28}
          />

          <h3>Students</h3>

          <h1>{statistics.total}</h1>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "16px",
            boxShadow:
              "0 8px 20px rgba(0,0,0,.08)",
          }}
        >
          <FaChartBar
            color="#16a34a"
            size={28}
          />

          <h3>Average</h3>

          <h1>{statistics.average}</h1>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "16px",
            boxShadow:
              "0 8px 20px rgba(0,0,0,.08)",
          }}
        >
          <FaGraduationCap
            color="#9333ea"
            size={28}
          />

          <h3>Highest</h3>

          <h1>{statistics.highest}</h1>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "16px",
            boxShadow:
              "0 8px 20px rgba(0,0,0,.08)",
          }}
        >
          <FaClipboardCheck
            color="#dc2626"
            size={28}
          />

          <h3>Pass Rate</h3>

          <h1>{statistics.passRate}%</h1>
        </div>
      </div>

      {/* ==========================
          Search
      ========================== */}

      <div
        style={{
          position: "relative",
          marginBottom: "30px",
        }}
      >
        <FaSearch
          style={{
            position: "absolute",
            left: "15px",
            top: "16px",
            color: "#666",
          }}
        />

        <input
          type="text"
          placeholder="Search student..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            width: "100%",
            padding:
              "14px 14px 14px 45px",
            borderRadius: "12px",
            border:
              "1px solid #ddd",
            fontSize: "15px",
          }}
        />
      </div>
            {/* ==========================
          Student Scores
      ========================== */}

      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          boxShadow:
            "0 8px 20px rgba(0,0,0,.08)",
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead
            style={{
              background: "#2563eb",
              color: "#fff",
            }}
          >
            <tr>
              <th style={{ padding: "16px" }}>
                Student
              </th>

              <th style={{ padding: "16px" }}>
                Student ID
              </th>

              <th style={{ padding: "16px" }}>
                Score
              </th>

              <th style={{ padding: "16px" }}>
                Percentage
              </th>

              <th style={{ padding: "16px" }}>
                Grade
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                  }}
                >
                  No students found.
                </td>
              </tr>
            ) : (
              filteredStudents.map(
                (student, index) => {
                  const percentage =
                    assessment.totalMark === 0
                      ? 0
                      : Math.round(
                          (student.score /
                            assessment.totalMark) *
                            100
                        );

                  let grade = "F";
                  let color = "#dc2626";

                  if (percentage >= 90) {
                    grade = "A";
                    color = "#16a34a";
                  } else if (
                    percentage >= 80
                  ) {
                    grade = "B";
                    color = "#2563eb";
                  } else if (
                    percentage >= 70
                  ) {
                    grade = "C";
                    color = "#ca8a04";
                  } else if (
                    percentage >= 50
                  ) {
                    grade = "D";
                    color = "#ea580c";
                  }

                  return (
                    <tr
                      key={
                        student.student._id
                      }
                      style={{
                        borderBottom:
                          "1px solid #eee",
                      }}
                    >
                      <td
                        style={{
                          padding: "18px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems:
                              "center",
                            gap: "15px",
                          }}
                        >
                          <div
                            style={{
                              width: "45px",
                              height: "45px",
                              borderRadius:
                                "50%",
                              background:
                                "#2563eb",
                              color: "#fff",
                              display: "flex",
                              justifyContent:
                                "center",
                              alignItems:
                                "center",
                              fontWeight:
                                "bold",
                            }}
                          >
                            {student.student.fullName
                              ?.split(" ")
                              .map(
                                (n) => n[0]
                              )
                              .join("")
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {
                                student.student
                                  .fullName
                              }
                            </strong>
                          </div>
                        </div>
                      </td>

                      <td
                        style={{
                          padding: "18px",
                        }}
                      >
                        {
                          student.student
                            .studentId
                        }
                      </td>

                      <td
                        style={{
                          padding: "18px",
                        }}
                      >
                        <input
                          type="number"
                          min="0"
                          max={
                            assessment.totalMark
                          }
                          value={
                            student.score
                          }
                          onChange={(e) =>
                            handleScoreChange(
                              index,
                              e.target.value
                            )
                          }
                          style={{
                            width: "90px",
                            padding: "10px",
                            borderRadius:
                              "8px",
                            border:
                              "1px solid #ccc",
                          }}
                        />
                      </td>

                      <td
                        style={{
                          padding: "18px",
                          fontWeight: "bold",
                        }}
                      >
                        {percentage}%
                      </td>

                      <td
                        style={{
                          padding: "18px",
                        }}
                      >
                        <span
                          style={{
                            background:
                              color,
                            color: "#fff",
                            padding:
                              "6px 14px",
                            borderRadius:
                              "20px",
                            fontWeight:
                              "bold",
                          }}
                        >
                          {grade}
                        </span>
                      </td>
                    </tr>
                  );
                }
              )
            )}
          </tbody>
        </table>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "25px",
            background: "#f8fafc",
          }}
        >
          <button
            onClick={saveScores}
            disabled={saving}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "14px 28px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <FaSave />

            {saving
              ? "Saving..."
              : "Save Scores"}
          </button>
        </div>
      </div>

    </Layout>
  );
}

export default AssessmentScores;