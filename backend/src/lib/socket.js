import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,  
  },
    transports: ["websocket", "polling"],
});

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
  }

const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
    console.log("A user connected", socket.id);
    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;
    console.log(userId,"userid");
    
    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

     socket.on("userTyping", ({ senderId, receiverId, isTyping }) => {
    console.log(`${senderId} is typing for ${receiverId}: ${isTyping}`);
    
    // Emit only to the specific receiver
    // socket.to(receiverId).emit("userTyping", { senderId, isTyping });
     const receiverSocketId = userSocketMap[receiverId];
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("userTyping", { senderId, isTyping });
  }
  });
    
    socket.on("disconnect", () => {
      console.log("A user disconnected", socket.id);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

export { io, app, server };
