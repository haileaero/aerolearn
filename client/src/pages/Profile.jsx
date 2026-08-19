import {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaVenusMars,
  FaCalendarAlt,
  FaCamera,
  FaEdit,
} from "react-icons/fa";

import Layout from "../components/Layout";

import { AuthContext } from "../context/AuthContext";

import {
  getProfile,
  updateProfile,
  changePassword,
} from "../services/userService";

function Profile() {
  const { updateUser } =
    useContext(AuthContext);

  const fileInputRef =
    useRef(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    passwordLoading,
    setPasswordLoading,
  ] = useState(false);

  const [editing, setEditing] =
    useState(false);

  const [profile, setProfile] =
    useState({
      fullName: "",
      email: "",
      department: "",
      phone: "",
      address: "",
      gender: "",
      role: "",
      createdAt: "",
      lastLogin: "",
      isActive: true,
      profileImage: "",
    });

  const [passwords, setPasswords] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data =
        await getProfile();

      setProfile(data);

      updateUser(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.value,
    }));
  };

  const saveProfile = async () => {
    try {
      setSaving(true);

      const updated =
        await updateProfile(
          profile
        );

      setProfile(updated);

      updateUser(updated);

      setEditing(false);

      alert(
        "Profile updated successfully."
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Update failed."
      );
    } finally {
      setSaving(false);
    }
  };

  const passwordChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]:
        e.target.value,
    });
  };

  const updatePassword = async (
    e
  ) => {
    e.preventDefault();

    if (
      passwords.newPassword !==
      passwords.confirmPassword
    ) {
      return alert(
        "Passwords do not match."
      );
    }

    try {
      setPasswordLoading(true);

      const res =
        await changePassword(
          passwords
        );

      alert(res.message);

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Password update failed."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  /* ===========================
     PROFILE IMAGE
  =========================== */

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleProfileImage = (
    e
  ) => {
    const file =
      e.target.files[0];

    if (!file) return;

    const preview =
      URL.createObjectURL(file);

    setProfile((prev) => ({
      ...prev,
      profileImage: preview,
    }));
  };

  if (loading) {
    return (
      <Layout>
        <h2>Loading...</h2>
      </Layout>
    );
  }

  /* ===========================
     STYLES
  =========================== */

  const inputStyle = {
    width: "100%",
    padding: "13px 16px",
    border:
      "1px solid #dbe4ee",
    borderRadius: "12px",
    fontSize: "15px",
    outline: "none",
    marginTop: "6px",
  };

  const infoRow = {
    display: "flex",
    alignItems: "center",
    padding: "18px 0",
    borderBottom:
      "1px solid #edf2f7",
  };

  const infoLeft = {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    width: "100%",
  };

  const labelStyle = {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: 600,
    display: "block",
    marginBottom: "6px",
  };

  const valueStyle = {
    margin: 0,
    fontSize: "18px",
    color: "#0f172a",
    fontWeight: "600",
  };
    return (
    <Layout>
      <div
        style={{
          maxWidth: "1400px",
          margin: "25px auto",
          padding: "0 15px",
        }}
      >
        {/* Hidden File Input */}

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleProfileImage}
          style={{ display: "none" }}
        />

        {/* ================= HEADER ================= */}

        <div
          style={{
            background:
              "linear-gradient(135deg,#2563eb,#3b82f6,#1d4ed8)",
            borderRadius: "30px",
            padding: "40px 50px",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            overflow: "hidden",
            position: "relative",
            boxShadow:
              "0 20px 45px rgba(37,99,235,.35)",
            marginBottom: "35px",
          }}
        >
          {/* Decorative Circle */}

          <div
            style={{
              position: "absolute",
              right: "-60px",
              top: "-50px",
              width: "260px",
              height: "260px",
              borderRadius: "50%",
              background:
                "rgba(255,255,255,.08)",
            }}
          />

          {/* Left Side */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "35px",
              zIndex: 2,
            }}
          >
            {/* Avatar */}

            <div
              style={{
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "170px",
                  height: "170px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border:
                    "6px solid rgba(255,255,255,.35)",
                }}
              >
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: "60px",
                      fontWeight: "700",
                      color: "#2563eb",
                    }}
                  >
                    {profile.fullName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                )}
              </div>

              {/* Camera Button */}

              <button
                type="button"
                onClick={openFilePicker}
                style={{
                  position: "absolute",
                  right: "8px",
                  bottom: "8px",
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  border: "none",
                  background: "#fff",
                  color: "#2563eb",
                  cursor: "pointer",
                  fontSize: "18px",
                  boxShadow:
                    "0 10px 20px rgba(0,0,0,.20)",
                }}
              >
                <FaCamera />
              </button>
            </div>

            {/* User Information */}

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "42px",
                  fontWeight: "700",
                }}
              >
                {profile.fullName}
              </h1>

              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  marginTop: "20px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    background:
                      "rgba(255,255,255,.18)",
                    padding:
                      "12px 24px",
                    borderRadius: "14px",
                    fontWeight: "600",
                    backdropFilter:
                      "blur(10px)",
                  }}
                >
                  {profile.role}
                </div>

                <div
                  style={{
                    background:
                      "rgba(255,255,255,.18)",
                    padding:
                      "12px 24px",
                    borderRadius: "14px",
                    fontWeight: "600",
                    backdropFilter:
                      "blur(10px)",
                  }}
                >
                  {profile.department ||
                    "No Department"}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side */}

          <div
            style={{
              zIndex: 2,
            }}
          >
           <button
  type="button"
  onClick={saveProfile}
  disabled={saving}
  style={{
    border: "none",
    background: "#16a34a",
    color: "#fff",
    padding: "16px 34px",
    borderRadius: "40px",
    fontWeight: "700",
    fontSize: "16px",
    cursor: "pointer",
  }}
>
  {saving ? "Saving..." : "Save Changes"}
</button>
          </div>
        </div>

        {/* ================= CONTENT ================= */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "2fr 1fr",
            gap: "30px",
            alignItems: "start",
          }}
        >
                    {/* ================= PERSONAL INFORMATION ================= */}

          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              padding: "35px",
              boxShadow:
                "0 12px 35px rgba(15,23,42,.08)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "30px",
                fontSize: "28px",
                color: "#0f172a",
              }}
            >
              Personal Information
            </h2>

            {/* Full Name */}

            <div style={infoRow}>
              <div style={infoLeft}>
                <FaUser
                  color="#2563eb"
                  size={20}
                />

                <div style={{ flex: 1 }}>
                  <span style={labelStyle}>
                    Full Name
                  </span>

                  {editing ? (
                    <input
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  ) : (
                    <h3 style={valueStyle}>
                      {profile.fullName}
                    </h3>
                  )}
                </div>
              </div>
            </div>

            {/* Department */}

            <div style={infoRow}>
              <div style={infoLeft}>
                <FaBuilding
                  color="#2563eb"
                  size={20}
                />

                <div style={{ flex: 1 }}>
                  <span style={labelStyle}>
                    Department
                  </span>

                  {editing ? (
                    <input
                      name="department"
                      value={profile.department}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  ) : (
                    <h3 style={valueStyle}>
                      {profile.department ||
                        "-"}
                    </h3>
                  )}
                </div>
              </div>
            </div>

            {/* Phone */}

            <div style={infoRow}>
              <div style={infoLeft}>
                <FaPhone
                  color="#2563eb"
                  size={20}
                />

                <div style={{ flex: 1 }}>
                  <span style={labelStyle}>
                    Phone Number
                  </span>

                  {editing ? (
                    <input
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  ) : (
                    <h3 style={valueStyle}>
                      {profile.phone ||
                        "-"}
                    </h3>
                  )}
                </div>
              </div>
            </div>

            {/* Address */}

            <div style={infoRow}>
              <div style={infoLeft}>
                <FaMapMarkerAlt
                  color="#2563eb"
                  size={20}
                />

                <div style={{ flex: 1 }}>
                  <span style={labelStyle}>
                    Address
                  </span>

                  {editing ? (
                    <input
                      name="address"
                      value={profile.address}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  ) : (
                    <h3 style={valueStyle}>
                      {profile.address ||
                        "-"}
                    </h3>
                  )}
                </div>
              </div>
            </div>

            {/* Gender */}

            <div style={infoRow}>
              <div style={infoLeft}>
                <FaVenusMars
                  color="#2563eb"
                  size={20}
                />

                <div style={{ flex: 1 }}>
                  <span style={labelStyle}>
                    Gender
                  </span>

                  {editing ? (
                    <select
                      name="gender"
                      value={profile.gender}
                      onChange={handleChange}
                      style={inputStyle}
                    >
                      <option value="">
                        Select Gender
                      </option>

                      <option value="Male">
                        Male
                      </option>

                      <option value="Female">
                        Female
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>
                  ) : (
                    <h3 style={valueStyle}>
                      {profile.gender ||
                        "-"}
                    </h3>
                  )}
                </div>
              </div>
            </div>

            {/* Member Since */}

            <div
              style={{
                ...infoRow,
                borderBottom: "none",
              }}
            >
              <div style={infoLeft}>
                <FaCalendarAlt
                  color="#2563eb"
                  size={20}
                />

                <div>
                  <span style={labelStyle}>
                    Member Since
                  </span>

                  <h3 style={valueStyle}>
                    {profile.createdAt
                      ? new Date(
                          profile.createdAt
                        ).toLocaleDateString()
                      : "-"}
                  </h3>
                </div>
              </div>
            </div>
          </div>
                    {/* ================= SECURITY PANEL ================= */}

          <div
            style={{
              background: "#fff",
              borderRadius: "24px",
              padding: "30px",
              boxShadow:
                "0 12px 35px rgba(15,23,42,.08)",
              position: "sticky",
              top: "25px",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "30px",
                color: "#0f172a",
                fontSize: "26px",
              }}
            >
              Security
            </h2>

            <form
              onSubmit={updatePassword}
            >
              <div
                style={{
                  marginBottom: "20px",
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#475569",
                    fontWeight: 600,
                  }}
                >
                  Current Password
                </label>

                <input
                  type="password"
                  name="currentPassword"
                  value={
                    passwords.currentPassword
                  }
                  onChange={
                    passwordChange
                  }
                  style={inputStyle}
                />
              </div>

              <div
                style={{
                  marginBottom: "20px",
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#475569",
                    fontWeight: 600,
                  }}
                >
                  New Password
                </label>

                <input
                  type="password"
                  name="newPassword"
                  value={
                    passwords.newPassword
                  }
                  onChange={
                    passwordChange
                  }
                  style={inputStyle}
                />
              </div>

              <div
                style={{
                  marginBottom: "30px",
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#475569",
                    fontWeight: 600,
                  }}
                >
                  Confirm Password
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={
                    passwords.confirmPassword
                  }
                  onChange={
                    passwordChange
                  }
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={
                  passwordLoading
                }
                style={{
                  width: "100%",
                  padding: "15px",
                  border: "none",
                  borderRadius: "14px",
                  background:
                    "linear-gradient(135deg,#2563eb,#1d4ed8)",
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                {passwordLoading
                  ? "Updating Password..."
                  : "Change Password"}
              </button>
            </form>

            <hr
              style={{
                margin: "35px 0",
                border: "none",
                borderTop:
                  "1px solid #e5e7eb",
              }}
            />

            <div>
              <h3
                style={{
                  marginBottom: "15px",
                  color: "#0f172a",
                }}
              >
                Account Status
              </h3>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: "12px",
                }}
              >
                <span>Status</span>

                <span
                  style={{
                    color: profile.isActive
                      ? "#16a34a"
                      : "#dc2626",
                    fontWeight: 700,
                  }}
                >
                  {profile.isActive
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                }}
              >
                <span>Last Login</span>

                <span>
                  {profile.lastLogin
                    ? new Date(
                        profile.lastLogin
                      ).toLocaleDateString()
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Profile;