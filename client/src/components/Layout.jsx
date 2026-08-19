import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="layout">
      <Sidebar />

      <div className="main-content">
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