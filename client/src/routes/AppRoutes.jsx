import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Students from "../pages/Students";
import Courses from "../pages/Courses";
import MyCourses from "../pages/MyCourses";
import MyResults from "../pages/MyResults";
import Attendance from "../pages/Attendance";
import Assessment from "../pages/Assessment";
import SubmitAssessment from "../pages/SubmitAssessment";
import ViewResults from "../pages/ViewResults";
import LearningMaterials from "../pages/LearningMaterials";
import CourseDetails from "../pages/CourseDetails";
import Announcements from "../pages/Announcements";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";

function AppRoutes() {
  return (
    <Routes>

      {/* ================= PUBLIC ================= */}

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      {/* ================= DASHBOARD ================= */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* ================= ADMIN ================= */}

      <Route
        path="/users"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <Users />
          </ProtectedRoute>
        }
      />

      <Route
        path="/students"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <Students />
          </ProtectedRoute>
        }
      />

      {/* ============ ADMIN + INSTRUCTOR ============ */}

      <Route
        path="/courses"
        element={
          <ProtectedRoute
            roles={[
              "Admin",
              "Instructor",
            ]}
          >
            <Courses />
          </ProtectedRoute>
        }
      />

      {/* ================= STUDENT ================= */}

      <Route
        path="/my-courses"
        element={
          <ProtectedRoute roles={["Student"]}>
            <MyCourses />
          </ProtectedRoute>
        }
      />
<Route
  path="/my-results"
  element={
    <ProtectedRoute roles={["Student"]}>
      <MyResults />
    </ProtectedRoute>
  }
/>
      {/* ================= ATTENDANCE ================= */}

      <Route
        path="/attendance"
        element={
          <ProtectedRoute
            roles={[
              "Admin",
              "Instructor",
            ]}
          >
            <Attendance />
          </ProtectedRoute>
        }
      />

      {/* ================= CREATE ASSESSMENT ================= */}

      <Route
        path="/assessment"
        element={
          <ProtectedRoute
            roles={[
              "Admin",
              "Instructor",
            ]}
          >
            <Assessment />
          </ProtectedRoute>
        }
      />

      {/* ================= SUBMIT ASSESSMENT ================= */}

      <Route
        path="/assessment-submit"
        element={
          <ProtectedRoute
            roles={[
              "Admin",
              "Instructor",
            ]}
          >
            <SubmitAssessment />
          </ProtectedRoute>
        }
      />

      {/* ================= VIEW RESULTS ================= */}

      <Route
        path="/assessment-results"
        element={
          <ProtectedRoute
            roles={[
              "Admin",
              "Instructor",
            ]}
          >
            <ViewResults />
          </ProtectedRoute>
        }
      />

      {/* ================= LEARNING MATERIALS ================= */}

      <Route
        path="/learning-materials"
        element={
          <ProtectedRoute
            roles={[
              "Admin",
              "Instructor",
              "Student",
            ]}
          >
            <LearningMaterials />
          </ProtectedRoute>
        }
      />

      {/* ================= COURSE DETAILS ================= */}

      <Route
        path="/course/:id"
        element={
          <ProtectedRoute
            roles={[
              "Admin",
              "Instructor",
              "Student",
            ]}
          >
            <CourseDetails />
          </ProtectedRoute>
        }
      />

      {/* ================= ANNOUNCEMENTS ================= */}

      <Route
        path="/announcements"
        element={
          <ProtectedRoute
            roles={[
              "Admin",
              "Instructor",
              "Student",
            ]}
          >
            <Announcements />
          </ProtectedRoute>
        }
      />

      {/* ================= PROFILE ================= */}

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* ================= 404 ================= */}

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  );
}

export default AppRoutes;