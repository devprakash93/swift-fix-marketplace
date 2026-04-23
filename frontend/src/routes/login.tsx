import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Wrench, User, Loader2, ArrowRight } from "lucide-react";
import { useApp, type Role } from "@/context/AppContext";
import { AuthService } from "@/services/api";
import { connectSocket } from "@/services/socket";
import { DemoLoginBanner } from "@/components/DemoLoginBanner";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Log in — FlowFix" }] }),
});

function LoginPage() {
  const { setUser, setPlumberOnline } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await AuthService.login({ email, password });
      localStorage.setItem("token", data.token);
      setUser({ 
        id: data._id, 
        name: data.name, 
        email: data.email, 
        role: data.role,
        walletBalance: data.walletBalance,
        avatar: data.avatar 
      });
      setPlumberOnline(data.isOnline || false);
      connectSocket(data._id);
      
      toast.success(`Welcome back, ${data.name}!`);
      
      // Artificial delay for smooth animation transition
      setTimeout(() => {
        navigate({ to: data.role === "plumber" ? "/plumber" : data.role === "admin" ? "/admin" : "/customer" });
      }, 500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed. Please check your credentials.");
      const form = document.getElementById("login-form");
      if (form) {
        form.classList.add("animate-[shake_0.5s_ease-in-out]");
        setTimeout(() => form.classList.remove("animate-[shake_0.5s_ease-in-out]"), 500);
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (e: string, p: string, r: string) => {
    setEmail(e);
    setPassword(p);
    setRole(r as Role);
    toast.info(`${r.toUpperCase()} credentials loaded.`);
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex flex-1 flex-col justify-between bg-card border-r border-border p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)] opacity-5" />
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-16">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <Wrench className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight">FlowFix</span>
          </Link>
          <h1 className="text-5xl font-black leading-tight mb-6">Welcome back to the future of home services.</h1>
          <p className="text-xl text-muted-foreground">Log in to manage your bookings, track your professionals, or accept new jobs.</p>
        </div>
        
        <div className="relative z-10 p-8 rounded-3xl border border-border glass-dark">
          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />)}
          </div>
          <p className="text-lg font-medium italic mb-4">"FlowFix completely changed how I handle emergencies. The plumber was here in 12 minutes."</p>
          <p className="font-bold">— Sarah J., Verified Customer</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md animate-slide-up-fade">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black">Sign In</h2>
            <p className="text-muted-foreground mt-2">Enter your details to access your account.</p>
          </div>

          <DemoLoginBanner onSelect={fillDemo} />

          <form id="login-form" onSubmit={submit} className="space-y-5">
            <RoleSwitcher role={role} setRole={setRole} />
            
            <Field label="Email Address">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field py-4"
              />
            </Field>
            
            <Field label="Password">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field py-4"
              />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative flex items-center justify-center gap-2 rounded-2xl bg-foreground py-4 text-sm font-black text-background transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 overflow-hidden shadow-xl"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex items-center gap-2">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
              </span>
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-bold text-foreground hover:underline">
              Create one now
            </Link>
          </p>
        </div>
      </div>
      
      {/* Custom keyframe for form shake */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function RoleSwitcher({ role, setRole }: { role: Role; setRole: (r: Role) => void }) {
  const opts: { value: Role; label: string; icon: typeof User }[] = [
    { value: "customer", label: "Customer", icon: User },
    { value: "plumber", label: "Professional", icon: Wrench },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-1">
      {opts.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setRole(value)}
          className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
            role === value ? "bg-card text-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon className="h-4 w-4" /> {label}
        </button>
      ))}
    </div>
  );
}

// Add Star icon for the testimonial
function Star(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
