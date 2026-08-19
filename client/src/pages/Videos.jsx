import { useState } from "react";
import Layout from "../components/Layout";

function Videos() {
  const [videos, setVideos] = useState([
    {
      id: 1,
      title: "Introduction to React",
      url: "https://www.youtube.com/embed/bMknfKXIFA8",
    },
    {
      id: 2,
      title: "JavaScript Crash Course",
      url: "https://www.youtube.com/embed/hdI2bqOjy3c",
    },
    {
      id: 3,
      title: "MongoDB Tutorial",
      url: "https://www.youtube.com/embed/ofme2o29ngU",
    },
  ]);

  return (
    <Layout>
      <h1 className="page-title">Learning Videos</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(350px,1fr))",
          gap: "25px",
          marginTop: "30px",
        }}
      >
        {videos.map((video) => (
          <div
            key={video.id}
            style={{
              background: "#fff",
              borderRadius: "10px",
              padding: "15px",
              boxShadow: "0 2px 8px rgba(0,0,0,.1)",
            }}
          >
            <h3>{video.title}</h3>

            <iframe
              width="100%"
              height="220"
              src={video.url}
              title={video.title}
              allowFullScreen
            />
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Videos;