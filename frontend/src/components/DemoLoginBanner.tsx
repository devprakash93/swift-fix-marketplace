import { Users, Wrench, ShieldCheck, Sparkles } from "lucide-react";

interface DemoLoginBannerProps {
  onSelect: (email: string, pass: string, role: string) => void;
}

export function DemoLoginBanner({ onSelect }: DemoLoginBannerProps) {
  const accounts = [
    { label: "Customer", email: "emma@mail.com", pass: "customer123", role: "customer", icon: Users, color: "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:border-blue-500/50" },
    { label: "Plumber", email: "mike@flowfix.io", pass: "plumber123", role: "plumber", icon: Wrench, color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:border-yellow-500/50" },
    { label: "Admin", email: "admin@flowfix.io", pass: "admin123", role: "admin", icon: ShieldCheck, color: "bg-primary/10 text-primary border-primary/20 hover:border-primary/50" }
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] mb-8 animate-slide-up-fade">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-sm uppercase tracking-widest">Demo Credentials</h3>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {accounts.map(acc => (
          <button
            key={acc.role}
            type="button"
            onClick={() => onSelect(acc.email, acc.pass, acc.role)}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all hover:scale-105 active:scale-95 ${acc.color}`}
          >
            <acc.icon className="h-5 w-5 mb-2" />
            <span className="text-[10px] font-black uppercase">{acc.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
