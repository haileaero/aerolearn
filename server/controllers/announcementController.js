import Announcement from "../models/announcement.js";
import Student from "../models/student.js";
import Course from "../models/course.js";
import AnnouncementRead from "../models/announcementRead.js";

const activeOnly = () => ({ $or: [{ expiryDate: null }, { expiryDate: { $gte: new Date() } }] });
const roleOf = (user) => String(user?.role || "").trim().toLowerCase();
const isStudent = (user) => roleOf(user) === "student";
const isInstructor = (user) => roleOf(user) === "instructor";
const studentFor = (user) => Student.findOne({ $or: [{ user: user._id }, { studentId: user.studentId }] }).select("courses department year semester section status");
const same = (a, b) => String(a ?? "").trim().toLowerCase() === String(b ?? "").trim().toLowerCase();
const targetsAllSections = (section) => !section || ["all", "all sections"].includes(String(section).trim().toLowerCase());

// Blank targeting fields on older announcements are treated as broad targeting
// for that dimension; the course still has to match the student's eligible courses.
const announcementMatchesStudent = (announcement, student) => {
  const course = announcement.course;
  if (!course) return false;
  if (!same(announcement.department, student.department)) return false;
  if (announcement.studyYear && !same(announcement.studyYear, student.year)) return false;
  if (!targetsAllSections(announcement.section) && !same(announcement.section, student.section)) return false;
  const assigned = (student.courses || []).some((id) => String(id) === String(course._id));
  const courseProfileMatches = same(course.department, student.department) &&
    same(course.studyYear, student.year) && same(course.semester, student.semester) &&
    (targetsAllSections(announcement.section) || same(announcement.section, student.section));
  return assigned || courseProfileMatches;
};

const visibleAnnouncementsFor = async (user) => {
  const filter = { ...activeOnly() };
  if (isStudent(user)) {
    const student = await studentFor(user);
    if (!student || student.status !== "Active") return [];
    filter.audience = { $in: ["All", "Students"] };
    const all = await Announcement.find(filter).populate("createdBy", "fullName email role").populate("course", "code name department studyYear semester").sort({ isPinned: -1, createdAt: -1 });
    return all.filter((a) => announcementMatchesStudent(a, student));
  }
  if (isInstructor(user)) filter.audience = { $in: ["All", "Instructors", "Students"] };
  return Announcement.find(filter).populate("createdBy", "fullName email role").populate("course", "code name department studyYear semester").sort({ isPinned: -1, createdAt: -1 });
};

export const getAnnouncements = async (req, res) => {
  try {
    return res.status(200).json(await visibleAnnouncementsFor(req.user));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to load announcements." });
  }
};

// Counts only announcements visible to this account and not yet read by this user.
export const getUnreadAnnouncementCount = async (req, res) => {
  try {
    const visible = await visibleAnnouncementsFor(req.user);
    if (!visible.length) return res.json({ count: 0 });
    const ids = visible.map((item) => item._id);
    const reads = await AnnouncementRead.find({ user: req.user._id, announcement: { $in: ids } }).select("announcement").lean();
    const readIds = new Set(reads.map((item) => String(item.announcement)));
    return res.json({ count: ids.filter((id) => !readIds.has(String(id))).length });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to count unread announcements." });
  }
};

// Opening the announcements page marks currently visible announcements as read for this account only.
export const markVisibleAnnouncementsRead = async (req, res) => {
  try {
    const visible = await visibleAnnouncementsFor(req.user);
    if (visible.length) {
      await AnnouncementRead.bulkWrite(visible.map((item) => ({
        updateOne: {
          filter: { user: req.user._id, announcement: item._id },
          update: { $setOnInsert: { user: req.user._id, announcement: item._id, readAt: new Date() } },
          upsert: true,
        },
      })), { ordered: false });
    }
    return res.json({ message: "Announcements marked as read.", count: visible.length });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to mark announcements as read." });
  }
};

export const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate("createdBy", "fullName email role").populate("course", "code name department studyYear semester");
    if (!announcement) return res.status(404).json({ message: "Announcement not found." });
    if (isStudent(req.user)) {
      const student = await studentFor(req.user);
      if (!student || student.status !== "Active" || !["All", "Students"].includes(announcement.audience) || !announcementMatchesStudent(announcement, student)) {
        return res.status(403).json({ message: "Announcement not available for this account." });
      }
    }
    return res.status(200).json(announcement);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to load announcement." });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, audience = "All", priority = "Normal", expiryDate = null, isPinned = false, course, department, studyYear = "", section = "" } = req.body;
    if (!title?.trim() || !message?.trim() || !course || !department || !studyYear || !section) {
      return res.status(400).json({ message: "Title, message, study year, department, section and course are required." });
    }
    const courseDoc = await Course.findById(course).select("department studyYear semester status");
    if (!courseDoc) return res.status(400).json({ message: "Selected course was not found." });
    if (!same(courseDoc.department, department) || !same(courseDoc.studyYear, studyYear)) {
      return res.status(400).json({ message: "The selected course does not match the chosen department and study year." });
    }
    const announcement = await Announcement.create({ title: title.trim(), message: message.trim(), audience, priority, expiryDate: expiryDate || null, isPinned: Boolean(isPinned), course, department, studyYear, section, createdBy: req.user._id });
    const populated = await Announcement.findById(announcement._id).populate("createdBy", "fullName email role").populate("course", "code name department studyYear semester");
    return res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create announcement." });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found." });
    for (const field of ["title", "message", "audience", "priority", "isPinned", "studyYear", "section", "department"]) {
      if (req.body[field] !== undefined) announcement[field] = req.body[field];
    }
    if (req.body.expiryDate !== undefined) announcement.expiryDate = req.body.expiryDate || null;
    if (req.body.course !== undefined) announcement.course = req.body.course;
    const courseDoc = await Course.findById(announcement.course).select("department studyYear");
    if (!courseDoc) return res.status(400).json({ message: "Selected course was not found." });
    if (!same(courseDoc.department, announcement.department) || !same(courseDoc.studyYear, announcement.studyYear)) {
      return res.status(400).json({ message: "The selected course does not match the chosen department and study year." });
    }
    await announcement.save();
    const updated = await Announcement.findById(announcement._id).populate("createdBy", "fullName email role").populate("course", "code name department studyYear semester");
    return res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update announcement." });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found." });
    await announcement.deleteOne();
    return res.status(200).json({ message: "Announcement deleted successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete announcement." });
  }
};
