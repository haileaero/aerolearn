import mongoose from "mongoose";

const attendanceStudentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    status: {
      type: String,
      enum: ["Present", "Absent", "Late"],
      default: "Present",
    },
  },
  {
    _id: false,
  }
);

const attendanceSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: true,
      trim: true,
    },

    year: {
      type: String,
      required: true,
      trim: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    week: {
      type: Number,
      required: true,
    },

    period: {
      type: Number,
      required: true,
      default: 1,
    },

    date: {
      type: Date,
      required: true,
    },

    students: [attendanceStudentSchema],
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index(
  {
    department: 1,
    year: 1,
    course: 1,
    week: 1,
    period: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model("Attendance", attendanceSchema);