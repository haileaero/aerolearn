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
  }, [materials, search, categoryFilter]);

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

      <div className="resource-filter-bar">
        <span>Filter</span>
        {["All","Lecture Note","Assignment","Exercise","Slides","Video","Other"].map((category) => <button key={category} className={categoryFilter === category ? "active" : ""} onClick={() => setCategoryFilter(category)}>{category}</button>)}
      </div>

      <div
        style={{
          position: "relative",
          marginBottom: "30px",
        }}
      >
        <FaSearch
          style={{
            position: "absolute",
            left: "18px",
            top: "16px",
            color: "#64748b",
          }}
        />

        <input
          placeholder="Search materials..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            width: "100%",
            padding:
              "14px 18px 14px 50px",
            borderRadius: "12px",
            border: "1px solid #d1d5db",
            fontSize: "15px",
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(300px,1fr))",
          gap: "14px",
        }}
      >
        {filtered.map((material) => (
          <div
            key={material._id}
            onClick={() =>
              navigate(
                `/course/${
                  material.course && typeof material.course ===
                  "object"
                    ? material.course._id
                    : material.course
                }`
              )
            }
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "16px",
              boxShadow:
                "0 10px 25px rgba(15,23,42,.06)",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h2>{material.title}</h2>

              <span
                style={{
                  padding: "6px 12px",
                  borderRadius: "20px",
                  background:
                    material.category ===
                    "Video"
                      ? "#dc2626"
                      : "#2563eb",
                  color: "#fff",
                }}
              >
                {material.category}
              </span>
            </div>

            <p>
              <strong>Course:</strong>{" "}
              {material.course && typeof material.course ===
              "object"
                ? `${material.course.code || "Course"} - ${material.course.name || "Unavailable"}`
                : material.course || "Course unavailable"}
            </p>

            <p>{material.description}</p>

            {material.category ===
              "Video" &&
              getYoutubeEmbed(
                material.file
              ) && (
                <iframe
                  width="100%"
                  height="220"
                  src={getYoutubeEmbed(
                    material.file
                  )}
                  title="Video"
                  frameBorder="0"
                  allowFullScreen
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                />
              )}

            {material.category !==
              "Video" &&
              material.file && (
               <a
  href={material.file}
  target="_blank"
  rel="noopener noreferrer"
  onClick={(e) =>
    e.stopPropagation()
  }
 className="material-open-link">
  <FaExternalLinkAlt /> Open file
</a>
              )}

            {(material.category ===
              "Assignment" ||
              material.category ===
                "Exercise") &&
              material.dueDate && (
                <p
                  style={{
                    color: "#dc2626",
                    fontWeight: "bold",
                  }}
                >
                  Due:{" "}
                  {new Date(
                    material.dueDate
                  ).toLocaleDateString()}
                </p>
              )}

            {canManageMaterials && (
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "20px",
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    edit(material);
                  }}
                  className="al-row-text-btn edit"
                >
                  <FaPen /> Edit
                </button>

                <button
                  className="al-row-text-btn delete"
                  onClick={async (
                    e
                  ) => {
                    e.stopPropagation();
                    await remove(
                      material._id
                    );
                  }}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            )}

          </div>
        ))}
      </div>

      </div>
    </Layout>
  );
}

export default LearningMaterials;