import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { User as UserIcon, MapPin, Hammer, Car, CheckCircle2 } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// Fix leaflet icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const createCustomIcon = (iconHtml: string, className: string) => 
  L.divIcon({
    html: iconHtml,
    className,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });

const customerHtml = renderToString(
  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background shadow-lg border-2 border-background">
    <MapPin className="h-5 w-5" />
  </div>
);
const customerIcon = createCustomIcon(customerHtml, 'customer-marker');

const proHtml = renderToString(
  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg border-2 border-background">
    <Car className="h-5 w-5" />
  </div>
);
const proIcon = createCustomIcon(proHtml, 'pro-marker');

const availableHtml = renderToString(
  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-success-foreground shadow-lg border-2 border-background">
    <Hammer className="h-5 w-5" />
  </div>
);
const availableIcon = createCustomIcon(availableHtml, 'available-marker');

const offlineHtml = renderToString(
  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-lg border-2 border-background">
    <Hammer className="h-5 w-5" />
  </div>
);
const offlineIcon = createCustomIcon(offlineHtml, 'offline-marker');


// Component to handle route fetching and drawing
function RoutePolyline({ start, end, onRouteCalculated }: { start: [number, number], end: [number, number], onRouteCalculated?: (data: { duration: number, distance: number }) => void }) {
  const [route, setRoute] = useState<[number, number][]>([]);

  useEffect(() => {
    if (!start || !end) return;
    let isMounted = true;
    
    const fetchRoute = async () => {
      try {
        // OSRM coordinates are [longitude, latitude]
        const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (isMounted && data.code === 'Ok') {
          // OSRM returns [lon, lat], leaflet needs [lat, lon]
          const coordinates = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
          setRoute(coordinates);
          if (onRouteCalculated) {
            onRouteCalculated({ duration: data.routes[0].duration, distance: data.routes[0].distance });
          }
        }
      } catch (err) {
        console.error("Failed to fetch route", err);
      }
    };
    
    fetchRoute();
    return () => { isMounted = false; };
  }, [start, end]);

  if (!route.length) return null;
  
  return (
    <>
      {/* Route shadow for 3D effect */}
      <Polyline positions={route} pathOptions={{ color: 'black', weight: 8, opacity: 0.2 }} />
      <Polyline positions={route} pathOptions={{ color: 'var(--color-primary, #6366f1)', weight: 4, opacity: 0.8, dashArray: '10, 10', lineCap: 'round' }} />
    </>
  );
}

// Auto-fit bounds when coordinates change
function AutoFitBounds({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [coords, map]);
  return null;
}

// Smooth marker component for live tracking
function SmoothMarker({ position, icon, title }: { position: [number, number], icon: L.Icon | L.DivIcon, title?: string }) {
  const markerRef = useRef<L.Marker>(null);
  
  useEffect(() => {
    if (markerRef.current) {
      // Use Leaflet's setLatLng for smoother DOM updates instead of React re-render
      markerRef.current.setLatLng(position);
    }
  }, [position]);

  return <Marker ref={markerRef} position={position} icon={icon} title={title} />;
}

export interface LiveMapProps {
  customerCoords?: [number, number] | null;
  proCoords?: [number, number] | null;
  professionals?: Array<{
    _id: string;
    name: string;
    rating: number;
    basePrice?: number;
    location: { coordinates: [number, number] }; // [lon, lat]
    isOnline: boolean;
  }>;
  mode: 'discovery' | 'tracking';
  height?: string;
  onProSelect?: (pro: any) => void;
  onRouteCalculated?: (data: { duration: number, distance: number }) => void;
}

export function LiveMap({ customerCoords, proCoords, professionals = [], mode, height = "100%", onProSelect, onRouteCalculated }: LiveMapProps) {
  // Default center (London approx) if nothing provided
  const center: [number, number] = customerCoords || proCoords || [51.5074, -0.1276];
  
  // Collect coordinates for bounding box
  const allCoords: [number, number][] = [];
  if (customerCoords) allCoords.push(customerCoords);
  if (proCoords && mode === 'tracking') allCoords.push(proCoords);
  if (mode === 'discovery' && professionals.length > 0) {
    professionals.forEach(p => {
      // Mongo uses [lon, lat], convert to [lat, lon]
      if (p.location?.coordinates) {
        allCoords.push([p.location.coordinates[1], p.location.coordinates[0]]);
      }
    });
  }

  return (
    <div className={`w-full relative overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-[var(--shadow-card)] z-0`} style={{ height }}>
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={false} 
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {/* Bounds management */}
        {allCoords.length > 0 && <AutoFitBounds coords={allCoords} />}

        {/* Customer Location */}
        {customerCoords && (
          <Marker position={customerCoords} icon={customerIcon}>
            <Popup className="rounded-2xl shadow-xl border-0">
              <div className="font-bold text-sm">Your Location</div>
            </Popup>
          </Marker>
        )}

        {/* Live Tracking Mode */}
        {mode === 'tracking' && proCoords && (
          <>
            <SmoothMarker position={proCoords} icon={proIcon} />
            {customerCoords && <RoutePolyline start={proCoords} end={customerCoords} onRouteCalculated={onRouteCalculated} />}
          </>
        )}

        {/* Discovery Mode */}
        {mode === 'discovery' && professionals.map(pro => {
          if (!pro.location?.coordinates) return null;
          // Mongo coordinates are [lon, lat]
          const pos: [number, number] = [pro.location.coordinates[1], pro.location.coordinates[0]];
          
          return (
            <Marker 
              key={pro._id} 
              position={pos} 
              icon={pro.isOnline ? availableIcon : offlineIcon}
              eventHandlers={{
                click: () => onProSelect && onProSelect(pro)
              }}
            >
              <Popup className="rounded-2xl shadow-xl border-0 p-0 overflow-hidden">
                <div className="p-4 bg-card w-48">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${pro.isOnline ? 'bg-success' : 'bg-muted'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {pro.isOnline ? 'Available' : 'Offline'}
                    </span>
                  </div>
                  <h4 className="font-black text-lg mb-1">{pro.name}</h4>
                  <div className="flex items-center gap-1 text-sm font-bold text-yellow-500">
                    ★ {pro.rating.toFixed(1)}
                  </div>
                  {pro.basePrice && (
                    <div className="mt-3 text-sm font-bold text-foreground">
                      Est. ₹{pro.basePrice}/hr
                    </div>
                  )}
                  {onProSelect && (
                    <button 
                      onClick={() => onProSelect(pro)}
                      className="mt-3 w-full bg-primary text-primary-foreground text-xs font-black py-2 rounded-xl"
                    >
                      View Profile
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Decorative gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none z-10" />
    </div>
  );
}
