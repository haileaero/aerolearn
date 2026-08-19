import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import UserForm from "../components/UserForm";
import UserTable from "../components/UserTable";
import api from "../api";

function Users() {
  const [users, setUsers] =
    useState([]);

  const [editingUser, setEditingUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users");

console.log("Users API:", response.data);

setUsers(
  Array.isArray(response.data)
    ? response.data
    : response.data.users || []
);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  const saveUser = async (user) => {
    try {
      setError("");
      setMessage("");

      if (editingUser) {
        await api.put(
          `/users/${editingUser._id}`,
          user
        );

        setMessage(
          "User updated successfully."
        );

        setEditingUser(null);
      } else {
        await api.post(
          "/users",
          user
        );

        setMessage(
          "User created successfully."
        );
      }

      fetchUsers();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Operation failed."
      );
    }
  };

  const deleteUser = async (id) => {
    if (
      !window.confirm(
        "Delete this user?"
      )
    )
      return;

    try {
      await api.delete(
        `/users/${id}`
      );

      setMessage(
        "User deleted successfully."
      );

      fetchUsers();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to delete user."
      );
    }
  };

  return (
    <Layout>
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <h1
          className="page-title"
          style={{
            marginBottom: "25px",
          }}
        >
          👥 User Management
        </h1>

        {message && (
          <div
            style={{
              background: "#dcfce7",
              color: "#166534",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "20px",
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
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            ❌ {error}
          </div>
        )}

        <UserForm
          onSave={saveUser}
          editingUser={editingUser}
        />

        {loading ? (
          <div
            style={{
              background: "#fff",
              padding: "40px",
              borderRadius: "12px",
              textAlign: "center",
              marginTop: "25px",
            }}
          >
            Loading users...
          </div>
        ) : (
          <UserTable
            users={users}
            editUser={setEditingUser}
            deleteUser={deleteUser}
          />
        )}
      </div>
    </Layout>
  );
}

export default Users;