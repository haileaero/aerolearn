import { useEffect, useState } from "react";
import api from "../api";

function UserForm({ onSave, editingUser }) {
  const emptyUser = {
    fullName: "",
    email: "",
    password: "",
    role: "Student",
    department: "",
    studentId: "",
    employeeId: "",
    phone: "",
  };

  const [user, setUser] = useState(emptyUser);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (editingUser) {
      setUser({
        ...emptyUser,
        ...editingUser,
        password: "",
      });
    } else {
      setUser(emptyUser);
    }
  }, [editingUser]);

  const loadDepartments = async () => {
    try {
      const res = await api.get("/departments");

      setDepartments(
        Array.isArray(res.data)
          ? res.data
          : res.data.departments || []
      );
    } catch (err) {
      console.error("Failed to load departments", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "role") {
      setUser((prev) => ({
        ...prev,
        role: value,
        studentId:
          value === "Student"
            ? prev.studentId
            : "",
        employeeId:
          value !== "Student"
            ? prev.employeeId
            : "",
      }));
      return;
    }

    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (
      !user.fullName ||
      !user.email ||
      (!editingUser && !user.password)
    ) {
      alert("Please fill all required fields.");
      return;
    }

    await onSave(user);

    if (!editingUser) {
      setUser(emptyUser);
    }
  };

  return (
    <form
      onSubmit={submit}
      style={{
        background: "#fff",
        padding: "25px",
        borderRadius: "12px",
        marginBottom: "30px",
      }}
    >
      <h2>
        {editingUser
          ? "Update User"
          : "Create User"}
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(250px,1fr))",
          gap: "15px",
        }}
      >
        <input
          name="fullName"
          placeholder="Full Name"
          value={user.fullName}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={user.email}
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder={
            editingUser
              ? "Leave blank to keep current password"
              : "Password"
          }
          value={user.password}
          onChange={handleChange}
        />

        <select
          name="role"
          value={user.role}
          onChange={handleChange}
        >
          <option value="Admin">Admin</option>
          <option value="Instructor">
            Instructor
          </option>
          <option value="Student">
            Student
          </option>
        </select>

        <select
  name="department"
  value={user.department}
  onChange={handleChange}
>
  <option value="">
    Select Department
  </option>

  <option value="Aerospace Engineering">
    Aerospace Engineering
  </option>

  <option value="Production Engineering">
    Production Engineering
  </option>

  <option value="Armament Engineering">
    Armament Engineering
  </option>

  <option value="Computer Engineering">
    Computer Engineering
  </option>

  <option value="Motor Vehicle Engineering">
    Motor Vehicle Engineering
  </option>

  <option value="Metallurgy and Materials Engineering">
    Metallurgy and Materials Engineering
  </option>

  <option value="Chemical Engineering">
    Chemical Engineering
  </option>

  <option value="Electrical Power Engineering">
    Electrical Power Engineering
  </option>

  <option value="Electronics Engineering">
    Electronics Engineering
  </option>

  <option value="Civil Engineering">
    Civil Engineering
  </option>
</select>

        {user.role === "Student" && (
          <input
            name="studentId"
            placeholder="Student ID"
            value={user.studentId}
            onChange={handleChange}
          />
        )}

        {user.role !== "Student" && (
          <input
            name="employeeId"
            placeholder="Employee ID"
            value={user.employeeId}
            onChange={handleChange}
          />
        )}

        <input
          name="phone"
          placeholder="Phone"
          value={user.phone}
          onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        style={{
          marginTop: "20px",
        }}
      >
        {editingUser
          ? "Update User"
          : "Create User"}
      </button>
    </form>
  );
}

export default UserForm;