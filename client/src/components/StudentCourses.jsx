import { Link } from "react-router-dom";
import { FaArrowRight, FaBookOpen, FaClock, FaLayerGroup, FaUserTie } from "react-icons/fa";

const fallbackImage = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200";

function StudentCourses({ courses = [] }) {
  return (
    <section className="student-courses-section">
      <div className="dashboard-section-head" style={{ marginBottom: "12px" }}>
        <div>
          <span className="student-eyebrow">Learning deck</span>
          <h2>My active courses</h2>
          <p>Everything you need for this semester, one click away.</p>
        </div>
        <span className="student-count-badge">{courses.length} enrolled</span>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state"><FaBookOpen style={{ marginRight: 8 }} />No courses assigned yet.</div>
      ) : (
        <div className="student-course-grid premium-course-grid">
          {courses.map((course, index) => {
            const image = course.thumbnail || fallbackImage;

            return (
              <article key={course._id} className={`student-course-card premium-course-card course-tone-${index % 4}`}>
                <div className="student-course-cover student-course-cover-complete">
                  <div
                    className="student-course-cover-backdrop"
                    style={{ backgroundImage: `url(${image})` }}
                    aria-hidden="true"
                  />
                  <img src={image} alt={course.name} />
                  <div className="course-cover-shade" />
                  <span className="student-course-code">{course.code || "COURSE"}</span>
                  <span className="course-status-dot">Active</span>
                </div>

                <div className="student-course-body">
                  <h3>{course.name}</h3>
                  <div className="course-compact-meta">
                    <span><FaUserTie /> {course.instructor?.fullName || "Instructor"}</span>
                    {course.creditHours && <span><FaClock /> {course.creditHours} credits</span>}
                    {course.semester && <span><FaLayerGroup /> {course.semester}</span>}
                  </div>
                  <div className="course-progress-line" aria-hidden="true"><span style={{ width: `${58 + (index % 4) * 8}%` }} /></div>
                  <div className="course-card-footer">
                    <small>Course workspace</small>
                    <Link className="student-course-link" to={`/course/${course._id}`}>
                      <span>Open course</span><FaArrowRight />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default StudentCourses;
