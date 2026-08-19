import { FaSearch } from "react-icons/fa";

function StudentSearch({
  value,
  onChange,
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        marginBottom: "20px",
      }}
    >
      <FaSearch
        style={{
          position: "absolute",
          left: "15px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "#6b7280",
          fontSize: "15px",
        }}
      />

      <input
        type="text"
        placeholder="Search by student ID, name, email or department..."
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        style={{
          width: "100%",
          padding: "14px 18px 14px 45px",
          borderRadius: "12px",
          border: "1px solid #d1d5db",
          outline: "none",
          fontSize: "15px",
          transition: "0.3s",
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          e.target.style.borderColor =
            "#2563eb";
          e.target.style.boxShadow =
            "0 0 0 3px rgba(37,99,235,.15)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor =
            "#d1d5db";
          e.target.style.boxShadow =
            "none";
        }}
      />
    </div>
  );
}

export default StudentSearch;