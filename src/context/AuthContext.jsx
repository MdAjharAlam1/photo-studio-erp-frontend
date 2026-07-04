import { createContext, useContext, useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = loading, false = anonymous
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
      } catch {
        setUser(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data);
    return data;
  };

  const register = async (payload) => {
    console.log(payload)
    const { data } = await api.post("/auth/register", payload);
    setUser(data);
    return data;
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, formatApiError }}>
      {children}
    </AuthContext.Provider>
  );
}
