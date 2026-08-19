import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import api from "../api";

function MyCourses() {
  const { user } = useContext(AuthContext);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyCourses();
  }, []);

  const loadMyCourses = async () => {
  try {
    const profileRes = await api.get(
      `/students/profile/${user.studentId}`
    );

    const profile = profileRes.data;

    const enrolledCourses = Array.isArray(profile.courses)
      ? profile.courses
      : [];

    const fullCourses = await Promise.all(
      enrolledCourses.map(async (course) => {
        if (typeof course === "object" && course.name) {
          return course;
        }

        const res = await api.get(`/courses/${course}`);
        return res.data;
      })
    );

    setCourses(fullCourses);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <Layout>
      <div
        style={{
          background:
            "linear-gradient(135deg,#1e40af,#2563eb,#3b82f6)",
          color: "#fff",
          padding: "40px",
          borderRadius: "20px",
          marginBottom: "30px",
        }}
      >
        <h1>My Courses</h1>

        <p>
          View all courses you are currently enrolled in.
        </p>
      </div>

      {loading ? (
        <h2>Loading...</h2>
      ) : courses.length === 0 ? (
        <div
          style={{
            background: "#fff",
            padding: "50px",
            borderRadius: "18px",
            textAlign: "center",
          }}
        >
          <h2>No enrolled courses.</h2>
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
          {courses.map((course) => (
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
                  {course.instructor?.fullName || "-"}
                </p>

                <p>
                  <strong>Semester:</strong>{" "}
                  {course.semester}
                </p>

                <p>
                  <strong>Study Year:</strong>{" "}
                  {course.studyYear}
                </p>

                <Link
                  to={`/course/${course._id}`}
                  style={{
                    display: "block",
                    marginTop: "20px",
                    textAlign: "center",
                    background: "#2563eb",
                    color: "#fff",
                    textDecoration: "none",
                    padding: "12px",
                    borderRadius: "10px",
                    fontWeight: "600",
                  }}
                >
                  View Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default MyCourses;