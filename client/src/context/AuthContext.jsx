import {
  createContext,
  useEffect,
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

    if (currentUser) {
      setUser(currentUser);
    }

    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    localStorage.setItem(
      "token",
      userData.token
    );

    setUser(userData);
  };

  const updateUser = (userData) => {
    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    if (userData.token) {
      localStorage.setItem(
        "token",
        userData.token
      );
    }

    setUser(userData);
  };

  const logout = () => {
    authLogout();

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        updateUser,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;