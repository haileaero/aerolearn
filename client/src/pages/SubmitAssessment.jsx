import { useEffect, useMemo, useState } from "react";
import { FaCheckCircle, FaClipboardCheck, FaSave, FaUsers } from "react-icons/fa";
import Layout from "../components/Layout";
import api from "../api";
import "../styles/workspace.css";

function SubmitAssessment() {
  const departments = ["Aerospace Engineering","Armament Engineering","Computer Engineering","Software Engineering","Information Technology","Computer Science","Electrical Engineering","Mechanical Engineering","Civil Engineering","Chemical Engineering"];
  const [courses,setCourses]=useState([]); const [assessments,setAssessments]=useState([]); const [students,setStudents]=useState([]);
  const [department,setDepartment]=useState(""); const [course,setCourse]=useState(""); const [assessment,setAssessment]=useState("");
  const [scores,setScores]=useState([]); const [saving,setSaving]=useState(false); const [message,setMessage]=useState(""); const [error,setError]=useState("");

  useEffect(()=>{(async()=>{try{const [c,a]=await Promise.all([api.get("/courses"),api.get("/assessment")]);setCourses(Array.isArray(c.data.courses)?c.data.courses:Array.isArray(c.data)?c.data:[]);setAssessments(Array.isArray(a.data)?a.data:[]);}catch(err){setError(err.response?.data?.message||"Unable to load assessment data.");}})();},[]);
  useEffect(()=>{if(!course){setStudents([]);setScores([]);return;} (async()=>{try{const res=await api.get(`/courses/${course}`);const list=res.data.students||[];setStudents(list);setScores(list.map(s=>({student:s._id,score:""})));}catch(err){setError(err.response?.data?.message||"Unable to load students.");}})();},[course]);

  const filteredCourses=useMemo(()=>courses.filter(c=>c.department===department),[courses,department]);
  const filteredAssessments=useMemo(()=>assessments.filter(a=>a.course&&(typeof a.course==="object"?a.course._id===course:a.course===course)),[assessments,course]);
  const selectedAssessment=assessments.find(a=>a._id===assessment);
  const entered=scores.filter(s=>s.score!=="").length;

  const saveScores=async()=>{if(!assessment){setError("Please select an assessment.");return;} try{setSaving(true);setError("");setMessage("");await api.put(`/assessment/${assessment}/scores`,{scores});setMessage("Scores saved successfully.");}catch(err){setError(err.response?.data?.message||"Unable to save scores.");}finally{setSaving(false);}};

  return <Layout><div className="workspace-page"><nav className="ops-flow assessment-flow" aria-label="Academic operations"><span><b>1</b> Attendance</span><span><b>2</b> Assessment</span><span className="active"><b>3</b> Scores</span><span><b>4</b> Results</span><span><b>5</b> Resources</span></nav>
    <section className="workspace-head"><div><h1><FaClipboardCheck/> Submit Assessment Scores</h1><p>Choose the class context, enter marks quickly, and save the complete score sheet.</p></div><div className="head-badge"><strong>{students.length}</strong><span>Students loaded</span></div></section>
    {message&&<div className="message-strip success">✓ {message}</div>}{error&&<div className="message-strip error">{error}</div>}
    <section className="workspace-card"><div className="workspace-card-head"><div><h2>Assessment selection</h2><p>Department → course → assessment</p></div><span className="pill pill-blue">3 steps</span></div><div className="workspace-card-body compact-filter-grid">
      <div className="field"><label>Department</label><select value={department} onChange={e=>{setDepartment(e.target.value);setCourse("");setAssessment("");}}><option value="">Select department</option>{departments.map(d=><option key={d}>{d}</option>)}</select></div>
      <div className="field"><label>Course</label><select value={course} disabled={!department} onChange={e=>{setCourse(e.target.value);setAssessment("");}}><option value="">Select course</option>{filteredCourses.map(c=><option key={c._id} value={c._id}>{c.code} — {c.name}</option>)}</select></div>
      <div className="field"><label>Assessment</label><select value={assessment} disabled={!course} onChange={e=>setAssessment(e.target.value)}><option value="">Select assessment</option>{filteredAssessments.map(a=><option key={a._id} value={a._id}>{a.title||a.category}</option>)}</select></div>
    </div></section>
    <div className="mini-stats"><div className="mini-stat" style={{"--tone":"#2563eb"}}><div className="dot"/><div><strong>{students.length}</strong><span>Students</span></div></div><div className="mini-stat" style={{"--tone":"#7c3aed"}}><div className="dot"/><div><strong>{selectedAssessment?.totalMark??"—"}</strong><span>Total mark</span></div></div><div className="mini-stat" style={{"--tone":"#10b981"}}><div className="dot"/><div><strong>{entered}</strong><span>Scores entered</span></div></div><div className="mini-stat" style={{"--tone":"#f59e0b"}}><div className="dot"/><div><strong>{Math.max(students.length-entered,0)}</strong><span>Remaining</span></div></div></div>
    <section className="workspace-card"><div className="workspace-card-head"><div><h2><FaUsers/> Student score sheet</h2><p>{selectedAssessment?`${selectedAssessment.title||selectedAssessment.category} · maximum ${selectedAssessment.totalMark}`:"Select an assessment to begin"}</p></div>{selectedAssessment&&<span className="pill pill-violet">{selectedAssessment.category}</span>}</div>
      {!assessment?<div className="empty-state"><strong>No assessment selected</strong>Select department, course and assessment above.</div>:students.length===0?<div className="empty-state"><strong>No students found</strong>This course currently has no enrolled students.</div>:<div className="workspace-card-body"><div className="data-wrap"><table className="data-table"><thead><tr><th>#</th><th>Student ID</th><th>Student name</th><th>Score</th><th>Completion</th></tr></thead><tbody>{students.map((s,i)=><tr key={s._id}><td>{i+1}</td><td><span className="table-id">{s.studentId}</span></td><td><strong>{s.fullName}</strong></td><td><input className="score-input" type="number" min="0" max={selectedAssessment?.totalMark||undefined} value={scores[i]?.score??""} onChange={e=>setScores(prev=>prev.map((x,idx)=>idx===i?{...x,score:e.target.value}:x))}/></td><td>{scores[i]?.score!==""?<span className="pill pill-green"><FaCheckCircle/> Entered</span>:<span className="pill pill-amber">Pending</span>}</td></tr>)}</tbody></table></div><div className="sticky-actions"><button className="btn-compact btn-primary" onClick={saveScores} disabled={saving}><FaSave/>{saving?"Saving...":"Save all scores"}</button></div></div>}
    </section>
  </div></Layout>;
}
export default SubmitAssessment;
