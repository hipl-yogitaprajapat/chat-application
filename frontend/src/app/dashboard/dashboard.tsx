"use client"
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAppSelector } from "@/store/hooks";

const Dashboard = () => {
  const { selectedUser } = useAppSelector((state) => state.messages); 
  console.log(selectedUser,"selectedUser");
  
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    // dispatch(sendMessageThunk({ receiverId: selectedUser._id, text: message }));
    setMessage("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Chat Area */}
      <div className="flex flex-col flex-1">
        {!selectedUser ? (
          // ✅ Show welcome if no user is selected
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
              {/* Later load from API */}
              <div className="flex">
                <div className="bg-blue-100 p-3 rounded-lg max-w-sm">
                  Hi 👋 this is a sample message
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t flex items-center gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write Something..."
                className="flex-1 p-2 rounded-full border bg-gray-50"
              />
              <button className="p-2">😊</button>
              <button className="p-2">📎</button>
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
