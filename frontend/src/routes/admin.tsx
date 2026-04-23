import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Users, Wrench, Briefcase, ShieldCheck, ShieldAlert, Star, DollarSign, Loader2, Tag, Percent, Trash2, Plus } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { socket } from "@/services/socket";
import { StatusBadge } from "@/components/StatusBadge";
import { AdminService, ServiceService } from "@/services/api";
import { RevenueChart } from "@/components/RevenueChart";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminPanel,
  head: () => ({ meta: [{ title: "Admin Panel — FlowFix" }] }),
});

type Tab = "users" | "plumbers" | "bookings" | "services" | "marketing" | "payouts" | "banned";

function AdminPanel() {
  const { bookings, user } = useApp();
  const [tab, setTab] = useState<Tab>("bookings");
  const [stats, setStats] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [plumbers, setPlumbers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [bannedUsers, setBannedUsers] = useState<any[]>([]);
  
  const [newCat, setNewCat] = useState({ name: "", icon: "", description: "" });
  const [newCoupon, setNewCoupon] = useState({ code: "", discountPercent: 10, expiryDate: "" });
  const [newPlumber, setNewPlumber] = useState({ name: "", email: "", password: "", phone: "" });
  const [broadcastMsg, setBroadcastMsg] = useState("");
  
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [showAddPlumber, setShowAddPlumber] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [suspendingUser, setSuspendingUser] = useState<string | null>(null);

  const chartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map(day => ({ name: day, total: 0 }));
    
    bookings.forEach(b => {
      if (b.pricing?.totalAmount && b.status === "completed") {
         const d = new Date(b.createdAt);
         const now = new Date();
         const diffTime = Math.abs(now.getTime() - d.getTime());
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
         if (diffDays <= 7) {
            data[d.getDay()].total += b.pricing.commission || 0; // Admin earns commission
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

  const fetchAdminData = async () => {
    try {
      const [sData, cData, pData, catData, coupData, bannedData] = await Promise.all([
        AdminService.getStats(),
        AdminService.getUsers(),
        AdminService.getPlumbers(),
        ServiceService.getCategories(),
        AdminService.getCoupons(),
        AdminService.getBannedUsers()
      ]);
      setStats(sData);
      setCustomers(cData);
      setPlumbers(pData);
      setCategories(catData);
      setCoupons(coupData);
      setBannedUsers(bannedData);
      
      // Fetch services for all categories
      if (catData.length > 0) {
        const allServices = await Promise.all(catData.map((c: any) => ServiceService.getServicesByCategory(c._id)));
        setServices(allServices.flat());
      }
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAdminData();
      
      socket.on("adminNewBooking", (newBooking) => {
        setStats((prev: any) => ({ ...prev, bookings: (prev?.bookings || 0) + 1 }));
        toast.info(`🔔 New Booking Request #${newBooking._id.slice(-6)} created!`);
      });

      socket.on("adminNewUser", ({ id, role }) => {
        setStats((prev: any) => ({
          ...prev,
          customers: role === "customer" ? (prev?.customers || 0) + 1 : prev?.customers,
          plumbers: role === "plumber" ? (prev?.plumbers || 0) + 1 : prev?.plumbers,
        }));
        toast.info(`👤 New ${role} registered!`);
      });
    }

    return () => {
      socket.off("adminNewBooking");
      socket.off("adminNewUser");
    };
  }, [user]);

  const handleKyc = async (id: string, status: string, suspendDays?: number | 'permanent') => {
    try {
      await AdminService.approveKyc(id, status, suspendDays);
      setPlumbers(plumbers.map(p => {
        if (p._id === id) {
          const suspendedUntil = status === 'suspended' && typeof suspendDays === 'number' 
            ? new Date(Date.now() + suspendDays * 24 * 60 * 60 * 1000).toISOString() 
            : null;
          return { ...p, kycStatus: status, suspendedUntil };
        }
        return p;
      }));
      setSuspendingUser(null);
    } catch(err) {
      toast.error("Failed to update status");
    }
  };

  const handleSettlePayout = async (id: string) => {
    try {
      const res = await AdminService.settlePayout(id);
      setPlumbers(plumbers.map(p => p._id === id ? { ...p, walletBalance: 0 } : p));
      toast.success(res.message);
    } catch (err) {
      toast.error("Failed to settle payout");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await AdminService.deleteCategory(id);
      setCategories(categories.filter(c => c._id !== id));
      toast.success("Category deleted");
    } catch (err) {
      toast.error("Failed to delete category");
    }
  };

  const handleToggleCoupon = async (id: string) => {
    try {
      const updated = await AdminService.toggleCoupon(id);
      setCoupons(coupons.map(c => c._id === id ? updated : c));
      toast.success("Coupon status updated");
    } catch (err) {
      toast.error("Failed to update coupon");
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await AdminService.createCategory(newCat);
      setCategories([...categories, data]);
      setShowAddCategory(false);
      setNewCat({ name: "", icon: "", description: "" });
      toast.success("Category created!");
    } catch (err) { toast.error("Failed to create category"); }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await AdminService.createCoupon({
        ...newCoupon,
        expiryDate: new Date(newCoupon.expiryDate).toISOString()
      });
      setCoupons([data, ...coupons]);
      setShowAddCoupon(false);
      setNewCoupon({ code: "", discountPercent: 10, expiryDate: "" });
      toast.success("Coupon created!");
    } catch (err) { toast.error("Failed to create coupon"); }
  };

  const handleCreatePlumber = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await AdminService.createPlumber(newPlumber);
      setPlumbers([data, ...plumbers]);
      setShowAddPlumber(false);
      setNewPlumber({ name: "", email: "", password: "", phone: "" });
      toast.success("Professional added successfully!");
      setStats((prev: any) => ({ ...prev, plumbers: (prev?.plumbers || 0) + 1 }));
    } catch (err: any) { 
      toast.error(err.response?.data?.message || "Failed to add professional"); 
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg) return;
    try {
      await AdminService.broadcastGlobal(broadcastMsg, "info");
      setBroadcastMsg("");
      setShowBroadcast(false);
      toast.success("Broadcast sent to all users!");
    } catch (err) { toast.error("Failed to broadcast"); }
  };

  if (user?.role !== "admin") return <div className="p-20 text-center">Access Denied. Admins only.</div>;

  const tabs: { id: Tab; label: string; icon: typeof Users; count: number | string }[] = [
    { id: "bookings", label: "Bookings", icon: Briefcase, count: stats?.bookings || 0 },
    { id: "users", label: "Customers", icon: Users, count: stats?.customers || 0 },
    { id: "plumbers", label: "Pros", icon: Wrench, count: stats?.plumbers || 0 },
    { id: "payouts", label: "Payouts", icon: DollarSign, count: plumbers.filter(p => p.walletBalance > 0).length },
    { id: "services", label: "Catalog", icon: Tag, count: categories.length },
    { id: "marketing", label: "Marketing", icon: Percent, count: coupons.length },
    { id: "banned", label: "Banned", icon: ShieldAlert, count: bannedUsers.length },
  ];

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-10 flex flex-wrap justify-between items-end gap-6">
        <div>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Control Center</p>
          <div className="flex items-center gap-4 mt-1">
            <h1 className="text-4xl font-black tracking-tight">Platform Operations</h1>
            <button onClick={() => setShowBroadcast(!showBroadcast)} className="rounded-full bg-primary/10 text-primary px-4 py-1.5 text-xs font-black uppercase hover:bg-primary/20 transition">
              {showBroadcast ? "Close" : "Broadcast"}
            </button>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Total Revenue</p>
          <p className="text-3xl font-black text-primary">₹{stats?.revenue || 0}</p>
        </div>
      </div>

      {showBroadcast && (
        <form onSubmit={handleBroadcast} className="mb-8 p-6 rounded-3xl border-2 border-primary/20 bg-primary/5 animate-in slide-in-from-top-4 flex flex-col sm:flex-row gap-4 items-end shadow-lg">
          <div className="flex-1 w-full">
            <label className="text-xs font-black uppercase tracking-widest text-primary mb-2 block">Global Announcement</label>
            <input required placeholder="Type a message to send to all active users..." value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} className="input-field bg-background w-full" />
          </div>
          <button type="submit" className="rounded-xl bg-primary text-primary-foreground px-8 py-3 text-sm font-black whitespace-nowrap hover:scale-105 transition w-full sm:w-auto shadow-md">Send Live</button>
        </form>
      )}

      <div className="mb-8 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex flex-col items-center justify-center gap-3 rounded-[2rem] border p-6 text-center transition ${
              tab === id ? "border-primary bg-primary/5 shadow-xl scale-105" : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tab === id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
              <p className="text-2xl font-black">{loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto mt-1" /> : count}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mb-8 rounded-[2.5rem] border border-border bg-card p-8 shadow-[var(--shadow-card)]">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">Real-Time Revenue Analysis</h3>
        <RevenueChart data={chartData} type="area" />
      </div>

      <div className="rounded-[2.5rem] border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
        {tab === "users" && (
          <Table headers={["Name", "Email", "Role", "Registered"]}>
            {customers.map((u) => (
              <tr key={u._id} className="border-t border-border hover:bg-secondary/20 transition">
                <td className="px-8 py-5 font-bold">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} className="h-10 w-10 rounded-full bg-secondary" />
                    {u.name}
                  </div>
                </td>
                <td className="px-8 py-5 text-sm text-muted-foreground">{u.email}</td>
                <td className="px-8 py-5">
                  <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-black uppercase tracking-widest">{u.role}</span>
                </td>
                <td className="px-8 py-5 text-sm text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {customers.length === 0 && <tr><td colSpan={4} className="py-20 text-center text-muted-foreground">No customers found.</td></tr>}
          </Table>
        )}

        {tab === "plumbers" && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black">Professional Network</h2>
              <button onClick={() => setShowAddPlumber(!showAddPlumber)} className="flex items-center gap-2 rounded-xl bg-foreground text-background px-4 py-2 text-sm font-bold transition hover:opacity-90">
                <Plus className="h-4 w-4" /> {showAddPlumber ? "Cancel" : "Add Professional"}
              </button>
            </div>

            {showAddPlumber && (
              <form onSubmit={handleCreatePlumber} className="mb-8 p-6 rounded-3xl border border-border bg-card animate-in slide-in-from-top-4 shadow-sm">
                <h3 className="text-lg font-black mb-4">Manual Professional Registration</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground mb-1 block">Full Name</label>
                    <input required placeholder="Name" value={newPlumber.name} onChange={e => setNewPlumber({...newPlumber, name: e.target.value})} className="input-field" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground mb-1 block">Email (ID)</label>
                    <input required type="email" placeholder="email@example.com" value={newPlumber.email} onChange={e => setNewPlumber({...newPlumber, email: e.target.value})} className="input-field" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground mb-1 block">Password</label>
                    <input required type="password" placeholder="••••••••" value={newPlumber.password} onChange={e => setNewPlumber({...newPlumber, password: e.target.value})} className="input-field" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground mb-1 block">Phone (Optional)</label>
                    <input placeholder="+1 (555) 000-0000" value={newPlumber.phone} onChange={e => setNewPlumber({...newPlumber, phone: e.target.value})} className="input-field" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="rounded-xl bg-primary text-primary-foreground px-8 py-2.5 text-sm font-black shadow-lg hover:scale-105 transition">Register Pro</button>
                </div>
              </form>
            )}

            <Table headers={["Professional", "Status", "Performance", "KYC", "Action"]}>
            {plumbers.map((p) => (
              <tr key={p._id} className="border-t border-border hover:bg-secondary/20 transition">
                <td className="px-8 py-5 font-bold">
                  <div className="flex items-center gap-3">
                    <img src={p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} className="h-10 w-10 rounded-full bg-secondary" />
                    <div>
                      <p>{p.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{p.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                   <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase ${p.isOnline ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'}`}>
                     {p.isOnline ? "Online" : "Offline"}
                   </span>
                </td>
                <td className="px-8 py-5 text-sm">
                  <div className="flex items-center gap-1 font-bold"><Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />{p.rating}</div>
                  <div className="text-[10px] text-muted-foreground font-bold uppercase">{p.numRatings} ratings</div>
                </td>
                <td className="px-8 py-5">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                    p.kycStatus === 'approved' ? 'bg-success/15 text-success' : 
                    p.kycStatus === 'rejected' ? 'bg-destructive/15 text-destructive' : 
                    p.kycStatus === 'suspended' ? 'bg-muted-foreground/20 text-foreground' :
                    'bg-warning/15 text-warning'
                  }`}>
                    {p.kycStatus === 'approved' ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />} 
                    {p.kycStatus}
                  </span>
                  {p.kycStatus === 'suspended' && p.suspendedUntil && (
                    <div className="text-[10px] text-muted-foreground mt-1">Until {new Date(p.suspendedUntil).toLocaleDateString()}</div>
                  )}
                  {p.kycStatus === 'suspended' && !p.suspendedUntil && (
                    <div className="text-[10px] text-muted-foreground mt-1">Permanent</div>
                  )}
                </td>
                <td className="px-8 py-5">
                  {suspendingUser === p._id ? (
                    <div className="flex flex-col xl:flex-row items-start xl:items-center gap-2 p-3 rounded-2xl bg-secondary/50 border border-border animate-in fade-in zoom-in-95">
                      <div className="flex gap-2 w-full xl:w-auto">
                        <button onClick={() => { handleKyc(p._id, 'suspended', 7); toast.info(`${p.name} suspended for 7 days.`); }} className="flex-1 xl:flex-none rounded-xl bg-background border border-border px-3 py-2 text-[10px] font-black uppercase transition hover:bg-destructive hover:text-destructive-foreground hover:border-destructive shadow-sm">7 Days</button>
                        <button onClick={() => { handleKyc(p._id, 'suspended', 30); toast.info(`${p.name} suspended for 30 days.`); }} className="flex-1 xl:flex-none rounded-xl bg-background border border-border px-3 py-2 text-[10px] font-black uppercase transition hover:bg-destructive hover:text-destructive-foreground hover:border-destructive shadow-sm">30 Days</button>
                        <button onClick={() => { handleKyc(p._id, 'suspended', 'permanent'); toast.error(`${p.name} permanently suspended.`); }} className="flex-1 xl:flex-none rounded-xl bg-background border border-border px-3 py-2 text-[10px] font-black uppercase transition hover:bg-destructive hover:text-destructive-foreground hover:border-destructive shadow-sm">Permanent</button>
                      </div>
                      <button onClick={() => setSuspendingUser(null)} className="w-full xl:w-auto rounded-xl px-4 py-2 text-[10px] font-black uppercase transition hover:bg-muted text-muted-foreground hover:text-foreground mt-2 xl:mt-0">Cancel</button>
                    </div>
                  ) : p.kycStatus === 'pending' ? (
                    <div className="flex gap-2">
                      <button onClick={() => handleKyc(p._id, 'approved')} className="rounded-xl border border-border px-4 py-2 text-[10px] font-black uppercase transition hover:bg-success hover:text-success-foreground hover:border-success">Approve</button>
                      <button onClick={() => handleKyc(p._id, 'rejected')} className="rounded-xl border border-border px-4 py-2 text-[10px] font-black uppercase transition hover:bg-destructive hover:text-destructive-foreground hover:border-destructive">Reject</button>
                    </div>
                  ) : p.kycStatus === 'suspended' ? (
                    <button onClick={() => { handleKyc(p._id, 'approved'); toast.success(`${p.name}'s suspension lifted.`); }} className="rounded-xl border border-border px-4 py-2 text-[10px] font-black uppercase transition hover:bg-success hover:text-success-foreground hover:border-success">Lift Suspension</button>
                  ) : (
                    <button onClick={() => setSuspendingUser(p._id)} className="rounded-xl border border-border px-4 py-2 text-[10px] font-black uppercase transition hover:bg-secondary">Suspend</button>
                  )}
                </td>
              </tr>
            ))}
            {plumbers.length === 0 && <tr><td colSpan={5} className="py-20 text-center text-muted-foreground">No professionals found.</td></tr>}
          </Table>
          </div>
        )}

        {tab === "bookings" && (
          <Table headers={["Service", "Customer", "Total", "Status", "Date"]}>
            {bookings.map((j) => (
              <tr key={j._id} className="border-t border-border hover:bg-secondary/20 transition">
                <td className="px-8 py-5">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">#{j._id.slice(-6)}</p>
                  <p className="font-bold text-lg">{j.service?.name || "General Service"}</p>
                </td>
                <td className="px-8 py-5">
                  <p className="font-bold">{typeof j.customer === 'string' ? j.customer : (j.customer as any).name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase truncate max-w-[150px]">{j.address}</p>
                </td>
                <td className="px-8 py-5 font-black text-primary">₹{j.pricing?.totalAmount || 0}</td>
                <td className="px-8 py-5"><StatusBadge status={j.status} /></td>
                <td className="px-8 py-5 text-xs font-bold text-muted-foreground">{new Date(j.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {bookings.length === 0 && <tr><td colSpan={5} className="py-20 text-center text-muted-foreground">No bookings recorded yet.</td></tr>}
          </Table>
        )}

        {tab === "payouts" && (
          <Table headers={["Professional", "Available Balance", "Status", "Action"]}>
            {plumbers.filter(p => p.walletBalance > 0).map((p) => (
              <tr key={p._id} className="border-t border-border hover:bg-secondary/20 transition">
                <td className="px-8 py-5 font-bold">
                  <div className="flex items-center gap-3">
                    <img src={p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} className="h-10 w-10 rounded-full bg-secondary" />
                    <div>
                      <p>{p.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{p.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-2xl font-black text-success">₹{p.walletBalance}</td>
                <td className="px-8 py-5">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase bg-warning/15 text-warning">Pending Settlement</span>
                </td>
                <td className="px-8 py-5">
                  <button onClick={() => handleSettlePayout(p._id)} className="rounded-xl border-2 border-primary bg-primary text-primary-foreground px-6 py-2 text-xs font-black uppercase transition hover:opacity-90">Settle Payment</button>
                </td>
              </tr>
            ))}
            {plumbers.filter(p => p.walletBalance > 0).length === 0 && <tr><td colSpan={4} className="py-20 text-center text-muted-foreground">No pending payouts. All professionals are settled.</td></tr>}
          </Table>
        )}

        {tab === "services" && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black">Service Catalog</h2>
              <button onClick={() => setShowAddCategory(!showAddCategory)} className="flex items-center gap-2 rounded-xl bg-foreground text-background px-4 py-2 text-sm font-bold transition hover:opacity-90">
                <Plus className="h-4 w-4" /> {showAddCategory ? "Cancel" : "Add Category"}
              </button>
            </div>

            {showAddCategory && (
              <form onSubmit={handleCreateCategory} className="mb-8 p-6 rounded-3xl border border-border bg-card animate-in slide-in-from-top-4">
                <h3 className="text-lg font-black mb-4">New Category</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <input required placeholder="Name (e.g. Carpentry)" value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} className="input-field" />
                  <input required placeholder="Emoji Icon (e.g. 🪚)" value={newCat.icon} onChange={e => setNewCat({...newCat, icon: e.target.value})} className="input-field" />
                  <input required placeholder="Description" value={newCat.description} onChange={e => setNewCat({...newCat, description: e.target.value})} className="input-field" />
                </div>
                <button type="submit" className="rounded-xl bg-primary text-primary-foreground px-6 py-2 text-sm font-bold">Save Category</button>
              </form>
            )}

            <div className="grid gap-6">
              {categories.map((cat) => (
                <div key={cat._id} className="rounded-3xl border border-border bg-secondary/20 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card border border-border shadow-sm text-2xl">
                        {cat.icon || "🔧"}
                      </div>
                      <div>
                        <h3 className="text-xl font-black">{cat.name}</h3>
                        <p className="text-sm text-muted-foreground">{cat.description}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteCategory(cat._id)} className="h-10 w-10 flex items-center justify-center rounded-xl text-destructive hover:bg-destructive/10 transition">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.filter(s => s.category === cat._id || s.category?._id === cat._id).map((srv) => (
                      <div key={srv._id} className="rounded-2xl border border-border bg-card p-4">
                        <h4 className="font-bold">{srv.name}</h4>
                        <div className="flex justify-between mt-2">
                          <span className="text-primary font-black">₹{srv.basePrice}</span>
                          <span className="text-xs text-muted-foreground font-bold">{srv.estimatedDuration} mins</span>
                        </div>
                        {srv.addons?.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Addons</p>
                            {srv.addons.map((a: any, i: number) => (
                              <div key={i} className="flex justify-between text-xs mb-1">
                                <span>{a.name}</span>
                                <span className="font-bold text-primary">+₹{a.price}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    <button onClick={() => toast.info(`Add Service to ${cat.name} modal coming soon!`)} className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-4 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition min-h-[120px]">
                      <Plus className="h-6 w-6" />
                      <span className="text-sm font-bold">Add Service</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "marketing" && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black">Marketing & Promotions</h2>
              <button onClick={() => setShowAddCoupon(!showAddCoupon)} className="flex items-center gap-2 rounded-xl bg-foreground text-background px-4 py-2 text-sm font-bold transition hover:opacity-90">
                <Plus className="h-4 w-4" /> {showAddCoupon ? "Cancel" : "Create Coupon"}
              </button>
            </div>

            {showAddCoupon && (
              <form onSubmit={handleCreateCoupon} className="mb-8 p-6 rounded-3xl border border-border bg-card animate-in slide-in-from-top-4">
                <h3 className="text-lg font-black mb-4">New Discount Code</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <input required placeholder="CODE (e.g. SUMMER20)" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} className="input-field uppercase" />
                  <input required type="number" min="1" max="100" placeholder="Discount %" value={newCoupon.discountPercent} onChange={e => setNewCoupon({...newCoupon, discountPercent: Number(e.target.value)})} className="input-field" />
                  <input required type="date" value={newCoupon.expiryDate} onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value})} className="input-field" />
                </div>
                <button type="submit" className="rounded-xl bg-primary text-primary-foreground px-6 py-2 text-sm font-bold">Save Coupon</button>
              </form>
            )}
            
            <Table headers={["Code", "Discount", "Limits", "Usage", "Status", "Action"]}>
              {coupons.map((c) => (
                <tr key={c._id} className="border-t border-border hover:bg-secondary/20 transition">
                  <td className="px-8 py-5">
                    <span className="rounded-lg bg-primary/10 text-primary px-3 py-1 font-mono font-black text-lg tracking-widest">{c.code}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="font-black text-xl">{c.discountPercent}% OFF</div>
                    {c.maxDiscount && <div className="text-[10px] text-muted-foreground font-bold uppercase">Max ₹{c.maxDiscount}</div>}
                  </td>
                  <td className="px-8 py-5 text-sm">
                    <div>Min Order: ₹{c.minOrderValue}</div>
                    <div className="text-muted-foreground">Expires: {new Date(c.expiryDate).toLocaleDateString()}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="font-bold">{c.usedCount} / {c.usageLimit}</div>
                    <div className="w-24 h-2 bg-secondary rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${(c.usedCount / c.usageLimit) * 100}%` }} />
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase ${c.isActive ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {c.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <button onClick={() => handleToggleCoupon(c._id)} className="rounded-xl border border-border px-4 py-2 text-[10px] font-black uppercase transition hover:bg-secondary">
                      {c.isActive ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && <tr><td colSpan={6} className="py-20 text-center text-muted-foreground">No coupons created yet.</td></tr>}
            </Table>
          </div>
        )}

        {tab === "banned" && (
          <Table headers={["User", "Role", "Suspension Type", "Ends", "Action"]}>
            {bannedUsers.map((u) => (
              <tr key={u._id} className="border-t border-border hover:bg-secondary/20 transition">
                <td className="px-8 py-5 font-bold">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} className="h-10 w-10 rounded-full bg-secondary" />
                    <div>
                      <p>{u.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-black uppercase tracking-widest">{u.role}</span>
                </td>
                <td className="px-8 py-5">
                   <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase bg-destructive/15 text-destructive">
                     {u.suspendedUntil ? "Temporary" : "Permanent"}
                   </span>
                </td>
                <td className="px-8 py-5 text-sm text-muted-foreground">
                  {u.suspendedUntil ? new Date(u.suspendedUntil).toLocaleDateString() : "Never"}
                </td>
                <td className="px-8 py-5">
                  <button 
                    onClick={async () => {
                      await AdminService.approveKyc(u._id, 'approved');
                      setBannedUsers(bannedUsers.filter(b => b._id !== u._id));
                      toast.success(`Suspension lifted for ${u.name}`);
                    }} 
                    className="rounded-xl border border-border px-4 py-2 text-[10px] font-black uppercase transition hover:bg-success hover:text-success-foreground hover:border-success"
                  >
                    Unban User
                  </button>
                </td>
              </tr>
            ))}
            {bannedUsers.length === 0 && <tr><td colSpan={5} className="py-20 text-center text-muted-foreground">No banned users found.</td></tr>}
          </Table>
        )}
      </div>
    </main>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left whitespace-nowrap">
        <thead>
          <tr className="bg-secondary/30">
            {headers.map((h) => (
              <th key={h} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}
