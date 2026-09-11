import { FaBookOpen, FaClock, FaLayerGroup, FaUserTie } from "react-icons/fa";
import "./course.css";

function CourseHeader({ course }) {
  return (
    <div className="course-header course-header-pro">
      <img src={course.thumbnail || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1400"} alt={course.name} className="course-header-image" />
      <div className="course-overlay">
        <div className="course-header-topline">
          <span className="course-code">{course.code}</span>
          <span className="course-live-pill">● Active course</span>
        </div>
        <h1>{course.name}</h1>
        <p>{course.description || "Your complete course workspace for learning materials, assessments and progress."}</p>
        <div className="course-hero-meta">
          <span><FaUserTie /> {course.instructor?.fullName || "Course instructor"}</span>
          {course.creditHours && <span><FaClock /> {course.creditHours} credits</span>}
          {course.semester && <span><FaLayerGroup /> {course.semester}</span>}
          <span><FaBookOpen /> Learning workspace</span>
        </div>
      </div>
    </div>
  );
}

export default CourseHeader;
