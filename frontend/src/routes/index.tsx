import { createFileRoute, Link } from "@tanstack/react-router";
import { Wrench, Clock, ShieldCheck, Star, ArrowRight, Droplets, Zap, Sparkles, Scissors, Bath } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: Landing,
});

const FEATURED_CATS = [
  { icon: Droplets, label: "Plumbing", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: Zap, label: "Electrical", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { icon: Bath, label: "Cleaning", color: "text-green-500", bg: "bg-green-500/10" },
  { icon: Scissors, label: "Beauty", color: "text-pink-500", bg: "bg-pink-500/10" },
];

function AnimatedCounter({ end, suffix = "", prefix = "" }: { end: number, suffix?: string, prefix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [end]);

  return <>{prefix}{count}{suffix}</>;
}

function Landing() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10 bg-background">
          <div className="absolute top-[20%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-primary/20 blur-[100px] animate-float opacity-50" />
          <div className="absolute bottom-[20%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-accent/20 blur-[80px] animate-float opacity-50" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-5xl mx-auto animate-slide-up-fade">
            <div className="inline-flex items-center gap-2 rounded-full border border-border glass px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary mb-8 animate-pulse-glow">
              <Sparkles className="h-4 w-4" /> Version 2.0 Now Live
            </div>
            
            <h1 className="text-6xl font-black leading-[1.1] tracking-tight md:text-8xl">
              Professional services,<br />
              <span className="bg-[image:var(--gradient-hero)] bg-clip-text text-transparent">
                delivered in minutes.
              </span>
            </h1>
            
            <p className="mx-auto mt-8 max-w-2xl text-xl text-muted-foreground leading-relaxed">
              From burst pipes to beauty treatments, FlowFix connects you to verified experts instantly. AI-powered pricing, real-time tracking, zero hassle.
            </p>
            
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Link
                to="/customer"
                className="group relative inline-flex items-center gap-2 rounded-2xl bg-primary px-10 py-5 text-lg font-black text-primary-foreground transition-all hover:scale-105 active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex items-center gap-2">Book a service <ArrowRight className="h-5 w-5" /></span>
              </Link>
              <Link
                to="/plumber"
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-border glass px-10 py-5 text-lg font-black transition hover:bg-secondary hover:border-foreground/20"
              >
                <Wrench className="h-5 w-5" /> Register as Pro
              </Link>
            </div>
          </div>

          {/* Category Quick Access */}
          <div className="mt-32 grid grid-cols-2 gap-6 md:grid-cols-4 max-w-6xl mx-auto animate-slide-up-fade" style={{ animationDelay: '0.2s' }}>
            {FEATURED_CATS.map((cat, i) => (
              <div key={cat.label} className="group relative flex flex-col items-center gap-4 rounded-[2.5rem] border border-border glass p-10 transition-all duration-300 hover:scale-105 hover:border-primary/50 shadow-[var(--shadow-card)] overflow-hidden">
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${cat.bg.replace('/10', '')}`} />
                <div className={`relative flex h-24 w-24 items-center justify-center rounded-[2rem] ${cat.bg} ${cat.color} transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110`}>
                  <cat.icon className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-bold relative z-10">{cat.label}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="border-y border-border bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid gap-10 md:grid-cols-4 text-center divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="py-4"><p className="text-6xl font-black text-primary"><AnimatedCounter end={50} suffix="k+" /></p><p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-4">Services Done</p></div>
            <div className="py-4"><p className="text-6xl font-black text-primary"><AnimatedCounter end={4.9} /></p><p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-4">Average Rating</p></div>
            <div className="py-4"><p className="text-6xl font-black text-primary"><AnimatedCounter end={15} suffix="m" /></p><p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-4">Response Time</p></div>
            <div className="py-4"><p className="text-6xl font-black text-primary"><AnimatedCounter end={100} suffix="%" /></p><p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-4">Verified Pros</p></div>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="container mx-auto px-4 py-32">
        <div className="text-center mb-20">
          <span className="text-sm font-bold uppercase tracking-widest text-primary mb-2 block">The FlowFix Advantage</span>
          <h2 className="text-5xl font-black tracking-tight">Why choose our platform?</h2>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {[
            { icon: Clock, title: "Super-fast ETA", desc: "Our proximity-based matching ensures a pro reaches you in under 15 minutes. Watch them arrive on the live map." },
            { icon: ShieldCheck, title: "Premium Verification", desc: "Every professional goes through strict KYC, background checks, and skill assessments before joining." },
            { icon: Star, title: "Standard Pricing", desc: "No haggling. No surprises. Pay standard rates decided by our AI pricing engine based on market data." },
          ].map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="rounded-[2.5rem] border border-border bg-card p-12 shadow-[var(--shadow-card)] transition-transform duration-300 hover:-translate-y-2">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Icon className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black">{title}</h3>
              <p className="mt-4 text-muted-foreground leading-relaxed text-lg">{desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* CTA Banner */}
      <section className="container mx-auto px-4 pb-32">
        <div className="rounded-[3rem] bg-[image:var(--gradient-hero)] p-12 md:p-20 text-center text-primary-foreground shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black mb-6">Ready to fix it?</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto mb-10">Join thousands of satisfied customers who trust FlowFix for their home maintenance needs.</p>
            <Link to="/signup" className="inline-block rounded-2xl bg-background text-foreground px-12 py-5 text-xl font-black transition hover:scale-105 shadow-xl">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
