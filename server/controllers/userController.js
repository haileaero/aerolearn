import User from "../models/user.js";

/* ============================================================
   Helpers
============================================================ */

const userFields =
  "-password -__v";

/* ============================================================
   GET ALL USERS
   Search + Filters + Pagination
============================================================ */

export const getUsers = async (
  req,
  res
) => {

  try {

    const page =
      Number(req.query.page) || 1;

    const limit =
      Number(req.query.limit) || 20;

    const skip =
      (page - 1) * limit;

    const filter = {};

    if (req.query.role) {
      filter.role =
        req.query.role;
    }

    if (req.query.department) {
      filter.department =
        req.query.department;
    }

    if (req.query.status) {
      filter.isActive =
        req.query.status ===
        "Active";
    }

    if (req.query.search) {

      filter.$or = [

        {
          fullName: {
            $regex:
              req.query.search,
            $options: "i",
          },
        },

        {
          email: {
            $regex:
              req.query.search,
            $options: "i",
          },
        },

        {
          studentId: {
            $regex:
              req.query.search,
            $options: "i",
          },
        },

        {
          employeeId: {
            $regex:
              req.query.search,
            $options: "i",
          },
        },

      ];

    }

    const total =
      await User.countDocuments(
        filter
      );

    const users =
      await User.find(filter)

        .select(userFields)

        .sort({
  createdAt: 1,
})

        .skip(skip)

        .limit(limit);

    return res.json({

      users,

      pagination: {

        page,

        limit,

        total,

        pages: Math.ceil(
          total / limit
        ),

      },

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      message:
        "Failed to retrieve users.",

    });

  }

};

/* ============================================================
   GET USER BY ID
============================================================ */

export const getUserById =
  async (
    req,
    res
  ) => {

    try {

      const user =
        await User.findById(
          req.params.id
        )
        .select(userFields);

      if (!user) {

        return res
          .status(404)
          .json({

            message:
              "User not found.",

          });

      }

      return res.json(user);

    } catch (error) {

      console.error(error);

      return res.status(500).json({

        message:
          "Failed to retrieve user.",

      });

    }

  };
  /* ============================================================
   GET ALL INSTRUCTORS
============================================================ */

export const getInstructors = async (
  req,
  res
) => {

  try {

    const instructors =
      await User.find({

        role: "Instructor",

        isActive: true,

      })

      .select(
        "fullName email department employeeId"
      )

     .sort({
  createdAt: 1,
})

    return res.json(
      instructors
    );

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      message:
        "Failed to retrieve instructors.",

    });

  }

};

/* ============================================================
   GET ALL STUDENTS
============================================================ */

export const getStudents = async (
  req,
  res
) => {

  try {

    const students =
      await User.find({

        role: "Student",

        isActive: true,

      })

      .select(
        "fullName email studentId department"
      )

     .sort({
  createdAt: 1,
})

    return res.json(
      students
    );

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      message:
        "Failed to retrieve students.",

    });

  }

};

/* ============================================================
   CREATE USER
============================================================ */

export const createUser = async (
  req,
  res
) => {

  try {

    const {

      fullName,

      email,

      password,

      role,

      department,

      studentId,

      employeeId,

      phone,

    } = req.body;

    if (
      !fullName ||
      !email ||
      !password ||
      !role
    ) {

      return res.status(400).json({

        message:
          "Full Name, Email, Password and Role are required.",

      });

    }

    const emailExists =
      await User.findOne({

        email:
          email.trim().toLowerCase(),

      });

    if (emailExists) {

      return res.status(400).json({

        message:
          "Email already exists.",

      });

    }

    if (
      studentId &&
      await User.findOne({
        studentId,
      })
    ) {

      return res.status(400).json({

        message:
          "Student ID already exists.",

      });

    }

    if (
      employeeId &&
      await User.findOne({
        employeeId,
      })
    ) {

      return res.status(400).json({

        message:
          "Employee ID already exists.",

      });

    }

    const user =
      await User.create({

        fullName,

        email:
          email.trim().toLowerCase(),

        password,

        role,

        department,

        studentId,

        employeeId,

        phone,

      });

    return res.status(201).json({

      message:
        "User created successfully.",

      user: {

        _id: user._id,

        fullName:
          user.fullName,

        email:
          user.email,

        role:
          user.role,

      },

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      message:
        "Failed to create user.",

    });

  }

};
/* ============================================================
   UPDATE USER
============================================================ */

export const updateUser = async (
  req,
  res
) => {

  try {

    const user =
      await User.findById(
        req.params.id
      );

    if (!user) {

      return res.status(404).json({

        message:
          "User not found.",

      });

    }

    if (
      req.body.email &&
      req.body.email !== user.email
    ) {

      const emailExists =
        await User.findOne({

          email:
            req.body.email
              .trim()
              .toLowerCase(),

          _id: {
            $ne: user._id,
          },

        });

      if (emailExists) {

        return res.status(400).json({

          message:
            "Email already exists.",

        });

      }

    }

    if (
      req.body.studentId &&
      req.body.studentId !==
        user.studentId
    ) {

      const studentExists =
        await User.findOne({

          studentId:
            req.body.studentId,

          _id: {
            $ne: user._id,
          },

        });

      if (studentExists) {

        return res.status(400).json({

          message:
            "Student ID already exists.",

        });

      }

    }

    if (
      req.body.employeeId &&
      req.body.employeeId !==
        user.employeeId
    ) {

      const employeeExists =
        await User.findOne({

          employeeId:
            req.body.employeeId,

          _id: {
            $ne: user._id,
          },

        });

      if (employeeExists) {

        return res.status(400).json({

          message:
            "Employee ID already exists.",

        });

      }

    }

    user.fullName =
      req.body.fullName ??
      user.fullName;

    user.email =
      req.body.email
        ?.trim()
        .toLowerCase() ??
      user.email;

    user.role =
      req.body.role ??
      user.role;

    user.department =
      req.body.department ??
      user.department;

    user.studentId =
      req.body.studentId ??
      user.studentId;

    user.employeeId =
      req.body.employeeId ??
      user.employeeId;

    user.phone =
      req.body.phone ??
      user.phone;

    if (
      req.body.isActive !==
      undefined
    ) {

      user.isActive =
        req.body.isActive;

    }

    if (
      req.body.password &&
      req.body.password
        .trim() !== ""
    ) {

      user.password =
        req.body.password;

    }

    const updatedUser =
      await user.save();

    return res.json({

      message:
        "User updated successfully.",

      user: {

        _id:
          updatedUser._id,

        fullName:
          updatedUser.fullName,

        email:
          updatedUser.email,

        role:
          updatedUser.role,

        department:
          updatedUser.department,

        studentId:
          updatedUser.studentId,

        employeeId:
          updatedUser.employeeId,

        phone:
          updatedUser.phone,

        isActive:
          updatedUser.isActive,

      },

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      message:
        "Failed to update user.",

    });

  }

};

/* ============================================================
   DELETE USER
============================================================ */
/* ============================================================
   DELETE USER
============================================================ */

export const deleteUser = async (
  req,
  res
) => {

  try {

    const user =
      await User.findById(
        req.params.id
      );

    if (!user) {

      return res.status(404).json({

        message:
          "User not found.",

      });

    }

    await user.deleteOne();

    return res.json({

      message:
        "User deleted successfully.",

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      message:
        "Failed to delete user.",

    });

  }

};

/* ============================================================
   TOGGLE USER STATUS
============================================================ */

export const toggleUserStatus =
  async (
    req,
    res
  ) => {

    try {

      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {

        return res.status(404).json({

          message:
            "User not found.",

        });

      }

      user.isActive =
        !user.isActive;

      await user.save();

      return res.json({

        message:
          `User ${
            user.isActive
              ? "activated"
              : "deactivated"
          } successfully.`,

        isActive:
          user.isActive,

      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({

        message:
          "Failed to update user status.",

      });

    }

  };

/* ============================================================
   USER STATISTICS
============================================================ */

export const getUserStatistics =
  async (
    req,
    res
  ) => {

    try {

      const totalUsers =
        await User.countDocuments();

      const activeUsers =
        await User.countDocuments({
          isActive: true,
        });

      const inactiveUsers =
        await User.countDocuments({
          isActive: false,
        });

      const admins =
        await User.countDocuments({
          role: "Admin",
        });

      const instructors =
        await User.countDocuments({
          role: "Instructor",
        });

      const students =
        await User.countDocuments({
          role: "Student",
        });

      return res.json({

        totalUsers,

        activeUsers,

        inactiveUsers,

        admins,

        instructors,

        students,

      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({

        message:
          "Failed to load user statistics.",

      });

    }

  };