import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Wrench, User, Loader2, ArrowRight } from "lucide-react";
import { useApp, type Role } from "@/context/AppContext";
import { AuthService } from "@/services/api";
import { connectSocket } from "@/services/socket";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({ meta: [{ title: "Sign up — FlowFix" }] }),
});

function SignupPage() {
  const { setUser } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await AuthService.signup({ name, email, password, role });
      localStorage.setItem("token", data.token);
      setUser({ 
        id: data._id, 
        name: data.name, 
        email: data.email, 
        role: data.role,
        walletBalance: data.walletBalance || 0,
        avatar: data.avatar || "" 
      });
      connectSocket(data._id);
      
      toast.success(`Account created successfully! Welcome, ${data.name}!`);
      
      setTimeout(() => {
        navigate({ to: data.role === "plumber" ? "/plumber" : data.role === "admin" ? "/admin" : "/customer" });
      }, 500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Signup failed. Please try again.");
      const form = document.getElementById("signup-form");
      if (form) {
        form.classList.add("animate-[shake_0.5s_ease-in-out]");
        setTimeout(() => form.classList.remove("animate-[shake_0.5s_ease-in-out]"), 500);
      }
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-5xl font-black leading-tight mb-6">Join the fastest growing service platform.</h1>
          <p className="text-xl text-muted-foreground">Whether you need a quick fix or want to grow your service business, we've got you covered.</p>
        </div>
        
        <div className="relative z-10 grid grid-cols-2 gap-4">
           <div className="p-6 rounded-3xl border border-border glass-dark">
             <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
               <User className="h-6 w-6" />
             </div>
             <h3 className="font-black text-lg mb-2">For Customers</h3>
             <p className="text-sm text-muted-foreground">Instant matching with verified professionals. Transparent pricing guaranteed.</p>
           </div>
           <div className="p-6 rounded-3xl border border-border glass-dark">
             <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-accent">
               <Wrench className="h-6 w-6" />
             </div>
             <h3 className="font-black text-lg mb-2">For Experts</h3>
             <p className="text-sm text-muted-foreground">Get high-quality leads in your area. Set your own hours and get paid fast.</p>
           </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md animate-slide-up-fade">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black">Create Account</h2>
            <p className="text-muted-foreground mt-2">Enter your details to get started.</p>
          </div>

          <form id="signup-form" onSubmit={submit} className="space-y-5">
            <RoleSwitcher role={role} setRole={setRole} />
            
            <Field label="Full Name">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="input-field py-4"
              />
            </Field>

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
                placeholder="At least 8 characters"
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
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Sign Up <ArrowRight className="h-4 w-4" /></>}
              </span>
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-foreground hover:underline">
              Log in here
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
