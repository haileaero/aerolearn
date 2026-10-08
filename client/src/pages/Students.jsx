import { useEffect, useState } from "react";
import { useUI } from "../context/UIContext";
import { FaPlus, FaTimes } from "react-icons/fa";
import Layout from "../components/Layout";
import api from "../api";
import StudentForm from "../components/StudentForm";
import StudentTable from "../components/StudentTable";

const PAGE_SIZE = 20;

function Students() {
  const { confirm, toast } = useUI();
  const [students, setStudents] = useState([]);
  const [statistics, setStatistics] = useState({ totalStudents: 0, activeStudents: 0, graduatedStudents: 0, suspendedStudents: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, pages: 1 });
  const [filters, setFilters] = useState({ search: "", department: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchStatistics = async () => {
    try {
      const res = await api.get("/students/statistics");
      setStatistics(res.data?.summary || {});
    } catch (err) {
      console.error("Failed to load student statistics", err);
    }
  };

  const fetchStudents = async (requestedPage = pagination.page, nextFilters = filters) => {
    try {
      setLoading(true); setError("");
      const params = { page: requestedPage, limit: PAGE_SIZE };
      if (nextFilters.search.trim()) params.search = nextFilters.search.trim();
      if (nextFilters.department) params.department = nextFilters.department;
      const res = await api.get("/students", { params });
      const data = res.data || {};
      setStudents(Array.isArray(data.students) ? data.students : Array.isArray(data) ? data : []);
      setPagination({
        page: Number(data.pagination?.page) || requestedPage,
        limit: Number(data.pagination?.limit) || PAGE_SIZE,
        total: Number(data.pagination?.total) || 0,
        pages: Math.max(1, Number(data.pagination?.pages) || 1),
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load students.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(1, filters); fetchStatistics(); }, []);

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters);
    fetchStudents(1, nextFilters);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.pages || page === pagination.page) return;
    fetchStudents(page, filters);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addStudent = async (student) => {
    try { await api.post("/students", student); await Promise.all([fetchStudents(1, filters), fetchStatistics()]); setShowForm(false); toast("Student registered successfully."); }
    catch (err) { setError(err.response?.data?.message || "Failed to add student."); }
  };

  const updateStudent = async (student) => {
    try { await api.put(`/students/${student._id}`, student); await Promise.all([fetchStudents(pagination.page, filters), fetchStatistics()]); setEditingStudent(null); setShowForm(false); toast("Student record updated."); }
    catch (err) { setError(err.response?.data?.message || "Failed to update student."); }
  };

  const deleteStudent = async (id) => {
    const approved = await confirm({ title: "Delete student record?", message: "This removes the academic registry record from the current workspace.", confirmText: "Delete student" });
    if (!approved) return;
    try {
      await api.delete(`/students/${id}`);
      const nextPage = students.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page;
      await Promise.all([fetchStudents(nextPage, filters), fetchStatistics()]);
      toast("Student record deleted.");
    } catch (err) { setError(err.response?.data?.message || "Failed to delete student."); }
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
          <StudentTable students={students} statistics={statistics} pagination={pagination} filters={filters} onFiltersChange={handleFiltersChange} onPageChange={handlePageChange} removeStudent={deleteStudent} editStudent={edit} />}
      </div>
    </Layout>
  );
}
export default Students;
