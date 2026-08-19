function AnnouncementTable({ announcements, removeAnnouncement }) {
  return (
    <table className="student-table">

      <thead>

        <tr>
          <th>Title</th>
          <th>Course</th>
          <th>Date</th>
          <th>Announcement</th>
          <th>Action</th>
        </tr>

      </thead>

      <tbody>

        {announcements.map((announcement, index) => (

          <tr key={index}>

            <td>{announcement.title}</td>

            <td>{announcement.course}</td>

            <td>{announcement.date}</td>

            <td>{announcement.message}</td>

            <td>

              <button
                className="delete-btn"
                onClick={() => removeAnnouncement(index)}
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

export default AnnouncementTable;