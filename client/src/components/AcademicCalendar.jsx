function AcademicCalendar() {
  const events = [
    {
      date: "Jan 08",
      title: "Semester Begins",
      color: "#2d5be3",
    },
    {
      date: "Feb 15",
      title: "Continuous Assessment",
      color: "#16a085",
    },
    {
      date: "Mar 20",
      title: "Mid Examination",
      color: "#f39c12",
    },
    {
      date: "May 12",
      title: "Final Examination",
      color: "#e74c3c",
    },
    {
      date: "Jun 01",
      title: "Result Submission",
      color: "#8e44ad",
    },
  ];

  return (
    <div
      style={{
        background: "#fff",
        padding: "25px",
        borderRadius: "15px",
        boxShadow:
          "0 5px 20px rgba(0,0,0,.08)",
      }}
    >
      <h2
        style={{
          marginBottom: "20px",
        }}
      >
        📅 Academic Calendar
      </h2>

      {events.map((event, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "18px",
            paddingBottom: "18px",
            borderBottom:
              index !== events.length - 1
                ? "1px solid #eee"
                : "none",
          }}
        >
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "12px",
              background: event.color,
              color: "#fff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              marginRight: "18px",
            }}
          >
            {event.date}
          </div>

          <div>
            <h3
              style={{
                margin: 0,
              }}
            >
              {event.title}
            </h3>

            <p
              style={{
                color: "#777",
                marginTop: "6px",
              }}
            >
              AeroLearn Academic Event
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AcademicCalendar;