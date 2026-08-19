import { useState } from "react";

function VideoForm({ onAdd }) {
  const [video, setVideo] = useState({
    title: "",
    course: "",
    week: "",
    url: "",
  });

  const handleChange = (e) => {
    setVideo({
      ...video,
      [e.target.name]: e.target.value,
    });
  };

  const submit = (e) => {
    e.preventDefault();

    if (
      !video.title ||
      !video.course ||
      !video.week ||
      !video.url
    )
      return;

    onAdd(video);

    setVideo({
      title: "",
      course: "",
      week: "",
      url: "",
    });
  };

  return (
    <form className="video-form" onSubmit={submit}>
      <input
        name="title"
        placeholder="Video Title"
        value={video.title}
        onChange={handleChange}
      />

      <input
        name="course"
        placeholder="Course"
        value={video.course}
        onChange={handleChange}
      />

      <input
        name="week"
        placeholder="Week"
        value={video.week}
        onChange={handleChange}
      />

      <input
        name="url"
        placeholder="YouTube URL"
        value={video.url}
        onChange={handleChange}
      />

      <button>Add Video</button>
    </form>
  );
}

export default VideoForm;