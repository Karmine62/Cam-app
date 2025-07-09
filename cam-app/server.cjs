const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static files from the dist directory (after build)
app.use(express.static(path.join(__dirname, 'dist')));

// Handle mobile route specifically
app.get('/mobile', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Handle root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Store connected devices
const connectedDevices = new Map();

io.on('connection', (socket) => {
  console.log('New connection:', socket.id);

  // Handle mobile device connection
  socket.on('mobile-connect', (deviceId) => {
    connectedDevices.set(deviceId, socket.id);
    console.log('Mobile device connected:', deviceId);
    socket.emit('connection-confirmed');
  });

  // Handle selfie capture from mobile
  socket.on('selfie-captured', (data) => {
    console.log('Selfie received from mobile');
    // Broadcast to desktop
    socket.broadcast.emit('new-selfie', data);
  });

  // Handle desktop connection
  socket.on('desktop-connect', () => {
    console.log('Desktop connected');
    socket.emit('desktop-confirmed');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Remove from connected devices
    for (const [deviceId, socketId] of connectedDevices.entries()) {
      if (socketId === socket.id) {
        connectedDevices.delete(deviceId);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Desktop URL: http://localhost:${PORT}`);
  console.log(`Mobile URL: http://localhost:${PORT}/mobile`);
  console.log(`QR Code URL: http://localhost:${PORT}/mobile`);
}); 