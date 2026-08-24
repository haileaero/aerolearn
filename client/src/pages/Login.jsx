import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaUserGraduate,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
} from "react-icons/fa";

import api from "../api";
import { AuthContext } from "../context/AuthContext";

function Login() {

  const { login } = useContext(AuthContext);

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const handleChange = (e) => {

    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    setError("");

    try {

      const { data } =
        await api.post(
          "/auth/login",
          form
        );

     login(data);
console.log("LOGIN DATA:", data);
console.log("USER ROLE:", data.role);
if (data.role === "Student") {
  navigate("/my-courses");
} else {
  navigate("/dashboard");
}

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Invalid email or password."
      );

    } finally {

      setLoading(false);

    }

  };
    return (

    <div
     style={{
  minHeight: "100dvh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  boxSizing: "border-box",
}}
    >

      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          background: "#ffffff",
          borderRadius: "24px",
          padding: "24px",
          boxShadow:
            "0 25px 60px rgba(0,0,0,.35)",
        }}
      >

        <div
          style={{
            textAlign: "center",
            marginBottom: "10px",
          }}
        >

          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              background: "#2563eb",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "0 auto 20px",
              color: "#fff",
              fontSize: "38px",
            }}
          >
            <FaUserGraduate />
          </div>

          <h1
            style={{
              marginBottom: "10px",
              color: "#1e3a8a",
              fontSize: "34px",
            }}
          >
            AeroLearn LMS
          </h1>

          <h3
            style={{
              color: "#475569",
              fontWeight: "500",
            }}
          >
            Ethiopian Defense University
          </h3>

          <p
            style={{
              marginTop: "10px",
              color: "#64748b",
              lineHeight: 1.7,
            }}
          >
            Sign in to access your dashboard,
            courses, attendance, assessments,
            learning materials and announcements.
          </p>

        </div>

        {error && (

          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: "14px",
              borderRadius: "12px",
              marginBottom: "10px",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            ⚠ {error}
          </div>

        )}

        <form onSubmit={handleSubmit}>
                    {/* ==========================
              EMAIL
          ========================== */}

          <div
            style={{
              position: "relative",
              marginBottom: "10px",
            }}
          >

            <FaEnvelope
              style={{
                position: "absolute",
                left: "16px",
                top: "16px",
                color: "#64748b",
              }}
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "14px 14px 14px 48px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                fontSize: "15px",
                outline: "none",
              }}
            />

          </div>

          {/* ==========================
              PASSWORD
          ========================== */}

          <div
            style={{
              position: "relative",
              marginBottom: "10px",
            }}
          >

            <FaLock
              style={{
                position: "absolute",
                left: "16px",
                top: "16px",
                color: "#64748b",
              }}
            />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding:
                  "14px 50px 14px 48px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                fontSize: "15px",
                outline: "none",
              }}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              style={{
                position: "absolute",
                right: "14px",
                top: "12px",
                background: "none",
                border: "none",
                color: "#64748b",
                cursor: "pointer",
                fontSize: "18px",
                padding: 0,
              }}
            >
              {showPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>

          </div>

          {/* ==========================
              OPTIONS
          ========================== */}

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: "10px",
              fontSize: "14px",
            }}
          >

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <input type="checkbox" />

              Remember Me

            </label>

            <span
              style={{
                color: "#2563eb",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Forgot Password?
            </span>

          </div>

          {/* ==========================
              LOGIN BUTTON
          ========================== */}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: "10px",
              border: "none",
              background:
                "linear-gradient(135deg,#2563eb,#1d4ed8)",
              color: "#fff",
              fontWeight: "500",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            <FaSignInAlt
              style={{
                marginRight: "10px",
              }}
            />

            {loading
              ? "Signing In..."
              : "Sign In"}

          </button>
                  </form>

        {/* ==========================
            FOOTER
        ========================== */}

        <div
          style={{
            marginTop: "10px",
            textAlign: "center",
            borderTop: "1px solid #e5e7eb",
            paddingTop: "20px",
          }}
        >

          <p
            style={{
              color: "#64748b",
              fontSize: "14px",
              marginBottom: "8px",
            }}
          >
            AeroLearn Learning Management System
          </p>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "13px",
            }}
          >
            Military Engineering College
          </p>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "12px",
              marginTop: "10px",
            }}
          >
            © 2026 AeroLearn LMS • Version 1.0
          </p>

        </div>

      </div>

    </div>

  );

}


export default Login;