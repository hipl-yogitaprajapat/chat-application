import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/message.model.js";
import mongoose from "mongoose";

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

io.on("connection", async (socket) => {
    console.log("A user connected", socket.id);
    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;
    console.log(userId,"userid");

const unreadCounts = await Message.aggregate([
    { $match: { receiverId: new mongoose.Types.ObjectId(userId), isRead: false } },
    { $group: { _id: "$senderId", count: { $sum: 1 } } }
  ]);

  const formattedUnreadCounts = unreadCounts.map(c => ({
  senderId: c._id.toString(),
  count: c.count
}));

  io.to(socket.id).emit("initialUnreadCounts", formattedUnreadCounts);

    
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
