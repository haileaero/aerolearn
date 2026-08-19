import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";
import learningMaterialRoutes from "./routes/learningMaterialRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";

import {
  notFound,
  errorHandler,
} from "./middleware/errorMiddleware.js";

/* ============================================================
   ENVIRONMENT CONFIGURATION
============================================================ */

dotenv.config();

/* ============================================================
   EXPRESS APPLICATION
============================================================ */

const app = express();

/* ============================================================
   SECURITY
============================================================ */

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",
    credentials: true,
  })
);

/* ============================================================
   BODY PARSERS
============================================================ */

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

/* ============================================================
   REQUEST LOGGING
============================================================ */

if (
  process.env.NODE_ENV !==
  "production"
) {
  app.use(morgan("dev"));
}

/* ============================================================
   STATIC FILES
============================================================ */

app.use(
  "/uploads",
  express.static(
    path.join(
      process.cwd(),
      "uploads"
    )
  )
);

/* ============================================================
   HOME
============================================================ */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    application:
      "AeroLearn LMS API",
    version: "1.0.0",
    environment:
      process.env.NODE_ENV ||
      "development",
    status: "Running",
  });
});

/* ============================================================
   HEALTH CHECK
============================================================ */

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "Healthy",
    uptime: process.uptime(),
    timestamp:
      new Date().toISOString(),
  });
});

/* ============================================================
   API ROUTES
============================================================ */

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/courses",
  courseRoutes
);

app.use(
  "/api/students",
  studentRoutes
);

app.use(
  "/api/attendance",
  attendanceRoutes
);

app.use(
  "/api/assessment",
  assessmentRoutes
);

app.use(
  "/api/learning-materials",
  learningMaterialRoutes
);

app.use(
  "/api/announcements",
  announcementRoutes
);



/* ============================================================
   ERROR HANDLING
============================================================ */

app.use(notFound);

app.use(errorHandler);

/* ============================================================
   START SERVER
============================================================ */

const startServer =
  async () => {
    try {
      await connectDB();

      const PORT =
        process.env.PORT ||
        5000;

      const server =
        app.listen(PORT, () => {
          console.log("");
          console.log(
            "========================================"
          );
          console.log(
            "🚀 AeroLearn LMS API Started"
          );
          console.log(
            "========================================"
          );
          console.log(
            `🌐 Port: ${PORT}`
          );
          console.log(
            `🌍 Environment: ${
              process.env.NODE_ENV ||
              "development"
            }`
          );
          console.log(
            `📁 Upload Folder: /uploads`
          );
          console.log(
            `❤️ Health Check: http://localhost:${PORT}/health`
          );
          console.log(
            "========================================"
          );
          console.log("");
        });

      /* ============================================================
         GRACEFUL SHUTDOWN
      ============================================================ */

      process.on(
        "SIGINT",
        () => {
          console.log(
            "\n🛑 Shutting down server..."
          );

          server.close(() => {
            console.log(
              "✅ Server stopped successfully."
            );

            process.exit(0);
          });
        }
      );

      process.on(
        "SIGTERM",
        () => {
          console.log(
            "\n🛑 SIGTERM received."
          );

          server.close(() => {
            console.log(
              "✅ Server stopped successfully."
            );

            process.exit(0);
          });
        }
      );
    } catch (error) {
      console.error("");
      console.error(
        "❌ Failed to start AeroLearn Server"
      );
      console.error(error);
      process.exit(1);
    }
  };

startServer();