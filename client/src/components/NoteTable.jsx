function NoteTable({ notes, removeNote }) {
  return (
    <table className="student-table">

      <thead>

        <tr>
          <th>Lecture</th>
          <th>Course</th>
          <th>Week</th>
          <th>PDF</th>
          <th>Action</th>
        </tr>

      </thead>

      <tbody>

        {notes.map((note, index) => (

          <tr key={index}>

            <td>{note.title}</td>

            <td>{note.course}</td>

            <td>{note.week}</td>

            <td>
              <a
                href={note.link}
                target="_blank"
                rel="noreferrer"
              >
                Open
              </a>
            </td>

            <td>

              <button
                className="delete-btn"
                onClick={() => removeNote(index)}
              >
                Delete
              </button>

            </td>

          </tr>

        ))}

      </tbody>

    </table>
  );
}

export default NoteTable;