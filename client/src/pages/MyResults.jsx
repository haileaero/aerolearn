import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import api from "../api";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
function MyResults() {
  const [courses, setCourses] = useState([]);
  const [assessments, setAssessments] = useState([]);
const { user } = useContext(AuthContext);

  const [selectedCourse, setSelectedCourse] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

     const [profileRes, assessmentRes] =
  await Promise.all([
    api.get(`/students/profile/${user.studentId}`),
    api.get("/assessment"),
  ]);

const profile = profileRes.data;

const myCourses = Array.isArray(profile.courses)
  ? profile.courses
  : [];

setCourses(myCourses);

// Get only assessments for the student's courses
const myCourseIds = myCourses.map((course) => course._id);

const myAssessments = (
  Array.isArray(assessmentRes.data)
    ? assessmentRes.data
    : []
).filter((assessment) => {
  const courseId =
    typeof assessment.course === "object"
      ? assessment.course._id
      : assessment.course;

  return myCourseIds.includes(courseId);
});

setAssessments(myAssessments);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load results."
      );
    } finally {
      setLoading(false);
    }
  };

  const courseResults = useMemo(() => {
    return assessments.filter((assessment) => {
      if (!selectedCourse) return false;

      if (typeof assessment.course === "object") {
        return (
          assessment.course._id ===
          selectedCourse
        );
      }

      return (
        assessment.course === selectedCourse
      );
    });
  }, [assessments, selectedCourse]);
const totalWeight = courseResults.reduce(
  (sum, assessment) => sum + Number(assessment.weight),
  0
);

const totalScore = courseResults.reduce(
  (sum, assessment) => {

    const myScore = assessment.scores?.find(
  (score) =>
    score.student?.studentId === user.studentId
);

    if (!myScore) return sum;

    const weightedScore =
      (Number(myScore.score) / Number(assessment.totalMark)) *
      Number(assessment.weight);

    return sum + weightedScore;

  },
  0
);
 

 

 const finalGrade = () => {
  if (totalScore >= 90) return "A+";
  if (totalScore >= 85) return "A";
  if (totalScore >= 80) return "A-";
  if (totalScore >= 75) return "B+";
  if (totalScore >= 70) return "B";
  if (totalScore >= 65) return "B-";
  if (totalScore >= 60) return "C+";
  if (totalScore >= 55) return "C";
  if (totalScore >= 50) return "C-";
  if (totalScore >= 45) return "D";
  return "F";
};
const resultStatus =
  totalScore >= 50 ? "PASS" : "FAIL";

  return (
    <Layout>

      {/* ================= Header ================= */}

      <div
        style={{
          background:
            "linear-gradient(135deg,#2563eb,#3b82f6)",
          color: "#fff",
          padding: "35px",
          borderRadius: "20px",
          marginBottom: "30px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "38px",
          }}
        >
          My Results
        </h1>

        <p
          style={{
            marginTop: "10px",
            opacity: 0.9,
          }}
        >
          View your assessment results,
          grades and overall performance.
        </p>
      </div>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "16px",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "18px",
          boxShadow:
            "0 8px 20px rgba(0,0,0,.08)",
          marginBottom: "30px",
        }}
      >
        <label
          style={{
            display: "block",
            marginBottom: "10px",
            fontWeight: "600",
          }}
        >
          Select Course
        </label>

        <select
          value={selectedCourse}
          onChange={(e) =>
            setSelectedCourse(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            border:
              "1px solid #d1d5db",
          }}
        >
          <option value="">
            Select Course
          </option>

          {courses.map((course) => (
            <option
              key={course._id}
              value={course._id}
            >
              {course.code} - {course.name}
            </option>
          ))}
        </select>
      </div>
            {loading ? (

        <div
          style={{
            background: "#fff",
            padding: "60px",
            borderRadius: "18px",
            textAlign: "center",
          }}
        >
          <h2>Loading Results...</h2>
        </div>

      ) : !selectedCourse ? (

        <div
          style={{
            background: "#fff",
            padding: "60px",
            borderRadius: "18px",
            textAlign: "center",
          }}
        >
          <h2>Select a course to view your results.</h2>
        </div>

      ) : (

        <>
          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              overflow: "hidden",
              boxShadow:
                "0 8px 20px rgba(0,0,0,.08)",
              marginBottom: "30px",
            }}
          >

            <table
  style={{
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  }}
>
  <thead>
    <tr>
      <th
        style={{
          width: "50%",
          padding: "15px 20px",
          textAlign: "left",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        Assessment
      </th>

      <th
        style={{
          width: "25%",
          padding: "15px 20px",
          textAlign: "center",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        Score
      </th>

      <th
        style={{
          width: "25%",
          padding: "15px 20px",
          textAlign: "center",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        Weight
      </th>
    </tr>
  </thead>

  <tbody>
    {courseResults.map((assessment) => {

      const myScore =
        assessment.scores?.find(
          (score) =>
            score.student?.studentId ===
            user?.studentId
        );

      const score =
        Number(myScore?.score || 0);

      return (
        <tr key={assessment._id}>

          {/* Assessment */}
          <td
            style={{
              width: "50%",
              padding: "14px 20px",
              textAlign: "left",
              borderBottom:
                "1px solid #e5e7eb",
            }}
          >
            {assessment.title ||
              assessment.category}
          </td>


          {/* Score */}
          <td
            style={{
              width: "25%",
              padding: "14px 20px",
              textAlign: "center",
              borderBottom:
                "1px solid #e5e7eb",
            }}
          >
            {score}
          </td>


          {/* Weight */}
          <td
            style={{
              width: "25%",
              padding: "14px 20px",
              textAlign: "center",
              borderBottom:
                "1px solid #e5e7eb",
            }}
          >
            {assessment.weight}%
          </td>

        </tr>
      );
    })}
  </tbody>
</table>

          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(220px,1fr))",
              gap: "20px",
            }}
          >

           
          </div>
        </>
      )}

    </Layout>
  );
}

export default MyResults;