import { useState, lazy, Suspense } from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  DollarSign,
  LogOut,
  Menu,
  X,
  Package,
  ShoppingBag,
  Settings,
  HelpCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import SalonMindLogo from "./SalonMindLogo";

// Lazy load all view components for better performance
const Overview = lazy(() => import("./Overview"));
const Appointments = lazy(() => import("./Appointments"));
const Clients = lazy(() => import("./Clients"));
const Staff = lazy(() => import("./Staff"));
const Services = lazy(() => import("./Services"));
const Revenue = lazy(() => import("./Revenue"));
const Inventory = lazy(() => import("./Inventory"));
const Products = lazy(() => import("./Products"));
const ProfileSettings = lazy(() => import("./ProfileSettings"));
const Help = lazy(() => import("./Help"));

// Loading component for view transitions
function ViewLoader() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground">Loading view...</p>
      </div>
    </div>
  );
}

interface DashboardProps {
  onLogout: () => void;
}

type View =
  | "overview"
  | "appointments"
  | "clients"
  | "staff"
  | "services"
  | "revenue"
  | "inventory"
  | "products"
  | "settings"
  | "help";

export default function Dashboard({ onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState<View>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: "overview" as View, label: "Overview", icon: LayoutDashboard },
    { id: "appointments" as View, label: "Appointments", icon: Calendar },
    { id: "clients" as View, label: "Clients", icon: Users },
    { id: "staff" as View, label: "Staff", icon: Users },
    { id: "services" as View, label: "Services", icon: Scissors },
    { id: "products" as View, label: "Products", icon: ShoppingBag },
    { id: "inventory" as View, label: "Inventory", icon: Package },
    { id: "revenue" as View, label: "Revenue", icon: DollarSign },
    { id: "settings" as View, label: "Settings", icon: Settings },
    { id: "help" as View, label: "Help", icon: HelpCircle },
  ];

  const renderView = () => {
    switch (currentView) {
      case "overview":
        return <Overview />;
      case "appointments":
        return <Appointments />;
      case "clients":
        return <Clients />;
      case "staff":
        return <Staff />;
      case "services":
        return <Services />;
      case "products":
        return <Products />;
      case "inventory":
        return <Inventory />;
      case "revenue":
        return <Revenue />;
      case "settings":
        return <ProfileSettings />;
      case "help":
        return <Help />;
      default:
        return <Overview />;
    }
  };

  return (
    <div
      className="flex h-screen"
      style={{
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #0c4a6e 50%, #1e3a5f 75%, #0f172a 100%)",
      }}
    >
      {/* Sidebar - Desktop */}
      <aside
        className="hidden lg:flex lg:flex-col lg:w-64 border-r border-blue-400/30 backdrop-blur-lg"
        style={{
          background:
            "linear-gradient(180deg, #0f172a 0%, #1e3a8a 35%, #0c4a6e 50%, #1e3a8a 65%, #0f172a 100%)",
        }}
      >
        <div className="flex items-center gap-3 p-6 border-b border-blue-400/30">
          <SalonMindLogo size={44} />
          <div>
            <h1 className="text-blue-100">SalonMind</h1>
            <p className="text-xs text-blue-300/80">AI-Powered</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === item.id
                    ? "bg-blue-500/30 text-blue-100 border border-blue-400/40 shadow-lg shadow-blue-500/20"
                    : "text-blue-200/70 hover:bg-blue-500/20 hover:text-blue-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-blue-400/30">
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full justify-start gap-3 border-blue-400/30 text-blue-200/70 hover:text-blue-100 hover:bg-blue-500/20"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 border-r border-blue-400/30 flex flex-col backdrop-blur-lg"
            style={{
              background:
                "linear-gradient(180deg, #0f172a 0%, #1e3a8a 35%, #0c4a6e 50%, #1e3a8a 65%, #0f172a 100%)",
            }}
          >
            <div className="flex items-center justify-between p-6 border-b border-blue-400/30">
              <div className="flex items-center gap-3">
                <SalonMindLogo size={44} />
                <div>
                  <h1 className="text-blue-100">SalonMind</h1>
                  <p className="text-xs text-blue-300/80">AI-Powered</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="text-blue-100 hover:bg-blue-500/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      currentView === item.id
                        ? "bg-blue-500/30 text-blue-100 border border-blue-400/40 shadow-lg shadow-blue-500/20"
                        : "text-blue-200/70 hover:bg-blue-500/20 hover:text-blue-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-blue-400/30">
              <Button
                onClick={onLogout}
                variant="outline"
                className="w-full justify-start gap-3 border-blue-400/30 text-blue-200/70 hover:text-blue-100 hover:bg-blue-500/20"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main
        className="flex-1 overflow-auto"
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #0c4a6e 50%, #1e3a5f 75%, #0f172a 100%)",
        }}
      >
        <header
          className="border-b border-blue-400/30 px-6 py-4 lg:hidden backdrop-blur-md"
          style={{
            background:
              "linear-gradient(90deg, #0f172a 0%, #1e3a8a 50%, #0c4a6e 100%)",
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-blue-100"
          >
            <Menu className="w-6 h-6" />
          </Button>
        </header>
        <div className="p-6 lg:p-8">
          <Suspense fallback={<ViewLoader />}>{renderView()}</Suspense>
        </div>
      </main>
    </div>
  );
}
