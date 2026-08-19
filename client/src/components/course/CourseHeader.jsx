import "./course.css";

function CourseHeader({ course }) {
  return (
    <div className="course-header">

      <img
        src={
          course.thumbnail ||
          "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1400"
        }
        alt={course.name}
        className="course-header-image"
      />

      <div className="course-overlay">

        <span className="course-code">
          {course.code}
        </span>

        <h1>{course.name}</h1>

        <p>
          {course.description}
        </p>

      </div>

    </div>
  );
}

export default CourseHeader;