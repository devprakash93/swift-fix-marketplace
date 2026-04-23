import { Clock, MapPin, Truck, Wrench, CheckCircle2 } from "lucide-react";
import { type BookingStatus } from "@/context/AppContext";

export function StatusBadge({ status }: { status: BookingStatus }) {
  const configs: Record<BookingStatus, { color: string; label: string; icon: any; pulse?: boolean }> = {
    pending: { color: "bg-muted text-muted-foreground border-border", label: "Pending", icon: Clock },
    searching: { color: "bg-blue-500/15 text-blue-500 border-blue-500/30", label: "Searching", icon: MapPin, pulse: true },
    assigned: { color: "bg-primary/15 text-primary border-primary/30", label: "Assigned", icon: Wrench },
    enroute: { color: "bg-orange-500/15 text-orange-500 border-orange-500/30", label: "En Route", icon: Truck, pulse: true },
    arrived: { color: "bg-indigo-500/15 text-indigo-500 border-indigo-500/30", label: "Arrived", icon: MapPin },
    in_progress: { color: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30", label: "In Progress", icon: Wrench, pulse: true },
    completed: { color: "bg-success/15 text-success border-success/30", label: "Completed", icon: CheckCircle2 },
    cancelled: { color: "bg-destructive/15 text-destructive border-destructive/30", label: "Cancelled", icon: Clock },
    rescheduled: { color: "bg-accent/15 text-accent border-accent/30", label: "Rescheduled", icon: Clock },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${config.color}`}>
      {config.pulse ? (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 bg-current`} />
        </span>
      ) : (
        <Icon className="h-3 w-3" />
      )}
      {config.label}
    </span>
  );
}
