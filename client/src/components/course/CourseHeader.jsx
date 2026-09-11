import { FaBookOpen, FaClock, FaLayerGroup, FaUserTie } from "react-icons/fa";
import "./course.css";

const fallbackImage = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1400";

function CourseHeader({ course }) {
  const image = course.thumbnail || fallbackImage;

  return (
    <section className="course-identity-hero">
      <div className="course-identity-copy">
        <div className="course-header-topline">
          <span className="course-code">{course.code || "COURSE"}</span>
          <span className="course-live-pill">● Active course</span>
        </div>

        <div className="course-identity-kicker">Student course workspace</div>
        <h1>{course.name}</h1>
        <p className="course-identity-intro">
          Everything for this course in one place — learning materials, assessments, attendance and progress.
        </p>

        <div className="course-hero-meta">
          <span><FaUserTie /> {course.instructor?.fullName || "Course instructor"}</span>
          {course.creditHours && <span><FaClock /> {course.creditHours} credits</span>}
          {course.semester && <span><FaLayerGroup /> {course.semester}</span>}
          <span><FaBookOpen /> Learning workspace</span>
        </div>
      </div>

      <div className="course-identity-visual" aria-label={`${course.name} course image`}>
        <div
          className="course-identity-visual-backdrop"
          style={{ backgroundImage: `url(${image})` }}
          aria-hidden="true"
        />
        <img src={image} alt={course.name} />
        <div className="course-identity-visual-badge">Course cover</div>
      </div>
    </section>
  );
}

export default CourseHeader;
