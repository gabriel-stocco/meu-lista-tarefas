import React, { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { AuthContextType } from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuthContext deve ser usado dentro de um <AuthProvider>. " +
        "Verifique se o componente está envolvido pelo AuthProvider no _layout.tsx.",
    );
  }

  return context;
}

export default AuthProvider;
