import { CheckCircle2, Clock, MapPin, Truck, Wrench } from "lucide-react";

interface TimelineEvent {
  status: string;
  timestamp: string;
  note?: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: "Booking Received", icon: Clock, color: "text-muted-foreground bg-muted" },
  searching: { label: "Locating Pro", icon: MapPin, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  assigned: { label: "Pro Assigned", icon: Wrench, color: "text-primary bg-primary/10 border-primary/20" },
  enroute: { label: "Pro En Route", icon: Truck, color: "text-orange-500 bg-orange-500/10 border-orange-500/20" },
  arrived: { label: "Pro Arrived", icon: MapPin, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
  in_progress: { label: "Work In Progress", icon: Wrench, color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-success bg-success/10 border-success/20" },
};

export function BookingTimeline({ history }: { history: TimelineEvent[] }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
      {history.map((event, index) => {
        const config = STATUS_CONFIG[event.status] || STATUS_CONFIG.pending;
        const Icon = config.icon;
        
        return (
          <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active animate-slide-up-fade" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-card shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 bg-background">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-border bg-card shadow-sm group-hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-sm">{config.label}</h4>
                <time className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</time>
              </div>
              {event.note && <p className="text-xs text-muted-foreground mt-2">{event.note}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
