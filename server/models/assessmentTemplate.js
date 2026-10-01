import mongoose from "mongoose";

const componentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ["Quiz","Assignment","Lab","Project","Mid Exam","Final Exam"] },
  weight: { type: Number, required: true, min: 1, max: 100 },
  week: { type: Number, default: 1, min: 1, max: 52 },
  description: { type: String, default: "", trim: true },
}, { _id: true });

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, default: "", trim: true },
  components: { type: [componentSchema], validate: v => Array.isArray(v) && v.length > 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true, versionKey: false });

schema.pre("validate", function(next) {
  const total = (this.components || []).reduce((s,c) => s + Number(c.weight || 0), 0);
  if (total !== 100) return next(new Error(`Assessment template weights must total 100%. Current total is ${total}%.`));
  next();
});

export default mongoose.model("AssessmentTemplate", schema);
