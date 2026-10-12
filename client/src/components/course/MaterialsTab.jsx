import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / MATERIALS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedMaterials = filtered.slice(
    (safePage - 1) * MATERIALS_PER_PAGE,
    safePage * MATERIALS_PER_PAGE
  );
  const firstMaterial = filtered.length ? (safePage - 1) * MATERIALS_PER_PAGE + 1 : 0;
  const lastMaterial = Math.min(safePage * MATERIALS_PER_PAGE, filtered.length);

  if (!materials.length) return <div className="student-empty-state"><FaFolderOpen /> No learning materials have been published yet.</div>;

  return <section className="course-library">
    <div className="course-library-head">
      <div><span className="student-eyebrow">Course library</span><h2>Learning materials</h2><p>Notes, presentations, videos and course resources in one organized library.</p></div>
      <span className="student-count-badge">{filtered.length} resources</span>
    </div>
    <div className="course-library-toolbar">
      <label><FaSearch /><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search this course..." /></label>
      <div className="course-filter-chips">{["All","pdf","youtube","video","slides"].map(x=><button key={x} className={filter===x?"active":""} onClick={()=>setFilter(x)}>{x === "All" ? "All" : x.toUpperCase()}</button>)}</div>
    </div>
    <div className="course-resource-list">
      {paginatedMaterials.map(material => {
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
    {filtered.length > 0 && <div className="course-material-pagination" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginTop: "18px", padding: "12px 0" }}>
      <span style={{ color: "#64748b", fontSize: "0.9rem" }}>Showing {firstMaterial}–{lastMaterial} of {filtered.length} resources</span>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
        <button type="button" disabled={safePage === 1} onClick={() => setCurrentPage(page => Math.max(1, page - 1))} style={{ padding: "8px 12px", border: "1px solid #dbe3ef", borderRadius: "8px", background: safePage === 1 ? "#f1f5f9" : "#fff", color: "#1e40af", cursor: safePage === 1 ? "not-allowed" : "pointer" }}>Previous</button>
        {Array.from({ length: totalPages }, (_, index) => index + 1)
          .filter(page => page === 1 || page === totalPages || Math.abs(page - safePage) <= 1)
          .map((page, index, pages) => <span key={page} style={{ display: "contents" }}>
            {index > 0 && page - pages[index - 1] > 1 && <span style={{ color: "#64748b" }}>…</span>}
            <button type="button" aria-current={safePage === page ? "page" : undefined} onClick={() => setCurrentPage(page)} style={{ minWidth: "36px", padding: "8px 10px", border: safePage === page ? "1px solid #2563eb" : "1px solid #dbe3ef", borderRadius: "8px", background: safePage === page ? "#2563eb" : "#fff", color: safePage === page ? "#fff" : "#1e40af", fontWeight: safePage === page ? 700 : 500, cursor: "pointer" }}>{page}</button>
          </span>)}
        <button type="button" disabled={safePage === totalPages} onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))} style={{ padding: "8px 12px", border: "1px solid #dbe3ef", borderRadius: "8px", background: safePage === totalPages ? "#f1f5f9" : "#fff", color: "#1e40af", cursor: safePage === totalPages ? "not-allowed" : "pointer" }}>Next</button>
      </div>
    </div>}
  </section>;
}
export default MaterialsTab;
