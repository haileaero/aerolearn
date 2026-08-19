import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api";
import StudentForm from "../components/StudentForm";
import StudentTable from "../components/StudentTable";

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingStudent, setEditingStudent] =
    useState(null);
useEffect(() => {
  console.log("editingStudent:", editingStudent);
}, [editingStudent]);
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/students");

console.log("Students API:", res.data);

setStudents(
  Array.isArray(res.data)
    ? res.data
    : res.data.students || []
);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load students."
      );
    } finally {
      setLoading(false);
    }
  };

 const addStudent = async (student) => {
  try {
    await api.post("/students", student);

    // Reload the students from the server
    await fetchStudents();
  } catch (err) {
    console.error(err);

    alert(
      err.response?.data?.message ||
      "Failed to add student."
    );
  }
};
  const updateStudent = async (student) => {
  try {
    await api.put(
      `/students/${student._id}`,
      student
    );

    await fetchStudents();

    setEditingStudent(null);
  } catch (err) {
    console.error(err);

    alert(
      err.response?.data?.message ||
      "Failed to update student."
    );
  }
};
  const deleteStudent = async (id) => {
    try {
      await api.delete(`/students/${id}`);

      setStudents((prev) =>
        prev.filter(
          (student) => student._id !== id
        )
      );
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Failed to delete student."
      );
    }
  };

  return (
    <Layout>
      <h1>Students</h1>

      {loading && <p>Loading students...</p>}

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
        <StudentForm
  key={editingStudent?._id || "new"}
  onAdd={addStudent}
  onUpdate={updateStudent}
  editingStudent={editingStudent}
/>

          <StudentTable
            students={students}
            removeStudent={deleteStudent}
            editStudent={setEditingStudent}
          />
        </>
      )}
    </Layout>
  );
}

export default Students;