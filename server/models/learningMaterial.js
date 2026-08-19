import mongoose from "mongoose";

const learningMaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Store the Course ID instead of the course name
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Lecture Note",
        "Slides",
        "Video",
        "Assignment",
        "Exercise",
        "Lab Manual",
        "Reference Book",
        "Previous Exam",
        "Other",
      ],
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    file: {
      type: String,
      default: "",
    },

    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "LearningMaterial",
  learningMaterialSchema
);