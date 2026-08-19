import { useState } from "react";

function AnnouncementForm({ onAdd }) {
  const [announcement, setAnnouncement] = useState({
    title: "",
    course: "",
    date: "",
    message: "",
  });

  const handleChange = (e) => {
    setAnnouncement({
      ...announcement,
      [e.target.name]: e.target.value,
    });
  };

  const submit = (e) => {
    e.preventDefault();

    if (
      !announcement.title ||
      !announcement.course ||
      !announcement.date ||
      !announcement.message
    )
      return;

    onAdd(announcement);

    setAnnouncement({
      title: "",
      course: "",
      date: "",
      message: "",
    });
  };

  return (
    <form className="announcement-form" onSubmit={submit}>

      <input
        name="title"
        placeholder="Announcement Title"
        value={announcement.title}
        onChange={handleChange}
      />

      <input
        name="course"
        placeholder="Course"
        value={announcement.course}
        onChange={handleChange}
      />

      <input
        type="date"
        name="date"
        value={announcement.date}
        onChange={handleChange}
      />

      <textarea
        name="message"
        placeholder="Announcement"
        rows="4"
        value={announcement.message}
        onChange={handleChange}
      />

      <button>Publish Announcement</button>

    </form>
  );
}

export default AnnouncementForm;