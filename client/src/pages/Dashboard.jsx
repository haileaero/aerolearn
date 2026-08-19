import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Layout from "../components/Layout";
import StudentCourses from "./StudentCourses";
import StudentAnnouncements from "./StudentAnnouncements";
import { AuthContext } from "../context/AuthContext";
import api from "../api";

import {
  FaUsers,
  FaUserGraduate,
  FaBook,
  FaClipboardCheck,
  FaClipboardList,
  FaBullhorn,
  FaFolderOpen,
  FaUniversity,
  FaClock,
  FaArrowRight,
  FaPlusCircle,
  FaCalendarAlt,
  FaBuilding,
} from "react-icons/fa";

function Dashboard() {

  const { user } = useContext(AuthContext);
const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    students: 0,
    courses: 0,
    attendance: 0,
    assessments: 0,
    announcements: 0,
    materials: 0,
  });

  const [studentProfile, setStudentProfile] = useState(null);

  const [recentStudents, setRecentStudents] = useState([]);

  const [recentCourses, setRecentCourses] = useState([]);

  const [departmentStats, setDepartmentStats] = useState([]);

  const [loading, setLoading] = useState(true);

  const [currentTime, setCurrentTime] = useState(new Date());

 useEffect(() => {
  if (!user) return;

  loadDashboard();

  const timer = setInterval(() => {
    setCurrentTime(new Date());
  }, 1000);

  return () => clearInterval(timer);
}, [user]);

const departments = [
  "Aerospace Engineering",
  "Production Engineering",
  "Armament Engineering",
  "Computer Engineering",
  "Motor Vehicle Engineering",
  "Metallurgy and Materials Engineering",
  "Chemical Engineering",
  "Electrical Power Engineering",
  "Electronics Engineering",
  "Civil Engineering",
];

const loadDashboard = async () => {
  try {
    setLoading(true);

    // ==========================
    // STUDENT DASHBOARD
    // ==========================
    if (user?.role === "Student") {

  // 1. Get the student profile first
  console.log("Logged in user:", user);
  const profileRes = await api.get(
    `/students/profile/${user.studentId}`
  );

  

  const profile = profileRes.data;

  setStudentProfile(profile);

  // 2. Load the other data separately
  const announcementsRes = await api.get("/announcements");
  const materialsRes = await api.get("/learning-materials");
  const assessmentsRes = await api.get("/assessment");

  const coursesList = profile.courses || [];

  const announcementList = Array.isArray(announcementsRes.data)
    ? announcementsRes.data
    : announcementsRes.data.announcements || [];

  const materialList = Array.isArray(materialsRes.data)
    ? materialsRes.data
    : materialsRes.data.materials || [];

  const assessmentList = Array.isArray(assessmentsRes.data)
    ? assessmentsRes.data
    : assessmentsRes.data.assessments || [];

  setStats({
    users: 0,
    students: 1,
    courses: coursesList.length,
    attendance: 0,
    assessments: assessmentList.length,
    announcements: announcementList.length,
    materials: materialList.length,
  });

  setRecentCourses(coursesList);

  setRecentStudents([
    {
      fullName: profile.fullName,
      studentId: profile.studentId,
      department: profile.department,
    },
  ]);

  setDepartmentStats([
    {
      department: profile.department,
      total: 1,
    },
  ]);

  setLoading(false);
  return;
}

    // ==========================
    // ADMIN & INSTRUCTOR
    // ==========================
    const [
      usersRes,
      studentsRes,
      coursesRes,
      attendanceRes,
      assessmentsRes,
      announcementsRes,
      materialsRes,
    ] = await Promise.all([
      api.get("/users"),
      api.get("/students"),
      api.get("/courses"),
      api.get("/attendance"),
      api.get("/assessment"),
      api.get("/announcements"),
      api.get("/learning-materials"),
    ]);

    const usersList = Array.isArray(usersRes.data)
      ? usersRes.data
      : usersRes.data.users || [];

    const studentsList = Array.isArray(studentsRes.data)
      ? studentsRes.data
      : studentsRes.data.students || [];

    const coursesList = Array.isArray(coursesRes.data)
      ? coursesRes.data
      : coursesRes.data.courses || [];

    const attendanceList = Array.isArray(attendanceRes.data)
      ? attendanceRes.data
      : attendanceRes.data.attendance || [];

    const assessmentList = Array.isArray(assessmentsRes.data)
      ? assessmentsRes.data
      : assessmentsRes.data.assessments || [];

    const announcementList = Array.isArray(announcementsRes.data)
      ? announcementsRes.data
      : announcementsRes.data.announcements || [];

    const materialList = Array.isArray(materialsRes.data)
      ? materialsRes.data
      : materialsRes.data.materials || [];

    setStats({
      users: usersList.length,
      students: studentsList.length,
      courses: coursesList.length,
      attendance: attendanceList.length,
      assessments: assessmentList.length,
      announcements: announcementList.length,
      materials: materialList.length,
    });

    setRecentStudents(
      [...studentsList]
        .sort(
          (a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        )
        .slice(0, 5)
    );

    setRecentCourses(
      [...coursesList]
        .sort(
          (a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        )
        .slice(0, 5)
    );

    const departmentSummary = departments.map((department) => ({
      department,
      total: studentsList.filter(
        (student) => student.department === department
      ).length,
    }));

    setDepartmentStats(departmentSummary);
  } catch (error) {
    console.error("Dashboard Error:", error);
  } finally {
    setLoading(false);
  }
};
    // ==========================================
  // Statistic Card
  // ==========================================

 const StatCard = ({
  title,
  value,
  icon,
  color,
  link,
}) => (

  <div
    onClick={() => link && navigate(link)}
    style={{
      background: "#ffffff",
      borderRadius: "18px",
      padding: "24px",
      border: "1px solid #e5e7eb",
      boxShadow:
        "0 10px 25px rgba(15,23,42,.06)",
      transition: ".25s",
      cursor: link ? "pointer" : "default",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform =
        "translateY(-6px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform =
        "translateY(0)";
    }}
  >

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >

      <div>

        <p
          style={{
            color: "#64748b",
            fontSize: "13px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: ".6px",
            marginBottom: "10px",
          }}
        >
          {title}
        </p>

        <h1
          style={{
            fontSize: "42px",
            color: "#0f172a",
          }}
        >
          {value}
        </h1>

      </div>

      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "18px",
          background: color,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          fontSize: "28px",
        }}
      >
        {icon}
      </div>

    </div>

  </div>

);
  // ==========================================
  // Department Card
  // ==========================================

  const DepartmentCard = ({
    department,
    total,
  }) => (

    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "18px",
        border:
          "1px solid #e5e7eb",
        display: "flex",
        justifyContent:
          "space-between",
        alignItems: "center",
      }}
    >

      <div>

        <strong
          style={{
            color: "#0f172a",
          }}
        >
          {department}
        </strong>

        <p
          style={{
            color: "#64748b",
            marginTop: "8px",
            fontSize: "14px",
          }}
        >
          Registered Students
        </p>

      </div>

      <div
        style={{
          width: "55px",
          height: "55px",
          borderRadius: "50%",
          background: "#2563eb",
          color: "#fff",
          display: "flex",
          justifyContent:
            "center",
          alignItems: "center",
          fontWeight: "700",
          fontSize: "18px",
        }}
      >
        {total}
      </div>

    </div>

  );

  // ==========================================
  // Quick Action Card
  // ==========================================

  const QuickAction = ({
    title,
    icon,
    color,
    link,
  }) => (

    <Link
      to={link}
      style={{
        textDecoration: "none",
      }}
    >

      <div
        style={{
          background: color,
          color: "#fff",
          borderRadius: "18px",
          padding: "22px",
          minHeight: "130px",
          display: "flex",
          flexDirection: "column",
          justifyContent:
            "space-between",
          transition: ".25s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform =
            "translateY(-6px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform =
            "translateY(0)";
        }}
      >

        <div
          style={{
            fontSize: "34px",
          }}
        >
          {icon}
        </div>

        <div>

          <h3
            style={{
              marginBottom: "8px",
            }}
          >
            {title}
          </h3>

          <small>

            Open Module

            <FaArrowRight
              style={{
                marginLeft: "8px",
              }}
            />

          </small>

        </div>

      </div>

    </Link>

  );
  
    // ==========================================
  // USER INTERFACE
  // ==========================================

  return (
    <Layout>

      {/* =======================================
          HERO SECTION
      ======================================== */}

      <div
  style={{
    background: "linear-gradient(135deg,#1e40af,#2563eb)",
    borderRadius: "24px",
    padding: "45px",
    marginBottom: "35px",
    color: "#fff",
    boxShadow: "0 18px 45px rgba(37,99,235,.30)",
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      flexWrap: "wrap",
      gap: "40px",
    }}
  >
    {/* LEFT */}
    <div style={{ flex: 1, minWidth: "350px" }}>
      <p
        style={{
          margin: 0,
          fontSize: "15px",
          opacity: .85,
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}
      >
        Student Portal
      </p>

      <h1
        style={{
          marginTop: "10px",
          marginBottom: "15px",
          fontSize: "42px",
          fontWeight: "700",
        }}
      >
        Welcome back, {user?.fullName}
      </h1>

      <div
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          marginBottom: "25px",
        }}
      >
        <span
          style={{
            background: "rgba(255,255,255,.15)",
            padding: "10px 18px",
            borderRadius: "999px",
            fontWeight: "600",
          }}
        >
          🏫 {studentProfile?.department}
        </span>

        <span
          style={{
            background: "rgba(255,255,255,.15)",
            padding: "10px 18px",
            borderRadius: "999px",
            fontWeight: "600",
          }}
        >
          🎓 {studentProfile?.year}
        </span>

        <span
          style={{
            background: "rgba(255,255,255,.15)",
            padding: "10px 18px",
            borderRadius: "999px",
            fontWeight: "600",
          }}
        >
          📚 {studentProfile?.semester}
        </span>
      </div>

      <p
        style={{
          fontSize: "18px",
          lineHeight: 1.8,
          maxWidth: "700px",
          opacity: .95,
          margin: 0,
        }}
      >
        Welcome to AeroLearn. Access your enrolled courses,
        learning materials, assessments and announcements
        from one centralized dashboard.
      </p>
    </div>

    {/* RIGHT */}
    <div
      style={{
        width: "280px",
        background: "rgba(255,255,255,.12)",
        border: "1px solid rgba(255,255,255,.15)",
        borderRadius: "20px",
        padding: "25px",
        textAlign: "center",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          fontSize: "15px",
          opacity: .9,
          marginBottom: "18px",
        }}
      >
        LIVE CLOCK
      </div>

      <h1
        style={{
          margin: 0,
          fontSize: "46px",
        }}
      >
        {currentTime.toLocaleTimeString()}
      </h1>

      <p
        style={{
          marginTop: "20px",
          opacity: .9,
        }}
      >
        {currentTime.toLocaleDateString(undefined,{
          weekday:"long",
          year:"numeric",
          month:"long",
          day:"numeric",
        })}
      </p>
    </div>
  </div>
</div>
      {/* =======================================
          STATISTICS
      ======================================== */}

      {loading ? (

        <h2>Loading dashboard...</h2>

      ) : (

        <>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(260px,1fr))",
              gap: "22px",
              marginBottom: "35px",
            }}
          >

            {user?.role === "Admin" && (
              <>

                <StatCard
                  title="System Users"
                  value={stats.users}
                  icon={<FaUsers />}
                  color="#2563eb"
                />

                <StatCard
                  title="Students"
                  value={stats.students}
                  icon={<FaUserGraduate />}
                  color="#16a34a"
                />

                <StatCard
                  title="Courses"
                  value={stats.courses}
                  icon={<FaBook />}
                  color="#7c3aed"
                />

                <StatCard
                  title="Attendance"
                  value={stats.attendance}
                  icon={<FaClipboardCheck />}
                  color="#f59e0b"
                />

                <StatCard
                  title="Assessments"
                  value={stats.assessments}
                  icon={<FaClipboardList />}
                  color="#ef4444"
                />

                <StatCard
                  title="Announcements"
                  value={stats.announcements}
                  icon={<FaBullhorn />}
                  color="#0891b2"
                />

                <StatCard
                  title="Learning Materials"
                  value={stats.materials}
                  icon={<FaFolderOpen />}
                  color="#0f766e"
                />

              </>
            )}
                        {user?.role === "Instructor" && (
              <>
                <StatCard
                  title="Courses"
                  value={stats.courses}
                  icon={<FaBook />}
                  color="#7c3aed"
                />

                <StatCard
                  title="Attendance"
                  value={stats.attendance}
                  icon={<FaClipboardCheck />}
                  color="#f59e0b"
                />

                <StatCard
                  title="Assessments"
                  value={stats.assessments}
                  icon={<FaClipboardList />}
                  color="#ef4444"
                />

                <StatCard
                  title="Learning Materials"
                  value={stats.materials}
                  icon={<FaFolderOpen />}
                  color="#0f766e"
                />
              </>
            )}

</div>
{user?.role === "Student" && (
  <>
    <StudentCourses courses={recentCourses} />

    <StudentAnnouncements />
  </>
)}

         {/* =======================================
    QUICK ACTIONS
======================================== */}

{(user?.role === "Admin" ||
  user?.role === "Instructor") && (
  <div
    style={{
      marginBottom: "40px",
    }}
  >
    <h2
      style={{
        marginBottom: "20px",
      }}
    >
      <FaPlusCircle /> Quick Actions
    </h2>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(220px,1fr))",
        gap: "20px",
      }}
    >
      <QuickAction
        title="Students"
        icon={<FaUserGraduate />}
        color="#2563eb"
        link="/students"
      />

      <QuickAction
        title="Courses"
        icon={<FaBook />}
        color="#7c3aed"
        link="/courses"
      />

      <QuickAction
        title="Attendance"
        icon={<FaClipboardCheck />}
        color="#16a34a"
        link="/attendance"
      />

      <QuickAction
        title="Assessments"
        icon={<FaClipboardList />}
        color="#ea580c"
        link="/assessment"
      />

      <QuickAction
        title="Announcements"
        icon={<FaBullhorn />}
        color="#0891b2"
        link="/announcements"
      />

      <QuickAction
        title="Materials"
        icon={<FaFolderOpen />}
        color="#0f766e"
        link="/learning-materials"
      />
    </div>
  </div>
)}
        
                    

          {/* =======================================
              SYSTEM INFORMATION
          ======================================== */}

          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "30px",
              border:
                "1px solid #e5e7eb",
              boxShadow:
                "0 8px 20px rgba(0,0,0,.06)",
            }}
          >

            <h2
              style={{
                marginBottom: "18px",
              }}
            >
              <FaUniversity />
              {" "}
              AeroLearn LMS Overview
            </h2>

            <p
              style={{
                lineHeight: 1.9,
                color: "#475569",
              }}
            >
              AeroLearn Learning Management
              System centralizes academic
              management by integrating
              student registration, course
              administration, attendance
              tracking, assessment
              management, announcements,
              learning materials and user
              administration into a single
              secure platform.

              Administrators can manage the
              entire institution, instructors
              can organize teaching activities,
              while students have access to
              their academic information from
              one professional dashboard.
            </p>

          </div>

        </>

      )}

    </Layout>

  );

}

export default Dashboard;