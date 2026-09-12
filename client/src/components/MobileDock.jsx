import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaBook, FaClipboardCheck, FaFolderOpen, FaUser, FaBullhorn } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

function MobileDock() {
  const { user } = useContext(AuthContext);
  if (!user) return null;
  const items = user.role === "Student"
    ? [
        ["/my-courses", "Courses", <FaBook />],
        ["/my-results", "Results", <FaClipboardCheck />],
        ["/learning-materials", "Resources", <FaFolderOpen />],
        ["/announcements", "Updates", <FaBullhorn />],
        ["/profile", "Profile", <FaUser />],
      ]
    : [
        ["/dashboard", "Home", <FaHome />],
        ["/courses", "Courses", <FaBook />],
        ["/attendance", "Attendance", <FaClipboardCheck />],
        ["/assessment", "Assessment", <FaClipboardCheck />],
        ["/profile", "Profile", <FaUser />],
      ];
  return <nav className="mobile-dock" aria-label="Mobile navigation">
    {items.map(([to,label,icon]) => <NavLink key={to} to={to} className={({isActive}) => isActive ? "active" : ""}>{icon}<span>{label}</span></NavLink>)}
  </nav>;
}
export default MobileDock;
