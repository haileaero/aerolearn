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