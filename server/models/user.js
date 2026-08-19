import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "Admin",
        "Instructor",
        "Student",
      ],
      default: "Student",
    },

    studentId: {
      type: String,
      default: "",
    },

    employeeId: {
      type: String,
      default: "",
    },

    department: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },

    assignedCourses: [
      {
        type: String,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password"))
    return next();

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(
    this.password,
    salt
  );

  next();
});

userSchema.methods.matchPassword =
  async function (password) {
    return await bcrypt.compare(
      password,
      this.password
    );
  };

export default mongoose.model(
  "User",
  userSchema
);