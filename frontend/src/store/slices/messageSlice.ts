"use client";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { registerAction } from "../action/authAction";
import { chathistory, chatSidebar, markMessagesAsReadApi, sendChatMessage } from "../action/messageAction";

const initialState: MessageState = {
  users: [],
  isLoading: false,
  error: null,
  text: '',
  message: "",
  messages: [],
  success: false,
  onlineUsers: [],
  selectedUser: null,
  unreadCounts: {},
};

const updatedInitialState: MessageState = {
  ...initialState,
};

export const chatSidebarThunk = createAsyncThunk<
  MessageResponse,
  void,
  { rejectValue: MessageResponse }
>("auth/chat-sidebar", async (_, { rejectWithValue }) => {
  const response = await chatSidebar()
  return response;
})

export const sendMessageThunk = createAsyncThunk(
  "chat/sendMessage",
  async ({ receiverId, formData }: { receiverId: string; formData: FormData }) => {
    return await sendChatMessage(receiverId, formData);
  }
);

export const fetchChatHistoryThunk = createAsyncThunk(
  "chat/fetchChatHistory",
  async (id: string, { rejectWithValue }) => {
    try {
      return await chathistory(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch messages");
    }
  }
);

export const markMessagesAsReadThunk = createAsyncThunk(
  "chat/markMessagesAsRead",
  async (senderId: string, { rejectWithValue }) => {
    try {
      await markMessagesAsReadApi(senderId);
      return senderId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to mark messages as read");
    }
  }
);


const chatSlice = createSlice({
  name: "auth",
  initialState: updatedInitialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.message = '';
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setUnreadCounts: (state, action) => {
      const arr = action.payload || [];
      const map: Record<string, number> = {};
      arr.forEach((it:any) => {
        if (it && it._id) map[String(it._id)] = it.count || 0;
      });
      state.unreadCounts = map;
    },
    clearUnread: (state, action) => {
      state.unreadCounts[action.payload] = 0;
    },
    incrementUnread: (state, action) => {
  const userId = action.payload;
  state.unreadCounts[userId] = (state.unreadCounts[userId] || 0) + 1;
},
  },
  extraReducers: (builder) => {
    builder.addCase(chatSidebarThunk.pending, (state) => {
      state.isLoading = true,
        state.error = null
    })
    builder.addCase(chatSidebarThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.success = true;
      state.users = action.payload;
    })
    builder.addCase(chatSidebarThunk.rejected, (state, action) => {
      state.isLoading = true
      // state.error = action.payload;
    })
    builder.addCase(sendMessageThunk.pending, (state) => {
      state.isLoading = true,
        state.error = null
    })
    builder.addCase(sendMessageThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.success = true;
    })
    builder.addCase(sendMessageThunk.rejected, (state, action) => {
      state.isLoading = true
      state.error = action.payload;
    })

    builder.addCase(fetchChatHistoryThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addCase(fetchChatHistoryThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.success = true;
      state.messages = action.payload;
    });

    builder.addCase(fetchChatHistoryThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
      builder.addCase(markMessagesAsReadThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(markMessagesAsReadThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.success = true;
      const senderId = action.payload as string;
      state.unreadCounts[senderId] = 0;
    });

    builder.addCase(markMessagesAsReadThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  }
})

export const { clearMessages, setSelectedUser, addMessage, setMessages, setOnlineUsers,setUnreadCounts,clearUnread } = chatSlice.actions;
export default chatSlice.reducer;