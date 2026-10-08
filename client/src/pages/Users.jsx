import { useEffect, useState } from "react";
import { useUI } from "../context/UIContext";
import {
  FaPlus,
  FaTimes,
  FaUsers,
  FaUserShield,
  FaChalkboardTeacher,
  FaUserGraduate,
} from "react-icons/fa";
import Layout from "../components/Layout";
import UserForm from "../components/UserForm";
import UserTable from "../components/UserTable";
import api from "../api";

const USERS_PER_PAGE = 20;

function Users() {
  const { confirm, toast } = useUI();

  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Server-side pagination/search.
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: USERS_PER_PAGE,
    total: 0,
    pages: 0,
  });

  // These values come from the whole database, not only the current page.
  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    instructors: 0,
    students: 0,
  });

  const fetchStats = async () => {
    try {
      const response = await api.get("/users/statistics");

      setStats({
        totalUsers: Number(response.data?.totalUsers) || 0,
        admins: Number(response.data?.admins) || 0,
        instructors: Number(response.data?.instructors) || 0,
        students: Number(response.data?.students) || 0,
      });
    } catch (err) {
      console.error("Unable to load user statistics:", err);
    }
  };

  const fetchUsers = async (requestedPage = page, requestedSearch = search) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users", {
        params: {
          page: requestedPage,
          limit: USERS_PER_PAGE,
          ...(requestedSearch.trim()
            ? { search: requestedSearch.trim() }
            : {}),
        },
      });

      const data = response.data || {};

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.users)
          ? data.users
          : [];

      const serverPagination = data.pagination || {
        page: requestedPage,
        limit: USERS_PER_PAGE,
        total: list.length,
        pages: list.length ? 1 : 0,
      };

      setUsers(list);
      setPagination({
        page: Number(serverPagination.page) || requestedPage,
        limit: Number(serverPagination.limit) || USERS_PER_PAGE,
        total: Number(serverPagination.total) || 0,
        pages: Number(serverPagination.pages) || 0,
      });

      // If a deletion makes the current page disappear, move back
      // automatically to the last available page.
      const availablePages = Number(serverPagination.pages) || 0;

      if (
        availablePages > 0 &&
        requestedPage > availablePages
      ) {
        setPage(availablePages);
      }

      if (
        availablePages === 0 &&
        requestedPage !== 1
      ) {
        setPage(1);
      }
    } catch (err) {
      console.error("Unable to load users:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load the requested page whenever page or search changes.
  useEffect(() => {
    fetchUsers(page, search);
  }, [page, search]);

  // Load global statistics once and refresh them after create/update/delete.
  useEffect(() => {
    fetchStats();
  }, []);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const saveUser = async (user) => {
    try {
      setError("");
      setMessage("");

      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, user);

        setMessage("User updated successfully.");
        toast("User updated successfully.");
      } else {
        await api.post("/users", user);

        setMessage("User created successfully.");
        toast("User created successfully.");

        // Newly-created users are easiest to find from page 1.
        setPage(1);
      }

      setEditingUser(null);
      setShowForm(false);

      await fetchStats();
      await fetchUsers(
        editingUser ? page : 1,
        search
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Operation failed."
      );
    }
  };

  const deleteUser = async (id) => {
    const approved = await confirm({
      title: "Remove this account?",
      message:
        "The user will lose access to AeroLearn. This action should only be used when access must be removed.",
      confirmText: "Remove access",
    });

    if (!approved) return;

    try {
      setError("");

      await api.delete(`/users/${id}`);

      setMessage("User deleted successfully.");
      toast("User access removed.");

      await fetchStats();

      // Re-read the current page. fetchUsers will move to the
      // previous page automatically if this was the final row.
      await fetchUsers(page, search);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete user."
      );
    }
  };

  const edit = (user) => {
    setEditingUser(user);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Layout>
      <div className="al-control-page">

        <header className="al-control-header">
          <div>
            <span className="al-eyebrow">
              ACCESS CONTROL
            </span>

            <h1>User Management</h1>

            <p>
              Accounts, roles and access in one
              compact workspace.
            </p>
          </div>

          <button
            className={`al-primary-action ${
              showForm ? "is-close" : ""
            }`}
            onClick={() => {
              setShowForm((value) => !value);
              setEditingUser(null);
              setMessage("");
              setError("");
            }}
          >
            {showForm ? (
              <>
                <FaTimes /> Close
              </>
            ) : (
              <>
                <FaPlus /> New User
              </>
            )}
          </button>
        </header>

        <div className="al-kpi-ribbon">

          <div>
            <span className="blue">
              <FaUsers />
            </span>
            <b>{stats.totalUsers}</b>
            <small>All users</small>
          </div>

          <div>
            <span className="violet">
              <FaUserShield />
            </span>
            <b>{stats.admins}</b>
            <small>Admins</small>
          </div>

          <div>
            <span className="orange">
              <FaChalkboardTeacher />
            </span>
            <b>{stats.instructors}</b>
            <small>Instructors</small>
          </div>

          <div>
            <span className="green">
              <FaUserGraduate />
            </span>
            <b>{stats.students}</b>
            <small>Students</small>
          </div>

        </div>

        {message && (
          <div className="al-notice success">
            {message}
          </div>
        )}

        {error && (
          <div className="al-notice error">
            {error}
          </div>
        )}

        {showForm && (
          <div className="al-collapsible-panel">
            <UserForm
              onSave={saveUser}
              editingUser={editingUser}
            />
          </div>
        )}

        {loading ? (
          <div className="al-loading-panel">
            Loading user directory…
          </div>
        ) : (
          <UserTable
            users={users}
            editUser={edit}
            deleteUser={deleteUser}
            search={search}
            onSearch={handleSearch}
            pagination={pagination}
            onPageChange={setPage}
          />
        )}

      </div>
    </Layout>
  );
}

export default Users;
