import { io } from "socket.io-client";

let socketBaseUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "http://localhost:5000";
// Render injects raw host without protocol
if (socketBaseUrl && !socketBaseUrl.startsWith("http")) {
  if (!socketBaseUrl.includes('.')) {
    socketBaseUrl = `${socketBaseUrl}.onrender.com`;
  }
  socketBaseUrl = `https://${socketBaseUrl}`;
}

const SOCKET_URL = socketBaseUrl;

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
