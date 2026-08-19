function VideoTable({ videos, removeVideo }) {
  return (
    <table className="student-table">

      <thead>
        <tr>
          <th>Title</th>
          <th>Course</th>
          <th>Week</th>
          <th>Video</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>

        {videos.map((video, index) => (

          <tr key={index}>

            <td>{video.title}</td>

            <td>{video.course}</td>

            <td>{video.week}</td>

            <td>
              <a
                href={video.url}
                target="_blank"
                rel="noreferrer"
              >
                Watch
              </a>
            </td>

            <td>

              <button
                className="delete-btn"
                onClick={() => removeVideo(index)}
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

export default VideoTable;