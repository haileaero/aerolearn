import {
  useEffect,
  useMemo,
  useState,
  useContext,
} from "react";

import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";

import { AuthContext } from "../context/AuthContext";

import {
  FaBook,
  FaFilePdf,
  FaVideo,
  FaFileAlt,
  FaSearch,
  FaUpload,
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

  const { user } = useContext(AuthContext);

  const canManageMaterials =
    user?.role === "Admin" ||
    user?.role === "Instructor";

  const [courses, setCourses] = useState([]);

  const [materials, setMaterials] = useState([]);

  const [editingId, setEditingId] =
    useState(null);

  const [search, setSearch] =
    useState("");

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

    setForm({
      title: material.title,

      course:
        typeof material.course === "object"
          ? material.course._id
          : material.course,

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
    await deleteLearningMaterial(id);
    await loadData();
  }

  const filtered = useMemo(() => {
    return materials.filter((material) => {
      return (
        (material.title || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||

        (
          typeof material.course ===
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
  }, [materials, search]);

  return (
    <Layout>

      <div
        style={{
          background:
            "linear-gradient(135deg,#2563eb,#3b82f6)",
          color: "#fff",
          borderRadius: "22px",
          padding: "35px",
          marginBottom: "35px",
        }}
      >
        <h1
          style={{
            fontSize: "42px",
            marginBottom: "10px",
          }}
        >
          Learning Materials
        </h1>

        <p
          style={{
            opacity: 0.95,
            fontSize: "16px",
          }}
        >
          Upload, organize and manage lecture
          notes, assignments, videos and
          learning resources.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginBottom: "35px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "25px",
            boxShadow:
              "0 8px 20px rgba(15,23,42,.06)",
          }}
        >
          <FaBook size={34} color="#2563eb" />
          <h3>Total Materials</h3>
          <h1>{materials.length}</h1>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "25px",
            boxShadow:
              "0 8px 20px rgba(15,23,42,.06)",
          }}
        >
          <FaVideo size={34} color="#dc2626" />
          <h3>Videos</h3>
          <h1>
            {
              materials.filter(
                (m) =>
                  m.category === "Video"
              ).length
            }
          </h1>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "25px",
            boxShadow:
              "0 8px 20px rgba(15,23,42,.06)",
          }}
        >
          <FaFilePdf size={34} color="#16a34a" />
          <h3>Documents</h3>
          <h1>
            {
              materials.filter(
                (m) =>
                  m.category !== "Video"
              ).length
            }
          </h1>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "25px",
            boxShadow:
              "0 8px 20px rgba(15,23,42,.06)",
          }}
        >
          <FaFileAlt size={34} color="#f59e0b" />
          <h3>Courses</h3>
          <h1>{courses.length}</h1>
        </div>
      </div>

      {canManageMaterials && (
              <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "30px",
          marginBottom: "35px",
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
            "repeat(auto-fit,minmax(360px,1fr))",
          gap: "25px",
        }}
      >
        {filtered.map((material) => (
          <div
            key={material._id}
            onClick={() =>
              navigate(
                `/course/${
                  typeof material.course ===
                  "object"
                    ? material.course._id
                    : material.course
                }`
              )
            }
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "25px",
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
              {typeof material.course ===
              "object"
                ? `${material.course.code} - ${material.course.name}`
                : material.course}
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
                  href={`http://localhost:5000${material.file}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >
                  📄 Open File
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
                >
                  Edit
                </button>

                <button
                  style={{
                    background:
                      "#dc2626",
                    color: "#fff",
                  }}
                  onClick={async (
                    e
                  ) => {
                    e.stopPropagation();
                    await remove(
                      material._id
                    );
                  }}
                >
                  Delete
                </button>
              </div>
            )}

          </div>
        ))}
      </div>

    </Layout>
  );
}

export default LearningMaterials;