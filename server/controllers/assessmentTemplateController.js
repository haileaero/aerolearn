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
    const existing=await Assessment.countDocuments({course:course._id});
    if(existing>0)return res.status(400).json({message:"This course already has an assessment plan. Remove or keep the existing plan before assigning a template."});
    const students=await Student.find({$or:[{courses:course._id},{_id:{$in:course.students||[]}}],status:"Active"}).select("_id");
    const scores=students.map(s=>({student:s._id,score:0,entered:false,remark:""}));
    const baseDate=new Date();
    const docs=template.components.map(c=>({course:course._id,title:c.title,category:c.category,week:c.week||1,dueDate:new Date(baseDate.getTime()+Math.max((c.week||1)-1,0)*7*86400000),totalMark:Number(c.weight),weight:Number(c.weight),description:c.description||`From assessment type: ${template.name}`,template:template._id,scores}));
    const created=await Assessment.insertMany(docs);
    res.status(201).json({message:`${template.name} assigned to ${course.code}.`,count:created.length});
  } catch(e){ res.status(400).json({message:e.message||"Failed to assign assessment type."}); }
};
