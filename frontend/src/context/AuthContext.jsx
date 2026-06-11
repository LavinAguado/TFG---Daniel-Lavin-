import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

/**
 * Decode the JWT payload without external dependencies.
 * Returns null on any error so the app never crashes.
 */
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    // atob works in all modern browsers; add padding if needed
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Hydrate user from localStorage on first render
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        // Check the token has not expired
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < now) {
          // Token expired — clean up
          localStorage.removeItem('token');
        } else {
          setUser(decoded);
        }
      }
    }
  }, []);

  /**
   * Call this after a successful login response.
   * Pass the token string; AuthContext will decode and store the user.
   */
  const login = (token) => {
    localStorage.setItem('token', token);
    const decoded = decodeToken(token);
    setUser(decoded);
  };

  /**
   * Call this to log the user out from any component.
   */
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Convenience hook — use instead of useContext(AuthContext).
 * Throws a descriptive error if used outside AuthProvider.
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
};
