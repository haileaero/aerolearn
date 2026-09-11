import api from "../api";

const messageFrom = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const getProfile = async () => {
  try {
    const { data } = await api.get("/auth/profile");
    return data?.user || data;
  } catch (error) {
    throw new Error(messageFrom(error, "Unable to load profile."), { cause: error });
  }
};

export const updateProfile = async (profile) => {
  try {
    // Only send editable profile fields. This prevents stale role/status/token
    // values from a cached profile object being submitted back to the API.
    const payload = {
      fullName: profile.fullName,
      email: profile.email,
      department: profile.department,
      phone: profile.phone,
      gender: profile.gender,
      address: profile.address,
      profileImage: profile.profileImage,
    };

    const { data } = await api.put("/auth/profile", payload);
    const responseUser = data?.user || data;

    // Read the profile back from the database after the PUT. This makes the
    // UI reflect what was actually persisted instead of trusting a stale or
    // partial update response from an older backend deployment.
    const { data: verifiedData } = await api.get("/auth/profile", {
      params: { _ts: Date.now() },
      headers: { "Cache-Control": "no-cache" },
    });
    const updated = verifiedData?.user || verifiedData || responseUser;

    const editableFields = [
      "fullName", "email", "department", "phone", "gender", "address",
    ];
    const mismatch = editableFields.find((field) => {
      const requested = String(payload[field] ?? "").trim();
      const persisted = String(updated?.[field] ?? "").trim();
      return requested !== persisted;
    });

    if (mismatch) {
      throw new Error(
        `The server did not persist the ${mismatch} change. Make sure the current backend is running/deployed and the frontend is pointing to it.`
      );
    }

    if (updated) {
      const current = JSON.parse(localStorage.getItem("user") || "null") || {};
      const merged = { ...current, ...updated };
      const token = updated.token || responseUser?.token || current.token || localStorage.getItem("token") || "";
      if (token) merged.token = token;
      localStorage.setItem("user", JSON.stringify(merged));
      if (token) localStorage.setItem("token", token);
    }

    return updated;
  } catch (error) {
    throw new Error(messageFrom(error, "Unable to update profile."), { cause: error });
  }
};

export const changePassword = async (passwords) => {
  try {
    const { data } = await api.put("/auth/change-password", {
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    });
    return data;
  } catch (error) {
    throw new Error(messageFrom(error, "Unable to change password."), { cause: error });
  }
};

// Kept for backward compatibility with any older screens. The current profile
// page stores a small compressed image directly with the profile update so it
// remains available on stateless production hosts.
export const uploadProfilePhoto = async (formData) => {
  try {
    const { data } = await api.post("/auth/profile/photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (error) {
    throw new Error(messageFrom(error, "Unable to upload profile photo."), { cause: error });
  }
};

export const deleteProfilePhoto = async () => {
  try {
    const { data } = await api.delete("/auth/profile/photo");
    return data;
  } catch (error) {
    throw new Error(messageFrom(error, "Unable to delete profile photo."), { cause: error });
  }
};
