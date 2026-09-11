import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
  FaPlane,
  FaBookOpen,
  FaChartLine,
  FaShieldAlt,
} from "react-icons/fa";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/login", form);
      login(data);
      navigate(data.role === "Student" ? "/my-courses" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-showcase">
        <div className="login-brand">
          <div className="login-brand-mark"><FaPlane /></div>
          <div>
            <strong>AeroLearn</strong>
            <span>Academic Cloud</span>
          </div>
        </div>

        <div className="login-showcase-copy">
          <span className="login-badge">Ethiopian Defense University</span>
          <h1>One workspace for smarter learning.</h1>
          <p>
            Courses, assessments, attendance, learning resources and academic progress—organized in one secure digital campus for students, instructors and administrators.
          </p>

          <div className="login-features">
            <div className="login-feature">
              <FaBookOpen />
              <strong>Learn anywhere</strong>
              <span>Course resources and academic content in one place.</span>
            </div>
            <div className="login-feature">
              <FaChartLine />
              <strong>Track progress</strong>
              <span>Results, attendance and learning activity at a glance.</span>
            </div>
            <div className="login-feature">
              <FaShieldAlt />
              <strong>Role-secured</strong>
              <span>Purpose-built access for every academic role.</span>
            </div>
          </div>
        </div>

        <div className="login-showcase-foot">Military Engineering College • Digital Learning Environment</div>
      </section>

      <section className="login-auth">
        <div className="login-card">
          <span className="login-card-kicker">Welcome back</span>
          <h2>Sign in to AeroLearn</h2>
          <p className="login-card-subtitle">Use your institutional account to continue to your personalized learning workspace.</p>

          {error && <div className="login-error">⚠ {error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="email">Email address</label>
              <div className="login-input-wrap">
                <FaEnvelope />
                <input id="email" type="email" name="email" placeholder="name@institution.edu" value={form.email} onChange={handleChange} required autoComplete="email" />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <div className="login-input-wrap">
                <FaLock />
                <input id="password" type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" value={form.password} onChange={handleChange} required autoComplete="current-password" />
                <button className="login-password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label><input type="checkbox" /> Keep me signed in</label>
              <span>Contact your system administrator</span>
            </div>

            <button className="login-submit" type="submit" disabled={loading}>
              <FaSignInAlt /> {loading ? "Signing in..." : "Sign in securely"}
            </button>
          </form>

          <div className="login-help">
            Access is limited to authorized AeroLearn users.<br />
            © 2026 AeroLearn Learning Management System
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;
