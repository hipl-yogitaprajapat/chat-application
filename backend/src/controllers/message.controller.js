import mongoose from "mongoose";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";


export const getUsersForSidebar = async (req, res) => {
    try {
      const loggedInUserId = req.user._id;
      const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    //   console.log(filteredUsers,"filteredUsers");
      
  
      res.status(200).json(filteredUsers);
    } catch (error) {
      console.error("Error in getUsersForSidebar: ", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };


    export const getMessages = async (req, res) => {
    try {
      const { id: userToChatId } = req.params;
      const myId = req.user._id;
  
      const messages = await Message.find({
        $or: [
          { senderId: myId, receiverId: userToChatId },
          { senderId: userToChatId, receiverId: myId },
        ],
      });
  
      res.status(200).json(messages);
    } catch (error) {
      console.log("Error in getMessages controller: ", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  export const sendMessage = async (req, res) => {
    try {
      const { text } = req.body;
      const { id: receiverId } = req.params;
      const senderId = req.user._id;
  
      const newMessage = new Message({
        senderId,
        receiverId,
        text,
        attachment: req.file ? `/uploads/${req.file.filename}` : null,
        isRead:false,
        delivered:false
      });
      console.log(newMessage,"newMessage");
  
      await newMessage.save();

  const unreadCount = await Message.aggregate([
  { $match: { receiverId: new mongoose.Types.ObjectId(receiverId), isRead: false } },
  { $group: { _id: "$senderId", count: { $sum: 1 } } }
]);
    console.log(unreadCount,"unreadCount");
    
  
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
         io.to(receiverSocketId).emit("unreadCountsUpdate", unreadCount);
      }
  
      res.status(201).json(newMessage);
    } catch (error) {
      console.log("Error in sendMessage controller: ", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };

export const markMessagesAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;
    const myId = req.user._id;

    await Message.updateMany(
      { senderId, receiverId: myId, isRead: false },
      { $set: { isRead: true } }
    );

    // Recalculate unread counts for sidebar
    const unreadCounts = await Message.aggregate([
      { $match: { receiverId: myId, isRead: false } },
      { $group: { _id: "$senderId", count: { $sum: 1 } } }
    ]);

    const receiverSocketId = getReceiverSocketId(myId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("unreadCountsUpdate", unreadCounts);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error in markMessagesAsRead:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    // Update message only if the logged-in user is the sender
    const updatedMessage = await Message.findOneAndUpdate(
      { _id: messageId, senderId: userId },
      { $set: { text, edited: true } }, // optional 'edited' flag
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: "Message not found or unauthorized" });
    }

    // Emit real-time update to receiver if online
    const receiverSocketId = getReceiverSocketId(updatedMessage.receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageEdited", updatedMessage);
    }

    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error("Error in editMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    // Delete message only if the logged-in user is the sender
    const deletedMessage = await Message.findOneAndDelete(
      { _id: messageId, senderId: userId },
      { $set: { text: "This message has been deleted", deleted: true } },
      { new: true }
    );

    if (!deletedMessage) {
      return res.status(404).json({ error: "Message not found or unauthorized" });
    }

    // Emit real-time update to receiver if online
    const receiverSocketId = getReceiverSocketId(deletedMessage.receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", { messageId: deletedMessage._id });
    }

    res.status(200).json({ success: true, messageId: deletedMessage._id });
  } catch (error) {
    console.error("Error in deleteMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


