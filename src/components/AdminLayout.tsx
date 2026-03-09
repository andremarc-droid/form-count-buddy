import logo from "@/assets/DTClogo.png";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { FileText, LayoutDashboard, LineChart, LogOut, Moon, Sun, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "./theme-provider";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "Visitors", icon: Users, path: "/admin/visitors" },
  { label: "Analytics", icon: LineChart, path: "/admin/analytics" },
  { label: "Reports", icon: FileText, path: "/admin/reports" },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/admin/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background overflow-hidden relative">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 h-full bg-slate-800 border-r border-slate-700 flex-col shadow-2xl z-10 transition-all duration-300">
        <div className="px-2 py-2 border-b border-sidebar-border">
          <div className="flex flex-col items-center justify-center w-full py-4">
            <div className="flex items-center justify-center mb-3">
              <img src={logo} alt="DTC Logo" className="w-52 h-auto object-contain brightness-[1.3] saturate-150 contrast-125" />
            </div>
            <div className="text-center">
              <h2 className="font-heading font-bold text-slate-100 text-xl tracking-tight">Foot Traffic</h2>
              <p className="text-[10px] text-slate-400 font-medium leading-tight uppercase tracking-wider">Monitoring System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-300",
                location.pathname === item.path
                  ? "bg-primary text-white shadow-md shadow-primary/30 translate-x-1"
                  : "text-slate-300 hover:bg-slate-700 hover:text-slate-50 hover:translate-x-1"
              )}
            >
              <item.icon className={cn("h-5 w-5", location.pathname === item.path ? "text-white" : "text-slate-300")} />
              {item.label}
              {location.pathname === item.path && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-md bg-white opacity-80" />
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700 space-y-2 bg-slate-800/50">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-slate-50 hover:bg-slate-700 rounded-xl transition-all"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 mr-3" />
            ) : (
              <Moon className="h-5 w-5 mr-3" />
            )}
            <span className="font-medium">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span className="font-medium">Sign Out</span>
          </Button>
        </div>
      </aside >

      {/* Main content */}
      < main className="flex-1 flex flex-col h-screen overflow-hidden" >
        {/* Mobile Header */}
        < header className="md:hidden flex items-center justify-between p-3 border-b" >
          <div className="flex items-center gap-1.5">
            <img src={logo} alt="DTC Logo" className="h-10 w-auto object-contain" />
            <div>
              <h2 className="font-heading font-bold text-[13px] leading-tight">Foot Traffic</h2>
              <p className="text-[9px] text-muted-foreground leading-tight">Monitoring System</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Sign out</span>
            </Button>
          </div>
        </header >

        <div className="flex-1 overflow-auto p-4 pb-20 md:p-8 md:pb-8">
          <Outlet />
        </div>

        {/* Mobile Bottom Tab Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-background border-t border-border p-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center w-full py-1 gap-1 text-[10px] font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </main >
    </div >
  );
};

export default AdminLayout;
