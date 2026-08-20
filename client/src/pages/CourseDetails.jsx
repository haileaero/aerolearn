import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useParams } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import Layout from "../components/Layout";
import api from "../api";
import CourseHeader from "../components/course/CourseHeader";
import CourseNavigation from "../components/course/CourseNavigation";
import CourseOverview from "../components/course/CourseOverview";
import MaterialsTab from "../components/course/MaterialsTab";
import AssessmentsTab from "../components/course/AssessmentsTab";
import AttendanceTab from "../components/course/AttendanceTab";
import StudentsTab from "../components/course/StudentsTab";
import StatisticsTab from "../components/course/StatisticsTab";

function CourseDetails() {

  const { id } = useParams();

  const { user } =
    useContext(AuthContext);
  // =====================================================
  // STATE
  // =====================================================

  const [course, setCourse] =
    useState(null);

  const [students, setStudents] =
    useState([]);

  const [materials, setMaterials] =
    useState([]);

  const [assessments, setAssessments] =
    useState([]);

  const [attendance, setAttendance] =
    useState([]);

  const [activeTab, setActiveTab] =
    useState("overview");

  // =====================================================
  // LOAD COURSE DATA
  // =====================================================

  useEffect(() => {

    if (!id) {
      return;
    }

    loadCourse();

  }, [id]);


  const loadCourse = async () => {

    try {

      // =================================================
      // COURSE
      // =================================================

      const courseRes =
        await api.get(
          `/courses/${id}`
        );

      const courseData =
        courseRes.data;

      setCourse(courseData);

      // =================================================
      // STUDENTS
      // =================================================

      if (
        Array.isArray(
          courseData.students
        )
      ) {

        setStudents(
          courseData.students
        );

      } else {

        setStudents([]);

      }

      // =================================================
      // LEARNING MATERIALS
      // =================================================

      try {

        const materialRes =
          await api.get(
            "/learning-materials"
          );

        const courseMaterials =
          materialRes.data.filter(
            (material) => {

              const materialCourseId =
                typeof material.course ===
                "object"
                  ? material.course?._id
                  : material.course;

              return (
                String(
                  materialCourseId
                ) ===
                String(
                  courseData._id
                )
              );

            }
          );

        setMaterials(
          courseMaterials
        );

      } catch (error) {

        console.error(
          "Failed to load learning materials:",
          error
        );

        setMaterials([]);

      }
      // =================================================
      // ANNOUNCEMENTS
      // =================================================
      //
      // IMPORTANT:
      // This endpoint must return announcements
      // belonging to this specific course.
      //
      // GET /api/announcements/course/:courseId
      //
      // =================================================

      try {

      

      } catch (error) {

        console.error(
          "Failed to load course announcements:",
          error
        );

        setAnnouncements([]);

      }

      // =================================================
      // ASSESSMENTS
      // =================================================

      try {

        const assessmentRes =
          await api.get(
            "/assessment"
          );

        const courseAssessments =
          assessmentRes.data.filter(
            (assessment) => {

              const assessmentCourseId =
                typeof assessment.course ===
                "object"
                  ? assessment.course?._id
                  : assessment.course;

              return (
                String(
                  assessmentCourseId
                ) ===
                String(
                  courseData._id
                )
              );

            }
          );

        setAssessments(
          courseAssessments
        );

      } catch (error) {

        console.error(
          "Failed to load assessments:",
          error
        );

        setAssessments([]);

      }

      // =================================================
      // ATTENDANCE
      // =================================================

      try {

        const attendanceRes =
          await api.get(
            "/attendance"
          );

        const courseAttendance =
          attendanceRes.data.filter(
            (attendanceRecord) => {

              const attendanceCourseId =
                typeof attendanceRecord.course ===
                "object"
                  ? attendanceRecord.course?._id
                  : attendanceRecord.course;

              return (
                String(
                  attendanceCourseId
                ) ===
                String(
                  courseData._id
                )
              );

            }
          );

        setAttendance(
          courseAttendance
        );

      } catch (error) {

        console.error(
          "Failed to load attendance:",
          error
        );

        setAttendance([]);

      }

    } catch (error) {

      console.error(
        "Failed to load course:",
        error
      );

      setCourse(null);

    }

  };
  // =====================================================
  // COURSE STATISTICS
  // =====================================================

  const statistics =
    useMemo(() => {

      return {

        students:
          students.length,

        materials:
          materials.length,

        assessments:
          assessments.length,

        attendance:
          attendance.length,

      };

    }, [
      students,
      materials,
      assessments,
      attendance,
      
    ]);
  // =====================================================
  // LOADING
  // =====================================================

  if (!course) {

    return (

      <Layout>

        <h2>
          Loading...
        </h2>

      </Layout>

    );

  }

  // =====================================================
  // PAGE
  // =====================================================

  return (

    <Layout>
      {/* =================================================
          COURSE HEADER
      ================================================= */}

      {user?.role !== "Student" && (

        <CourseHeader
          course={course}
        />

      )}
      {/* =================================================
          COURSE NAVIGATION
      ================================================= */}

      <CourseNavigation
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      {/* =================================================
          OVERVIEW
      ================================================= */}

      {activeTab === "overview" && (

        <CourseOverview
          course={course}
          statistics={statistics}
        />

      )}
      {/* =================================================
          LEARNING MATERIALS
      ================================================= */}

      {activeTab === "materials" && (

        <MaterialsTab
          materials={materials}
        />

      )}
      {/* =================================================
          ASSESSMENTS
      ================================================= */}

      {activeTab === "assessments" && (

        <AssessmentsTab
          assessments={assessments}
        />

      )}
      {/* =================================================
          ATTENDANCE
      ================================================= */}

      {activeTab === "attendance" && (

        <AttendanceTab
          attendance={attendance}
          user={user}
        />

      )}
      {/* =================================================
          

      {/* =================================================
          STUDENTS
          ADMIN & INSTRUCTOR ONLY
      ================================================= */}

      {user?.role !== "Student" &&
        activeTab === "students" && (

          <StudentsTab
            students={students}
          />

        )}
      {/* =================================================
          STATISTICS
          ADMIN & INSTRUCTOR ONLY
      ================================================= */}

      {user?.role !== "Student" &&
        activeTab === "statistics" && (

          <StatisticsTab
            students={students}
            materials={materials}
            assessments={assessments}
            attendance={attendance}
          />

        )}

    </Layout>

  );

}
export default CourseDetails;