import User from "../models/user.js";
import Student from "../models/student.js";
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
  gender: user.gender,
  address: user.address,
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
      gender,
      address,
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

        gender,

        address,

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

export const getProfile = async (req, res) => {
  try {
    let user = await User.findById(req.user._id)
      .select("-password")
      .read("primary")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Older AeroLearn versions stored some student profile details only in the
    // Student collection. For student accounts, backfill missing User profile
    // fields once so the common /auth/profile endpoint becomes the single
    // source of truth for every role.
    if (user.role === "Student") {
      const student = await Student.findOne({
        $or: [
          { user: user._id },
          ...(user.studentId ? [{ studentId: user.studentId }] : []),
        ],
      })
        .read("primary")
        .lean();

      if (student) {
        const backfill = {};
        if (!user.fullName && student.fullName) backfill.fullName = student.fullName;
        if (!user.email && student.email) backfill.email = student.email;
        if (!user.phone && student.phone) backfill.phone = student.phone;
        if (!user.department && student.department) backfill.department = student.department;
        if (!user.gender && student.gender) backfill.gender = student.gender;
        if (!user.profileImage && student.photo) backfill.profileImage = student.photo;

        if (Object.keys(backfill).length) {
          user = await User.findByIdAndUpdate(
            user._id,
            { $set: backfill },
            { new: true, runValidators: true }
          )
            .select("-password")
            .read("primary")
            .lean();
        }
      }
    }

    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    return res.json(user);
  } catch (error) {
    console.error("Profile load error:", error);
    return res.status(500).json({ message: "Failed to load profile." });
  }
};

/* ============================================================
   UPDATE PROFILE
============================================================ */

export const updateProfile = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id)
      .select("email role studentId")
      .read("primary")
      .lean();

    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // These fields are editable for Admin, Instructor and Student alike.
    // The original project rendered gender/address in the profile UI but the
    // User schema/controller did not persist them, which made values revert.
    const editableFields = [
      "fullName",
      "email",
      "department",
      "phone",
      "gender",
      "address",
      "profileImage",
    ];

    const updates = {};
    for (const field of editableFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (updates.fullName !== undefined) {
      updates.fullName = String(updates.fullName).trim();
      if (!updates.fullName) {
        return res.status(400).json({ message: "Full name is required." });
      }
    }

    if (updates.email !== undefined) {
      updates.email = String(updates.email).trim().toLowerCase();
      if (!updates.email) {
        return res.status(400).json({ message: "Email is required." });
      }

      const duplicateUser = await User.findOne({
        email: updates.email,
        _id: { $ne: req.user._id },
      }).read("primary");

      if (duplicateUser) {
        return res.status(409).json({ message: "That email is already in use." });
      }

      if (currentUser.role === "Student") {
        const duplicateStudent = await Student.findOne({
          email: updates.email,
          $nor: [
            { user: req.user._id },
            ...(currentUser.studentId ? [{ studentId: currentUser.studentId }] : []),
          ],
        }).read("primary");
        if (duplicateStudent) {
          return res.status(409).json({ message: "That email is already used by another student." });
        }
      }
    }

    for (const field of ["department", "phone", "address"]) {
      if (updates[field] !== undefined) updates[field] = String(updates[field] ?? "").trim();
    }

    if (updates.gender !== undefined) {
      updates.gender = String(updates.gender || "");
      if (!["", "Male", "Female", "Other"].includes(updates.gender)) {
        return res.status(400).json({ message: "Invalid gender value." });
      }
    }

    if (updates.profileImage !== undefined) {
      updates.profileImage = String(updates.profileImage || "");
      if (updates.profileImage.length > 1_500_000) {
        return res.status(413).json({ message: "Profile image is too large." });
      }
    }

    // One atomic write to the User collection. User is the canonical profile
    // record for every login role.
    let updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true, context: "query" }
    )
      .select("-password")
      .read("primary")
      .lean();

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Student data is duplicated in the Student collection in this project.
    // Keep identity fields synchronized so editing the common profile does not
    // leave Student Management showing stale values. Address has no Student
    // schema field, so it intentionally remains only on User.
    if (currentUser.role === "Student") {
      const studentUpdates = {};
      if (updates.fullName !== undefined) studentUpdates.fullName = updates.fullName;
      if (updates.email !== undefined) studentUpdates.email = updates.email;
      if (updates.phone !== undefined) studentUpdates.phone = updates.phone;
      if (updates.department !== undefined) studentUpdates.department = updates.department;
      if (["Male", "Female"].includes(updates.gender)) studentUpdates.gender = updates.gender;
      if (updates.profileImage !== undefined) studentUpdates.photo = updates.profileImage;

      if (Object.keys(studentUpdates).length) {
        await Student.findOneAndUpdate(
          {
            $or: [
              { user: req.user._id },
              ...(currentUser.studentId ? [{ studentId: currentUser.studentId }] : []),
            ],
          },
          { $set: studentUpdates },
          { runValidators: true }
        );
      }
    }

    // Read back from the primary and compare only fields submitted in this
    // request. Never return 200 if the database did not keep the new values.
    updatedUser = await User.findById(req.user._id)
      .select("-password")
      .read("primary")
      .lean();

    const mismatch = Object.keys(updates).find((field) => {
      const requested = String(updates[field] ?? "").trim();
      const persisted = String(updatedUser?.[field] ?? "").trim();
      return requested !== persisted;
    });

    if (mismatch) {
      console.error("PROFILE_PERSISTENCE_MISMATCH", {
        userId: String(req.user._id),
        role: currentUser.role,
        field: mismatch,
        requested: mismatch === "profileImage" ? "[image data]" : updates[mismatch],
        persisted: mismatch === "profileImage" ? "[image data]" : updatedUser?.[mismatch],
      });
      return res.status(500).json({
        message: `MongoDB did not persist the ${mismatch} field.`,
        field: mismatch,
      });
    }

    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    return res.json({
      message: "Profile updated successfully.",
      user: buildUserResponse(updatedUser),
    });
  } catch (error) {
    console.error("Profile update error:", error);

    if (error?.code === 11000) {
      return res.status(409).json({ message: "That email is already in use." });
    }
    if (error?.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors || {})[0]?.message || "Invalid profile data.",
      });
    }

    return res.status(500).json({ message: "Failed to update profile." });
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

    if (newPassword.length < 8) {
      return res.status(400).json({
        message:
          "New password must be at least 8 characters long.",
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
      await user.matchPassword(
        currentPassword
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