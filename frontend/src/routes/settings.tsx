import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  User, Phone, Image as ImageIcon, Lock, Shield, Briefcase, ChevronRight,
  Save, Eye, EyeOff, Check, Loader2
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { UserService } from "@/services/api";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — FlowFix" }] }),
});

function SettingsPage() {
  const { user, setUser } = useApp();
  const [activeSection, setActiveSection] = useState<"profile" | "security">("profile");

  // Profile form
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState((user as any)?.phone || "");
  const [avatar, setAvatar] = useState((user as any)?.avatar || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  if (!user) {
    return (
      <div className="p-20 text-center">
        Please <Link to="/login" className="text-primary font-bold hover:underline">log in</Link> to view settings.
      </div>
    );
  }

  const dashboardPath = user.role === "plumber" ? "/plumber" : user.role === "admin" ? "/admin" : "/customer";

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await UserService.updateProfile({ name, phone, avatar });
      setUser({ ...user, name: updated.name, ...(updated as any) });
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSavingPassword(true);
    try {
      await UserService.updatePassword({ currentPassword, newPassword });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      toast.success("Password changed successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  const roleColor = user.role === "admin" ? "text-destructive" : user.role === "plumber" ? "text-primary" : "text-success";
  const roleBg = user.role === "admin" ? "bg-destructive/10" : user.role === "plumber" ? "bg-primary/10" : "bg-success/10";

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-10">
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Account</p>
        <h1 className="text-4xl font-black tracking-tight mt-1">Settings</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px,1fr]">
        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Profile Card */}
          <div className="rounded-[2rem] border border-border bg-card p-6 shadow-[var(--shadow-card)] text-center">
            <div className="relative inline-block mb-4">
              <img
                src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                className="h-20 w-20 rounded-2xl bg-secondary object-cover shadow-[var(--shadow-soft)] mx-auto"
                alt="Avatar"
              />
              <span className={`absolute -bottom-2 -right-2 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${roleBg} ${roleColor}`}>
                {user.role}
              </span>
            </div>
            <p className="font-black text-lg">{user.name}</p>
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
          </div>

          {/* Nav */}
          <nav className="rounded-[2rem] border border-border bg-card p-3 shadow-[var(--shadow-card)] space-y-1">
            {[
              { id: "profile" as const, label: "Profile", icon: User, desc: "Name, phone, avatar" },
              { id: "security" as const, label: "Security", icon: Lock, desc: "Change password" },
            ].map(({ id, label, icon: Icon, desc }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition ${activeSection === id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${activeSection === id ? "bg-white/20" : "bg-secondary"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold leading-none">{label}</p>
                  <p className={`text-[10px] uppercase tracking-widest mt-1 ${activeSection === id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50 shrink-0" />
              </button>
            ))}

            <div className="pt-2 border-t border-border mt-2">
              <Link
                to={dashboardPath}
                className="w-full flex items-center gap-3 rounded-xl p-3 hover:bg-secondary transition"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold leading-none">My Dashboard</p>
                  <p className="text-[10px] uppercase tracking-widest mt-1 text-muted-foreground">Go to dashboard</p>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50 shrink-0" />
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="space-y-6">
          {activeSection === "profile" && (
            <form onSubmit={handleSaveProfile} className="rounded-[2rem] border border-border bg-card p-8 shadow-[var(--shadow-card)]">
              <div className="mb-8">
                <h2 className="text-2xl font-black">Profile Information</h2>
                <p className="text-sm text-muted-foreground mt-1">Update your personal details visible across FlowFix.</p>
              </div>

              <div className="space-y-6">
                {/* Avatar Preview */}
                <div className="flex items-center gap-6 p-6 rounded-2xl bg-secondary/30 border border-border">
                  <img
                    src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    className="h-20 w-20 rounded-2xl bg-secondary object-cover shadow-sm shrink-0"
                    alt="Avatar Preview"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Avatar URL</p>
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="url"
                        value={avatar}
                        onChange={e => setAvatar(e.target.value)}
                        placeholder="https://example.com/photo.jpg"
                        className="input-field pl-10 w-full text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your full name"
                      className="input-field pl-10 w-full"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="input-field pl-10 w-full"
                    />
                  </div>
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block">Email Address</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="input-field pl-10 w-full opacity-60 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 font-bold">Email cannot be changed for security reasons.</p>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-2 rounded-xl bg-foreground text-background px-8 py-3 font-bold text-sm transition hover:opacity-90 disabled:opacity-50 shadow-lg"
                >
                  {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {savingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {activeSection === "security" && (
            <form onSubmit={handleSavePassword} className="rounded-[2rem] border border-border bg-card p-8 shadow-[var(--shadow-card)]">
              <div className="mb-8">
                <h2 className="text-2xl font-black">Change Password</h2>
                <p className="text-sm text-muted-foreground mt-1">Keep your account safe with a strong, unique password.</p>
              </div>

              <div className="space-y-6">
                {/* Current Password */}
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type={showCurrent ? "text" : "password"}
                      required
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="input-field pl-10 pr-12 w-full"
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type={showNew ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="input-field pl-10 pr-12 w-full"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block">Confirm New Password</label>
                  <div className="relative">
                    <Check className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className={`input-field pl-10 w-full transition ${confirmPassword && newPassword !== confirmPassword ? "border-destructive" : confirmPassword && newPassword === confirmPassword ? "border-success" : ""}`}
                    />
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-[10px] text-destructive mt-1.5 font-bold">Passwords do not match.</p>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="flex items-center gap-2 rounded-xl bg-foreground text-background px-8 py-3 font-bold text-sm transition hover:opacity-90 disabled:opacity-50 shadow-lg"
                >
                  {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                  {savingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
