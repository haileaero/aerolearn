export const normalizeRole = (role) => String(role || "").trim().toLowerCase();

const roleOf = (userOrRole) => normalizeRole(
  typeof userOrRole === "string" ? userOrRole : userOrRole?.role
);

export const isAdmin = (userOrRole) => roleOf(userOrRole) === "admin";
export const isInstructor = (userOrRole) => roleOf(userOrRole) === "instructor";
export const isStudent = (userOrRole) => roleOf(userOrRole) === "student";
export const canManageAcademic = (userOrRole) => isAdmin(userOrRole) || isInstructor(userOrRole);
