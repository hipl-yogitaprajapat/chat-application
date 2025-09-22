"use client";
import { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { connectSocket, getSocket, disconnectSocket } from "../../lib/socket";
import { addMessage, deleteMessageThunk, fetchChatHistoryThunk, markMessageDeleted, markMessagesAsReadThunk, sendMessageThunk, setOnlineUsers, setUnreadCounts } from "@/store/slices/messageSlice";
import { toast } from "react-toastify";

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { selectedUser, messages, onlineUsers } = useAppSelector((state) => state.messages);
  // console.log(messages, "messagesssss");

  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null | undefined>(null);
  // console.log(menuOpenId, "menuOpenId");

  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      connectSocket(userId);
    }

    const socket = getSocket();
    if (!socket) return;

    socket.on("initialUnreadCounts", (data) => {
      dispatch(setUnreadCounts(data));
    });

    socket.on("newMessage", (msg) => {
      dispatch(addMessage(msg));
      if (!selectedUser || msg.senderId !== selectedUser._id) {
        dispatch({
          type: "messages/incrementUnread",
          payload: msg.senderId,
        });
      } else {
        dispatch(markMessagesAsReadThunk(msg.senderId));
        // dispatch(clearUnread(msg.senderId));
      }
    });

    socket.on("getOnlineUsers", (users) => {
      dispatch(setOnlineUsers(users));
    });

    socket.on("unreadCountsUpdate", (data) => {
      dispatch(setUnreadCounts(data));
    });

    // listen for typing
    socket.on("userTyping", ({ senderId, isTyping }) => {
      if (selectedUser && senderId === selectedUser._id) {
        setIsTyping(isTyping);
      }
    });

    
  socket.on("messageDeleted", ({messageId, text }) => {
    // setMessages((prev) =>
    //   prev.map((msg) =>
    //     msg._id === messageId ? { ...msg, text, deleted: true } : msg
    //   )
    // );
//  const data = dispatch(deleteMessageThunk(messageId))
//  console.log(data,"dataeeeeee");
 dispatch(markMessageDeleted({messageId, text}))
  });

    return () => {
      socket?.off("newMessage");
      socket?.off("unreadCountsUpdate");
      socket?.off("getOnlineUsers");
      socket?.off("userTyping");
      socket?.off("messageDeleted");
      disconnectSocket();
    };
  }, [dispatch, selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      dispatch(fetchChatHistoryThunk(selectedUser._id));
    }
  }, [selectedUser, dispatch]);

  const handleSend = () => {
    if (!message.trim() && !attachment) return;
    if (!selectedUser) return;

    const formData = new FormData();
    formData.append("text", message);
    if (attachment) formData.append("attachment", attachment);


    const newMsg = {
      text: message,
      attachment: attachment ? URL.createObjectURL(attachment) : null,
      senderId: localStorage.getItem("userId"),
      receiverId: selectedUser._id,
      createdAt: new Date().toISOString(),
    };

    dispatch(addMessage(newMsg));
    dispatch(sendMessageThunk({ receiverId: selectedUser._id, formData }));

    setMessage("");
    setAttachment(null);

    const socket = getSocket();
    if (socket && selectedUser) {
      socket.emit("userTyping", {
        senderId: localStorage.getItem("userId"),
        receiverId: selectedUser._id,
        isTyping: false,
      });
    }
  };

  const handleTyping = (e: any) => {
    setMessage(e.target.value);

    const socket = getSocket();
    if (socket && selectedUser) {
      socket.emit("userTyping", {
        senderId: localStorage.getItem("userId"),
        receiverId: selectedUser._id,
        isTyping: true,
      });

      if (typingTimeout.current) clearTimeout(typingTimeout.current);

      typingTimeout.current = setTimeout(() => {
        socket.emit("userTyping", {
          senderId: localStorage.getItem("userId"),
          receiverId: selectedUser._id,
          isTyping: false,
        });
      }, 2000);
    }
  };


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const handleDelete = async (messageId: string) => {
    try {
      const result = await dispatch(deleteMessageThunk(messageId)).unwrap();
      console.log(result, "result");

      // toast.success(result.message)
    } catch (err: any) {
      toast.error(err?.message);
    }
  }

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
                <p className="text-xs">
                  {isTyping ? (
                    <span className="italic text-gray-500">Typing...</span>
                  ) : onlineUsers.includes(selectedUser._id) ? (
                    <span className="text-green-500">● Online</span>
                  ) : (
                    <span className="text-gray-400">● Offline</span>
                  )}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">

              {messages
                .filter((msg) =>
                  (msg.senderId === selectedUser._id &&
                    msg.receiverId === localStorage.getItem("userId")) ||
                  (msg.receiverId === selectedUser._id &&
                    msg.senderId === localStorage.getItem("userId"))
                )
                .map((msg, i) => {
                  const time = msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    : "";

                  const isMyMessage = msg.senderId === localStorage.getItem("userId");

                  return (
                    <div
                      key={i}
                      className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div className="relative group bg-blue-100 p-3 rounded-lg max-w-sm">
                        <p>{msg.text}</p>
                        {msg.attachment && (
                          <a
                            href={msg.attachment}
                            target="_blank"
                            className="text-blue-600 underline block mt-1"
                          >
                            Attachment
                          </a>
                        )}
                        <span className="text-xs text-gray-500 block mt-1 text-right">
                          {time}
                        </span>

                        {/* 3 Dots Button (only show for my own messages) */}
                        {isMyMessage && (
                          <button
                            onClick={() =>
                              setMenuOpenId(menuOpenId === msg.createdAt ? null : msg.createdAt)
                            }
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                          >
                            ⋮
                          </button>
                        )}

                        {/* Dropdown Menu */}
                        {menuOpenId === msg.createdAt && (
                          <div className="absolute right-0 top-8 bg-white border shadow-md rounded-md w-28 z-50">
                            <button
                              className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                            // onClick={() => {
                            //   console.log("Edit", msg);
                            //   setMenuOpenId(null);
                            // }}
                            // onClick={() => handleEdit(msg)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-red-500"
                              // onClick={() => {
                              //   console.log("Delete", msg);
                              //   setMenuOpenId(null);
                              // }}
                              onClick={() => handleDelete(msg?._id)}
                            >
                              🗑 Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t flex items-center gap-2">
              {/* Attachment */}
              <input
                type="file"
                id="attachment"
                className="hidden"
                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
              />
              <label
                htmlFor="attachment"
                className="cursor-pointer p-2 bg-gray-200 rounded-full"
              >
                📎
              </label>

              <input
                value={message}
                onChange={handleTyping}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Write Something..."
                className="flex-1 p-2 rounded-full border bg-gray-50"
              />

              {/* Show selected attachment */}
              {attachment && (
                <span className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                  {attachment.name}
                  <button
                    type="button"
                    className="text-red-500 font-bold"
                    onClick={() => setAttachment(null)}
                  >
                    ×
                  </button>
                </span>
              )}
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
