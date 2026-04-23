import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import Message from './models/Message.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Attach Socket.io to Request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('SwiftFix API is running. Access /api endpoints.');
});
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join', ({ userId, role }) => {
    socket.join(userId);
    socket.join('global'); // Everyone joins global room
    if (role === 'admin') {
      socket.join('admin');
      console.log(`Admin ${userId} joined admin room`);
    }
    console.log(`User ${userId} joined personal and global rooms`);
  });

  socket.on('joinJob', (jobId) => {
    socket.join(jobId);
    console.log(`User joined job room: ${jobId}`);
  });

  socket.on('updateLocation', ({ proId, coordinates }) => {
    // Broadcast to global so both discovery maps and active tracking get live updates
    io.emit('plumberLocationUpdate', { 
      proId, 
      location: { type: 'Point', coordinates } 
    });
  });

  socket.on('sendMessage', async (data) => {
    const { jobId, senderId, content } = data;
    try {
      const message = await Message.create({ job: jobId, sender: senderId, content });
      io.to(jobId).emit('newMessage', message);
    } catch (err) {
      console.error('Socket message error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
