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
} from "react-icons/fa";

import { AuthContext } from "../context/AuthContext";

function Sidebar() {
  const navigate = useNavigate();

  const { user, logout } =
    useContext(AuthContext);

  const [assessmentOpen, setAssessmentOpen] =
    useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        AeroLearn
      </div>

      <nav className="sidebar-nav">

        {/* ================= Dashboard ================= */}

        
        {/* ================= ADMIN ================= */}

        {user?.role === "Admin" && (
          <>
            <p className="sidebar-title">
              Administration
            </p>

            <NavLink to="/users">
              <FaUsers />
              <span>Users</span>
            </NavLink>

            <NavLink to="/students">
              <FaUserGraduate />
              <span>Students</span>
            </NavLink>
          </>
        )}

        {/* ============ ADMIN & INSTRUCTOR ============ */}

       {(user?.role === "Admin" ||
  user?.role === "Instructor") && (
  <>
    <NavLink to="/dashboard">
      <FaHome />
      <span>Dashboard</span>
    </NavLink>

    <p className="sidebar-title">
      Academic
    </p>

            <NavLink to="/courses">
              <FaBook />
              <span>Course Management</span>
            </NavLink>

            <NavLink to="/attendance">
              <FaClipboardCheck />
              <span>Attendance</span>
            </NavLink>

            {/* ================= Assessment ================= */}

            <div>

              <button
                type="button"
                onClick={() =>
                  setAssessmentOpen(
                    !assessmentOpen
                  )
                }
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  background: "transparent",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  padding: "12px 16px",
                  fontSize: "15px",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <FaClipboardList />
                  Assessment
                </span>

                <FaChevronDown
                  style={{
                    transform:
                      assessmentOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    transition: "0.3s",
                  }}
                />
              </button>

              {assessmentOpen && (
                <div
                  style={{
                    marginLeft: "34px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <NavLink to="/assessment">
                    Create Assessment
                  </NavLink>

                  <NavLink to="/assessment-submit">
                    Submit Assessment
                  </NavLink>

                  <NavLink to="/assessment-results">
                    View Results
                  </NavLink>
                </div>
              )}

            </div>

            <NavLink to="/learning-materials">
              <FaFolderOpen />
              <span>
                Learning Materials
              </span>
            </NavLink>

            <NavLink to="/announcements">
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

    <NavLink to="/my-courses">
      <FaBook />
      <span>My Courses</span>
    </NavLink>

    <NavLink to="/my-results">
      <FaClipboardCheck />
      <span>My Results</span>
    </NavLink>
  </>
)}
        {/* ================= ACCOUNT ================= */}

        <p className="sidebar-title">
          Account
        </p>

        <NavLink to="/profile">
          <FaUser />
          <span>Profile</span>
        </NavLink>

      </nav>

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
  );
}

export default Sidebar;