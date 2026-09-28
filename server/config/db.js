import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(
      process.env.MONGO_URI,
      {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      }
    );

    console.log("\n====================================");
    console.log("✅ MongoDB Connected Successfully");
    console.log(
      `Host      : ${connection.connection.host}`
    );
    console.log(
      `Database  : ${connection.connection.name}`
    );
    console.log(
      `Port      : ${connection.connection.port}`
    );
    console.log("====================================\n");

    // v5.4 migration: course codes are reusable across departments.
    // Older deployments created a global unique `code_1` index; remove it
    // and enforce uniqueness only for an exact academic course offering.
    const courses = mongoose.connection.collection("courses");
    const indexes = await courses.indexes();
    const legacyCodeIndex = indexes.find(
      (index) => index.name === "code_1" && index.unique
    );
    if (legacyCodeIndex) {
      await courses.dropIndex("code_1");
      console.log("🔄 Removed legacy global course-code uniqueness index");
    }
    await courses.createIndex(
      { code: 1, department: 1, academicYear: 1, studyYear: 1, semester: 1 },
      { unique: true, name: "course_offering_unique" }
    );

    mongoose.connection.on(
      "disconnected",
      () => {
        console.warn(
          "⚠️ MongoDB Disconnected"
        );
      }
    );

    mongoose.connection.on(
      "reconnected",
      () => {
        console.log(
          "🔄 MongoDB Reconnected"
        );
      }
    );

    mongoose.connection.on(
      "error",
      (err) => {
        console.error(
          "❌ MongoDB Error:",
          err.message
        );
      }
    );
  } catch (error) {
    console.error("\n====================================");
    console.error(
      "❌ Failed to Connect to MongoDB"
    );
    console.error(error.message);
    console.error("====================================\n");

    process.exit(1);
  }
};

export default connectDB;