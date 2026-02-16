import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import { SessionExpiredPage } from "./pages/SessionExpiredPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";

export const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route path="/session-expired" element={<SessionExpiredPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
