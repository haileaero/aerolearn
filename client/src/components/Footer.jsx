function Footer() {
  return (
    <footer
      className="footer"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "18px 35px",
        background: "#fff",
        borderTop: "1px solid #e5e7eb",
      }}
    >
      <div>
        © {new Date().getFullYear()} AeroLearn LMS
      </div>

      <div
        style={{
          display: "flex",
          gap: "25px",
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        <span>Version 1.0</span>

        <span>Developed by AeroLearn Team</span>
      </div>
    </footer>
  );
}

export default Footer;