import { useContext, useEffect, useRef, useState } from "react";
import { FaBuilding, FaCalendarAlt, FaCamera, FaEnvelope, FaKey, FaMapMarkerAlt, FaPhone, FaShieldAlt, FaUser, FaVenusMars } from "react-icons/fa";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import { getProfile, updateProfile, changePassword } from "../services/userService";

function Profile() {
  const { updateUser } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState({ fullName:"", email:"", department:"", phone:"", address:"", gender:"", role:"", createdAt:"", lastLogin:"", isActive:true, profileImage:"" });
  const [passwords, setPasswords] = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });

  useEffect(() => {
    const loadProfile = async () => {
      try { const data = await getProfile(); setProfile(data); updateUser(data); }
      catch { setMessage("Unable to load profile."); }
      finally { setLoading(false); }
    };
    loadProfile();
  }, [updateUser]);

  const handleChange = (e) => setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const passwordChange = (e) => setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const saveProfile = async () => {
    try { setSaving(true); const updated = await updateProfile(profile); setProfile(updated); updateUser(updated); setEditing(false); setMessage("Profile updated successfully."); }
    catch (err) { setMessage(err.response?.data?.message || "Profile update failed."); }
    finally { setSaving(false); }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return setMessage("New passwords do not match.");
    try { setPasswordLoading(true); const res = await changePassword(passwords); setMessage(res.message || "Password updated."); setPasswords({ currentPassword:"", newPassword:"", confirmPassword:"" }); }
    catch (err) { setMessage(err.response?.data?.message || "Password update failed."); }
    finally { setPasswordLoading(false); }
  };

  const handleProfileImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfile((prev) => ({ ...prev, profileImage: URL.createObjectURL(file) }));
  };

  if (loading) return <Layout><div className="student-empty-state">Loading profile…</div></Layout>;

  const initials = profile.fullName?.split(" ").map((n) => n[0]).join("").slice(0,2).toUpperCase() || "AL";
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
            <div className="profile-avatar">{profile.profileImage ? <img src={profile.profileImage} alt="Profile" /> : initials}</div>
            <button type="button" onClick={() => fileInputRef.current?.click()}><FaCamera /></button>
          </div>
          <div className="profile-title"><span className="student-eyebrow"><FaUser /> Account profile</span><h1>{profile.fullName}</h1><div className="profile-chips"><span>{profile.role}</span><span>{profile.department || "AeroLearn"}</span><span className={profile.isActive ? "active" : "inactive"}>{profile.isActive ? "Active" : "Inactive"}</span></div></div>
          <button className="profile-edit-btn" type="button" onClick={() => setEditing((value) => !value)}>{editing ? "Cancel" : "Edit profile"}</button>
        </header>

        {message && <div className="student-alert">{message}</div>}

        <div className="profile-pro-grid">
          <section className="profile-panel profile-main-panel">
            <div className="profile-panel-head"><div><h2>Personal information</h2><p>Keep your account details accurate and up to date.</p></div></div>
            {editing ? (
              <div className="profile-edit-grid">
                <label>Full name<input name="fullName" value={profile.fullName || ""} onChange={handleChange} /></label>
                <label>Email<input name="email" value={profile.email || ""} onChange={handleChange} /></label>
                <label>Phone<input name="phone" value={profile.phone || ""} onChange={handleChange} /></label>
                <label>Department<input name="department" value={profile.department || ""} onChange={handleChange} /></label>
                <label>Gender<select name="gender" value={profile.gender || ""} onChange={handleChange}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></label>
                <label>Address<input name="address" value={profile.address || ""} onChange={handleChange} /></label>
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
              <label>New password<input type="password" name="newPassword" value={passwords.newPassword} onChange={passwordChange} required /></label>
              <label>Confirm password<input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={passwordChange} required /></label>
              <button type="submit" disabled={passwordLoading}><FaKey /> {passwordLoading ? "Updating…" : "Update password"}</button>
            </form>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default Profile;
