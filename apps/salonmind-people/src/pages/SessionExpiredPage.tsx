import { useNavigate } from "react-router-dom";
import { useAuth } from "../modules/auth/AuthProvider";

export const SessionExpiredPage = () => {
  const navigate = useNavigate();
  const { acknowledgeSessionExpiry } = useAuth();

  const handleReturn = () => {
    acknowledgeSessionExpiry();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="max-w-sm rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold text-slate-900">Session expired</h1>
        <p className="mt-2 text-sm text-slate-600">
          For security reasons you have been signed out. Request a fresh OTP to continue.
        </p>
        <button
          onClick={handleReturn}
          className="mt-6 w-full rounded-lg bg-employee-600 px-4 py-2 font-semibold text-white"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};
