import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  useContext,
  useState,
} from "react";

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
  FaChevronDown,
  FaTimes,
} from "react-icons/fa";

import { AuthContext } from "../context/AuthContext";

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const { user, logout } =
    useContext(AuthContext);

  const [assessmentOpen, setAssessmentOpen] =
    useState(false);

  const handleLogout = () => {
    logout();
    onClose?.();
    navigate("/login");
  };

  const handleNavigation = () => {
    // Close sidebar automatically on mobile
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside
        className={`sidebar ${
          isOpen ? "sidebar-open" : ""
        }`}
      >
        {/* Mobile close button */}
        <button
          type="button"
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close menu"
        >
          <FaTimes />
        </button>

        <div className="sidebar-logo">
          AeroLearn
        </div>

        <nav className="sidebar-nav">

          {/* ================= ADMIN ================= */}

          {user?.role === "Admin" && (
            <>
              <p className="sidebar-title">
                Administration
              </p>

              <NavLink
                to="/users"
                onClick={handleNavigation}
              >
                <FaUsers />
                <span>Users</span>
              </NavLink>

              <NavLink
                to="/students"
                onClick={handleNavigation}
              >
                <FaUserGraduate />
                <span>Students</span>
              </NavLink>
            </>
          )}

          {/* ============ ADMIN & INSTRUCTOR ============ */}

          {(user?.role === "Admin" ||
            user?.role === "Instructor") && (
            <>
              <NavLink
                to="/dashboard"
                onClick={handleNavigation}
              >
                <FaHome />
                <span>Dashboard</span>
              </NavLink>

              <p className="sidebar-title">
                Academic
              </p>

              <NavLink
                to="/courses"
                onClick={handleNavigation}
              >
                <FaBook />
                <span>Course Management</span>
              </NavLink>

              <NavLink
                to="/attendance"
                onClick={handleNavigation}
              >
                <FaClipboardCheck />
                <span>Attendance</span>
              </NavLink>

              {/* ================= Assessment ================= */}

              <div className="assessment-menu">

                <button
                  type="button"
                  onClick={() =>
                    setAssessmentOpen(
                      !assessmentOpen
                    )
                  }
                  className="assessment-toggle"
                >
                  <span>
                    <FaClipboardList />
                    Assessment
                  </span>

                  <FaChevronDown
                    className={
                      assessmentOpen
                        ? "assessment-arrow open"
                        : "assessment-arrow"
                    }
                  />
                </button>

                {assessmentOpen && (
                  <div className="assessment-submenu">

                    <NavLink
                      to="/assessment"
                      onClick={handleNavigation}
                    >
                      Create Assessment
                    </NavLink>

                    <NavLink
                      to="/assessment-submit"
                      onClick={handleNavigation}
                    >
                      Submit Assessment
                    </NavLink>

                    <NavLink
                      to="/assessment-results"
                      onClick={handleNavigation}
                    >
                      View Results
                    </NavLink>

                  </div>
                )}

              </div>

              <NavLink
                to="/learning-materials"
                onClick={handleNavigation}
              >
                <FaFolderOpen />
                <span>
                  Learning Materials
                </span>
              </NavLink>

              <NavLink
                to="/announcements"
                onClick={handleNavigation}
              >
                <FaBullhorn />
                <span>
                  Announcements
                </span>
              </NavLink>
            </>
          )}

          {/* ================= STUDENT ================= */}

          {user?.role === "Student" && (
            <>
              <p className="sidebar-title">
                Academic
              </p>

              <NavLink
                to="/my-courses"
                onClick={handleNavigation}
              >
                <FaBook />
                <span>My Courses</span>
              </NavLink>

              <NavLink
                to="/my-results"
                onClick={handleNavigation}
              >
                <FaClipboardCheck />
                <span>My Results</span>
              </NavLink>
            </>
          )}

          {/* ================= ACCOUNT ================= */}

          <p className="sidebar-title">
            Account
          </p>

          <NavLink
            to="/profile"
            onClick={handleNavigation}
          >
            <FaUser />
            <span>Profile</span>
          </NavLink>

        </nav>

        {/* ================= USER ================= */}

        <div className="sidebar-user">

          <strong>
            {user?.fullName}
          </strong>

          <small>
            {user?.role}
          </small>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            Logout
          </button>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;