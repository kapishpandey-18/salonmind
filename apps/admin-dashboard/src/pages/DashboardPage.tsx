import { useAdminProfile } from "../modules/auth/useAdminProfile";
import { useAuth } from "../modules/auth/AuthProvider";

export const DashboardPage = () => {
  const { data: profile } = useAdminProfile();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between bg-white px-8 py-4 shadow">
        <div>
          <p className="text-sm text-slate-500">Logged in as</p>
          <h1 className="text-xl font-semibold text-slate-900">
            {profile?.firstName ?? "Admin"}
          </h1>
        </div>
        <button
          onClick={logout}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Logout
        </button>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl bg-white p-8 shadow">
          <h2 className="text-lg font-semibold text-slate-900">Welcome, administrator 🎉</h2>
          <p className="mt-2 text-slate-600">
            Your OTP-only flow is active. This dashboard is a placeholder where you can
            add moderation tools, feature toggles, or analytics once the platform scope
            is defined.
          </p>
        </div>
      </main>
    </div>
  );
};
