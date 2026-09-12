import {
  useEffect,
  useMemo,
  useState,
  useContext,
} from "react";

import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";

import { AuthContext } from "../context/AuthContext";
import { useUI } from "../context/UIContext";

import {
  FaBook,
  FaFilePdf,
  FaVideo,
  FaFileAlt,
  FaSearch,
  FaUpload,
  FaPlus,
  FaTimes,
  FaPen,
  FaTrash,
  FaExternalLinkAlt,
  FaFolderOpen,
  FaPlay,
  FaClock,
  FaLayerGroup,
  FaArrowRight,
} from "react-icons/fa";

import { getCourses } from "../services/courseService";

import {
  getLearningMaterials,
  createLearningMaterial,
  updateLearningMaterial,
  deleteLearningMaterial,
} from "../services/learningMaterialService";

function getYoutubeEmbed(url) {
  if (!url) return "";

  const regExp =
    /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/;

  const match = url.match(regExp);

  return match && match[1]
    ? `https://www.youtube.com/embed/${match[1]}`
    : "";
}

function LearningMaterials() {

  const navigate = useNavigate();
  const { confirm, toast } = useUI();

  const { user } = useContext(AuthContext);

  const canManageMaterials =
    user?.role === "Admin" ||
    user?.role === "Instructor";

  const [courses, setCourses] = useState([]);

  const [materials, setMaterials] = useState([]);

  const [editingId, setEditingId] =
    useState(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [courseFilter, setCourseFilter] = useState("All");
  const [showUpload, setShowUpload] = useState(false);

  const [form, setForm] = useState({
    title: "",
    course: "",
    category: "Lecture Note",
    description: "",
    file: null,
    dueDate: "",
  });

  useEffect(() => {
    loadData();
  }, []);
    async function loadData() {
    try {
      const [courseData, materialData] =
        await Promise.all([
          getCourses(),
          getLearningMaterials(),
        ]);

      setCourses(courseData || []);
      setMaterials(materialData || []);
    } catch (err) {
      console.error(err);
      setCourses([]);
      setMaterials([]);
    }
  }

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function submit(e) {
    e.preventDefault();

    const formData = new FormData();

    formData.append("title", form.title);
    formData.append("course", form.course);
    formData.append("category", form.category);
    formData.append(
      "description",
      form.description
    );

    if (form.dueDate) {
      formData.append(
        "dueDate",
        form.dueDate
      );
    }

    if (form.category === "Video") {
      formData.append(
        "file",
        form.file || ""
      );
    } else if (form.file instanceof File) {
      formData.append(
        "file",
        form.file
      );
    }

    if (editingId) {
      await updateLearningMaterial(
        editingId,
        formData
      );
    } else {
      await createLearningMaterial(
        formData
      );
    }

    await loadData();

    setEditingId(null);
    setShowUpload(false);

    setForm({
      title: "",
      course: "",
      category: "Lecture Note",
      description: "",
      file: null,
      dueDate: "",
    });
  }

  function edit(material) {
    setEditingId(material._id);
    setShowUpload(true);

    setForm({
      title: material.title,

      course:
        material.course && typeof material.course === "object"
          ? material.course._id
          : material.course || "",

      category: material.category,

      description:
        material.description,

      file: null,

      dueDate: material.dueDate
        ? material.dueDate.substring(0, 10)
        : "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function remove(id) {
    const approved = await confirm({
      title: "Delete this learning material?",
      message: "Students will no longer see this resource in the learning library.",
      confirmText: "Delete material",
    });
    if (!approved) return;
    try {
      await deleteLearningMaterial(id);
      await loadData();
      toast("Learning material deleted.");
    } catch {
      toast("Unable to delete learning material.", "error");
    }
  }

  const filtered = useMemo(() => {
    return materials.filter((material) => {
      if (categoryFilter !== "All" && material.category !== categoryFilter) return false;
      const materialCourseId = material.course && typeof material.course === "object" ? material.course._id : material.course;
      if (courseFilter !== "All" && materialCourseId !== courseFilter) return false;
      return (
        (material.title || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||

        (
          material.course && typeof material.course ===
          "object"
            ? `${material.course.code || ""} ${material.course.name || ""}`
            : material.course || ""
        )
          .toLowerCase()
          .includes(search.toLowerCase()) ||

        (material.category || "")
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    });
  }, [materials, search, categoryFilter, courseFilter]);

  return (
    <Layout>
      <div className="al-control-page">
        <header className="al-control-header al-library-head">
          <div>
            <span className="al-eyebrow">KNOWLEDGE LIBRARY</span>
            <h1>Learning Materials</h1>
            <p>Organize lecture notes, assignments, videos and course resources.</p>
          </div>
          {canManageMaterials && <button className={`al-primary-action ${showUpload ? "is-close" : ""}`} onClick={() => { setShowUpload((value) => !value); setEditingId(null); }}>{showUpload ? <><FaTimes /> Close</> : <><FaPlus /> Add material</>}</button>}
        </header>
        <nav className="ops-flow resource-flow" aria-label="Academic operations"><span><b>1</b> Attendance</span><span><b>2</b> Assessment</span><span><b>3</b> Scores</span><span><b>4</b> Results</span><span className="active"><b>5</b> Resources</span></nav>
        <div className="al-kpi-ribbon">
          <div><span className="blue"><FaBook /></span><b>{materials.length}</b><small>Materials</small></div>
          <div><span className="red"><FaVideo /></span><b>{materials.filter((m) => m.category === "Video").length}</b><small>Videos</small></div>
          <div><span className="green"><FaFilePdf /></span><b>{materials.filter((m) => m.category !== "Video").length}</b><small>Documents</small></div>
          <div><span className="orange"><FaFileAlt /></span><b>{courses.length}</b><small>Courses</small></div>
        </div>
      {canManageMaterials && showUpload && (
              <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "18px",
          marginBottom: "18px",
          boxShadow:
            "0 10px 25px rgba(15,23,42,.06)",
        }}
      >
        <h2 style={{ marginBottom: "25px" }}>
          {editingId
            ? "Update Learning Material"
            : "Upload Learning Material"}
        </h2>

        <form
          className="course-form"
          onSubmit={submit}
        >
          <input
            name="title"
            placeholder="Material Title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <select
            name="course"
            value={form.course}
            onChange={handleChange}
            required
          >
            <option value="">
              Select Course
            </option>

            {courses.map((course) => (
              <option
                key={course._id}
                value={course._id}
              >
                {course.code} - {course.name}
              </option>
            ))}
          </select>

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option>Lecture Note</option>
            <option>Assignment</option>
            <option>Exercise</option>
            <option>Slides</option>
            <option>Video</option>
            <option>Other</option>
          </select>

          <textarea
            rows="4"
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />

          {form.category === "Video" ? (
            <input
              type="url"
              name="file"
              placeholder="Paste YouTube URL"
              value={form.file || ""}
              onChange={handleChange}
            />
          ) : (
            <div>
              <input
                id="materialFile"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                style={{ display: "none" }}
                onChange={(e) =>
                  setForm({
                    ...form,
                    file: e.target.files[0],
                  })
                }
              />

              <label
                htmlFor="materialFile"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 20px",
                  background: "#2563eb",
                  color: "#fff",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                <FaUpload />
                Upload File
              </label>

              <span
                style={{
                  marginLeft: "15px",
                  color: "#64748b",
                }}
              >
                {form.file instanceof File
                  ? form.file.name
                  : "No file selected"}
              </span>
            </div>
          )}

          {(form.category ===
            "Assignment" ||
            form.category ===
              "Exercise") && (
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
            />
          )}

          <button>
            {editingId
              ? "Update Material"
              : "Save Material"}
          </button>
        </form>
      </div>

      )}

      <section className="resource-studio">
        <div className="resource-studio-head">
          <div>
            <span className="al-eyebrow">RESOURCE DISCOVERY</span>
            <h2>Your learning library</h2>
            <p>Find the right note, assignment, presentation or video without digging through oversized cards.</p>
          </div>
          <div className="resource-studio-count"><FaLayerGroup /><strong>{filtered.length}</strong><span>showing</span></div>
        </div>

        <div className="resource-command-bar">
          <label className="resource-search-box">
            <FaSearch />
            <input
              placeholder="Search by title, course or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} aria-label="Filter by course">
            <option value="All">All courses</option>
            {courses.map((course) => <option key={course._id} value={course._id}>{course.code} — {course.name}</option>)}
          </select>
        </div>

        <div className="resource-filter-bar resource-filter-polished">
          <span>Type</span>
          {["All","Lecture Note","Assignment","Exercise","Slides","Video","Other"].map((category) => (
            <button key={category} className={categoryFilter === category ? "active" : ""} onClick={() => setCategoryFilter(category)}>{category}</button>
          ))}
        </div>

        {filtered.length ? (
          <div className="resource-showcase-grid">
            {filtered.map((material) => {
              const course = material.course && typeof material.course === "object" ? material.course : null;
              const embedUrl = material.category === "Video" ? getYoutubeEmbed(material.file) : "";
              const tone = material.category === "Video" ? "video" : material.category === "Assignment" ? "assignment" : material.category === "Exercise" ? "exercise" : material.category === "Slides" ? "slides" : "document";
              const Icon = material.category === "Video" ? FaPlay : material.category === "Slides" ? FaLayerGroup : material.category === "Assignment" || material.category === "Exercise" ? FaFileAlt : FaBook;
              return (
                <article
                  key={material._id}
                  className={`resource-showcase-card ${tone}`}
                  onClick={() => navigate(`/course/${course?._id || material.course || ""}`)}
                >
                  <div className="resource-showcase-media">
                    {embedUrl ? (
                      <iframe src={embedUrl} title={material.title} frameBorder="0" allowFullScreen onClick={(e) => e.stopPropagation()} />
                    ) : (
                      <div className="resource-file-visual"><span><Icon /></span><small>{material.category || "Resource"}</small></div>
                    )}
                    <span className={`resource-type-badge ${tone}`}>{material.category || "Resource"}</span>
                  </div>

                  <div className="resource-showcase-body">
                    <div className="resource-course-line"><FaFolderOpen /><span>{course ? `${course.code} · ${course.name}` : "Course resource"}</span></div>
                    <h3>{material.title}</h3>
                    <p>{material.description || "Learning resource shared for this course."}</p>
                    {(material.category === "Assignment" || material.category === "Exercise") && material.dueDate && (
                      <div className="resource-due"><FaClock /> Due {new Date(material.dueDate).toLocaleDateString()}</div>
                    )}
                  </div>

                  <div className="resource-showcase-footer">
                    {material.category !== "Video" && material.file ? (
                      <a href={material.file} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="resource-open-primary"><FaExternalLinkAlt /> Open resource</a>
                    ) : (
                      <button className="resource-course-link" onClick={(e) => { e.stopPropagation(); navigate(`/course/${course?._id || material.course || ""}`); }}>Course workspace <FaArrowRight /></button>
                    )}
                    {canManageMaterials && (
                      <div className="resource-admin-actions">
                        <button onClick={(e) => { e.stopPropagation(); edit(material); }} className="al-row-text-btn edit"><FaPen /></button>
                        <button onClick={async (e) => { e.stopPropagation(); await remove(material._id); }} className="al-row-text-btn delete"><FaTrash /></button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="resource-empty-state"><FaFolderOpen /><h3>No resources found</h3><p>Try another search, course, or resource type.</p></div>
        )}
      </section>
      </div>
    </Layout>
  );
}

export default LearningMaterials;