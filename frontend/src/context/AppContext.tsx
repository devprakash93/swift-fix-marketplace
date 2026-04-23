import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { AuthService, BookingService } from "@/services/api";
import { socket, connectSocket, disconnectSocket } from "@/services/socket";
import { toast } from "sonner";

export type Role = "customer" | "plumber" | "admin";
export type BookingStatus =
  | "pending"
  | "searching"
  | "assigned"
  | "enroute"
  | "arrived"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "rescheduled";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  walletBalance?: number;
  avatar?: string;
}

export interface Booking {
  _id: string;
  customer: string | User;
  professional?: string | User;
  service: any;
  category: any;
  description: string;
  address: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  schedule: {
    bookingType: "instant" | "scheduled";
    dateTime: string;
  };
  pricing: {
    basePrice: number;
    addons: { name: string; price: number }[];
    totalAmount: number;
    discount?: number;
    commission?: number;
    paymentStatus: "pending" | "paid" | "refunded";
    paymentMethod: "cash" | "stripe" | "wallet";
  };
  status: BookingStatus;
  history?: {
    status: string;
    timestamp: string;
    note?: string;
  }[];
  createdAt: string;
}

interface AppState {
  user: User | null;
  setUser: (u: User | null) => void;
  currentBooking: Booking | null;
  setCurrentBooking: (b: Booking | null) => void;
  plumberOnline: boolean;
  setPlumberOnline: (v: boolean) => void;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  loading: boolean;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [plumberOnline, setPlumberOnline] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const data = await AuthService.getMe();
          setUser({ 
            id: data._id, 
            name: data.name, 
            email: data.email, 
            role: data.role,
            walletBalance: data.walletBalance 
          });
          setPlumberOnline(data.isOnline || false);
          connectSocket(data._id, data.role);
          
          socket.on('globalAnnouncement', (data) => {
            const { message, type } = data;
            if (type === 'error') toast.error(message, { duration: 10000 });
            else if (type === 'warning') toast.warning(message, { duration: 10000 });
            else toast.info(`📢 Announcement: ${message}`, { duration: 10000, style: { background: 'var(--primary)', color: 'white', border: 'none' }});
          });

          socket.on('bookingStatusUpdate', (updatedBooking) => {
            setBookings(prev => {
              const idx = prev.findIndex(b => b._id === updatedBooking._id);
              if (idx > -1) {
                const newBookings = [...prev];
                newBookings[idx] = updatedBooking;
                return newBookings;
              }
              return [updatedBooking, ...prev];
            });
            setCurrentBooking(prev => {
              if (prev && prev._id === updatedBooking._id) {
                return updatedBooking;
              }
              return prev;
            });
          });
          
          try {
            const history = await BookingService.getHistory();
            setBookings(history);
          } catch(e) {
            console.error("Failed to load booking history", e);
          }
        } catch (err) {
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };
    init();

    return () => {
      socket.off('globalAnnouncement');
      socket.off('bookingStatusUpdate');
      disconnectSocket();
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        currentBooking,
        setCurrentBooking,
        plumberOnline,
        setPlumberOnline,
        bookings,
        setBookings,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
