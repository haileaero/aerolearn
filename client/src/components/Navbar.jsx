import { useContext, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaBell, FaSearch } from "react-icons/fa";

const pageNames = {
  "/dashboard": "Overview",
  "/users": "User Management",
  "/students": "Students",
  "/courses": "Courses",
  "/attendance": "Attendance",
  "/assessment": "Assessments",
  "/learning-materials": "Learning Materials",
  "/announcements": "Announcements",
  "/my-courses": "My Courses",
  "/my-results": "My Results",
  "/profile": "My Profile",
};

function Navbar() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const pageName = location.pathname.startsWith("/assessment") ? "Assessment" : pageNames[location.pathname] || (location.pathname.startsWith("/course/") ? "Course Workspace" : "AeroLearn");
  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "User")}&background=123676&color=fff&bold=true`;
  const avatarUrl = user?.profileImage || avatarFallback;

  const allowedPages = useMemo(() => {
    const student = user?.role === "Student";
    const admin = user?.role === "Admin";
    return Object.entries(pageNames).filter(([path]) => {
      if (student) return ["/my-courses", "/my-results", "/learning-materials", "/announcements", "/profile"].includes(path);
      if (!admin && ["/users", "/students"].includes(path)) return false;
      return !["/my-courses", "/my-results"].includes(path);
    });
  }, [user?.role]);

  const handleSearch = (event) => {
    if (event.key !== "Enter" || !search.trim()) return;
    const keyword = search.trim().toLowerCase();
    const match = allowedPages.find(([, label]) => label.toLowerCase().includes(keyword));
    if (match) {
      navigate(match[0]);
      setSearch("");
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-brand-group">
        <div className="navbar-brand-copy">
          <span className="navbar-eyebrow">Current workspace</span>
          <h2>{pageName}</h2>
        </div>

        <label className="navbar-search" aria-label="Search AeroLearn pages">
          <FaSearch />
          <input
            type="search"
            placeholder="Find a page and press Enter..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={handleSearch}
          />
        </label>
      </div>

      <div className="navbar-actions">
        <button type="button" className="navbar-icon-button" aria-label="Open announcements" onClick={() => navigate("/announcements")}>
          <FaBell />
          <span className="notification-dot" />
        </button>
        <div className="navbar-profile">
          <img src={avatarUrl} alt={`${user?.fullName || "User"} profile`} onError={(event) => { if (event.currentTarget.src !== avatarFallback) event.currentTarget.src = avatarFallback; }} />
          <div className="navbar-profile-copy">
            <strong>{user?.fullName || "User"}</strong>
            <span>{user?.role || "Account"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
