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
    const components=req.body.components||[];
    const total=components.reduce((s,c)=>s+Number(c.weight||0),0);
    if(total!==100) return res.status(400).json({message:`Assessment type must total 100%. Current total is ${total}%.`});
    const componentKeys=new Set();
    for(const component of components){
      const key=`${String(component.title||"").trim().toLowerCase()}::${Number(component.week||1)}`;
      if(componentKeys.has(key)) return res.status(400).json({message:`Duplicate component “${component.title}” in week ${component.week||1}. Give each component a unique name or week.`});
      componentKeys.add(key);
    }
    const doc=await AssessmentTemplate.create({name:req.body.name,description:req.body.description||"",components,createdBy:req.user._id});
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
    // A course may have only one complete plan. Recover automatically from the
    // partial insert left by older versions when a duplicate component caused
    // MongoDB E11000 midway through template assignment.
    const existingDocs=await Assessment.find({course:course._id}).select("template weight");
    if(existingDocs.length){
      const sameTemplate=existingDocs.every(item=>String(item.template||"")===String(template._id));
      const existingWeight=existingDocs.reduce((sum,item)=>sum+Number(item.weight||0),0);
      if(sameTemplate && existingWeight<100){
        await Assessment.deleteMany({course:course._id});
      }else{
        return res.status(409).json({
          message:"This course already has an assessment plan. Delete the existing course plan before assigning another type.",
          courseId:String(course._id),
          existingComponents:existingDocs.length,
        });
      }
    }
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
    // Legacy templates could contain the same title/week more than once. MongoDB
    // requires course+title+week to be unique, so make those old components
    // deterministic and unique during assignment (e.g. Assignment 1 (2)).
    const usedKeys=new Map();
    const docs=template.components.map(c=>{
      const week=Number(c.week||1);
      const baseTitle=String(c.title||c.category||"Assessment").trim();
      const key=`${baseTitle.toLowerCase()}::${week}`;
      const occurrence=(usedKeys.get(key)||0)+1;
      usedKeys.set(key,occurrence);
      const title=occurrence===1?baseTitle:`${baseTitle} (${occurrence})`;
      return {course:course._id,title,category:c.category,week,dueDate:new Date(baseDate.getTime()+Math.max(week-1,0)*7*86400000),totalMark:Number(c.weight),weight:Number(c.weight),description:c.description||`From assessment type: ${template.name}`,template:template._id,scores};
    });
    let created;
    try{
      created=await Assessment.insertMany(docs);
    }catch(insertError){
      // insertMany can leave earlier documents behind on a duplicate-key error.
      // Roll back this template assignment so the course never becomes falsely blocked.
      await Assessment.deleteMany({course:course._id,template:template._id});
      throw insertError;
    }
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
