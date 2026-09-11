import { useMemo, useState } from "react";
import { FaDownload, FaExternalLinkAlt, FaFileAlt, FaFilePdf, FaFolderOpen, FaPlay, FaSearch, FaVideo } from "react-icons/fa";
import "./course.css";

const getFileType = (file = "") => {
  const lower = file.toLowerCase();
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube";
  if (lower.endsWith(".pdf")) return "pdf";
  if (/\.(mp4|webm|ogg)$/.test(lower)) return "video";
  if (/\.(ppt|pptx)$/.test(lower)) return "slides";
  return "file";
};
const getFileUrl = (file = "") => file.startsWith("http") ? file : `${import.meta.env.VITE_API_URL?.replace("/api", "") || ""}${file}`;
const getYoutubeEmbedUrl = (url = "") => { const match = url.match(/^.*(?:youtu\.be\/|embed\/|watch\?v=)([^#&?]*).*/); return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : ""; };
const icons = { pdf: FaFilePdf, youtube: FaPlay, video: FaVideo, slides: FaFileAlt, file: FaFolderOpen };

function MaterialsTab({ materials = [] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const filtered = useMemo(() => materials.filter(m => {
    const type = getFileType(m.file);
    const matchesSearch = `${m.title || ""} ${m.description || ""} ${m.category || ""}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || filter === type || filter === m.category;
    return matchesSearch && matchesFilter;
  }), [materials, search, filter]);

  if (!materials.length) return <div className="student-empty-state"><FaFolderOpen /> No learning materials have been published yet.</div>;

  return <section className="course-library">
    <div className="course-library-head">
      <div><span className="student-eyebrow">Course library</span><h2>Learning materials</h2><p>Notes, presentations, videos and course resources in one organized library.</p></div>
      <span className="student-count-badge">{materials.length} resources</span>
    </div>
    <div className="course-library-toolbar">
      <label><FaSearch /><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search this course..." /></label>
      <div className="course-filter-chips">{["All","pdf","youtube","video","slides"].map(x=><button key={x} className={filter===x?"active":""} onClick={()=>setFilter(x)}>{x === "All" ? "All" : x.toUpperCase()}</button>)}</div>
    </div>
    <div className="course-resource-list">
      {filtered.map(material => {
        const type = getFileType(material.file); const Icon = icons[type] || FaFileAlt; const url = getFileUrl(material.file);
        return <article key={material._id} className={`course-resource-row resource-${type}`}>
          <div className="resource-icon"><Icon /></div>
          <div className="resource-copy"><div className="resource-title-line"><h3>{material.title}</h3><span>{material.category || type}</span></div><p>{material.description || "Course learning resource"}</p><small>{material.createdAt ? new Date(material.createdAt).toLocaleDateString() : "Course resource"}</small></div>
          <div className="resource-actions">
            {material.file && <a href={url} target="_blank" rel="noreferrer" title="Open"><FaExternalLinkAlt /></a>}
            {material.file && type !== "youtube" && <a href={url} download title="Download"><FaDownload /></a>}
          </div>
          {type === "youtube" && getYoutubeEmbedUrl(material.file) && <div className="resource-preview"><iframe src={getYoutubeEmbedUrl(material.file)} title={material.title} allowFullScreen /></div>}
        </article>;
      })}
    </div>
    {!filtered.length && <div className="student-empty-state">No resources match your search.</div>}
  </section>;
}
export default MaterialsTab;
