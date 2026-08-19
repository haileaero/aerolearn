import api from "../api";

// ======================================
// Get Logged-in User Profile
// ======================================

export const getProfile = async () => {
  try {

    const { data } = await api.get(
      "/auth/profile"
    );

    return data;

  } catch (error) {

    console.error(error);

    throw (
      error.response?.data || {
        message:
          "Unable to load profile.",
      }
    );

  }
};

// ======================================
// Update Profile
// ======================================

export const updateProfile = async (
  profile
) => {
  try {

    const { data } = await api.put(
      "/auth/profile",
      profile
    );

    // ================================
    // Update Local Storage
    // ================================

    if (data.user) {

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

    } else {

      localStorage.setItem(
        "user",
        JSON.stringify(data)
      );

    }

    if (data.token) {

      localStorage.setItem(
        "token",
        data.token
      );

    }

    return data;

  } catch (error) {

    console.error(error);

    throw (
      error.response?.data || {
        message:
          "Unable to update profile.",
      }
    );

  }
};

// ======================================
// Change Password
// ======================================

export const changePassword = async (
  passwords
) => {
  try {

    const { data } = await api.put(
      "/auth/change-password",
      passwords
    );

    return data;

  } catch (error) {

    console.error(error);

    throw (
      error.response?.data || {
        message:
          "Unable to change password.",
      }
    );

  }
};

// ======================================
// Upload Profile Photo
// ======================================

export const uploadProfilePhoto = async (
  formData
) => {
  try {

    const { data } = await api.post(
      "/auth/profile/photo",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    return data;

  } catch (error) {

    console.error(error);

    throw (
      error.response?.data || {
        message:
          "Unable to upload profile photo.",
      }
    );

  }
};

// ======================================
// Delete Profile Photo
// ======================================

export const deleteProfilePhoto =
  async () => {
    try {

      const { data } =
        await api.delete(
          "/auth/profile/photo"
        );

      return data;

    } catch (error) {

      console.error(error);

      throw (
        error.response?.data || {
          message:
            "Unable to delete profile photo.",
        }
      );

    }
  };