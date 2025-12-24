import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  username: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple hash function for password comparison (not cryptographically secure, but adequate for prototype)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// Admin credentials (hashed for basic protection)
const ADMIN_USERNAME = 'Ziadh';
const ADMIN_PASSWORD_HASH = simpleHash('ziadfinance');

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('stockscout_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('stockscout_user');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Check admin credentials
    if (username === ADMIN_USERNAME && simpleHash(password) === ADMIN_PASSWORD_HASH) {
      const adminUser: User = { username: ADMIN_USERNAME, isAdmin: true };
      setUser(adminUser);
      localStorage.setItem('stockscout_user', JSON.stringify(adminUser));
      return true;
    }

    // Allow guest access with limited features
    if (username.trim().length >= 2) {
      const guestUser: User = { username: username.trim(), isAdmin: false };
      setUser(guestUser);
      localStorage.setItem('stockscout_user', JSON.stringify(guestUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stockscout_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin ?? false,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
