import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaHome, FaPlane } from "react-icons/fa";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-pro">
      <div className="notfound-pro-card">
        <div className="notfound-plane"><FaPlane /></div>
        <span className="notfound-code">404</span>
        <h1>This route is not in the flight plan.</h1>
        <p>The page may have moved, the link may be outdated, or the address may be incorrect.</p>
        <div className="notfound-actions">
          <button onClick={() => navigate(-1)}><FaArrowLeft /> Go back</button>
          <button className="primary" onClick={() => navigate("/dashboard")}><FaHome /> Dashboard</button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
