import AssessmentTemplate from "../models/assessmentTemplate.js";
import Assessment from "../models/assessment.js";
import Course from "../models/course.js";
import Student from "../models/student.js";

const allowedCourse = (course, user) => user.role === "Admin" || String(course.instructor || "") === String(user._id);

export const getAssessmentTemplates = async (req,res) => {
  try { res.json(await AssessmentTemplate.find().sort({ name: 1 })); }
  catch { res.status(500).json({message:"Failed to load assessment types."}); }
};
export const createAssessmentTemplate = async (req,res) => {
  try {
    const total=(req.body.components||[]).reduce((s,c)=>s+Number(c.weight||0),0);
    if(total!==100) return res.status(400).json({message:`Assessment type must total 100%. Current total is ${total}%.`});
    const doc=await AssessmentTemplate.create({name:req.body.name,description:req.body.description||"",components:req.body.components,createdBy:req.user._id});
    res.status(201).json(doc);
  } catch(e){ res.status(400).json({message:e.message||"Failed to create assessment type."}); }
};
export const deleteAssessmentTemplate = async (req,res) => {
  try { const doc=await AssessmentTemplate.findById(req.params.id); if(!doc)return res.status(404).json({message:"Assessment type not found."}); await doc.deleteOne(); res.json({message:"Assessment type deleted. Existing course assessments were not changed."}); }
  catch { res.status(500).json({message:"Failed to delete assessment type."}); }
};
export const assignAssessmentTemplate = async (req,res) => {
  try {
    const [template,course]=await Promise.all([AssessmentTemplate.findById(req.params.id),Course.findById(req.body.courseId)]);
    if(!template)return res.status(404).json({message:"Assessment type not found."});
    if(!course)return res.status(404).json({message:"Course not found."});
    if(!allowedCourse(course,req.user))return res.status(403).json({message:"You can only assign assessment types to courses assigned to you."});
    // A course may have only one active plan. This check intentionally uses
    // the course ObjectId itself, independent of whether the original template
    // still exists. The client hides these courses from the assignment picker.
    const existing=await Assessment.countDocuments({course:course._id});
    if(existing>0)return res.status(409).json({
      message:"This course already has an assessment plan. Delete the existing course plan before assigning another type.",
      courseId:String(course._id),
      existingComponents:existing,
    });
    const students=await Student.find({
      status:"Active",
      $or:[
        {courses:course._id},
        {_id:{$in:course.students||[]}},
        {department:course.department,year:course.studyYear,semester:course.semester}
      ]
    }).select("_id");
    const scores=students.map(s=>({student:s._id,score:0,entered:false,remark:""}));
    const baseDate=new Date();
    const docs=template.components.map(c=>({course:course._id,title:c.title,category:c.category,week:c.week||1,dueDate:new Date(baseDate.getTime()+Math.max((c.week||1)-1,0)*7*86400000),totalMark:Number(c.weight),weight:Number(c.weight),description:c.description||`From assessment type: ${template.name}`,template:template._id,scores}));
    const created=await Assessment.insertMany(docs);
    res.status(201).json({message:`${template.name} assigned to ${course.code}.`,count:created.length});
  } catch(e){ res.status(400).json({message:e.message||"Failed to assign assessment type."}); }
};

export const deleteCourseAssessmentPlan = async (req,res) => {
  try {
    const course=await Course.findById(req.params.courseId);
    if(!course)return res.status(404).json({message:"Course not found."});
    if(!allowedCourse(course,req.user))return res.status(403).json({message:"You can only delete assessment plans for courses assigned to you."});
    const result=await Assessment.deleteMany({course:course._id});
    // Verify the plan is actually gone before telling the UI the course can be
    // reassigned. This prevents stale/orphaned components from blocking a new type.
    const remaining=await Assessment.countDocuments({course:course._id});
    if(remaining>0)return res.status(409).json({
      message:`The assessment plan for ${course.code} could not be fully removed. Please try deleting it again.`,
      deleted:result.deletedCount,
      remaining,
    });
    res.json({message:`Assessment plan removed from ${course.code}. You can now assign another assessment type.`,deleted:result.deletedCount,remaining:0,courseId:String(course._id)});
  } catch(e){res.status(500).json({message:e.message||"Failed to delete course assessment plan."});}
};
