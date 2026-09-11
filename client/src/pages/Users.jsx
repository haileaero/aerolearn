import { useEffect, useMemo, useState } from "react";
import { useUI } from "../context/UIContext";
import { FaPlus, FaTimes, FaUsers, FaUserShield, FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";
import Layout from "../components/Layout";
import UserForm from "../components/UserForm";
import UserTable from "../components/UserTable";
import api from "../api";

function Users() {
  const { confirm, toast } = useUI();
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true); setError("");
      const response = await api.get("/users");
      setUsers(Array.isArray(response.data) ? response.data : response.data.users || []);
    } catch {
      setError("Unable to load users.");
    } finally { setLoading(false); }
  };

  const saveUser = async (user) => {
    try {
      setError(""); setMessage("");
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, user);
        setMessage("User updated successfully.");
        toast("User updated successfully.");
      } else {
        await api.post("/users", user);
        setMessage("User created successfully.");
        toast("User created successfully.");
      }
      setEditingUser(null); setShowForm(false); fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed.");
    }
  };

  const deleteUser = async (id) => {
    const approved = await confirm({ title: "Remove this account?", message: "The user will lose access to AeroLearn. This action should only be used when access must be removed.", confirmText: "Remove access" });
    if (!approved) return;
    try {
      await api.delete(`/users/${id}`);
      setMessage("User deleted successfully.");
      toast("User access removed.");
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete user.");
    }
  };

  const edit = (user) => { setEditingUser(user); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const stats = useMemo(() => ({
    total: users.length,
    admin: users.filter(u => u.role === "Admin").length,
    instructor: users.filter(u => u.role === "Instructor").length,
    student: users.filter(u => u.role === "Student").length,
  }), [users]);

  return (
    <Layout>
      <div className="al-control-page">
        <header className="al-control-header">
          <div><span className="al-eyebrow">ACCESS CONTROL</span><h1>User Management</h1><p>Accounts, roles and access in one compact workspace.</p></div>
          <button className={`al-primary-action ${showForm ? "is-close" : ""}`} onClick={() => { setShowForm(v => !v); setEditingUser(null); }}>
            {showForm ? <><FaTimes /> Close</> : <><FaPlus /> New User</>}
          </button>
        </header>

        <div className="al-kpi-ribbon">
          <div><span className="blue"><FaUsers /></span><b>{stats.total}</b><small>All users</small></div>
          <div><span className="violet"><FaUserShield /></span><b>{stats.admin}</b><small>Admins</small></div>
          <div><span className="orange"><FaChalkboardTeacher /></span><b>{stats.instructor}</b><small>Instructors</small></div>
          <div><span className="green"><FaUserGraduate /></span><b>{stats.student}</b><small>Students</small></div>
        </div>

        {message && <div className="al-notice success">{message}</div>}
        {error && <div className="al-notice error">{error}</div>}

        {showForm && <div className="al-collapsible-panel"><UserForm onSave={saveUser} editingUser={editingUser} /></div>}

        {loading ? <div className="al-loading-panel">Loading user directory…</div> :
          <UserTable users={users} editUser={edit} deleteUser={deleteUser} />}
      </div>
    </Layout>
  );
}
export default Users;
