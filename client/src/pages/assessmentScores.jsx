import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaClipboardCheck,
  FaSave,
  FaSearch,
  FaUsers,
} from "react-icons/fa";
import Layout from "../components/Layout";
import api from "../api";
import "../styles/workspace.css";

function AssessmentScores() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAssessment = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/assessment/${id}`);
        setAssessment(response.data);
        setScores(
          (response.data.scores || []).map((item) => ({
            student: item.student?._id || item.student,
            studentData: item.student,
            score: item.score === 0 ? "" : item.score,
            remark: item.remark || "",
          }))
        );
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load this score sheet.");
      } finally {
        setLoading(false);
      }
    };
    loadAssessment();
  }, [id]);

  const maxScore = Number(assessment?.totalMark) || 100;
  const entered = scores.filter((item) => item.score !== "").length;
  const average = entered
    ? scores.reduce((sum, item) => sum + (item.score === "" ? 0 : Number(item.score) || 0), 0) / entered
    : 0;

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return scores
      .map((item, index) => ({ ...item, sourceIndex: index }))
      .filter((item) => `${item.studentData?.studentId || ""} ${item.studentData?.fullName || ""}`.toLowerCase().includes(term));
  }, [scores, search]);

  const updateScore = (index, value) => {
    if (value !== "") {
      const numeric = Number(value);
      if (numeric < 0 || numeric > maxScore) return;
    }
    setScores((prev) => prev.map((item, i) => (i === index ? { ...item, score: value } : item)));
  };

  const saveScores = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const payload = scores.map((item) => ({
        student: item.student,
        score: item.score === "" ? 0 : Number(item.score),
        remark: item.remark || "",
      }));
      await api.put(`/assessment/${id}/scores`, { scores: payload });
      setMessage("Score sheet saved successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save scores.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Layout><div className="score-sheet-loading">Opening score sheet…</div></Layout>;
  }

  return (
    <Layout>
      <div className="score-command-page">
        <nav className="ops-flow assessment-flow" aria-label="Academic operations">
          <span><b>1</b> Attendance</span><span><b>2</b> Assessment</span><span className="active"><b>3</b> Scores</span><span><b>4</b> Results</span><span><b>5</b> Resources</span>
        </nav>

        <header className="score-command-head">
          <div className="score-title-wrap">
            <button className="score-back" onClick={() => navigate("/assessment")} title="Back to assessments"><FaArrowLeft /></button>
            <div><span className="al-eyebrow">SCORE ENTRY</span><h1>{assessment?.title || "Assessment"}</h1><p>{assessment?.course?.code ? `${assessment.course.code} — ${assessment.course.name}` : assessment?.category} · Week {assessment?.week} · {assessment?.weight}% course contribution</p></div>
          </div>
          <button className="score-save-main" onClick={saveScores} disabled={saving}><FaSave /> {saving ? "Saving…" : "Save score sheet"}</button>
        </header>

        {message && <div className="message-strip success">✓ {message}</div>}
        {error && <div className="message-strip error">{error}</div>}

        <div className="score-kpis">
          <div><span><FaUsers /></span><strong>{scores.length}</strong><small>Students</small></div>
          <div><span><FaCheckCircle /></span><strong>{entered}</strong><small>Entered</small></div>
          <div><span className="pending-dot">•</span><strong>{Math.max(scores.length - entered, 0)}</strong><small>Remaining</small></div>
          <div><span className="percent-symbol">%</span><strong>{average.toFixed(1)}</strong><small>Class average</small></div>
        </div>

        <section className="score-sheet-card">
          <div className="score-sheet-toolbar">
            <div><h2><FaClipboardCheck /> Student score sheet</h2><span>Enter {maxScore === 100 ? "percentage scores" : `scores out of ${maxScore}`} for each student.</span></div>
            <div className="score-sheet-search"><FaSearch /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student or ID" /></div>
          </div>

          {scores.length === 0 ? (
            <div className="assessment-empty"><strong>No students on this assessment</strong><span>The course needs enrolled students before scores can be entered.</span></div>
          ) : (
            <div className="score-table-wrap">
              <table className="score-entry-table">
                <thead><tr><th>#</th><th>Student ID</th><th>Student</th><th>{maxScore === 100 ? "Score (%)" : `Score / ${maxScore}`}</th><th>Status</th></tr></thead>
                <tbody>
                  {filtered.map((item, displayIndex) => (
                    <tr key={item.student || displayIndex}>
                      <td>{displayIndex + 1}</td>
                      <td><span className="table-id">{item.studentData?.studentId || "—"}</span></td>
                      <td><strong>{item.studentData?.fullName || "Student"}</strong></td>
                      <td><div className="score-input-wrap"><input type="number" min="0" max={maxScore} step="0.1" value={item.score} onChange={(e) => updateScore(item.sourceIndex, e.target.value)} placeholder="0" /><span>{maxScore === 100 ? "%" : `/ ${maxScore}`}</span></div></td>
                      <td>{item.score !== "" ? <span className="pill pill-green">Entered</span> : <span className="pill pill-amber">Pending</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="score-sheet-footer">
            <span>{entered} of {scores.length} students completed</span>
            <button onClick={saveScores} disabled={saving}><FaSave /> {saving ? "Saving…" : "Save all scores"}</button>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default AssessmentScores;
