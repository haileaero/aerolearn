import { useEffect, useState } from "react";
import { FaBullhorn, FaCalendarAlt } from "react-icons/fa";
import api from "../api";

function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const res = await api.get("/announcements");

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.announcements || [];

      setAnnouncements(data.slice(0, 5));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ marginTop: "40px" }}>
      <h2
        style={{
          marginBottom: "20px",
        }}
      >
        📢 Latest Announcements
      </h2>

      {announcements.length === 0 ? (
        <div
          style={{
            background: "#fff",
            padding: "40px",
            borderRadius: "18px",
            textAlign: "center",
          }}
        >
          No announcements available.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {announcements.map((item) => (
            <div
              key={item._id}
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "22px",
                boxShadow: "0 8px 20px rgba(0,0,0,.06)",
                borderLeft: "6px solid #2563eb",
              }}
            >
              <h3
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <FaBullhorn color="#2563eb" />
                {item.title}
              </h3>

              <p
                style={{
                  color: "#64748b",
                  lineHeight: 1.6,
                }}
              >
                {item.message || item.description}
              </p>

              <div
                style={{
                  marginTop: "15px",
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                }}
              >
                <FaCalendarAlt />
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentAnnouncements;