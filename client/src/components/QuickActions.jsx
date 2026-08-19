function QuickActions() {
  const actions = [
    {
      title: "Students",
      icon: "🎓",
      color: "#2d5be3",
      link: "/students",
    },
    {
      title: "Courses",
      icon: "📚",
      color: "#27ae60",
      link: "/courses",
    },
    {
      title: "Attendance",
      icon: "📅",
      color: "#f39c12",
      link: "/attendance",
    },
    {
      title: "Assessment",
      icon: "📝",
      color: "#8e44ad",
      link: "/assessment",
    },
    {
      title: "Materials",
      icon: "📂",
      color: "#16a085",
      link: "/learning-materials",
    },
    {
      title: "Announcements",
      icon: "📢",
      color: "#e74c3c",
      link: "/announcements",
    },
  ];

  return (
    <div>
      <h2
        style={{
          marginBottom: "20px",
        }}
      >
        Quick Actions
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3,1fr)",
          gap: "20px",
        }}
      >
        {actions.map((action) => (
          <a
            key={action.title}
            href={action.link}
            style={{
              textDecoration: "none",
            }}
          >
            <div
              style={{
                background: action.color,
                color: "#fff",
                borderRadius: "14px",
                padding: "25px",
                textAlign: "center",
                cursor: "pointer",
                transition: ".3s",
              }}
            >
              <div
                style={{
                  fontSize: "40px",
                }}
              >
                {action.icon}
              </div>

              <h3
                style={{
                  marginTop: "10px",
                }}
              >
                {action.title}
              </h3>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default QuickActions;