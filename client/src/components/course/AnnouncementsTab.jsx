import "./course.css";

function AnnouncementsTab({ announcements }) {
  if (!announcements || announcements.length === 0) {
    return (
      <div className="empty-state">
        <h2>📢 No Announcements</h2>
        <p>No announcements have been posted yet.</p>
      </div>
    );
  }

  return (
    <div className="announcements-list">
      {announcements.map((announcement) => (
        <div
          key={announcement._id}
          className="announcement-card"
        >
          <div className="announcement-header">

            <div>
              <h2>
                {announcement.title}
              </h2>

              <span className="announcement-date">
                {announcement.createdAt
                  ? new Date(
                      announcement.createdAt
                    ).toLocaleString()
                  : ""}
              </span>
            </div>

            <div className="announcement-icon">
              📢
            </div>

          </div>

          <p className="announcement-content">
            {announcement.message}
          </p>

        </div>
      ))}
    </div>
  );
}

export default AnnouncementsTab;