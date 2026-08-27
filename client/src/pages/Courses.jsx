import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import api from "../api";

function Courses() {
  const { user } = useContext(AuthContext);
  const emptyCourse = {
    code: "",
    name: "",
    description: "",
    creditHours: 3,
    semester: "Semester I",
    studyYear: "Year I",
    academicYear: new Date().getFullYear().toString(),
    department: "",
    instructor: "",
    thumbnail: "",
    status: "Active",
  };

  const [course, setCourse] = useState(emptyCourse);
  const [editingId, setEditingId] = useState(null);

  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadCourses();
    loadInstructors();
  }, []);

  const loadCourses = async () => {
    try {
      const res = await api.get("/courses");

      setCourses(
        Array.isArray(res.data)
          ? res.data
          : res.data.courses || []
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadInstructors = async () => {
    try {
      const res = await api.get("/users");

      const users = Array.isArray(res.data)
        ? res.data
        : res.data.users || [];

      setInstructors(
        users.filter(
          (u) => u.role === "Instructor"
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setCourse((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const saveCourse = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(
          `/courses/${editingId}`,
          course
        );
      } else {
        await api.post(
          "/courses",
          course
        );
      }

      setCourse(emptyCourse);
      setEditingId(null);
      loadCourses();

    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Unable to save course."
      );
    }
  };

  const editCourse = (selected) => {
    setEditingId(selected._id);

    setCourse({
      code: selected.code || "",
      name: selected.name || "",
      description: selected.description || "",
      creditHours: selected.creditHours || 3,
      semester: selected.semester || "Semester I",
      studyYear: selected.studyYear || "Year I",
      academicYear:
        selected.academicYear ||
        new Date().getFullYear().toString(),
      department: selected.department || "",
      instructor:
        typeof selected.instructor === "object"
          ? selected.instructor._id
          : selected.instructor || "",
      thumbnail: selected.thumbnail || "",
      status: selected.status || "Active",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteCourse = async (id) => {
    if (!window.confirm("Delete this course?"))
      return;

    try {
      await api.delete(`/courses/${id}`);
      loadCourses();
    } catch (err) {
      console.error(err);
      alert("Unable to delete course.");
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        c.name?.toLowerCase().includes(keyword) ||
        c.code?.toLowerCase().includes(keyword);

      const matchesDepartment =
        department === "" ||
        c.department === department;

      const matchesStatus =
        status === "" ||
        c.status === status;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus
      );
    });
  }, [
    courses,
    search,
    department,
    status,
  ]);

  return (
    <Layout>

      <div
        style={{
          background:
            "linear-gradient(135deg,#1e40af,#2563eb,#3b82f6)",
          color: "#fff",
          padding: "40px",
          borderRadius: "22px",
          marginBottom: "30px",
          boxShadow:
            "0 15px 35px rgba(37,99,235,.25)",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "38px",
            fontWeight: 700,
          }}
        >
          Course Management
        </h1>

        <p
          style={{
            marginTop: "12px",
            opacity: 0.9,
            fontSize: "16px",
          }}
        >
          Create, update and browse all university courses.
        </p>
      </div>

      <form
        onSubmit={saveCourse}
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "18px",
          marginBottom: "30px",
          boxShadow:
            "0 8px 20px rgba(0,0,0,.08)",
        }}
      >
        <h2 style={{ marginBottom: "25px" }}>
          {editingId
            ? "Update Course"
            : "Create New Course"}
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(250px,1fr))",
            gap: "18px",
          }}
        >
                    <input
            name="code"
            placeholder="Course Code"
            value={course.code}
            onChange={handleChange}
            required
          />

          <input
            name="name"
            placeholder="Course Name"
            value={course.name}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="creditHours"
            placeholder="Credit Hours"
            value={course.creditHours}
            onChange={handleChange}
          />

          <select
            name="semester"
            value={course.semester}
            onChange={handleChange}
          >
            <option>Semester I</option>
            <option>Semester II</option>
          </select>

          {/* NEW STUDY YEAR */}

          <select
            name="studyYear"
            value={course.studyYear}
            onChange={handleChange}
            required
          >
            <option>Year I</option>
            <option>Year II</option>
            <option>Year III</option>
            <option>Year IV</option>
            <option>Year V</option>
          </select>

          {/* Academic Year (Automatic) */}

          <input
            value={course.academicYear}
            readOnly
            style={{
              background: "#f8fafc",
              cursor: "not-allowed",
            }}
          />

          <select
            name="department"
            value={course.department}
            onChange={handleChange}
            required
          >
            <option value="">
              Select Department
            </option>

            <option>Aerospace Engineering</option>
            <option>Production Engineering</option>
            <option>Armament Engineering</option>
            <option>Computer Engineering</option>
            <option>Motor Vehicle Engineering</option>
            <option>Metallurgy and Materials Engineering</option>
            <option>Chemical Engineering</option>
            <option>Electrical Power Engineering</option>
            <option>Electronics Engineering</option>
            <option>Civil Engineering</option>
          </select>

          <select
            name="instructor"
            value={course.instructor}
            onChange={handleChange}
          >
            <option value="">
              Select Instructor
            </option>

            {instructors.map((inst) => (
              <option
                key={inst._id}
                value={inst._id}
              >
                {inst.fullName}
              </option>
            ))}
          </select>

          <select
            name="status"
            value={course.status}
            onChange={handleChange}
          >
            <option>Active</option>
            <option>Completed</option>
            <option>Archived</option>
          </select>

          <input
            name="thumbnail"
            placeholder="Thumbnail URL"
            value={course.thumbnail}
            onChange={handleChange}
          />
        </div>

        <textarea
          name="description"
          placeholder="Course Description"
          value={course.description}
          onChange={handleChange}
          style={{
            marginTop: "20px",
            width: "100%",
            minHeight: "120px",
          }}
        />

        <button
          type="submit"
          style={{
            marginTop: "20px",
          }}
        >
          {editingId
            ? "Update Course"
            : "Create Course"}
        </button>
      </form>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div className="summary-card">
          <h3>Total Courses</h3>
          <h1>{courses.length}</h1>
        </div>

        <div className="summary-card">
          <h3>Active</h3>
          <h1>
            {
              courses.filter(
                (c) => c.status === "Active"
              ).length
            }
          </h1>
        </div>

        <div className="summary-card">
          <h3>Completed</h3>
          <h1>
            {
              courses.filter(
                (c) => c.status === "Completed"
              ).length
            }
          </h1>
        </div>

        <div className="summary-card">
          <h3>Archived</h3>
          <h1>
            {
              courses.filter(
                (c) => c.status === "Archived"
              ).length
            }
          </h1>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          padding: "20px",
          marginBottom: "30px",
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr",
          gap: "15px",
        }}
      >
        <input
          placeholder="Search Course..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={department}
          onChange={(e) =>
            setDepartment(e.target.value)
          }
        >
          <option value="">
            All Departments
          </option>

          {[...new Set(
            courses.map((c) => c.department)
          )].map((dep) => (
            <option
              key={dep}
              value={dep}
            >
              {dep}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >
          <option value="">
            All Status
          </option>

          <option>Active</option>
          <option>Completed</option>
          <option>Archived</option>
        </select>
      </div>
            {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            background: "#fff",
            borderRadius: "18px",
          }}
        >
          <h2>Loading Courses...</h2>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div
          style={{
            background: "#fff",
            padding: "60px",
            borderRadius: "18px",
            textAlign: "center",
          }}
        >
          <h2>No Courses Found</h2>
          <p>Create your first course using the form above.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(340px,1fr))",
            gap: "25px",
          }}
        >
          {filteredCourses.map((course) => (
            <div
              key={course._id}
              style={{
                background: "#fff",
                borderRadius: "20px",
                overflow: "hidden",
                border: "1px solid #e5e7eb",
                boxShadow:
                  "0 10px 25px rgba(0,0,0,.08)",
              }}
            >
              <img
                src={
                  course.thumbnail ||
                  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200"
                }
                alt={course.name}
                style={{
                  width: "100%",
                  height: "220px",
                  objectFit: "cover",
                }}
              />

              <div style={{ padding: "24px" }}>
                <h2>{course.name}</h2>

                <p
                  style={{
                    color: "#64748b",
                    marginTop: "12px",
                    minHeight: "55px",
                  }}
                >
                  {course.description ||
                    "No description provided."}
                </p>

                <hr style={{ margin: "18px 0" }} />

                <p>
                  <strong>Course Code:</strong>{" "}
                  {course.code}
                </p>

                <p>
                  <strong>Department:</strong>{" "}
                  {course.department}
                </p>

                <p>
                  <strong>Instructor:</strong>{" "}
                  {course.instructor?.fullName ||
  (typeof course.instructor === "string"
    ? course.instructor
    : "-")}
                </p>

                <p>
                  <strong>Credit Hours:</strong>{" "}
                  {course.creditHours}
                </p>

                <p>
                  <strong>Semester:</strong>{" "}
                  {course.semester}
                </p>

                <p>
                  <strong>Study Year:</strong>{" "}
                  {course.studyYear}
                </p>

                <p>
                  <strong>Academic Year:</strong>{" "}
                  {course.academicYear}
                </p>

                <div
                  style={{
                    marginTop: "15px",
                    marginBottom: "20px",
                  }}
                >
                  <span
                    style={{
                      background:
                        course.status === "Active"
                          ? "#16a34a"
                          : course.status ===
                            "Completed"
                          ? "#2563eb"
                          : "#dc2626",
                      color: "#fff",
                      padding: "6px 15px",
                      borderRadius: "30px",
                      fontWeight: 600,
                      fontSize: "13px",
                    }}
                  >
                    {course.status}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  <Link
                    to={`/course/${course._id}`}
                    style={{
                      flex: 1,
                      background: "#2563eb",
                      color: "#fff",
                      textAlign: "center",
                      textDecoration: "none",
                      padding: "12px",
                      borderRadius: "10px",
                      fontWeight: 600,
                    }}
                  >
                    View
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      editCourse(course)
                    }
                    style={{
                      background: "#f59e0b",
                      color: "#fff",
                      border: "none",
                      padding: "12px",
                      borderRadius: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteCourse(course._id)
                    }
                    style={{
                      background: "#dc2626",
                      color: "#fff",
                      border: "none",
                      padding: "12px",
                      borderRadius: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default Courses;