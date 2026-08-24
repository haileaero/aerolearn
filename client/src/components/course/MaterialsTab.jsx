import "./course.css";

function MaterialsTab({ materials }) {
  if (materials.length === 0) {
    return (
      <div className="empty-state">
        <h2>📂 No Learning Materials Available</h2>
        <p>The instructor hasn't uploaded any materials yet.</p>
      </div>
    );
  }

  // Detect file type
  const getFileType = (file) => {
    if (!file) return "other";

    const lower = file.toLowerCase();

    if (
      lower.includes("youtube.com") ||
      lower.includes("youtu.be")
    )
      return "youtube";

    if (lower.endsWith(".pdf"))
      return "pdf";

    if (
      lower.endsWith(".mp4") ||
      lower.endsWith(".webm") ||
      lower.endsWith(".ogg")
    )
      return "video";

    if (
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg") ||
      lower.endsWith(".png") ||
      lower.endsWith(".gif") ||
      lower.endsWith(".webp")
    )
      return "image";

    if (
      lower.endsWith(".ppt") ||
      lower.endsWith(".pptx")
    )
      return "powerpoint";

    if (
      lower.endsWith(".doc") ||
      lower.endsWith(".docx")
    )
      return "word";

    if (
      lower.endsWith(".zip") ||
      lower.endsWith(".rar")
    )
      return "archive";

    return "other";
  };

  // Build proper URL
  const getFileUrl = (file) => {
    if (!file) return "";

    // External link (YouTube etc.)
    if (file.startsWith("http")) {
      return file;
    }

    // Local uploaded file
   return `${import.meta.env.VITE_API_URL?.replace("/api", "")}${file}`;
  };

  // Convert YouTube URL to embedded player
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return "";

    const regExp =
      /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/;

    const match = url.match(regExp);

    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }

    return "";
  };

  return (
    <div className="materials-grid">
      {materials.map((material) => (
        <div
          key={material._id}
          className="material-card"
        >
          <div className="material-header">
            <h2>{material.title}</h2>

            <span className="material-badge">
              {material.category || "Material"}
            </span>
          </div>

          <p className="material-description">
            {material.description ||
              "No description available."}
          </p>

          <div className="material-info">
            <div>
              <strong>Uploaded</strong>
              <span>
                {material.createdAt
                  ? new Date(
                      material.createdAt
                    ).toLocaleDateString()
                  : "-"}
              </span>
            </div>
          </div>

          {material.file && (
            <>
                          {/* ================= PDF ================= */}

              {getFileType(material.file) === "pdf" && (
                <>
                  <iframe
                    src={getFileUrl(material.file)}
                    title={material.title}
                    style={{
                      width: "100%",
                      height: "500px",
                      border: "1px solid #ddd",
                      borderRadius: "12px",
                      marginTop: "20px",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "15px",
                      flexWrap: "wrap",
                    }}
                  >
                    <a
                      href={getFileUrl(material.file)}
                      target="_blank"
                      rel="noreferrer"
                      className="material-btn"
                    >
                      📄 View PDF
                    </a>

                    <a
                      href={getFileUrl(material.file)}
                      download
                      className="material-btn download"
                    >
                      ⬇ Download PDF
                    </a>
                  </div>
                </>
              )}

              {/* ================= YouTube ================= */}

              {getFileType(material.file) === "youtube" && (
                <>
                  <iframe
                    width="100%"
                    height="420"
                    src={getYoutubeEmbedUrl(material.file)}
                    title={material.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      border: "none",
                      borderRadius: "12px",
                      marginTop: "20px",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "15px",
                      flexWrap: "wrap",
                    }}
                  >
                    <a
                      href={material.file}
                      target="_blank"
                      rel="noreferrer"
                      className="material-btn"
                    >
                      ▶ Watch on YouTube
                    </a>
                  </div>
                </>
              )}

              {/* ================= MP4 Video ================= */}

              {getFileType(material.file) === "video" && (
                <>
                  <video
                    controls
                    controlsList="nodownload"
                    style={{
                      width: "100%",
                      marginTop: "20px",
                      borderRadius: "12px",
                      background: "#000",
                    }}
                  >
                    <source
                      src={getFileUrl(material.file)}
                      type="video/mp4"
                    />
                    Your browser does not support HTML5 video.
                  </video>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "15px",
                      flexWrap: "wrap",
                    }}
                  >
                    <a
                      href={getFileUrl(material.file)}
                      target="_blank"
                      rel="noreferrer"
                      className="material-btn"
                    >
                      ▶ Open Video
                    </a>

                    <a
                      href={getFileUrl(material.file)}
                      download
                      className="material-btn download"
                    >
                      ⬇ Download Video
                    </a>
                  </div>
                </>
              )}

              {/* ================= Images ================= */}

              {getFileType(material.file) === "image" && (
                <>
                  <img
                    src={getFileUrl(material.file)}
                    alt={material.title}
                    style={{
                      width: "100%",
                      marginTop: "20px",
                      borderRadius: "12px",
                      objectFit: "cover",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "15px",
                      flexWrap: "wrap",
                    }}
                  >
                    <a
                      href={getFileUrl(material.file)}
                      target="_blank"
                      rel="noreferrer"
                      className="material-btn"
                    >
                      🖼 View Image
                    </a>

                    <a
                      href={getFileUrl(material.file)}
                      download
                      className="material-btn download"
                    >
                      ⬇ Download Image
                    </a>
                  </div>
                </>
              )}
                            {/* ================= PowerPoint ================= */}

              {getFileType(material.file) === "powerpoint" && (
                <>
                  <div
                    style={{
                      marginTop: "20px",
                      padding: "25px",
                      borderRadius: "12px",
                      background: "#fff3cd",
                      border: "1px solid #ffe69c",
                    }}
                  >
                    <h3>📊 PowerPoint Presentation</h3>

                    <p>
                      Preview is not supported in the browser.
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "15px",
                        flexWrap: "wrap",
                      }}
                    >
                      <a
                        href={getFileUrl(material.file)}
                        target="_blank"
                        rel="noreferrer"
                        className="material-btn"
                      >
                        Open Presentation
                      </a>

                      <a
                        href={getFileUrl(material.file)}
                        download
                        className="material-btn download"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </>
              )}

              {/* ================= Word ================= */}

              {getFileType(material.file) === "word" && (
                <>
                  <div
                    style={{
                      marginTop: "20px",
                      padding: "25px",
                      borderRadius: "12px",
                      background: "#eef5ff",
                      border: "1px solid #c7dcff",
                    }}
                  >
                    <h3>📝 Word Document</h3>

                    <p>
                      Preview is not supported in the browser.
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "15px",
                        flexWrap: "wrap",
                      }}
                    >
                      <a
                        href={getFileUrl(material.file)}
                        target="_blank"
                        rel="noreferrer"
                        className="material-btn"
                      >
                        Open Document
                      </a>

                      <a
                        href={getFileUrl(material.file)}
                        download
                        className="material-btn download"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </>
              )}

              {/* ================= ZIP / RAR ================= */}

              {getFileType(material.file) === "archive" && (
                <>
                  <div
                    style={{
                      marginTop: "20px",
                      padding: "25px",
                      borderRadius: "12px",
                      background: "#f4f4f4",
                      border: "1px solid #ddd",
                    }}
                  >
                    <h3>📦 Compressed File</h3>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "15px",
                        flexWrap: "wrap",
                      }}
                    >
                      <a
                        href={getFileUrl(material.file)}
                        download
                        className="material-btn"
                      >
                        Download Archive
                      </a>
                    </div>
                  </div>
                </>
              )}

              {/* ================= Other Files ================= */}

              {getFileType(material.file) === "other" && (
                <>
                  <div
                    style={{
                      marginTop: "20px",
                      padding: "25px",
                      borderRadius: "12px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <h3>📁 File Attachment</h3>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "15px",
                        flexWrap: "wrap",
                      }}
                    >
                      <a
                        href={getFileUrl(material.file)}
                        target="_blank"
                        rel="noreferrer"
                        className="material-btn"
                      >
                        Open File
                      </a>

                      <a
                        href={getFileUrl(material.file)}
                        download
                        className="material-btn download"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default MaterialsTab;