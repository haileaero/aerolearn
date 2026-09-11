import { useEffect, useState } from "react";
import { useUI } from "../context/UIContext";
import { FaPlus, FaTimes } from "react-icons/fa";
import Layout from "../components/Layout";
import api from "../api";
import StudentForm from "../components/StudentForm";
import StudentTable from "../components/StudentTable";

function Students() {
  const { confirm, toast } = useUI();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true); setError("");
      const res = await api.get("/students");
      setStudents(Array.isArray(res.data) ? res.data : res.data.students || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load students.");
    } finally { setLoading(false); }
  };

  const addStudent = async (student) => {
    try { await api.post("/students", student); await fetchStudents(); setShowForm(false); toast("Student registered successfully."); }
    catch (err) { setError(err.response?.data?.message || "Failed to add student."); }
  };
  const updateStudent = async (student) => {
    try { await api.put(`/students/${student._id}`, student); await fetchStudents(); setEditingStudent(null); setShowForm(false); toast("Student record updated."); }
    catch (err) { setError(err.response?.data?.message || "Failed to update student."); }
  };
  const deleteStudent = async (id) => {
    const approved = await confirm({ title: "Delete student record?", message: "This removes the academic registry record from the current workspace.", confirmText: "Delete student" });
    if (!approved) return;
    try { await api.delete(`/students/${id}`); setStudents(prev => prev.filter(student => student._id !== id)); toast("Student record deleted."); }
    catch (err) { setError(err.response?.data?.message || "Failed to delete student."); }
  };
  const edit = (student) => { setEditingStudent(student); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <Layout>
      <div className="al-control-page">
        <header className="al-control-header">
          <div><span className="al-eyebrow">ACADEMIC REGISTRY</span><h1>Student Directory</h1><p>Enrollment records, academic placement and student status.</p></div>
          <button className={`al-primary-action ${showForm ? "is-close" : ""}`} onClick={() => { setShowForm(v => !v); setEditingStudent(null); }}>
            {showForm ? <><FaTimes /> Close</> : <><FaPlus /> Register Student</>}
          </button>
        </header>
        {error && <div className="al-notice error">{error}</div>}
        {showForm && <div className="al-collapsible-panel"><StudentForm key={editingStudent?._id || "new"} onAdd={addStudent} onUpdate={updateStudent} editingStudent={editingStudent} /></div>}
        {loading ? <div className="al-loading-panel">Loading student registry…</div> :
          <StudentTable students={students} removeStudent={deleteStudent} editStudent={edit} />}
      </div>
    </Layout>
  );
}
export default Students;
