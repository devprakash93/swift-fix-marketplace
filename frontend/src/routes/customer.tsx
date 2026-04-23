import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { 
  Droplets, Bath, Sparkles, Scissors, PlugZap, 
  ArrowRight, MapPin, Calendar, Zap, 
  CheckCircle2, Star, ShieldCheck, CreditCard, ChevronRight
} from "lucide-react";
import { useApp, type Booking, type BookingStatus } from "@/context/AppContext";
import api, { ServiceService, BookingService, UserService } from "@/services/api";
import { socket } from "@/services/socket";
import { LiveMap } from "@/components/LiveMap";
import { StatusBadge } from "@/components/StatusBadge";
import { Loader } from "@/components/Loader";
import { Chat } from "@/components/Chat";
import { BookingTimeline } from "@/components/BookingTimeline";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export const Route = createFileRoute("/customer")({
  component: CustomerDashboard,
});

function CustomerDashboard() {
  const { user, currentBooking, setCurrentBooking, bookings, setBookings } = useApp();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [step, setStep] = useState<"categories" | "services" | "wizard" | "active">("categories");
  const [viewAllHistory, setViewAllHistory] = useState(false);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [onlinePros, setOnlinePros] = useState<any[]>([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await ServiceService.getCategories();
        setCategories(data);
      } catch (err) { console.error(err); }
    };
    const fetchCoupons = async () => {
      try {
        const data = await BookingService.getCoupons();
        setCoupons(data);
      } catch (err) { console.error(err); }
    };
    const fetchPros = async () => {
      try {
        const data = await UserService.getOnlineProfessionals();
        setOnlinePros(data);
      } catch (err) { console.error(err); }
    };
    fetchCats();
    fetchCoupons();
    fetchPros();
  }, []);

  useEffect(() => {
    if (currentBooking) setStep("active");
  }, [currentBooking]);

  if (!user) return <div className="p-20 text-center"><Link to="/login" className="text-primary font-bold">Log in</Link> to continue.</div>;

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      {step === "active" && currentBooking ? (
        <ActiveBookingView booking={currentBooking} onBack={() => { setStep("categories"); setCurrentBooking(null); }} />
      ) : (
        <>
          <header className="mb-12 animate-slide-up-fade">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">How can we help today?</h1>
            <p className="text-xl text-muted-foreground">Premium services delivered to your doorstep.</p>
          </header>

          {step === "categories" && coupons.length > 0 && (
            <div className="mb-12 animate-in slide-in-from-top-4 duration-500">
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {coupons.map((c) => (
                  <div 
                    key={c._id}
                    className="flex-shrink-0 w-80 p-6 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 relative overflow-hidden group shadow-lg"
                  >
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-primary text-primary-foreground text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">{c.code}</span>
                      <span className="text-2xl font-black text-primary">{c.discountPercent}% OFF</span>
                    </div>
                    <h4 className="font-black text-lg mb-1 italic">Special Platform Offer!</h4>
                    <p className="text-xs font-bold text-muted-foreground">Valid on orders above ₹{c.minOrderValue}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="animate-slide-up-fade" style={{ animationDelay: '0.1s' }}>
            {step === "categories" && (
              <>
                <div className="mb-12 h-96 rounded-[3rem] overflow-hidden shadow-[var(--shadow-card)] border border-border">
                  <div className="absolute z-10 top-6 left-6 pointer-events-none">
                    <h3 className="text-xl font-black drop-shadow-md bg-background/80 backdrop-blur px-4 py-2 rounded-2xl border border-border">Nearby Professionals</h3>
                  </div>
                  <LiveMap mode="discovery" professionals={onlinePros} />
                </div>
                <CategoryBrowser 
                  categories={categories} 
                  onSelect={(cat) => { setSelectedCat(cat); setStep("services"); }} 
                />
              </>
            )}

            {step === "services" && selectedCat && (
              <ServiceList 
                category={selectedCat} 
                onBack={() => setStep("categories")} 
                onSelect={(svc) => { setSelectedService(svc); setStep("wizard"); }} 
              />
            )}

            {step === "wizard" && selectedService && (
              <BookingWizard 
                service={selectedService} 
                onBack={() => setStep("services")} 
                onComplete={(booking) => { 
                  setCurrentBooking(booking); 
                  setBookings([booking, ...bookings]);
                  setStep("active"); 
                  toast.success("Booking confirmed! Finding a professional...");
                }}
              />
            )}
          </div>
        </>
      )}

      {/* History Section */}
      {step === "categories" && bookings.length > 0 && (
        <section className="mt-24 animate-slide-up-fade" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black">{viewAllHistory ? "All Bookings" : "Recent Bookings"}</h2>
            {bookings.length > 3 && (
              <button 
                onClick={() => setViewAllHistory(!viewAllHistory)}
                className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
              >
                {viewAllHistory ? "View Less" : "View All"} <ChevronRight className={`w-4 h-4 transition-transform ${viewAllHistory ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(viewAllHistory ? bookings : bookings.slice(0, 3)).map((b) => (
              <BookingCard key={b._id} booking={b} onClick={() => { setCurrentBooking(b); setStep("active"); }} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function CategoryBrowser({ categories, onSelect }: { categories: any[], onSelect: (c: any) => void }) {
  const IconMap: any = { Droplets, PlugZap, Bath, Scissors };

  if (categories.length === 0) return <Loader label="Loading categories..." />;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {categories.map((cat, i) => {
        const Icon = IconMap[cat.icon] || Sparkles;
        return (
          <button
            key={cat.name}
            onClick={() => onSelect(cat)}
            className="group relative flex flex-col items-center justify-center rounded-[2.5rem] border border-border glass p-10 transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 shadow-[var(--shadow-card)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-secondary text-primary transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110 shadow-inner">
              <Icon className="h-10 w-10" />
            </div>
            <h3 className="font-black text-xl relative z-10">{cat.name}</h3>
            <p className="mt-2 text-xs text-muted-foreground text-center relative z-10">{cat.description}</p>
          </button>
        );
      })}
    </div>
  );
}

function ServiceList({ category, onBack, onSelect }: { category: any, onBack: () => void, onSelect: (s: any) => void }) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSvcs = async () => {
      try {
        const data = await ServiceService.getServicesByCategory(category._id);
        setServices(data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchSvcs();
  }, [category]);

  if (loading) return <Loader label="Loading services..." />;

  return (
    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group">
        <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" /> Back to categories
      </button>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Sparkles className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-black">{category.name} Services</h2>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {services.length > 0 ? services.map((svc) => (
          <div key={svc._id} className="flex flex-col rounded-[2.5rem] border border-border glass overflow-hidden shadow-[var(--shadow-card)] transition-all duration-300 hover:border-primary/40 hover:-translate-y-1">
            <div className="aspect-video relative overflow-hidden bg-secondary">
              {svc.imageUrl ? (
                <img src={svc.imageUrl} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" alt={svc.name} />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Sparkles className="h-12 w-12 text-muted-foreground/30" /></div>
              )}
              <div className="absolute top-4 right-4 bg-background/90 backdrop-blur px-4 py-2 rounded-2xl font-black text-xl shadow-lg border border-border/50">
                ₹{svc.basePrice}
              </div>
            </div>
            <div className="p-8 md:p-10 flex flex-col flex-1">
              <h3 className="text-2xl font-black mb-3">{svc.name}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">{svc.description}</p>
              
              <div className="mb-8 flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Includes</p>
                <ul className="space-y-2">
                  {svc.inclusions?.map((inc: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => onSelect(svc)}
                className="w-full rounded-2xl bg-foreground py-4 md:py-5 text-sm font-black text-background transition-transform hover:scale-[1.02] active:scale-95 shadow-xl flex items-center justify-center gap-2"
              >
                Select Service <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )) : <div className="col-span-2 py-20 text-center text-muted-foreground border-2 border-dashed border-border rounded-3xl">No services found for this category.</div>}
      </div>
    </div>
  );
}

function BookingWizard({ service, onBack, onComplete }: { service: any, onBack: () => void, onComplete: (b: any) => void }) {
  const [addons, setAddons] = useState<string[]>([]);
  const [bookingType, setBookingType] = useState<"instant" | "scheduled">("instant");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [aiEstimate, setAiEstimate] = useState<any>(null);
  const [estimating, setEstimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [coords, setCoords] = useState<[number, number]>([-0.1276, 51.5074]);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const data = await BookingService.getCoupons();
        setCoupons(data);
      } catch (err) { console.error(err); }
    };
    fetchCoupons();
  }, []);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        setCoords([longitude, latitude]);
        setDetecting(false);
        toast.success("Location detected!");
        // In a real app, you'd use reverse geocoding here to get the address string
        if (!address) setAddress("Detected Location (Coordinates updated)");
      },
      (err) => {
        setDetecting(false);
        toast.error("Failed to detect location");
      }
    );
  };

  const baseTotal = service.basePrice + (addons.reduce((sum, id) => sum + (service.addons.find((a: any) => a._id === id)?.price || 0), 0));
  const discount = appliedCoupon ? Math.min(appliedCoupon.maxDiscount || Infinity, (baseTotal * appliedCoupon.discountPercent) / 100) : 0;
  const total = baseTotal - discount;

  const handleAiEstimate = async () => {
    setEstimating(true);
    try {
      const { data } = await api.post("/ai/estimate", { description: service.name, category: service.category });
      setAiEstimate(data);
      toast.success("AI Analysis Complete");
    } catch (err) { 
      toast.error("AI estimation failed");
    }
    setEstimating(false);
  };

  const handleBook = async () => {
    if (!address) return toast.error("Please provide a service address");
    
    setLoading(true);
    try {
      const payload = {
        serviceId: service._id,
        description: `Booking for ${service.name}`,
        address,
        location: { type: "Point", coordinates: coords }, 
        schedule: { bookingType, dateTime: bookingType === "scheduled" ? `${date}T${time}` : new Date().toISOString() },
        addons,
        paymentMethod: "stripe",
        couponCode: appliedCoupon?.code || couponCode
      };
      const booking = await BookingService.create(payload);
      onComplete(booking);
    } catch (err: any) { 
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr,1fr] animate-in slide-in-from-right-8 duration-500">
      <div className="space-y-8">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group">
          <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" /> Back to service selection
        </button>

        <section className="rounded-[3rem] border border-border glass p-8 md:p-12 shadow-[var(--shadow-card)]">
          <h2 className="text-3xl font-black mb-8">Customize your booking</h2>
          
          <div className="space-y-10">
            {service.addons && service.addons.length > 0 && (
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Select Add-ons (Optional)</h3>
                <div className="grid gap-3">
                  {service.addons.map((addon: any) => (
                    <button 
                      key={addon._id} 
                      type="button"
                      onClick={() => setAddons(prev => prev.includes(addon._id) ? prev.filter(id => id !== addon._id) : [...prev, addon._id])}
                      className={`flex items-center justify-between rounded-2xl border-2 p-5 cursor-pointer transition-all w-full ${addons.includes(addon._id) ? "border-primary bg-primary/5 shadow-md scale-[1.01]" : "border-border hover:border-primary/30 bg-card"}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${addons.includes(addon._id) ? 'bg-primary text-primary-foreground' : 'border-2 border-muted bg-background'}`}>
                          {addons.includes(addon._id) && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <span className="font-bold text-left">{addon.name}</span>
                      </div>
                      <span className="font-black text-primary text-lg shrink-0">+₹{addon.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">When do you need it?</h3>
              <div className="flex gap-4">
                <button 
                  onClick={() => setBookingType("instant")}
                  className={`flex-1 rounded-2xl border-2 p-6 text-center transition-all ${bookingType === "instant" ? "border-primary bg-primary/5 shadow-md scale-[1.02]" : "border-border hover:border-primary/30 bg-card"}`}
                >
                  <Zap className={`mx-auto mb-3 h-8 w-8 ${bookingType === "instant" ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="font-black text-lg">Instant</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">Pros nearby in 15m</p>
                </button>
                <button 
                  onClick={() => setBookingType("scheduled")}
                  className={`flex-1 rounded-2xl border-2 p-6 text-center transition-all ${bookingType === "scheduled" ? "border-primary bg-primary/5 shadow-md scale-[1.02]" : "border-border hover:border-primary/30 bg-card"}`}
                >
                  <Calendar className={`mx-auto mb-3 h-8 w-8 ${bookingType === "scheduled" ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="font-black text-lg">Schedule</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">Pick a date & time</p>
                </button>
              </div>
              {bookingType === "scheduled" && (
                <div className="mt-6 grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field py-4" />
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="input-field py-4" />
                </div>
              )}
            </div>

            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Service Address</h3>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary transition-transform group-focus-within:scale-110 group-focus-within:-translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="e.g. 123 Main St, Apt 4B" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input-field pl-12 py-4 shadow-sm w-full" 
                />
                <button 
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={detecting}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-secondary hover:bg-primary/10 text-primary text-[10px] font-black px-3 py-1.5 rounded-xl transition-all disabled:opacity-50"
                >
                  {detecting ? "..." : "DETECT"}
                </button>
              </div>
            </div>

            {coupons.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Available Offers</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {coupons.map((c) => (
                    <button 
                      key={c._id}
                      onClick={() => setAppliedCoupon(appliedCoupon?._id === c._id ? null : c)}
                      className={`flex-shrink-0 w-64 p-6 rounded-3xl border-2 transition-all text-left ${appliedCoupon?._id === c._id ? 'border-primary bg-primary/10 shadow-lg scale-105' : 'border-border bg-card hover:border-primary/30'}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="bg-primary/20 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">{c.code}</span>
                        <span className="text-xl font-black text-primary">{c.discountPercent}% OFF</span>
                      </div>
                      <p className="text-xs font-bold text-muted-foreground leading-tight">Min order ₹{c.minOrderValue}</p>
                      {appliedCoupon?._id === c._id && <div className="mt-4 text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Offer Applied</div>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <div className="rounded-[3rem] border border-border glass p-8 md:p-10 shadow-[var(--shadow-card)] sticky top-24">
          <h3 className="text-xl font-black mb-8">Fare Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-border border-dashed">
              <span className="text-muted-foreground font-medium">{service.name}</span>
              <span className="font-black text-lg">₹{service.basePrice}</span>
            </div>
            {addons.map(id => {
              const addon = service.addons.find((a: any) => a._id === id);
              return (
                <div key={id} className="flex justify-between items-center text-sm pb-2 animate-in fade-in">
                  <span className="text-muted-foreground">{addon.name}</span>
                  <span className="font-bold text-foreground">+₹{addon.price}</span>
                </div>
              );
            })}
            {appliedCoupon && (
              <div className="flex justify-between items-center text-sm pb-2 animate-in slide-in-from-right-4">
                <span className="text-success font-bold">Discount ({appliedCoupon.code})</span>
                <span className="font-bold text-success">-₹{discount.toFixed(0)}</span>
              </div>
            )}
            <div className="pt-6 mt-4 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Amount</p>
                <p className="text-5xl font-black text-primary">₹{total}</p>
              </div>
              <CreditCard className="h-10 w-10 text-primary/20" />
            </div>
          </div>
          <button 
            disabled={loading || !address || (bookingType === "scheduled" && (!date || !time))}
            onClick={handleBook}
            className="mt-10 w-full rounded-2xl bg-primary py-5 text-lg font-black text-primary-foreground shadow-[var(--shadow-soft)] transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-[var(--shadow-soft)]"
          >
            {loading ? <Loader label="" /> : "Confirm & Pay"}
          </button>
          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase font-black tracking-widest">
            <ShieldCheck className="w-4 h-4" /> Secure Payment Powered by Stripe
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-accent/20 bg-accent/5 p-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[image:var(--gradient-accent)] opacity-5 group-hover:opacity-10 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <h4 className="font-black text-accent-foreground text-lg">AI Price Assistant</h4>
            </div>
            {aiEstimate ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <p className="text-3xl font-black text-foreground">{aiEstimate.estimate}</p>
                <p className="text-sm font-medium leading-relaxed">{aiEstimate.advice}</p>
                <button onClick={() => setAiEstimate(null)} className="text-xs font-bold uppercase text-accent tracking-widest hover:underline pt-2">Reset Analysis</button>
              </div>
            ) : (
              <button 
                onClick={handleAiEstimate}
                disabled={estimating}
                className="w-full rounded-xl border-2 border-accent/30 py-4 text-sm font-bold text-accent-foreground transition-all hover:bg-accent hover:text-accent-foreground hover:border-accent shadow-sm disabled:opacity-70"
              >
                {estimating ? "Analyzing Market Data..." : "Get AI Price Estimate"}
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

function ActiveBookingView({ booking, onBack }: { booking: Booking, onBack: () => void }) {
  const { setCurrentBooking, setBookings, bookings } = useApp();
  const [status, setStatus] = useState<string>(booking.status);
  const [history, setHistory] = useState<any[]>(booking.history || []);
  const [proCoords, setProCoords] = useState<[number, number] | null>(null);
  const [eta, setEta] = useState<{ duration: number, distance: number } | null>(null);
  const customerCoords: [number, number] | null = booking.location?.coordinates ? 
    [booking.location.coordinates[1], booking.location.coordinates[0]] : null;

  // Sync if booking prop changes (e.g. navigating back and reopening)
  useEffect(() => {
    setStatus(booking.status);
    setHistory(booking.history || []);
  }, [booking._id]);

  useEffect(() => {
    if (booking.professional && typeof booking.professional === 'object' && booking.professional.location?.coordinates) {
      setProCoords([booking.professional.location.coordinates[1], booking.professional.location.coordinates[0]]);
    }
    
    const handleProLocation = (data: { proId: string, location: { type: 'Point', coordinates: [number, number] } }) => {
      if (booking.professional && typeof booking.professional === 'object' && data.proId === booking.professional._id) {
        setProCoords([data.location.coordinates[1], data.location.coordinates[0]]);
      }
    };
    
    socket.on("plumberLocationUpdate", handleProLocation);
    return () => { socket.off("plumberLocationUpdate", handleProLocation); };
  }, [booking.professional]);

  useEffect(() => {
    const handleStatusUpdate = (data: any) => {
      if (data._id === booking._id) {
        setStatus(data.status);
        setHistory(data.history || []);
        if (data.status === 'completed') {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#00ff00', '#0000ff', '#ff0000'] });
          toast.success("Service completed!");
        } else {
          toast.info(`Booking status updated: ${data.status}`);
        }
      }
    };

    socket.on("bookingStatusUpdate", handleStatusUpdate);
    return () => { socket.off("bookingStatusUpdate", handleStatusUpdate); };
  }, [booking._id]);

  const handleReview = async (rating: number, comment: string) => {
    try {
      await api.post(`/bookings/${booking._id}/review`, { rating, comment });
      toast.success("Review submitted successfully!");
      setCurrentBooking(null); // Return to home
    } catch(e) {
      toast.error("Failed to submit review");
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await BookingService.cancel(booking._id);
      toast.success("Booking cancelled");
      setBookings(bookings.map(b => b._id === booking._id ? { ...b, status: 'cancelled' as BookingStatus } : b));
      setCurrentBooking(null);
      onBack();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to cancel booking");
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr,1fr] animate-in slide-in-from-bottom-8 duration-500">
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
           <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight className="h-4 w-4 rotate-180" /> Dashboard
          </button>
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ID: #{booking._id.slice(-6)}</div>
        </div>

        {/* Live Tracking Map */}
        <div className={`transition-all duration-700 ${['in_progress', 'completed'].includes(status) ? 'h-32 opacity-50 grayscale hover:grayscale-0 hover:opacity-100' : 'h-96'} rounded-[3rem] overflow-hidden relative`}>
          {status === 'enroute' && eta && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-background/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-primary/20 flex items-center gap-3 animate-in slide-in-from-top-4">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <div className="text-sm font-black text-primary">
                Arriving in {Math.ceil(eta.duration / 60)} mins
                <span className="text-muted-foreground ml-2 text-xs">({(eta.distance / 1000).toFixed(1)} km)</span>
              </div>
            </div>
          )}
          <LiveMap 
            mode="tracking" 
            customerCoords={customerCoords} 
            proCoords={['searching', 'pending'].includes(status) ? null : proCoords} 
            onRouteCalculated={setEta}
          />
        </div>
        
        <div className="rounded-[3rem] border border-border glass p-8 md:p-12 shadow-[var(--shadow-card)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-10 border-b border-border border-dashed">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Service Progress</p>
              <h2 className="text-3xl font-black">{booking.service?.name || "Service"}</h2>
            </div>
            <StatusBadge status={status} />
          </div>

          {status === "completed" ? (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
              <div className="rounded-3xl bg-success/10 p-10 border border-success/20 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-success)_0%,transparent_70%)] opacity-10" />
                <CheckCircle2 className="mx-auto h-16 w-16 text-success mb-6 relative z-10" />
                <h3 className="text-3xl font-black text-success relative z-10">Service Completed!</h3>
                <p className="text-muted-foreground mt-2 relative z-10 text-lg">Your professional has finished the work.</p>
              </div>

              <ReviewForm onSubmit={handleReview} />

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={async () => {
                    const { data } = await api.get(`/bookings/${booking._id}/invoice`);
                    toast.success(`Invoice ${data.invoiceNumber} downloaded! Total: ₹${data.total.toFixed(2)}`);
                  }}
                  className="flex-1 rounded-2xl border-2 border-border py-4 font-black hover:bg-secondary transition-colors"
                >
                  Download Invoice
                </button>
                <button onClick={onBack} className="flex-1 rounded-2xl bg-primary py-4 font-black text-primary-foreground shadow-lg hover:scale-[1.02] transition-transform">
                  Back to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-10">
              <div className="py-4">
                <BookingTimeline history={history} />
              </div>
              <div className="py-4 flex flex-col justify-center items-center text-center bg-secondary/30 rounded-3xl p-8 border border-border/50">
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-spin" style={{ animationDuration: '3s' }} />
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center font-black text-primary uppercase text-[10px] tracking-widest">{status.replace('_', ' ')}</div>
                </div>
                <h4 className="font-black text-xl mb-2">Live Tracking</h4>
                <p className="text-sm text-muted-foreground">Keep this window open to track your professional's progress in real-time.</p>
              </div>
            </div>
          )}

          {['pending', 'searching'].includes(status) && (
            <div className="mt-10 pt-10 border-t border-border border-dashed">
              <button 
                onClick={handleCancel}
                className="w-full rounded-2xl border-2 border-destructive/30 text-destructive py-5 font-black hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 shadow-sm hover:shadow-destructive/20"
              >
                Cancel Booking
              </button>
              <p className="text-[10px] text-center text-muted-foreground mt-4 font-black uppercase tracking-[0.2em]">
                Cancellation is only possible before a professional accepts the request.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <aside className="space-y-6">
        <Chat jobId={booking._id} />
        
        <div className="rounded-[2.5rem] border border-border glass p-8 shadow-[var(--shadow-card)]">
          <h3 className="text-lg font-black mb-6">Booking Details</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-border/50">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Address</span>
              <span className="font-bold text-sm text-right max-w-[150px] truncate">{booking.address}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-border/50">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Schedule</span>
              <span className="font-bold text-sm">{new Date(booking.schedule.dateTime).toLocaleDateString()}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Paid</span>
              <div className="flex flex-col items-end">
                <span className="font-black text-primary text-2xl">₹{booking.pricing.totalAmount}</span>
                {(booking.pricing.discount || 0) > 0 && <span className="text-[10px] font-black text-success uppercase tracking-widest">Saved ₹{booking.pricing.discount}</span>}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function ReviewForm({ onSubmit }: { onSubmit: (rating: number, comment: string) => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  return (
    <div className="rounded-[2.5rem] border border-border bg-card p-8 shadow-sm">
      <h4 className="font-black text-xl mb-6 text-center">Rate your experience</h4>
      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((star) => (
          <button 
            key={star} 
            type="button"
            className="transition-transform hover:scale-125 focus:outline-none"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(star)}
          >
            <Star className={`h-10 w-10 ${(hover || rating) >= star ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
          </button>
        ))}
      </div>
      <textarea 
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Tell us what you loved..." 
        className="input-field bg-secondary/50 min-h-[120px] mb-6 resize-none" 
      />
      <button 
        disabled={!rating}
        onClick={() => onSubmit(rating, comment)}
        className="w-full rounded-2xl bg-foreground py-4 font-black text-background shadow-xl disabled:opacity-50 transition-transform hover:scale-[1.02] active:scale-95"
      >
        Submit Review
      </button>
    </div>
  );
}

function BookingCard({ booking, onClick }: { booking: Booking, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="text-left rounded-[2rem] border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-all hover:border-primary/40 hover:-translate-y-1 group"
    >
      <div className="flex justify-between items-start mb-6">
        <StatusBadge status={booking.status} />
        <div className="text-right">
          <span className="text-lg font-black text-primary">₹{booking.pricing.totalAmount}</span>
          {(booking.pricing.discount || 0) > 0 && <p className="text-[10px] text-success font-bold uppercase tracking-widest">Discount Applied</p>}
        </div>
      </div>
      <h4 className="font-black text-xl mb-2 group-hover:text-primary transition-colors">{booking.service?.name || "Service"}</h4>
      <p className="text-sm text-muted-foreground line-clamp-1 mb-6 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {booking.address}</p>
      <div className="pt-4 border-t border-border flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
        <span className="flex items-center gap-1 group-hover:text-primary transition-colors">Details <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /></span>
      </div>
    </button>
  );
}
