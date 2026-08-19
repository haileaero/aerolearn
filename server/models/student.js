import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
    },

    department: {
      type: String,
      required: true,
    },

    program: {
      type: String,
      default: "",
    },

    year: {
      type: String,
      default: "",
    },

    semester: {
      type: String,
      default: "",
    },

    section: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "Active",
        "Graduated",
        "Suspended",
      ],
      default: "Active",
    },

    photo: {
      type: String,
      default: "",
    },

    admissionYear: {
      type: Number,
      default: new Date().getFullYear(),
    },

    advisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Student",
  studentSchema
);