import "./course.css";

function CourseNavigation({
  user,
  activeTab,
  setActiveTab,
}) {
  const tabs =
    user?.role === "Student"
      ? [
          "overview",
          "materials",
          "assessments",
          "attendance",
        ]
      : [
          "overview",
          "materials",
          "assessments",
          "attendance",
          "announcements",
          "students",
          "statistics",
        ];

  return (
    <div className="course-navigation">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={
            activeTab === tab
              ? "course-tab active"
              : "course-tab"
          }
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export default CourseNavigation;