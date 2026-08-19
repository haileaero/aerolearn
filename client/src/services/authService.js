const USER_KEY = "user";
const TOKEN_KEY = "token";

// ===============================
// Get Current User
// ===============================
export function getCurrentUser() {
  const user = localStorage.getItem(USER_KEY);

  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

// ===============================
// Get JWT Token
// ===============================
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// ===============================
// Save User
// ===============================
export function saveUser(user) {
  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );

  if (user.token) {
    localStorage.setItem(
      TOKEN_KEY,
      user.token
    );
  }
}

// ===============================
// Logout
// ===============================
export function logout() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}