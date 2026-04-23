import { Link, useNavigate } from "@tanstack/react-router";
import { Wrench, LogOut, Sun, Moon, Bell, Settings } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function Navbar() {
  const { user, setUser } = useApp();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [notifications, setNotifications] = useState(2); // Demo notifications

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.theme = next ? "dark" : "light";
  };

  const dashboardPath =
    user?.role === "plumber"
      ? "/plumber"
      : user?.role === "admin"
        ? "/admin"
        : "/customer";

  return (
    <header className="sticky top-0 z-50 w-full glass border-b">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[image:var(--gradient-hero)] text-primary-foreground shadow-[var(--shadow-soft)] transition-transform group-hover:scale-105">
            <Wrench className="h-6 w-6 relative z-10" />
            <div className="absolute inset-0 rounded-2xl bg-[image:var(--gradient-hero)] blur-lg opacity-40 group-hover:opacity-70 transition-opacity" />
          </div>
          <div>
            <span className="block text-2xl font-black tracking-tight leading-none">FlowFix</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Premium Services</span>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/50 text-muted-foreground transition hover:text-foreground hover:bg-secondary"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {user ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => { setNotifications(0); toast("You're all caught up!", { description: "No new notifications at the moment." }); }}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/50 text-muted-foreground transition hover:text-foreground hover:bg-secondary"
              >
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute right-2 top-2 flex h-2.5 w-2.5 rounded-full bg-destructive shadow-[0_0_8px_rgba(var(--color-destructive),0.8)] animate-pulse" />
                )}
              </button>

              <Link
                to={dashboardPath}
                className="hidden items-center gap-3 rounded-full border border-border bg-card/50 py-1.5 pl-2 pr-4 transition hover:bg-secondary sm:flex"
              >
                <img 
                  src={(user as any).avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                  className="h-8 w-8 rounded-full bg-primary/20"
                  alt="Avatar"
                />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold leading-none">{user.name}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1.5 py-0.5 rounded bg-secondary">
                      {user.role}
                    </span>
                    <span className="text-[10px] font-black text-primary">₹{user.walletBalance || 0}</span>
                  </div>
                </div>
              </Link>
              <Link
                to="/settings"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/50 text-muted-foreground transition hover:text-foreground hover:bg-secondary"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Link>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-destructive/10 text-destructive transition hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => {
                  localStorage.removeItem("token");
                  setUser(null);
                  navigate({ to: "/" });
                }}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="hidden rounded-xl px-5 py-2.5 text-sm font-bold transition hover:bg-secondary sm:block"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-xl bg-foreground px-5 py-2.5 text-sm font-bold text-background transition hover:scale-105 active:scale-95 shadow-xl"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
