import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import React from "react";
import { 
  Wifi, WifiOff, MapPin, CheckCircle2, Hammer, Flag, X, 
  DollarSign, MessageSquare, TrendingUp, Users, Calendar, Star, ShieldCheck, ArrowRight, Sparkles
} from "lucide-react";
import { useApp, type Booking } from "@/context/AppContext";
import { LiveMap } from "@/components/LiveMap";
import { StatusBadge } from "@/components/StatusBadge";
import { socket } from "@/services/socket";
import { BookingService, PlumberService } from "@/services/api";
import { Chat } from "@/components/Chat";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { RevenueChart } from "@/components/RevenueChart";
import { toast } from "sonner";

export const Route = createFileRoute("/plumber")({
  component: ProfessionalDashboard,
});

function ProfessionalDashboard() {
  const { user, plumberOnline, setPlumberOnline, bookings, setBookings } = useApp();
  const [incoming, setIncoming] = useState<any>(null);
  const [active, setActive] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [proCoords, setProCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const data = await BookingService.getCoupons();
        setCoupons(data);
      } catch (err) { console.error(err); }
    };
    fetchCoupons();
  }, []);

  useEffect(() => {
    let watchId: number;
    if (plumberOnline && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition((pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setProCoords(coords);
        // Emitting as [lon, lat] for MongoDB standards
        socket.emit("updateLocation", { proId: user.id, coordinates: [pos.coords.longitude, pos.coords.latitude] });
      }, (err) => console.error("Geolocation error:", err), { enableHighAccuracy: true });
    }
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); }
  }, [plumberOnline, user.id]);

  useEffect(() => {
    socket.on("newBookingRequest", (booking) => {
      if (plumberOnline && !active) {
        setIncoming(booking);
        toast.info(`New service request: ${booking.service?.name}`, { duration: 10000 });
      }
    });
    return () => { socket.off("newBookingRequest"); };
  }, [plumberOnline, active]);

  const handleToggleOnline = async () => {
    try {
      const data = await PlumberService.toggleOnline(!plumberOnline);
      setPlumberOnline(data.isOnline);
      if (data.isOnline) {
        toast.success("You are now online and ready to receive jobs!");
      } else {
        toast.info("You are now offline.");
      }
    } catch (err) { toast.error("Failed to update status"); }
  };

  const handleAccept = async () => {
    if (!incoming) return;
    setLoading(true);
    try {
      const updated = await BookingService.updateStatus(incoming._id, "assigned", "Accepted by Pro");
      setActive(updated);
      setIncoming(null);
      socket.emit("joinJob", updated._id);
      toast.success("Job accepted! Head to the location.");
    } catch (err) { toast.error("Failed to accept job"); } finally { setLoading(false); }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!active) return;
    try {
      const updated = await BookingService.updateStatus(active._id, status);
      toast.success(`Status updated to ${status.replace("_", " ")}`);
      
      if (status === "completed") {
        setActive(null);
        setBookings(prev => [updated, ...prev]);
      } else {
        setActive(updated);
      }
    } catch (err: any) { 
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update status"); 
    }
  };

  if (!user) return <div className="p-20 text-center animate-in fade-in">Please <Link to="/login" className="text-primary font-bold hover:underline">log in</Link>.</div>;

  const totalEarnings = bookings.reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);
  
  const chartData = React.useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map(day => ({ name: day, total: 0 }));
    
    bookings.forEach(b => {
      if (b.pricing?.totalAmount && b.status === "completed") {
         const d = new Date(b.createdAt);
         const now = new Date();
         const diffTime = Math.abs(now.getTime() - d.getTime());
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
         if (diffDays <= 7) {
            data[d.getDay()].total += b.pricing.totalAmount - (b.pricing.commission || 0);
         }
      }
    });

    const today = new Date().getDay();
    const orderedData = [];
    for (let i = 6; i >= 0; i--) {
      const dayIndex = (today - i + 7) % 7;
      orderedData.push(data[dayIndex]);
    }
    return orderedData;
  }, [bookings]);

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 animate-slide-up-fade">
        <div className="flex items-center gap-4">
          <img src={(user as any).avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} className="h-16 w-16 rounded-2xl bg-secondary object-cover shadow-[var(--shadow-card)]" />
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-primary" /> Verified Professional</p>
            <h1 className="text-4xl font-black tracking-tight mt-1">Hello, {user.name}</h1>
          </div>
        </div>
        <button 
          onClick={handleToggleOnline} 
          className={`relative group inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-sm font-black transition-all shadow-[var(--shadow-soft)] overflow-hidden ${plumberOnline ? "bg-success text-success-foreground" : "bg-card border-2 border-border text-muted-foreground"}`}
        >
          {plumberOnline && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />}
          <span className="relative z-10 flex items-center gap-3">
            {plumberOnline ? <Wifi className="h-5 w-5 animate-pulse" /> : <WifiOff className="h-5 w-5" />} 
            {plumberOnline ? "STATUS: ONLINE" : "STATUS: OFFLINE"}
          </span>
        </button>
      </div>

      <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-slide-up-fade" style={{ animationDelay: '0.1s' }}>
        <StatCard icon={DollarSign} label="Total Revenue" value={totalEarnings} prefix="₹" color="text-primary" bg="bg-primary/10" />
        <StatCard icon={CheckCircle2} label="Jobs Done" value={bookings.length} color="text-success" bg="bg-success/10" />
        <StatCard icon={TrendingUp} label="Growth" value={12} suffix="%" color="text-accent" bg="bg-accent/10" />
        <StatCard icon={Star} label="Rating" value={(user as any).rating || 4.9} color="text-yellow-500" bg="bg-yellow-500/10" />
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.5fr,1fr] animate-slide-up-fade" style={{ animationDelay: '0.2s' }}>
        <div className="space-y-8">
          {active ? (
            <div className="space-y-8">
              <ActivePanel booking={active} onUpdate={handleUpdateStatus} />
              <button 
                onClick={() => setShowChat(!showChat)}
                className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-border bg-card py-5 font-black text-sm shadow-[var(--shadow-soft)] hover:border-primary/40 transition-colors"
              >
                <MessageSquare className={`h-5 w-5 ${showChat ? "text-primary" : "text-muted-foreground"}`} /> 
                {showChat ? "Close Messenger" : "Open Messenger"}
              </button>
              {showChat && <div className="animate-in slide-in-from-top-4 duration-300"><Chat jobId={active._id} /></div>}
            </div>
          ) : incoming ? (
            <IncomingCard booking={incoming} loading={loading} onAccept={handleAccept} onReject={() => setIncoming(null)} />
          ) : (
            <div className="rounded-[3rem] border-2 border-dashed border-border bg-card p-24 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative mb-8">
                <div className={`absolute inset-0 rounded-3xl ${plumberOnline ? 'bg-primary/20 animate-ping' : ''}`} style={{ animationDuration: '3s' }} />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-secondary text-primary shadow-inner">
                  {plumberOnline ? <Wifi className="h-10 w-10" /> : <WifiOff className="h-10 w-10 text-muted-foreground" />}
                </div>
              </div>
              <h3 className="text-3xl font-black mb-3">{plumberOnline ? "Waiting for new leads..." : "Go online to receive jobs"}</h3>
              <p className="text-lg text-muted-foreground max-w-sm">Nearby service requests will appear here automatically based on your location.</p>
            </div>
          )}
        </div>

        <aside className="space-y-8">
          <div className="rounded-[3rem] overflow-hidden shadow-[var(--shadow-card)]">
            <LiveMap 
              mode="tracking" 
              proCoords={proCoords}
              customerCoords={active?.location?.coordinates ? [active.location.coordinates[1], active.location.coordinates[0]] : null}
              height="300px"
            />
          </div>
          
          <div className="rounded-[2.5rem] border border-border glass p-8 shadow-[var(--shadow-card)]">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Analytics</h3>
            <h4 className="text-xl font-black mb-6">Weekly Earnings</h4>
            <RevenueChart data={chartData} type="area" />
          </div>

          <div className="rounded-[2.5rem] border border-border glass p-8 shadow-[var(--shadow-card)]">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">Recent Earnings</h3>
            <ul className="space-y-6">
              {bookings.slice(0, 5).map((b) => (
                <li key={b._id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-secondary group-hover:bg-primary/10 transition-colors">
                      <Calendar className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{b.service?.name || "Service"}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">{new Date(b.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-primary text-lg">₹{b.pricing?.totalAmount || 0}</p>
                    {(b.pricing?.discount || 0) > 0 && <p className="text-[10px] text-success font-bold uppercase tracking-widest">-₹{b.pricing.discount} OFF</p>}
                  </div>
                </li>
              ))}
              {bookings.length === 0 && <p className="text-center text-sm text-muted-foreground py-10 border-2 border-dashed border-border rounded-3xl">No completed jobs yet.</p>}
            </ul>
          </div>

          {coupons.length > 0 && (
            <div className="rounded-[2.5rem] border border-primary/20 bg-primary/5 p-8 shadow-[var(--shadow-card)] animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2"><Sparkles className="w-3 h-3" /> Active Platform Promos</h3>
              <div className="space-y-4">
                {coupons.map((c: any) => (
                  <div key={c._id} className="p-4 rounded-2xl bg-card border border-border flex justify-between items-center">
                    <div>
                      <span className="text-xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded">{c.code}</span>
                      <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase">Min ₹{c.minOrderValue}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-primary">{c.discountPercent}% OFF</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

function StatCard({ icon: Icon, label, value, prefix = "", suffix = "", color, bg }: any) {
  return (
    <div className="rounded-[2.5rem] border border-border glass p-8 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1">
      <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-[1.2rem] ${bg} ${color}`}>
        <Icon className="h-7 w-7" />
      </div>
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <p className="text-4xl font-black"><AnimatedCounter prefix={prefix} suffix={suffix} end={value} /></p>
    </div>
  );
}

function IncomingCard({ booking, loading, onAccept, onReject }: any) {
  return (
    <div className="rounded-[3rem] border border-primary bg-card p-10 md:p-12 shadow-[0_0_40px_rgba(var(--color-primary),0.15)] relative overflow-hidden animate-in zoom-in-95 duration-500">
      <div className="absolute top-0 right-0 p-6">
        <span className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-[10px] font-black text-primary uppercase tracking-widest">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          New Lead
        </span>
      </div>
      
      <div className="pr-32">
        <h3 className="text-4xl font-black leading-tight mb-3">{booking.service?.name || "Service Request"}</h3>
        <p className="text-muted-foreground font-medium text-lg line-clamp-2">{booking.description}</p>
      </div>
      
      <div className="mt-10 grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-secondary/50 p-6 border border-border/50">
          <MapPin className="h-6 w-6 text-primary mb-3" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Location</p>
          <span className="font-bold text-foreground">{booking.address}</span>
        </div>
        <div className="rounded-2xl bg-primary/5 p-6 border border-primary/20">
          <DollarSign className="h-6 w-6 text-primary mb-3" />
          <p className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-1">Estimated Payout</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-primary">₹{booking.pricing?.totalAmount || 0}</span>
            {(booking.pricing?.discount || 0) > 0 && <span className="text-xs font-bold text-success uppercase">(-₹{booking.pricing.discount})</span>}
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <button onClick={onReject} className="sm:flex-1 rounded-2xl border-2 border-border py-5 font-black text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">IGNORE</button>
        <button 
          onClick={onAccept} 
          disabled={loading} 
          className="sm:flex-[2] relative group rounded-2xl bg-primary py-5 font-black text-primary-foreground shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? "INITIALIZING..." : <>ACCEPT & START JOB <ArrowRight className="w-5 h-5" /></>}
          </span>
        </button>
      </div>
    </div>
  );
}

function ActivePanel({ booking, onUpdate }: any) {
  const STAGES = ["assigned", "enroute", "arrived", "in_progress", "completed"];
  const currentIdx = STAGES.indexOf(booking.status);
  const nextStage = STAGES[currentIdx + 1];

  return (
    <div className="rounded-[3rem] border border-border glass p-8 md:p-12 shadow-[var(--shadow-card)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Active Engagement</p>
          <h3 className="text-4xl font-black">{booking.service?.name}</h3>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="grid grid-cols-5 gap-2 mb-12">
        {STAGES.map((s, i) => {
          const isActive = currentIdx >= i;
          const isCurrent = currentIdx === i;
          return (
            <div key={s} className="flex flex-col gap-3 group relative">
              <div className={`h-3 rounded-full transition-all duration-500 ${isActive ? "bg-primary shadow-[0_0_10px_rgba(var(--color-primary),0.5)]" : "bg-secondary"} ${isCurrent ? 'animate-pulse' : ''}`} />
              <span className={`text-[9px] font-black uppercase text-center tracking-widest hidden sm:block ${isActive ? "text-primary" : "text-muted-foreground"}`}>{s.replace("_", " ")}</span>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-border bg-card p-8 space-y-5 mb-10 shadow-sm">
        <div className="flex justify-between items-center pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <span className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">Customer</span>
              <span className="font-black text-sm">{typeof booking.customer === 'string' ? "Customer" : (booking.customer as any)?.name || "Verified User"}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <MapPin className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <span className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">Location</span>
              <span className="font-bold text-sm max-w-[200px] truncate block">{booking.address}</span>
            </div>
          </div>
          <button 
            onClick={() => toast.info("Feature coming soon: Issue reporting system")}
            className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors text-primary"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {nextStage && (
        <button 
          onClick={() => onUpdate(nextStage)} 
          className="w-full relative group rounded-2xl bg-foreground py-6 text-xl font-black text-background shadow-xl hover:scale-[1.02] active:scale-95 transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <span className="relative z-10 flex items-center justify-center gap-3">
            {nextStage === "completed" ? <CheckCircle2 className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
            MARK AS {nextStage.replace("_", " ").toUpperCase()}
          </span>
        </button>
      )}
    </div>
  );
}
