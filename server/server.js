// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const socketio = require('socket.io');
const authRoutes = require('./routes/auth');
const Message = require('./models/Message');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = socketio(server, { cors: { origin: '*' } });

app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes);

// map userId -> socketId
const onlineUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    socket.userId = payload.id;
    next();
  } catch (err) {
    next();
  }
});

io.on('connection', (socket) => {
  if (socket.userId) {
    onlineUsers.set(String(socket.userId), socket.id);
    io.emit('presence:update', Array.from(onlineUsers.keys()));
  }

  socket.on('private:send', async ({ toUserId, content }) => {
    if (!socket.userId) return;
    try {
      const msg = await Message.create({ from: socket.userId, to: toUserId, content });
      const toSocket = onlineUsers.get(String(toUserId));
      if (toSocket) io.to(toSocket).emit('private:message', msg);
      socket.emit('private:message', msg);
    } catch (err) {
      console.error('send error', err);
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(String(socket.userId));
      io.emit('presence:update', Array.from(onlineUsers.keys()));
    }
  });
});

const start = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/messenger';
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => console.log('Server listening on', PORT));
};

start().catch(err => console.error(err));