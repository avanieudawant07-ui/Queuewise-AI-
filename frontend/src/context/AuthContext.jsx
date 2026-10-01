import React, { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "../api/client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("queuewise_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await apiClient.get("/auth/me");
        setUser(data.user);
      } catch (err) {
        localStorage.removeItem("queuewise_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (phone) => {
    const { data } = await apiClient.post("/auth/login", { phone, identifier: phone });
    localStorage.setItem("queuewise_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const createAccount = async ({ name, phone, role, specialty }) => {
    const { data } = await apiClient.post("/auth/register", { name, phone, role, specialty });
    localStorage.setItem("queuewise_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("queuewise_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, createAccount, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
