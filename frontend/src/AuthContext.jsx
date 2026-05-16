import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN } from "./constants";
const API_URL = import.meta.env.VITE_API_URL;
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem(ACCESS_TOKEN));
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(localStorage.getItem("role"));
  const [userCompany , setUserCompany] = useState(localStorage.getItem("company"));

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
        setUserCompany(decoded.company)
        localStorage.setItem("role", decoded.role);
        localStorage.setItem("company", decoded.company);

      } catch (e) {
        console.error("Invalid token", e);
        logout();
      }
    }
  }, [token]);

  const login = (accessToken, userData) => {
    localStorage.setItem(ACCESS_TOKEN, accessToken);
    setToken(accessToken);
    setUser(userData);

    try {
      const decoded = jwtDecode(accessToken);
      setUserRole(decoded.role);
      setUserCompany(decoded.company)
      localStorage.setItem("role", decoded.role);
      localStorage.setItem("company", decoded.company);

    } catch (e) {
      console.error("Failed to decode token", e);
    }
  };

  const logout = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      console.warn("No token found, skipping logout request.");
    } else {
      try {
        await axios.post(
          `${API_URL}/api/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }

    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem("role");
    localStorage.removeItem("company");
    setToken(null);
    setUser(null);
    setUserRole(null);
    setUserCompany(null);
  };


  return (
    <AuthContext.Provider value={{ token, user, login, logout, userRole , userCompany }}>
      {children}
    </AuthContext.Provider>
  );
};
