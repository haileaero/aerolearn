import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    // =====================================================
    // DEPARTMENT
    // =====================================================

    department: {
      type: String,
      required: true,
      trim: true,
    },


    // =====================================================
    // COURSE
    // =====================================================
    // Each announcement belongs to one specific course.
    // Students in that course can see the announcement.

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },


    // =====================================================
    // TITLE
    // =====================================================

    title: {
      type: String,
      required: true,
      trim: true,
    },


    // =====================================================
    // MESSAGE
    // =====================================================

    message: {
      type: String,
      required: true,
      trim: true,
    },


    // =====================================================
    // AUDIENCE
    // =====================================================
    // Normally this will be "Students" because the
    // announcement is connected to a specific course.

    audience: {
      type: String,
      enum: [
        "All",
        "Students",
        "Instructors",
      ],
      default: "Students",
    },


    // =====================================================
    // PRIORITY
    // =====================================================

    priority: {
      type: String,
      enum: [
        "Low",
        "Normal",
        "High",
      ],
      default: "Normal",
    },


    // =====================================================
    // EXPIRY DATE
    // =====================================================

    expiryDate: {
      type: Date,
      default: null,
    },


    // =====================================================
    // PINNED
    // =====================================================

    isPinned: {
      type: Boolean,
      default: false,
    },


    // =====================================================
    // CREATED BY
    // =====================================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },


  // =======================================================
  // TIMESTAMPS
  // =======================================================

  {
    timestamps: true,
  }
);


// =========================================================
// DATABASE INDEX
// =========================================================
// Makes it faster to find announcements belonging to
// a particular department and course.

announcementSchema.index({
  department: 1,
  course: 1,
  createdAt: -1,
});


// =========================================================
// MODEL
// =========================================================

const Announcement =
  mongoose.model(
    "Announcement",
    announcementSchema
  );

export default Announcement;