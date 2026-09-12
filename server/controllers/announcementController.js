import Announcement from "../models/announcement.js";
import Student from "../models/student.js";
import Course from "../models/course.js";

const activeOnly = () => ({ $or: [{ expiryDate: null }, { expiryDate: { $gte: new Date() } }] });
const roleOf = (user) => String(user?.role || "").trim().toLowerCase();
const isStudent = (user) => roleOf(user) === "student";
const isInstructor = (user) => roleOf(user) === "instructor";

export const getAnnouncements = async (req, res) => {
  try {
    const filter = { ...activeOnly() };
    if (isStudent(req.user)) {
      const student = await Student.findOne({ studentId: req.user.studentId }).select("courses department year semester status");
      if (!student || student.status !== "Active") return res.json([]);
      let courseIds = (student.courses || []).map(String);
      const eligible = await Course.find({ department: student.department, studyYear: student.year, semester: student.semester, status: "Active" }).select("_id");
      courseIds = [...new Set([...courseIds, ...eligible.map(c => String(c._id))])];
      filter.course = { $in: courseIds };
      filter.audience = { $in: ["All", "Students"] };
    } else if (isInstructor(req.user)) {
      filter.audience = { $in: ["All", "Instructors", "Students"] };
    }
    const announcements = await Announcement.find(filter)
      .populate("createdBy", "fullName email role")
      .populate("course", "code name department")
      .sort({ isPinned: -1, createdAt: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load announcements." });
  }
};

export const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate("createdBy", "fullName email role")
      .populate("course", "code name department studyYear semester");
    if (!announcement) return res.status(404).json({ message: "Announcement not found." });
    if (isStudent(req.user)) {
      const student = await Student.findOne({ studentId: req.user.studentId }).select("courses department year semester status");
      if (!student || student.status !== "Active" || !announcement.course) {
        return res.status(403).json({ message: "Announcement not available for this account." });
      }
      const assignedIds = new Set((student.courses || []).map(String));
      const courseMatchesCurrentStudy =
        String(student.department) === String(announcement.course.department) &&
        String(student.year || "") === String(announcement.course.studyYear || student.year || "") &&
        String(student.semester || "") === String(announcement.course.semester || student.semester || "");
      const eligible = assignedIds.has(String(announcement.course._id)) || courseMatchesCurrentStudy;
      if (!eligible || !["All", "Students"].includes(announcement.audience)) {
        return res.status(403).json({ message: "Announcement not available for this account." });
      }
    }
    res.status(200).json(announcement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load announcement." });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, audience = "All", priority = "Normal", expiryDate = null, isPinned = false, course, department } = req.body;
    if (!title || !message || !course) return res.status(400).json({ message: "Title, message and course are required." });
    const courseDoc = await Course.findById(course).select("department");
    if (!courseDoc) return res.status(400).json({ message: "Selected course was not found." });
    const announcement = await Announcement.create({ title, message, audience, priority, expiryDate: expiryDate || null, isPinned, course, department: department || courseDoc.department, createdBy: req.user._id });
    const populated = await Announcement.findById(announcement._id).populate("createdBy", "fullName email role").populate("course", "code name department studyYear semester");
    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create announcement." });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found." });
    const fields = ["title", "message", "audience", "priority", "isPinned"];
    fields.forEach((field) => { if (req.body[field] !== undefined) announcement[field] = req.body[field]; });
    if (req.body.expiryDate !== undefined) announcement.expiryDate = req.body.expiryDate || null;
    if (req.body.course !== undefined) {
      const courseDoc = await Course.findById(req.body.course).select("department");
      if (!courseDoc) return res.status(400).json({ message: "Selected course was not found." });
      announcement.course = req.body.course;
      announcement.department = courseDoc.department;
    }
    await announcement.save();
    const updated = await Announcement.findById(announcement._id).populate("createdBy", "fullName email role").populate("course", "code name department studyYear semester");
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update announcement." });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found." });
    await announcement.deleteOne();
    res.status(200).json({ message: "Announcement deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete announcement." });
  }
};
