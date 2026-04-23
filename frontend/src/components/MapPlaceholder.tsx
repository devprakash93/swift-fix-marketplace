import { MapPin, Navigation, Compass } from "lucide-react";

export function MapPlaceholder({ label, active = true }: { label: string, active?: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-[var(--shadow-card)] aspect-video md:aspect-[21/9] flex items-center justify-center group">
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-card/20 to-transparent" />
      
      {active ? (
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <Navigation className="h-6 w-6" />
            </div>
            
            {/* Simulated route dots */}
            <div className="absolute top-1/2 left-full w-24 h-0.5 border-t-2 border-dashed border-primary/50" />
            
            {/* Professional dot */}
            <div className="absolute top-1/2 left-[calc(100%+6rem)] -translate-y-1/2">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg">
                <MapPin className="h-4 w-4" />
              </div>
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="font-bold text-sm mt-1">Live Tracking Active</p>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center opacity-50">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-muted-foreground mb-4">
            <Compass className="h-6 w-6" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Map Offline</p>
        </div>
      )}
    </div>
  );
}
