import { lazy, Suspense } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/sonner";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Lazy load main components for better performance
const LoginPage = lazy(() => import("./pages/LoginPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Onboarding = lazy(() => import("./pages/Onboarding"));

// Loading fallback component
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Main App Content Component
function AppContent() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    // After onboarding is complete, user.isOnboarded will be true
    // and they'll automatically be redirected to dashboard
    console.log("Onboarding completed");
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Routing logic:
  // 1. Not authenticated → Show Login
  // 2. Authenticated but not onboarded → Show Onboarding
  // 3. Authenticated and onboarded → Show Dashboard

  // LoginPage has its own full-screen styling, don't wrap it
  if (!isAuthenticated) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <LoginPage />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingSpinner />}>
        {!user?.isOnboarded ? (
          <Onboarding
            onComplete={handleOnboardingComplete}
            phoneNumber={user?.phoneNumber || ""}
          />
        ) : (
          <Dashboard onLogout={logout} />
        )}
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </ErrorBoundary>
  );
}
