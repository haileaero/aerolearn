import mongoose from "mongoose";

/* ============================================================
   SCORE SCHEMA
============================================================ */

const scoreSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
    },

    remark: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
  },
  {
    _id: false,
  }
);

/* ============================================================
   ASSESSMENT SCHEMA
============================================================ */

const assessmentSchema =
  new mongoose.Schema(
    {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
        index: true,
      },

      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },

      category: {
        type: String,
        required: true,
        enum: [
          "Quiz",
          "Assignment",
          "Lab",
          "Project",
          "Mid Exam",
          "Final Exam",
        ],
        index: true,
      },

      week: {
        type: Number,
        required: true,
        min: 1,
        max: 52,
      },

      dueDate: {
        type: Date,
        required: true,
      },

      totalMark: {
        type: Number,
        required: true,
        min: 1,
      },

      weight: {
        type: Number,
        required: true,
        min: 1,
        max: 100,
      },

      description: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: "",
      },

      scores: {
        type: [scoreSchema],
        default: [],
      },
    },
    {
      timestamps: true,
      versionKey: false,
      toJSON: {
        virtuals: true,
      },
      toObject: {
        virtuals: true,
      },
    }
  );

/* ============================================================
   UNIQUE ASSESSMENT
============================================================ */

assessmentSchema.index(
  {
    course: 1,
    title: 1,
    week: 1,
  },
  {
    unique: true,
  }
);

/* ============================================================
   AVERAGE SCORE
============================================================ */

assessmentSchema.virtual(
  "averageScore"
).get(function () {

  if (!this.scores.length) {

    return 0;

  }

  const total =
    this.scores.reduce(
      (sum, item) =>
        sum + item.score,
      0
    );

  return Number(
    (
      total /
      this.scores.length
    ).toFixed(2)
  );

});

/* ============================================================
   VALIDATE SCORES
============================================================ */

assessmentSchema.pre(
  "save",
  function (next) {

    for (const item of this.scores) {

      if (
        item.score >
        this.totalMark
      ) {

        return next(
          new Error(
            `Score cannot exceed ${this.totalMark}.`
          )
        );

      }

    }

    next();

  }
);

export default mongoose.model(
  "Assessment",
  assessmentSchema
);