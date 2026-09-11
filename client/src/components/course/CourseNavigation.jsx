import { FaBullhorn, FaChartBar, FaClipboardCheck, FaFolderOpen, FaHome, FaTasks, FaUsers } from "react-icons/fa";
import "./course.css";

const labels = {
  overview: [FaHome, "Overview"], materials: [FaFolderOpen, "Materials"], assessments: [FaTasks, "Assessments"],
  attendance: [FaClipboardCheck, "Attendance"], announcements: [FaBullhorn, "Updates"], students: [FaUsers, "Students"], statistics: [FaChartBar, "Statistics"]
};

function CourseNavigation({ user, activeTab, setActiveTab }) {
  const tabs = user?.role === "Student"
    ? ["overview", "materials", "assessments", "attendance"]
    : ["overview", "materials", "assessments", "attendance", "announcements", "students", "statistics"];

  return (
    <div className="course-navigation course-navigation-pro">
      {tabs.map((tab) => {
        const [Icon, label] = labels[tab];
        return <button key={tab} className={activeTab === tab ? "course-tab active" : "course-tab"} onClick={() => setActiveTab(tab)}><Icon /><span>{label}</span></button>;
      })}
    </div>
  );
}

export default CourseNavigation;
