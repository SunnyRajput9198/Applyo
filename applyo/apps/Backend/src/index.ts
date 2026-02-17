import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import pollRoutes from './routes/polls';

const app = express();
const server = http.createServer(app);

// Socket.io for real-time updates
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://applyo-git-main-rajputsny50-gmailcoms-projects.vercel.app",
      "https://applyo-lake.vercel.app"
    ],
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://applyo-git-main-rajputsny50-gmailcoms-projects.vercel.app",
     "https://applyo-lake.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());

// Make io available in routes
app.set('io', io);

// Routes
app.use('/api/polls', pollRoutes);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Join a specific poll room
  socket.on('join-poll', (pollId: number) => {
    socket.join(`poll-${pollId}`);
    console.log(`Socket ${socket.id} joined poll-${pollId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});