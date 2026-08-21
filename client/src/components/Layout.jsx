import { useState } from "react";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaBars,
} from "react-icons/fa";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <div className="layout">

      {/* ================= SIDEBAR ================= */}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      {/* ================= MAIN CONTENT ================= */}

      <div className="main-content">

        {/* Mobile menu button */}
        <button
          type="button"
          className="mobile-menu-button"
          onClick={() =>
            setSidebarOpen(true)
          }
          aria-label="Open menu"
        >
          <FaBars />
        </button>

        <Navbar />

        <main className="page-content">

          {location.pathname !== "/" && (
            <button
              onClick={() => navigate(-1)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "20px",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 18px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              <FaArrowLeft />
              Back
            </button>
          )}

          {children}

        </main>

        <Footer />

      </div>

    </div>
  );
}

export default Layout;