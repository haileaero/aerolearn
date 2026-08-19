import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import {
  FaBell,
  FaSearch,
} from "react-icons/fa";

function Navbar() {
  const { user } = useContext(AuthContext);

  return (
    <header className="navbar">

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
      >
        <h2>AeroLearn</h2>

        <div
          style={{
            position: "relative",
          }}
        >
          <FaSearch
            style={{
              position: "absolute",
              top: "14px",
              left: "15px",
              color: "#999",
            }}
          />

          <input
            type="text"
            placeholder="Search..."
            style={{
              width: "320px",
              padding: "12px 15px 12px 42px",
              border: "1px solid #ddd",
              borderRadius: "12px",
              outline: "none",
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "25px",
        }}
      >
        <div
          style={{
            position: "relative",
            cursor: "pointer",
          }}
        >
          <FaBell
            size={22}
            color="#555"
          />

          <span
            style={{
              position: "absolute",
              top: "-6px",
              right: "-6px",
              width: "10px",
              height: "10px",
              background: "#ef4444",
              borderRadius: "50%",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              user?.fullName || "User"
            )}&background=2563eb&color=fff`}
            alt="avatar"
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
            }}
          />

          <div>
            <strong
              style={{
                display: "block",
              }}
            >
              {user?.fullName}
            </strong>

            <small
              style={{
                color: "#777",
              }}
            >
              {user?.role}
            </small>
          </div>
        </div>
      </div>

    </header>
  );
}

export default Navbar;