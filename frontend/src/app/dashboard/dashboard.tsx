"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { connectSocket, getSocket, disconnectSocket } from "../../lib/socket";
import { addMessage, fetchChatHistoryThunk, sendMessageThunk } from "@/store/slices/messageSlice";

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { selectedUser,messages  } = useAppSelector((state) => state.messages);
  const [message, setMessage] = useState("");
  

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    console.log(userId,"userId");
    
    if (userId) {
      connectSocket(userId);
    }

    const socket = getSocket();
    if (!socket) return;

    socket.on("newMessage", (msg) => {
      console.log(msg,"msg");
      dispatch(addMessage(msg));
    });

    return () => {
      socket?.off("newMessage");
      disconnectSocket();
    };
  }, []);

useEffect(() => {
  if (selectedUser) {
    dispatch(fetchChatHistoryThunk(selectedUser._id));
  }
}, [selectedUser, dispatch]);

const handleSend = () => {
  if (!message.trim() || !selectedUser) return;

  const newMsg = {
    text: message,
    senderId: localStorage.getItem("userId"),
    receiverId: selectedUser._id,
    createdAt: new Date().toISOString(),
  };

  dispatch(addMessage(newMsg));

  dispatch(sendMessageThunk({ receiverId: selectedUser._id, text: message }));

  setMessage("");
};

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex flex-col flex-1">
        {!selectedUser ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl font-bold">Welcome to Chatty!</h2>
            <p className="text-base-content/60">
              Select a conversation from the sidebar to start chatting
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center gap-2">
              <img
                src={`https://ui-avatars.com/api/?name=${selectedUser.firstName}+${selectedUser.lastName}`}
                alt={selectedUser.firstName}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <h2 className="font-semibold">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h2>
                <p className="text-xs text-green-500">● Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.senderId === localStorage.getItem("userId")
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div className="bg-blue-100 p-3 rounded-lg max-w-sm">
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t flex items-center gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write Something..."
                className="flex-1 p-2 rounded-full border bg-gray-50"
              />
              <button
                onClick={handleSend}
                className="p-2 bg-blue-500 text-white rounded-full px-4"
              >
                ➤
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
