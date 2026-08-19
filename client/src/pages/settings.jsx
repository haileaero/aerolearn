import { useState } from "react";
import Layout from "../components/Layout";

import {
  FaUniversity,
  FaBell,
  FaShieldAlt,
  FaSave,
  FaCog,
} from "react-icons/fa";

function Settings() {
  const [settings, setSettings] =
    useState({
      universityName:
        "AeroLearn University",

      academicYear:
        "2026/2027",

      semester:
        "Semester I",

      notifications: true,

      emailNotifications: true,

      autoSave: true,

      maintenanceMode: false,

      allowStudentRegistration: true,

      passwordLength: 8,

      sessionTimeout: 30,
    });

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox"
        ? e.target.checked
        : e.target.value;

    setSettings((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const saveSettings = () => {
    alert(
      "System settings saved successfully."
    );

    // Later connect to backend
  };

  const cardStyle = {
    background: "#fff",
    borderRadius: "18px",
    padding: "30px",
    boxShadow:
      "0 8px 25px rgba(0,0,0,.08)",
    marginBottom: "30px",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    marginTop: "8px",
  };

  return (
    <Layout>
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* Header */}

        <div
          style={{
            background:
              "linear-gradient(135deg,#1e3a8a,#2563eb)",
            color: "#fff",
            padding: "35px",
            borderRadius: "20px",
            marginBottom: "35px",
          }}
        >
          <h1
            style={{
              marginBottom: "10px",
            }}
          >
            <FaCog /> System Settings
          </h1>

          <p>
            Configure the AeroLearn
            Learning Management
            System.
          </p>
        </div>

        {/* University */}

        <div style={cardStyle}>
          <h2>
            <FaUniversity /> University
            Information
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(250px,1fr))",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            <div>
              <label>
                University Name
              </label>

              <input
                style={inputStyle}
                name="universityName"
                value={
                  settings.universityName
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div>
              <label>
                Academic Year
              </label>

              <input
                style={inputStyle}
                name="academicYear"
                value={
                  settings.academicYear
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div>
              <label>Semester</label>

              <select
                style={inputStyle}
                name="semester"
                value={
                  settings.semester
                }
                onChange={
                  handleChange
                }
              >
                <option>
                  Semester I
                </option>

                <option>
                  Semester II
                </option>

                <option>
                  Summer
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}

        <div style={cardStyle}>
          <h2>
            <FaBell /> Notifications
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            <label
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
              }}
            >
              Enable Notifications

              <input
                type="checkbox"
                name="notifications"
                checked={
                  settings.notifications
                }
                onChange={
                  handleChange
                }
              />
            </label>

            <label
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
              }}
            >
              Email Notifications

              <input
                type="checkbox"
                name="emailNotifications"
                checked={
                  settings.emailNotifications
                }
                onChange={
                  handleChange
                }
              />
            </label>

            <label
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
              }}
            >
              Auto Save

              <input
                type="checkbox"
                name="autoSave"
                checked={
                  settings.autoSave
                }
                onChange={
                  handleChange
                }
              />
            </label>
          </div>
        </div>

        {/* Security */}

        <div style={cardStyle}>
          <h2>
            <FaShieldAlt /> Security
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(250px,1fr))",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            <div>
              <label>
                Minimum Password
                Length
              </label>

              <input
                type="number"
                style={inputStyle}
                name="passwordLength"
                value={
                  settings.passwordLength
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div>
              <label>
                Session Timeout
                (Minutes)
              </label>

              <input
                type="number"
                style={inputStyle}
                name="sessionTimeout"
                value={
                  settings.sessionTimeout
                }
                onChange={
                  handleChange
                }
              />
            </div>
          </div>

          <div
            style={{
              marginTop: "25px",
              display: "flex",
              flexDirection:
                "column",
              gap: "18px",
            }}
          >
            <label
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
              }}
            >
              Allow Student
              Registration

              <input
                type="checkbox"
                name="allowStudentRegistration"
                checked={
                  settings.allowStudentRegistration
                }
                onChange={
                  handleChange
                }
              />
            </label>

            <label
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
              }}
            >
              Maintenance Mode

              <input
                type="checkbox"
                name="maintenanceMode"
                checked={
                  settings.maintenanceMode
                }
                onChange={
                  handleChange
                }
              />
            </label>
          </div>
        </div>

        {/* Save */}

        <div
          style={{
            textAlign: "right",
            marginBottom: "40px",
          }}
        >
          <button
            onClick={saveSettings}
            style={{
              background:
                "#2563eb",
              color: "#fff",
              border: "none",
              padding:
                "14px 30px",
              borderRadius: "10px",
              fontSize: "15px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            <FaSave /> Save
            Settings
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default Settings;