import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentUser,
  logout as authLogout,
} from "../services/authService";

export const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) setUser(currentUser);
    setLoading(false);
  }, []);

  const login = useCallback((userData) => {
    if (!userData) return;
    localStorage.setItem("user", JSON.stringify(userData));
    if (userData.token) localStorage.setItem("token", userData.token);
    setUser(userData);
  }, []);

  const updateUser = useCallback((userData) => {
    if (!userData) return;

    // Profile/update endpoints do not always return a token. Preserve the
    // existing production token instead of replacing the authenticated user
    // with a response wrapper or accidentally logging the user out.
    setUser((current) => {
      const normalized = userData.user || userData;
      const merged = {
        ...(current || {}),
        ...normalized,
      };

      const token = normalized.token || current?.token || localStorage.getItem("token") || "";
      if (token) merged.token = token;

      localStorage.setItem("user", JSON.stringify(merged));
      if (token) localStorage.setItem("token", token);
      return merged;
    });
  }, []);

  const logout = useCallback(() => {
    authLogout();
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, login, updateUser, logout, loading }),
    [user, login, updateUser, logout, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
