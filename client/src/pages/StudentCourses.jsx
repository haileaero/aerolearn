import { Link } from "react-router-dom";
import { FaBook } from "react-icons/fa";

function StudentCourses({ courses }) {
  return (
    <div style={{ marginBottom: "35px" }}>
      <h2 style={{ marginBottom: "20px" }}>
        📚 My Courses
      </h2>

      {courses.length === 0 ? (
        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "40px",
            textAlign: "center",
          }}
        >
          No courses assigned.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(320px,1fr))",
            gap: "20px",
          }}
        >
          {courses.map((course) => (
            <div
              key={course._id}
              style={{
                background: "#fff",
                borderRadius: "18px",
                overflow: "hidden",
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
                  height: "170px",
                  objectFit: "cover",
                }}
              />

              <div style={{ padding: "20px" }}>
                <h3>{course.name}</h3>

                <p
                  style={{
                    color: "#64748b",
                    margin: "10px 0",
                  }}
                >
                  {course.code}
                </p>

                <Link
                  to={`/course/${course._id}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "15px",
                    background: "#2563eb",
                    color: "#fff",
                    textDecoration: "none",
                    padding: "10px 18px",
                    borderRadius: "10px",
                    fontWeight: "600",
                  }}
                >
                  <FaBook />
                  Open Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentCourses;