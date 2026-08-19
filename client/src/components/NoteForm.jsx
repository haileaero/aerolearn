import { useState } from "react";

function NoteForm({ onAdd }) {
  const [note, setNote] = useState({
    title: "",
    course: "",
    week: "",
    link: "",
  });

  const handleChange = (e) => {
    setNote({
      ...note,
      [e.target.name]: e.target.value,
    });
  };

  const submit = (e) => {
    e.preventDefault();

    if (
      !note.title ||
      !note.course ||
      !note.week ||
      !note.link
    )
      return;

    onAdd(note);

    setNote({
      title: "",
      course: "",
      week: "",
      link: "",
    });
  };

  return (
    <form className="note-form" onSubmit={submit}>

      <input
        name="title"
        placeholder="Lecture Title"
        value={note.title}
        onChange={handleChange}
      />

      <input
        name="course"
        placeholder="Course"
        value={note.course}
        onChange={handleChange}
      />

      <input
        name="week"
        placeholder="Week"
        value={note.week}
        onChange={handleChange}
      />

      <input
        name="link"
        placeholder="PDF Link"
        value={note.link}
        onChange={handleChange}
      />

      <button>Add Note</button>

    </form>
  );
}

export default NoteForm;