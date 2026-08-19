import { useState } from "react";
import Layout from "../components/Layout";

function Notes() {
  const [notes, setNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState([]);

  const saveNote = () => {
    if (!notes.trim()) return;

    setSavedNotes([
      ...savedNotes,
      {
        id: Date.now(),
        text: notes,
      },
    ]);

    setNotes("");
  };

  const deleteNote = (id) => {
    setSavedNotes(
      savedNotes.filter((note) => note.id !== id)
    );
  };

  return (
    <Layout>
      <h1>Notes</h1>

      <textarea
        rows="6"
        placeholder="Write your notes here..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        style={{
          width: "100%",
          padding: "15px",
          borderRadius: "8px",
          marginTop: "20px",
        }}
      />

      <br />
      <br />

      <button onClick={saveNote}>
        Save Note
      </button>

      <div style={{ marginTop: "30px" }}>
        {savedNotes.map((note) => (
          <div
            key={note.id}
            style={{
              background: "#fff",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "8px",
              boxShadow:
                "0 2px 6px rgba(0,0,0,.1)",
            }}
          >
            <p>{note.text}</p>

            <button
              onClick={() => deleteNote(note.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Notes;