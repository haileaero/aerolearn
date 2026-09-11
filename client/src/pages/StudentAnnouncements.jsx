import { useEffect, useMemo, useState } from "react";
import { FaBullhorn, FaCalendarAlt, FaSearch, FaStar } from "react-icons/fa";
import api from "../api";

function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const res = await api.get("/announcements");
        const data = Array.isArray(res.data) ? res.data : res.data.announcements || [];
        setAnnouncements(data);
      } catch (error) {
        console.error(error);
      }
    };
    loadAnnouncements();
  }, []);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return announcements;
    return announcements.filter((item) =>
      `${item.title || ""} ${item.message || item.description || ""}`.toLowerCase().includes(term)
    );
  }, [announcements, query]);

  return (
    <section className="student-news-section">
      <div className="student-section-heading">
        <div>
          <span className="student-eyebrow"><FaBullhorn /> Campus updates</span>
          <h2>Announcements</h2>
          <p>Important academic notices and course updates in one place.</p>
        </div>
        <span className="student-count-badge">{announcements.length} updates</span>
      </div>

      <div className="student-news-toolbar">
        <FaSearch />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search announcements..." />
      </div>

      {visible.length === 0 ? (
        <div className="student-empty-state">No announcements found.</div>
      ) : (
        <div className="student-news-list">
          {visible.map((item, index) => (
            <article key={item._id} className={`student-news-card tone-${index % 4}`}>
              <div className="student-news-icon"><FaBullhorn /></div>
              <div className="student-news-content">
                <div className="student-news-title-row">
                  <h3>{item.title}</h3>
                  {item.pinned && <span className="student-pin"><FaStar /> Pinned</span>}
                </div>
                <p>{item.message || item.description}</p>
                <span className="student-news-date"><FaCalendarAlt /> {new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default StudentAnnouncements;
