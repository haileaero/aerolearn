import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    creditHours: {
      type: Number,
      default: 3,
    },

    semester: {
      type: String,
      enum: [
        "Semester I",
        "Semester II",
      ],
      required: true,
    },

    studyYear: {
      type: String,
      enum: [
        "Year I",
        "Year II",
        "Year III",
        "Year IV",
        "Year V",
      ],
      required: true,
    },

    academicYear: {
      type: String,
      default: () =>
        new Date().getFullYear().toString(),
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],

    schedule: {
      days: {
        type: String,
        default: "",
      },

      time: {
        type: String,
        default: "",
      },

      room: {
        type: String,
        default: "",
      },
    },

    thumbnail: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "Active",
        "Completed",
        "Archived",
      ],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Course",
  courseSchema
);