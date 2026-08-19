import User from "../models/user.js";
import generateToken from "../utils/generateToken.js";

/* ============================================================
   Helper
============================================================ */

const buildUserResponse = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  studentId: user.studentId,
  employeeId: user.employeeId,
  department: user.department,
  phone: user.phone,
  profileImage: user.profileImage,
  assignedCourses: user.assignedCourses,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  token: generateToken(
    user._id,
    user.role
  ),
});

/* ============================================================
   REGISTER
============================================================ */

export const register = async (
  req,
  res
) => {
  try {

    const {
      fullName,
      email,
      password,
      role,
      studentId,
      employeeId,
      department,
      phone,
      profileImage,
      assignedCourses,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        message:
          "Full name, email, password and role are required.",
      });
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const existingUser =
      await User.findOne({
        email:
          normalizedEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        message:
          "A user with this email already exists.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long.",
      });
    }

    const user =
      await User.create({

        fullName:
          fullName.trim(),

        email:
          normalizedEmail,

        password,

        role,

        studentId,

        employeeId,

        department,

        phone,

        profileImage,

        assignedCourses,

      });

    return res.status(201).json({
      message:
        "User registered successfully.",
      user:
        buildUserResponse(
          user
        ),
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message:
        "Failed to register user.",
    });

  }

};

/* ============================================================
   LOGIN
============================================================ */

export const login = async (
  req,
  res
) => {

  try {

    const {
      email,
      password,
    } = req.body;
        if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message:
          "Your account has been disabled. Please contact the administrator.",
      });
    }

    const isMatch =
      await user.matchPassword(
        password
      );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(
  user._id,
  user.role
);

return res.json({
  message: "Login successful.",
  token,
  ...buildUserResponse(user),
});

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message:
        "Failed to login.",
    });

  }

};

/* ============================================================
   GET PROFILE
============================================================ */

export const getProfile = async (
  req,
  res
) => {

  try {

    const user =
      await User.findById(
        req.user._id
      )
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.json(user);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message:
        "Failed to load profile.",
    });

  }

};

/* ============================================================
   UPDATE PROFILE
============================================================ */

export const updateProfile = async (
  req,
  res
) => {

  try {

    const user =
      await User.findById(
        req.user._id
      );

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    user.fullName =
      req.body.fullName ??
      user.fullName;

    user.department =
      req.body.department ??
      user.department;

    user.phone =
      req.body.phone ??
      user.phone;

    user.profileImage =
      req.body.profileImage ??
      user.profileImage;

    await user.save();

    return res.json({
      message:
        "Profile updated successfully.",
      user:
        buildUserResponse(user),
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message:
        "Failed to update profile.",
    });

  }

};

/* ============================================================
   CHANGE PASSWORD
============================================================ */
// ======================================
// Change Password
// ======================================

export const changePassword = async (
  req,
  res
) => {

  try {

    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        message:
          "Current password and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message:
          "New password must be at least 6 characters long.",
      });
    }

    const user =
      await User.findById(
        req.user._id
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found.",
      });
    }

    const isMatch =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        message:
          "Current password is incorrect.",
      });
    }

    user.password =
      newPassword;

    await user.save();

    return res.json({
      message:
        "Password changed successfully.",
    });

  } catch (error) {

    console.error(
      "Change Password Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to change password.",
    });

  }

};