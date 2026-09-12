import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { isStudent, normalizeRole } from "../utils/roles";

function ProtectedRoute({
  children,
  roles = [],
}) {
  const { user, loading } = useContext(AuthContext);

  // Wait for authentication to initialize
  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "22px",
          fontWeight: "bold",
        }}
      >
        Loading...
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // User does not have permission for this route
  if (
    roles.length > 0 &&
    !roles.map(normalizeRole).includes(normalizeRole(user.role))
  ) {
    if (isStudent(user)) {
      return (
        <Navigate
          to="/my-courses"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;