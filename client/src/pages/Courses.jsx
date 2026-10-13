import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import { useUI } from "../context/UIContext";
import { FaBook, FaPlus, FaSearch, FaEdit, FaTrash, FaExternalLinkAlt, FaTimes, FaLayerGroup } from "react-icons/fa";

function Courses(){
 const { confirm, toast }=useUI();
 const { user }=useContext(AuthContext); const year=new Date().getFullYear().toString();
 const empty={code:"",name:"",description:"",creditHours:3,semester:"Semester I",studyYear:"Year I",academicYear:year,department:"",instructor:"",thumbnail:"",status:"Active"};
 const [course,setCourse]=useState(empty),[editingId,setEditingId]=useState(null),[courses,setCourses]=useState([]),[instructors,setInstructors]=useState([]),[loading,setLoading]=useState(true),[search,setSearch]=useState(""),[department,setDepartment]=useState(""),[status,setStatus]=useState(""),[showForm,setShowForm]=useState(false);
 const loadCourses=async()=>{try{const r=await api.get("/courses?limit=1000");setCourses(Array.isArray(r.data)?r.data:r.data.courses||[])}finally{setLoading(false)}};
 useEffect(()=>{
   const initialize=async()=>{
     try{
       const [courseRes,instructorRes]=await Promise.all([api.get("/courses?limit=1000"),api.get("/users/instructors")]);
       setCourses(Array.isArray(courseRes.data)?courseRes.data:courseRes.data.courses||[]);
       setInstructors(Array.isArray(instructorRes.data)?instructorRes.data:[]);
     }catch(err){console.error(err)}finally{setLoading(false)}
   };
   initialize();
 },[]);
 const change=e=>setCourse(p=>({...p,[e.target.name]:e.target.value}));
 const save=async e=>{e.preventDefault();try{editingId?await api.put(`/courses/${editingId}`,course):await api.post("/courses",course);toast(editingId?"Course updated.":"Course created.");setCourse(empty);setEditingId(null);setShowForm(false);await loadCourses()}catch(err){toast(err.response?.data?.message||"Unable to save course.","error")}};
 const edit=c=>{setEditingId(c._id);setCourse({code:c.code||"",name:c.name||"",description:c.description||"",creditHours:c.creditHours||3,semester:c.semester||"Semester I",studyYear:c.studyYear||"Year I",academicYear:c.academicYear||year,department:c.department||"",instructor:typeof c.instructor==="object"?c.instructor._id:c.instructor||"",thumbnail:c.thumbnail||"",status:c.status||"Active"});setShowForm(true);window.scrollTo({top:0,behavior:"smooth"})};
 const remove=async id=>{const approved=await confirm({title:"Delete this course?",message:"Course deletion can affect linked materials, attendance and assessments. Continue only if this course should be removed.",confirmText:"Delete course"});if(approved){try{await api.delete(`/courses/${id}`);toast("Course deleted.");loadCourses()}catch(err){toast(err.response?.data?.message||"Unable to delete course.","error")}}};
 // A catalog course is identified by its code, name, academic year, study year and semester.
 // Department-specific offerings remain separate rows; only the Course cell is grouped.
 const courseKey = c => [c.code, c.name, c.academicYear, c.studyYear, c.semester]
   .map(value => String(value ?? "").trim().toLowerCase()).join("::");
 const filtered=useMemo(()=>courses.filter(c=>(c.name||"").toLowerCase().includes(search.toLowerCase())||(c.code||"").toLowerCase().includes(search.toLowerCase())).filter(c=>!department||c.department===department).filter(c=>!status||c.status===status),[courses,search,department,status]);
 const groupedRows=useMemo(()=>{
   const groups=new Map();
   filtered.forEach(c=>{
     const key=courseKey(c);
     if(!groups.has(key)) groups.set(key,[]);
     groups.get(key).push(c);
   });
   return [...groups.entries()].flatMap(([key,items])=>items.map((course,index)=>({course,key,first:index===0,rowSpan:items.length})));
 },[filtered]);
 const uniqueCourseCount = list => new Set(list.map(courseKey)).size;
 const count=s=>uniqueCourseCount(courses.filter(c=>c.status===s));
 return <Layout><div className="workspace-page course-command">
  <section className="workspace-head"><div><span className="command-eyebrow"><FaLayerGroup/> ACADEMIC CATALOG</span><h1>Course Workspace</h1><p>Manage the catalog, instructors and course delivery from one compact view.</p></div><button className="head-action" onClick={()=>{setShowForm(v=>!v);if(showForm){setEditingId(null);setCourse(empty)}}}>{showForm?<FaTimes/>:<FaPlus/>}{showForm?"Close":"New course"}</button></section>
  <div className="mini-stats"><div className="mini-stat"><span className="dot" style={{"--tone":"#2563eb"}}/><div><strong>{uniqueCourseCount(courses)}</strong><span>Total courses</span></div></div><div className="mini-stat"><span className="dot" style={{"--tone":"#10b981"}}/><div><strong>{count("Active")}</strong><span>Active</span></div></div><div className="mini-stat"><span className="dot" style={{"--tone":"#8b5cf6"}}/><div><strong>{count("Completed")}</strong><span>Completed</span></div></div><div className="mini-stat"><span className="dot" style={{"--tone":"#64748b"}}/><div><strong>{count("Archived")}</strong><span>Archived</span></div></div></div>
  {showForm&&<form className="workspace-card course-editor" onSubmit={save}><div className="workspace-card-head"><div><h2>{editingId?"Edit course":"Create course"}</h2><p>Core catalog information and teaching assignment</p></div></div><div className="workspace-card-body compact-form-grid">
   <div className="field"><label>Course code</label><input name="code" value={course.code} onChange={change} required/></div><div className="field span-2"><label>Course name</label><input name="name" value={course.name} onChange={change} required/></div><div className="field"><label>Credit hours</label><input type="number" name="creditHours" value={course.creditHours} onChange={change}/></div>
   <div className="field"><label>Semester</label><select name="semester" value={course.semester} onChange={change}><option>Semester I</option><option>Semester II</option></select></div><div className="field"><label>Study year</label><select name="studyYear" value={course.studyYear} onChange={change}>{[1,2,3,4,5].map(n=><option key={n}>Year {['I','II','III','IV','V'][n-1]}</option>)}</select></div><div className="field"><label>Academic year</label><input value={course.academicYear} readOnly/></div><div className="field"><label>Status</label><select name="status" value={course.status} onChange={change}><option>Active</option><option>Completed</option><option>Archived</option></select></div>
   <div className="field span-2"><label>Department</label><select name="department" value={course.department} onChange={change} required><option value="">Select department</option>{["Aerospace Engineering","Production Engineering","Armament Engineering","Computer Engineering","Motor Vehicle Engineering","Metallurgy and Materials Engineering","Chemical Engineering","Electrical Power Engineering","Electronics Engineering","Civil Engineering"].map(x=><option key={x}>{x}</option>)}</select></div><div className="field span-2"><label>Instructor</label><select name="instructor" value={course.instructor} onChange={change}><option value="">Select instructor</option>{instructors.map(i=><option key={i._id} value={i._id}>{i.fullName}</option>)}</select></div>
   <div className="field span-all"><label>Description</label><textarea name="description" value={course.description} onChange={change} placeholder="Short course description"/></div><div className="sticky-actions span-all"><button type="button" className="btn-compact btn-muted" onClick={()=>{setShowForm(false);setEditingId(null);setCourse(empty)}}>Cancel</button><button className="btn-compact btn-primary">{editingId?"Save changes":"Create course"}</button></div>
  </div></form>}
  <div className="workspace-toolbar"><div className="workspace-search"><FaSearch/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by course name or code…"/></div><select value={department} onChange={e=>setDepartment(e.target.value)}><option value="">All departments</option>{[...new Set(courses.map(c=>c.department).filter(Boolean))].map(d=><option key={d}>{d}</option>)}</select><select value={status} onChange={e=>setStatus(e.target.value)}><option value="">All status</option><option>Active</option><option>Completed</option><option>Archived</option></select><span className="toolbar-count">{uniqueCourseCount(filtered)} unique courses shown</span></div>
  <section className="workspace-card"><div className="workspace-card-head"><div><h2><FaBook/> Course catalog</h2><p>Compact operational view — open a course for its full learning cockpit.</p></div></div><div className="data-wrap">{loading?<div className="empty-state"><strong>Loading courses…</strong></div>:filtered.length===0?<div className="empty-state"><strong>No courses found</strong><span>Adjust the filters or create a course.</span></div>:<table className="data-table course-table"><thead><tr><th>Course</th><th>Department</th><th>Instructor</th><th>Delivery</th><th>Status</th><th>Actions</th></tr></thead><tbody>{groupedRows.map(({course:c,key,first,rowSpan})=><tr key={c._id}>{first&&<td rowSpan={rowSpan} className="course-group-cell" style={{verticalAlign:"middle",borderRight:"1px solid #e2e8f0"}}><div className="course-cell"><span className="course-code">{c.code}</span><div><strong>{c.name}</strong><small>{c.description||"No description"}</small></div><small className="table-sub">{rowSpan} {rowSpan===1?"department":"departments"}</small></div></td>}<td>{c.department||"—"}</td><td>{c.instructor?.fullName||(typeof c.instructor==="string"?c.instructor:"—")}</td><td><strong>{c.semester}</strong><small className="table-sub">{c.studyYear} · {c.creditHours} credits</small></td><td><span className={`pill ${c.status==="Active"?"pill-green":c.status==="Completed"?"pill-blue":"pill-amber"}`}>{c.status}</span></td><td><div className="row-actions"><Link className="icon-action view" to={`/course/${c._id}`} title="Open department offering"><FaExternalLinkAlt/></Link><button className="icon-action edit" onClick={()=>edit(c)} title="Edit this department offering"><FaEdit/></button><button className="icon-action delete" onClick={()=>remove(c._id)} title="Delete this department offering"><FaTrash/></button></div></td></tr>)}</tbody></table>}</div></section>
  <div className="catalog-footnote"><span><strong>{user?.role}</strong> workspace</span><span>Academic year {year}</span><span>{uniqueCourseCount(courses)} unique courses · {courses.length} department offerings</span></div>
 </div></Layout>
}
export default Courses;
