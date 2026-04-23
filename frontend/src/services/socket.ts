import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export const connectSocket = (userId: string, role?: string) => {
  socket.auth = { userId };
  socket.connect();
  socket.emit("join", { userId, role });
};

export const disconnectSocket = () => {
  socket.disconnect();
};
