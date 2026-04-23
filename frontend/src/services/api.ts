import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const AuthService = {
  login: async (credentials: any) => {
    const { data } = await api.post("/auth/login", credentials);
    return data;
  },
  signup: async (userData: any) => {
    const { data } = await api.post("/auth/signup", userData);
    return data;
  },
  getMe: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },
};

export const ServiceService = {
  getCategories: async () => {
    const { data } = await api.get("/services/categories");
    return data;
  },
  getServicesByCategory: async (categoryId: string) => {
    const { data } = await api.get(`/services/categories/${categoryId}/services`);
    return data;
  },
  getServiceDetails: async (id: string) => {
    const { data } = await api.get(`/services/${id}`);
    return data;
  },
};

export const BookingService = {
  create: async (payload: any) => {
    const { data } = await api.post("/bookings", payload);
    return data;
  },
  getHistory: async () => {
    const { data } = await api.get("/bookings/history");
    return data;
  },
  updateStatus: async (id: string, status: string, note?: string) => {
    const { data } = await api.put(`/bookings/${id}/status`, { status, note });
    return data;
  },
  cancel: async (id: string) => {
    const { data } = await api.delete(`/bookings/${id}`);
    return data;
  },
  getMessages: async (id: string) => {
    const { data } = await api.get(`/bookings/${id}/messages`);
    return data;
  },
  getCoupons: async () => {
    const { data } = await api.get('/bookings/coupons');
    return data;
  }
};

export const PaymentService = {
  createIntent: async (bookingId: string) => {
    const { data } = await api.post("/payments/create-intent", { bookingId });
    return data;
  },
  confirm: async (payload: { bookingId: string; transactionId: string }) => {
    const { data } = await api.post("/payments/confirm", payload);
    return data;
  },
};

export const PlumberService = {
  toggleOnline: async (isOnline: boolean) => {
    const { data } = await api.put("/users/online", { isOnline });
    return data;
  },
};

export const UserService = {
  getOnlineProfessionals: async () => {
    const { data } = await api.get("/users/online-pros");
    return data;
  },
  updateProfile: async (payload: { name?: string; phone?: string; avatar?: string }) => {
    const { data } = await api.put("/users/profile", payload);
    return data;
  },
  updatePassword: async (payload: { currentPassword: string; newPassword: string }) => {
    const { data } = await api.put("/users/password", payload);
    return data;
  },
};

export const AdminService = {
  getStats: async () => {
    const { data } = await api.get("/admin/stats");
    return data;
  },
  getUsers: async () => {
    const { data } = await api.get("/admin/users");
    return data;
  },
  getPlumbers: async () => {
    const { data } = await api.get("/admin/plumbers");
    return data;
  },
  approveKyc: async (id: string, status: string, suspendDays?: number | 'permanent') => {
    const { data } = await api.put(`/admin/kyc/${id}`, { status, suspendDays });
    return data;
  },
  settlePayout: async (id: string) => {
    const { data } = await api.put(`/admin/payouts/${id}`);
    return data;
  },
  createCategory: async (payload: any) => {
    const { data } = await api.post(`/admin/categories`, payload);
    return data;
  },
  deleteCategory: async (id: string) => {
    const { data } = await api.delete(`/admin/categories/${id}`);
    return data;
  },
  createService: async (payload: any) => {
    const { data } = await api.post(`/admin/services`, payload);
    return data;
  },
  deleteService: async (id: string) => {
    const { data } = await api.delete(`/admin/services/${id}`);
    return data;
  },
  createCoupon: async (payload: any) => {
    const { data } = await api.post(`/admin/coupons`, payload);
    return data;
  },
  getCoupons: async () => {
    const { data } = await api.get(`/admin/coupons`);
    return data;
  },
  toggleCoupon: async (id: string) => {
    const { data } = await api.put(`/admin/coupons/${id}/toggle`);
    return data;
  },
  broadcastGlobal: async (message: string, type: 'info' | 'warning' | 'error' = 'info') => {
    const { data } = await api.post('/admin/broadcast', { message, type });
    return data;
  },
  createPlumber: async (payload: { name: string; email: string; password: string; phone?: string }) => {
    const { data } = await api.post('/admin/plumbers', payload);
    return data;
  },
  getBannedUsers: async () => {
    const { data } = await api.get('/admin/banned');
    return data;
  }
};

export default api;
