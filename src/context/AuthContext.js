import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthController from '../controllers/AuthController';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const saved = await AuthController.getCurrentUser();
      setUser(saved);
      setLoading(false);
    })();
  }, []);

  const login = async (username, password) => {
    const loggedIn = await AuthController.login(username, password);
    setUser(loggedIn);
    return loggedIn;
  };

  const logout = async () => {
    setUser(null);
    try {
      await AuthController.logout();
    } catch (err) {
      console.warn('Gagal menghapus sesi tersimpan:', err.message);
    }
  };

  const activateSubscription = async () => {
    const updated = await AuthController.activateSubscription(user.id);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, activateSubscription }}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  return ctx;
}
