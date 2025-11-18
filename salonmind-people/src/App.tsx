import { lazy, Suspense } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/sonner";

// Lazy load main components for better performance
const Login = lazy(() => import("./components/Login"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const Onboarding = lazy(() => import("./components/Onboarding"));

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
  const { isAuthenticated, isLoading, user } = useAuth();

  // Handle new user signup (OTP verification completed)
  const handleSignUp = (phoneNumber: string) => {
    // After OTP verification, user will be authenticated but not onboarded
    // The routing logic below will automatically redirect to onboarding
    console.log("Sign up completed for:", phoneNumber);
  };

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
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingSpinner />}>
        {!isAuthenticated ? (
          <Login onLogin={() => {}} onSignUp={handleSignUp} />
        ) : !user?.isOnboarded ? (
          <Onboarding
            onComplete={handleOnboardingComplete}
            phoneNumber={user?.phoneNumber || ""}
          />
        ) : (
          <Dashboard onLogout={() => {}} />
        )}
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}
