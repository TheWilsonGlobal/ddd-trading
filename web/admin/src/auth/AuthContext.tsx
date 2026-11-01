import React, { createContext, useContext, useState } from 'react';
import { AdminRole, AdminUser } from '../types';

interface AuthContextType {
  user: AdminUser;
  setRole: (role: AdminRole) => void;
  isAuthenticated: boolean;
}

const DEFAULT_USER: AdminUser = {
  id: 'usr_admin_001',
  email: 'risk-desk@institution.internal',
  name: 'Chief Risk Officer',
  role: 'SUPER_ADMIN',
};

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_USER,
  setRole: () => {},
  isAuthenticated: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser>(DEFAULT_USER);

  const setRole = (role: AdminRole) => {
    setUser((prev) => ({
      ...prev,
      role,
      name:
        role === 'SUPER_ADMIN'
          ? 'Chief Technology Officer'
          : role === 'RISK_OFFICER'
          ? 'Risk Operations Lead'
          : role === 'OPERATOR'
          ? 'Market Operations Desk'
          : 'Compliance Auditor (Read-Only)',
    }));
  };

  return (
    <AuthContext.Provider value={{ user, setRole, isAuthenticated: true }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
