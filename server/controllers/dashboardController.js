import Student from "../models/student.js";
import Course from "../models/course.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();

    const totalCourses = await Course.countDocuments();

    res.status(200).json({
      totalStudents,
      totalCourses,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};