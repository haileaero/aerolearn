import { useContext, useEffect, useRef, useState } from "react";
import { FaBuilding, FaCalendarAlt, FaCamera, FaEnvelope, FaKey, FaMapMarkerAlt, FaPhone, FaShieldAlt, FaUser, FaVenusMars } from "react-icons/fa";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import { useUI } from "../context/UIContext";
import { getProfile, updateProfile, changePassword } from "../services/userService";

const EMPTY_PROFILE = {
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
};

function Profile() {
  const { updateUser } = useContext(AuthContext);
  const { toast } = useUI();
  const fileInputRef = useRef(null);
  const profileLoadedRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [editDraft, setEditDraft] = useState(EMPTY_PROFILE);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    // Load the profile exactly once for this mounted page. In development,
    // React StrictMode can run effects twice; the ref prevents a late second
    // response from overwriting fields while the user is already typing.
    if (profileLoadedRef.current) return;
    profileLoadedRef.current = true;

    let active = true;
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        if (!active) return;
        const normalized = { ...EMPTY_PROFILE, ...(data || {}) };
        setProfile(normalized);
        setEditDraft(normalized);
      } catch (error) {
        if (active) setMessage(error.message || "Unable to load profile.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();
    return () => { active = false; };
  }, []);

  const beginEdit = () => {
    setEditDraft({ ...profile });
    setMessage("");
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditDraft({ ...profile });
    setMessage("");
    setEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditDraft((prev) => ({ ...prev, [name]: value }));
  };

  const passwordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    if (!editDraft.fullName?.trim()) {
      setMessage("Full name is required.");
      return;
    }
    if (!editDraft.email?.trim()) {
      setMessage("Email is required.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      const updated = await updateProfile(editDraft);
      const normalized = { ...profile, ...(updated || {}) };
      setProfile(normalized);
      setEditDraft(normalized);
      updateUser(normalized);
      setEditing(false);
      setMessage("Profile updated successfully.");
      toast("Profile changes saved.");
    } catch (error) {
      setMessage(error.message || "Profile update failed.");
      toast(error.message || "Profile update failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }
    if (passwords.newPassword.length < 8) {
      setMessage("New password must be at least 8 characters long.");
      return;
    }

    try {
      setPasswordLoading(true);
      setMessage("");
      const res = await changePassword(passwords);
      setMessage(res.message || "Password updated.");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast("Password updated successfully.");
    } catch (error) {
      setMessage(error.message || "Password update failed.");
      toast(error.message || "Password update failed.", "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleProfileImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }
    if (file.size > 1024 * 1024) {
      setMessage("Profile image must be 1 MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      setEditDraft((prev) => ({ ...prev, profileImage: dataUrl }));
      if (!editing) setEditing(true);
    };
    reader.onerror = () => setMessage("Unable to read the selected image.");
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  if (loading) return <Layout><div className="student-empty-state">Loading profile…</div></Layout>;

  const shown = editing ? editDraft : profile;
  const initials = shown.fullName?.split(" ").map((n) => n[0]).join("").slice(0,2).toUpperCase() || "AL";
  const info = [
    [<FaEnvelope key="e" />, "Email", profile.email], [<FaPhone key="p" />, "Phone", profile.phone || "Not provided"],
    [<FaBuilding key="b" />, "Department", profile.department || "Not assigned"], [<FaVenusMars key="g" />, "Gender", profile.gender || "Not provided"],
    [<FaMapMarkerAlt key="a" />, "Address", profile.address || "Not provided"], [<FaCalendarAlt key="c" />, "Member since", profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"],
  ];

  return (
    <Layout>
      <div className="profile-pro-page">
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleProfileImage} hidden />
        <header className="profile-pro-header">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">{shown.profileImage ? <img src={shown.profileImage} alt="Profile" /> : initials}</div>
            <button type="button" onClick={() => fileInputRef.current?.click()} title="Change profile photo"><FaCamera /></button>
          </div>
          <div className="profile-title"><span className="student-eyebrow"><FaUser /> Account profile</span><h1>{shown.fullName}</h1><div className="profile-chips"><span>{profile.role}</span><span>{shown.department || "AeroLearn"}</span><span className={profile.isActive ? "active" : "inactive"}>{profile.isActive ? "Active" : "Inactive"}</span></div></div>
          <button className="profile-edit-btn" type="button" onClick={editing ? cancelEdit : beginEdit}>{editing ? "Cancel" : "Edit profile"}</button>
        </header>

        {message && <div className="student-alert">{message}</div>}

        <div className="profile-pro-grid">
          <section className="profile-panel profile-main-panel">
            <div className="profile-panel-head"><div><h2>Personal information</h2><p>Keep your account details accurate and up to date.</p></div></div>
            {editing ? (
              <div className="profile-edit-grid">
                <label>Full name<input name="fullName" value={editDraft.fullName || ""} onChange={handleChange} /></label>
                <label>Email<input name="email" type="email" value={editDraft.email || ""} onChange={handleChange} /></label>
                <label>Phone<input name="phone" value={editDraft.phone || ""} onChange={handleChange} /></label>
                <label>Department<input name="department" value={editDraft.department || ""} onChange={handleChange} /></label>
                <label>Gender<select name="gender" value={editDraft.gender || ""} onChange={handleChange}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></label>
                <label>Address<input name="address" value={editDraft.address || ""} onChange={handleChange} /></label>
                <div className="profile-save-row"><button type="button" onClick={saveProfile} disabled={saving}>{saving ? "Saving…" : "Save changes"}</button></div>
              </div>
            ) : (
              <div className="profile-info-grid">{info.map(([icon,label,value]) => <div className="profile-info-item" key={label}><span>{icon}</span><div><small>{label}</small><strong>{value}</strong></div></div>)}</div>
            )}
          </section>

          <section className="profile-panel profile-security-panel">
            <div className="profile-security-title"><span><FaShieldAlt /></span><div><h2>Security</h2><p>Update your account password.</p></div></div>
            <form onSubmit={updatePassword} className="profile-password-form">
              <label>Current password<input type="password" name="currentPassword" value={passwords.currentPassword} onChange={passwordChange} required /></label>
              <label>New password<input type="password" name="newPassword" value={passwords.newPassword} onChange={passwordChange} minLength={8} required /></label>
              <label>Confirm password<input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={passwordChange} minLength={8} required /></label>
              <button type="submit" disabled={passwordLoading}><FaKey /> {passwordLoading ? "Updating…" : "Update password"}</button>
            </form>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default Profile;
