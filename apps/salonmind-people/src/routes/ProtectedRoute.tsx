import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../modules/auth/AuthProvider";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading, sessionExpired } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading workspace...</p>
      </div>
    );
  }

  if (sessionExpired) {
    return <Navigate to="/session-expired" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
