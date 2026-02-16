import { useAuth } from "../modules/auth/AuthProvider";

export const HomePage = () => {
  const { user, tokenClaims, logout } = useAuth();

  const role = user?.role ?? tokenClaims?.surface ?? "SALON_EMPLOYEE";
  const salonId = user?.salon ?? (tokenClaims?.salon as string | undefined) ?? "Pending";
  const sessionId = tokenClaims?.sessionId ?? "";
  const userId = user?.id ?? tokenClaims?.sub ?? "";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between bg-white px-6 py-4 shadow">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Logged in as</p>
          <h1 className="text-lg font-semibold text-slate-900">{role}</h1>
        </div>
        <button
          onClick={logout}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Logout
        </button>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-slate-900">Welcome back 👋</h2>
          <p className="mt-2 text-slate-600">
            Your OTP-only session is live. Use this screen as the launch pad for shift reminders,
            assignment queues, or quick links to daily tasks.
          </p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <dt className="text-xs uppercase tracking-wide text-slate-400">User ID</dt>
              <dd className="text-base font-semibold text-slate-900">{userId || "Unavailable"}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <dt className="text-xs uppercase tracking-wide text-slate-400">Session ID</dt>
              <dd className="text-base font-semibold text-slate-900">{sessionId || "Pending"}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <dt className="text-xs uppercase tracking-wide text-slate-400">Assigned Salon</dt>
              <dd className="text-base font-semibold text-slate-900">{salonId || "To be assigned"}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <dt className="text-xs uppercase tracking-wide text-slate-400">Phone</dt>
              <dd className="text-base font-semibold text-slate-900">
                {user?.phoneNumber || "Provided after onboarding"}
              </dd>
            </div>
          </dl>
        </div>
      </main>
    </div>
  );
};
