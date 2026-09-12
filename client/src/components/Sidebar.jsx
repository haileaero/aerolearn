import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import {
  FaHome,
  FaUsers,
  FaUserGraduate,
  FaBook,
  FaClipboardCheck,
  FaClipboardList,
  FaFolderOpen,
  FaBullhorn,
  FaUser,
  FaSignOutAlt,
  FaTimes,
  FaPlane,
} from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { isAdmin, isInstructor, isStudent } from "../utils/roles";

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    onClose?.();
    navigate("/login");
  };

  const handleNavigation = () => onClose?.();

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <button type="button" className="sidebar-close" onClick={onClose} aria-label="Close menu">
          <FaTimes />
        </button>

        <div className="sidebar-brand">
          <div className="sidebar-brand-mark"><FaPlane /></div>
          <div className="sidebar-brand-copy">
            <strong>AeroLearn</strong>
            <span>Academic Cloud</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {(isAdmin(user) || isInstructor(user)) && (
            <>
              <p className="sidebar-title">Workspace</p>
              <NavLink to="/dashboard" onClick={handleNavigation}>
                <FaHome /><span>Dashboard</span>
              </NavLink>
            </>
          )}

          {isAdmin(user) && (
            <>
              <p className="sidebar-title">Administration</p>
              <NavLink to="/users" onClick={handleNavigation}>
                <FaUsers /><span>User Management</span>
              </NavLink>
              <NavLink to="/students" onClick={handleNavigation}>
                <FaUserGraduate /><span>Students</span>
              </NavLink>
            </>
          )}

          {(isAdmin(user) || isInstructor(user)) && (
            <>
              <p className="sidebar-title">Academic</p>
              <NavLink to="/courses" onClick={handleNavigation}>
                <FaBook /><span>Courses</span>
              </NavLink>
              <p className="sidebar-title sidebar-ops-title">Academic Operations</p>
              <NavLink to="/attendance" onClick={handleNavigation}>
                <FaClipboardCheck /><span>Attendance</span>
              </NavLink>

              <NavLink to="/assessment" onClick={handleNavigation}>
                <FaClipboardList /><span>Assessment</span>
              </NavLink>

              <NavLink to="/learning-materials" onClick={handleNavigation}>
                <FaFolderOpen /><span>Learning Materials</span>
              </NavLink>
              <NavLink to="/announcements" onClick={handleNavigation}>
                <FaBullhorn /><span>Announcements</span>
              </NavLink>
            </>
          )}

          {isStudent(user) && (
            <>
              <p className="sidebar-title">My Learning</p>
              <NavLink to="/my-courses" onClick={handleNavigation}>
                <FaBook /><span>My Courses</span>
              </NavLink>
              <NavLink to="/my-results" onClick={handleNavigation}>
                <FaClipboardCheck /><span>My Results</span>
              </NavLink>
              <NavLink to="/learning-materials" onClick={handleNavigation}>
                <FaFolderOpen /><span>Resources</span>
              </NavLink>
              <NavLink to="/announcements" onClick={handleNavigation}>
                <FaBullhorn /><span>Announcements</span>
              </NavLink>
            </>
          )}

          <p className="sidebar-title">Account</p>
          <NavLink to="/profile" onClick={handleNavigation}>
            <FaUser /><span>My Profile</span>
          </NavLink>
        </nav>

        <div className="sidebar-user">
          <strong>{user?.fullName || "AeroLearn User"}</strong>
          <small>{user?.role || "Account"}</small>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
