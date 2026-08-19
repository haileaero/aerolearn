import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";

import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../services/announcementService";

function Announcements() {
  const [announcements, setAnnouncements] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] = useState({
    title: "",
    message: "",
    audience: "All",
    priority: "Normal",
    expiryDate: "",
    isPinned: false,
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    const data =
      await getAnnouncements();

    setAnnouncements(data);
  };

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox"
        ? e.target.checked
        : e.target.value;

    setForm((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const submitAnnouncement = async (
    e
  ) => {
    e.preventDefault();

    if (editingId) {
      await updateAnnouncement(
        editingId,
        form
      );
    } else {
      await createAnnouncement(
        form
      );
    }

    await loadAnnouncements();

    setEditingId(null);

    setForm({
      title: "",
      message: "",
      audience: "All",
      priority: "Normal",
      expiryDate: "",
      isPinned: false,
    });
  };

  const editAnnouncement = (
    announcement
  ) => {
    setEditingId(
      announcement._id
    );

    setForm({
      title:
        announcement.title,
      message:
        announcement.message,
      audience:
        announcement.audience,
      priority:
        announcement.priority,
      expiryDate:
        announcement.expiryDate
          ? announcement.expiryDate.substring(
              0,
              10
            )
          : "",
      isPinned:
        announcement.isPinned,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const removeAnnouncement =
    async (id) => {
      await deleteAnnouncement(id);

      await loadAnnouncements();
    };

  const filtered =
    useMemo(() => {
      return announcements
        .filter((a) =>
          (
            a.title +
            a.message +
            a.audience +
            a.priority
          )
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
        )
        .sort((a, b) => {
          if (
            a.isPinned &&
            !b.isPinned
          )
            return -1;

          if (
            !a.isPinned &&
            b.isPinned
          )
            return 1;

          return (
            new Date(
              b.createdAt
            ) -
            new Date(a.createdAt)
          );
        });
    }, [announcements, search]);

  const priorityColor = (
    priority
  ) => {
    switch (priority) {
      case "High":
        return "#dc3545";

      case "Normal":
        return "#f39c12";

      default:
        return "#28a745";
    }
  };
    return (
    <Layout>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h1
          className="page-title"
          style={{
            marginBottom: "25px",
          }}
        >
          📢 Announcement Center
        </h1>

        <form
          className="course-form"
          onSubmit={submitAnnouncement}
        >
          <input
            name="title"
            placeholder="Announcement Title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <textarea
            rows="5"
            name="message"
            placeholder="Write announcement..."
            value={form.message}
            onChange={handleChange}
            required
          />

          <select
            name="audience"
            value={form.audience}
            onChange={handleChange}
          >
            <option>All</option>
            <option>Students</option>
            <option>Instructors</option>
          </select>

          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
          >
            <option>Low</option>
            <option>Normal</option>
            <option>High</option>
          </select>

          <input
            type="date"
            name="expiryDate"
            value={form.expiryDate}
            onChange={handleChange}
          />

          <label>
            <input
              type="checkbox"
              name="isPinned"
              checked={form.isPinned}
              onChange={handleChange}
            />{" "}
            Pin Announcement
          </label>

          <button type="submit">
            {editingId
              ? "Update Announcement"
              : "Publish Announcement"}
          </button>
        </form>

        <input
          type="text"
          placeholder="Search announcements..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "10px",
            margin: "30px 0",
            border: "1px solid #ddd",
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill,minmax(340px,1fr))",
            gap: "25px",
          }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                gridColumn: "1/-1",
                textAlign: "center",
                padding: "50px",
                background: "#fff",
                borderRadius: "12px",
              }}
            >
              No announcements found.
            </div>
          ) : (
            filtered.map(
              (announcement) => (
                <div
                  key={
                    announcement._id
                  }
                  style={{
                    background: "#fff",
                    borderRadius: "14px",
                    padding: "22px",
                    boxShadow:
                      "0 8px 25px rgba(0,0,0,.08)",
                    borderLeft: `6px solid ${priorityColor(
                      announcement.priority
                    )}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h3>
                      {announcement.isPinned &&
                        "📌 "}
                      {
                        announcement.title
                      }
                    </h3>

                    <span
                      style={{
                        background:
                          priorityColor(
                            announcement.priority
                          ),
                        color: "#fff",
                        padding:
                          "4px 12px",
                        borderRadius:
                          "20px",
                        fontSize:
                          "12px",
                      }}
                    >
                      {
                        announcement.priority
                      }
                    </span>
                  </div>

                  <p
                    style={{
                      margin:
                        "15px 0",
                      lineHeight:
                        "1.6",
                    }}
                  >
                    {
                      announcement.message
                    }
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap:
                        "wrap",
                      marginBottom:
                        "15px",
                    }}
                  >
                    <span
                      style={{
                        background:
                          "#eef3ff",
                        color:
                          "#2d5be3",
                        padding:
                          "5px 10px",
                        borderRadius:
                          "15px",
                        fontSize:
                          "13px",
                      }}
                    >
                      👥{" "}
                      {
                        announcement.audience
                      }
                    </span>

                    {announcement.expiryDate && (
                      <span
                        style={{
                          background:
                            "#f8f8f8",
                          padding:
                            "5px 10px",
                          borderRadius:
                            "15px",
                          fontSize:
                            "13px",
                        }}
                      >
                        ⏰{" "}
                        {new Date(
                          announcement.expiryDate
                        ).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                    }}
                  >
                    <small
                      style={{
                        color:
                          "#777",
                      }}
                    >
                      {announcement.createdAt
                        ? new Date(
                            announcement.createdAt
                          ).toLocaleString()
                        : ""}
                    </small>

                    <div
                      style={{
                        display:
                          "flex",
                        gap: "10px",
                      }}
                    >
                      <button
                        onClick={() =>
                          editAnnouncement(
                            announcement
                          )
                        }
                      >
                        ✏️ Edit
                      </button>

                      <button
                        onClick={() =>
                          removeAnnouncement(
                            announcement._id
                          )
                        }
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Announcements;