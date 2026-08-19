import { useEffect, useState } from "react";
import api from "../api";

function CourseForm({
  onSave,
  editingCourse,
}) {
  const emptyCourse = {
    code: "",
    name: "",
    department: "",
    program: "",
    year: "",
    semester: "",
    creditHours: 3,
    academicYear: "2026",
    instructor: "",
    description: "",
    status: "Active",

    schedule: {
      days: "",
      time: "",
      room: "",
    },
  };

  const [course, setCourse] =
    useState(emptyCourse);

  const [instructors, setInstructors] =
    useState([]);

  useEffect(() => {
    loadInstructors();
  }, []);

  useEffect(() => {
    if (editingCourse) {
      setCourse({
        ...emptyCourse,
        ...editingCourse,
        schedule: {
          ...emptyCourse.schedule,
          ...(editingCourse.schedule || {}),
        },
      });
    } else {
      setCourse(emptyCourse);
    }
  }, [editingCourse]);

  const loadInstructors = async () => {
    try {
      const res = await api.get(
        "/users/instructors"
      );

      setInstructors(res.data);

    } catch (error) {

      console.log(error);

    }
  };

  const handleChange = (e) => {

    setCourse({
      ...course,
      [e.target.name]: e.target.value,
    });

  };

  const handleSchedule = (e) => {

    setCourse({
      ...course,
      schedule: {
        ...course.schedule,
        [e.target.name]:
          e.target.value,
      },
    });

  };

  const submit = async (e) => {

    e.preventDefault();

    if (
      !course.code ||
      !course.name ||
      !course.department ||
      !course.program ||
      !course.year ||
      !course.semester ||
      !course.instructor
    ) {
      alert(
        "Please complete all required fields."
      );
      return;
    }

    await onSave(course);

    if (!editingCourse) {
      setCourse(emptyCourse);
    }

  };

  return (
    <form
      className="course-form"
      onSubmit={submit}
    >

      <h2
        style={{
          marginBottom: "25px",
        }}
      >
        {editingCourse
          ? "Edit Course"
          : "Create Course"}
      </h2>

      <input
        name="code"
        placeholder="Course Code"
        value={course.code}
        onChange={handleChange}
      />

      <input
        name="name"
        placeholder="Course Name"
        value={course.name}
        onChange={handleChange}
      />

      <select
        name="department"
        value={course.department}
        onChange={handleChange}
      >
        <option value="">
          Select Department
        </option>

        <option>
          Aeronautical Engineering
        </option>

        <option>
          Mechanical Engineering
        </option>

        <option>
          Electrical Engineering
        </option>

        <option>
          Civil Engineering
        </option>

        <option>
          Computer Science
        </option>

        <option>
          Information Technology
        </option>

      </select>

      <select
        name="program"
        value={course.program}
        onChange={handleChange}
      >
        <option value="">
          Select Program
        </option>

        <option>
          Undergraduate
        </option>

        <option>
          Masters
        </option>

        <option>
          PhD
        </option>

      </select>

      <select
        name="year"
        value={course.year}
        onChange={handleChange}
      >
        <option value="">
          Select Year
        </option>

        <option>
          Year I
        </option>

        <option>
          Year II
        </option>

        <option>
          Year III
        </option>

        <option>
          Year IV
        </option>

        <option>
          Year V
        </option>

      </select>

      <select
        name="semester"
        value={course.semester}
        onChange={handleChange}
      >
        <option value="">
          Select Semester
        </option>

        <option>
          Semester I
        </option>

        <option>
          Semester II
        </option>

        <option>
          Summer
        </option>

      </select>

      <input
        type="number"
        name="creditHours"
        placeholder="Credit Hours"
        value={course.creditHours}
        onChange={handleChange}
      />

     

      <select
        name="instructor"
        value={course.instructor}
        onChange={handleChange}
      >
        <option value="">
          Select Instructor
        </option>

        {instructors.map(
          (instructor) => (
            <option
              key={instructor._id}
              value={instructor._id}
            >
              {instructor.fullName}
            </option>
          )
        )}

      </select>

      <select
        name="status"
        value={course.status}
        onChange={handleChange}
      >
        <option>
          Active
        </option>

        <option>
          Completed
        </option>

        <option>
          Archived
        </option>

      </select>

      <input
        name="days"
        placeholder="Days"
        value={course.schedule.days}
        onChange={handleSchedule}
      />

      <input
        name="time"
        placeholder="Time"
        value={course.schedule.time}
        onChange={handleSchedule}
      />

      <input
        name="room"
        placeholder="Room"
        value={course.schedule.room}
        onChange={handleSchedule}
      />

      <textarea
        rows="5"
        name="description"
        placeholder="Course Description"
        value={course.description}
        onChange={handleChange}
        style={{
          gridColumn:
            "1 / -1",
          padding: "12px",
        }}
      />

      <button
        type="submit"
      >
        {editingCourse
          ? "Update Course"
          : "Create Course"}
      </button>

    </form>
  );
}

export default CourseForm;