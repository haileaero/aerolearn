import { useState } from "react";

function GradeForm({ onAdd }) {
  const [grade, setGrade] = useState({
    student: "",
    course: "",
    quiz: "",
    assignment: "",
    mid: "",
    final: "",
  });

  const handleChange = (e) => {
    setGrade({
      ...grade,
      [e.target.name]: e.target.value,
    });
  };

  const submit = (e) => {
    e.preventDefault();

    const quiz = Number(grade.quiz);
    const assignment = Number(grade.assignment);
    const mid = Number(grade.mid);
    const finalExam = Number(grade.final);

    const total = quiz + assignment + mid + finalExam;

    onAdd({
      ...grade,
      total,
    });

    setGrade({
      student: "",
      course: "",
      quiz: "",
      assignment: "",
      mid: "",
      final: "",
    });
  };

  return (
    <form className="grade-form" onSubmit={submit}>
      <input
        name="student"
        placeholder="Student Name"
        value={grade.student}
        onChange={handleChange}
      />

      <input
        name="course"
        placeholder="Course"
        value={grade.course}
        onChange={handleChange}
      />

      <input
        type="number"
        name="quiz"
        placeholder="Quiz"
        value={grade.quiz}
        onChange={handleChange}
      />

      <input
        type="number"
        name="assignment"
        placeholder="Assignment"
        value={grade.assignment}
        onChange={handleChange}
      />

      <input
        type="number"
        name="mid"
        placeholder="Mid Exam"
        value={grade.mid}
        onChange={handleChange}
      />

      <input
        type="number"
        name="final"
        placeholder="Final Exam"
        value={grade.final}
        onChange={handleChange}
      />

      <button>Save Grade</button>
    </form>
  );
}

export default GradeForm;