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

    // v6.1 migration: attendance uniqueness follows the actual class meeting:
    // one course + calendar date + period. Week is descriptive, not identity.
    const attendance = mongoose.connection.collection("attendances");
    const attendanceIndexes = await attendance.indexes();
    const legacyAttendanceIndex = attendanceIndexes.find((index) =>
      index.unique && index.key?.course === 1 && index.key?.week === 1 && index.key?.period === 1
    );
    if (legacyAttendanceIndex) {
      await attendance.dropIndex(legacyAttendanceIndex.name);
      console.log("🔄 Removed legacy attendance week/period uniqueness index");
    }
    // Clean any duplicates produced by older attendance builds before the
    // database-level uniqueness constraint is installed. Keep the newest copy.
    const duplicateAttendanceGroups = await attendance.aggregate([
      { $group: { _id: { course: "$course", date: "$date", period: "$period" }, ids: { $push: "$_id" }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ]).toArray();
    for (const group of duplicateAttendanceGroups) {
      const duplicates = await attendance.find({ _id: { $in: group.ids } }).sort({ updatedAt: -1, createdAt: -1 }).toArray();
      const removeIds = duplicates.slice(1).map((item) => item._id);
      if (removeIds.length) await attendance.deleteMany({ _id: { $in: removeIds } });
    }
    if (duplicateAttendanceGroups.length) console.log(`🔄 Cleaned ${duplicateAttendanceGroups.length} duplicate attendance session group(s)`);
    await attendance.createIndex(
      { course: 1, date: 1, period: 1 },
      { unique: true, name: "attendance_course_date_period_unique" }
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