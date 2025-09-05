"use client";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { registerAction } from "../action/authAction";
import { chathistory, chatSidebar, sendChatMessage } from "../action/messageAction";

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
  async ({ receiverId, text }: { receiverId: string; text: string }) => {
    return await sendChatMessage(receiverId, text);
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
  },
  extraReducers: (builder) => {
    builder.addCase(chatSidebarThunk.pending, (state) => {
      state.isLoading = true,
        state.error = null
    })
    builder.addCase(chatSidebarThunk.fulfilled, (state, action) => {
      console.log(action, "action");
      state.isLoading = false;
      state.success = true;
      state.users = action.payload;

    })
    builder.addCase(chatSidebarThunk.rejected, (state, action) => {
      console.log(action, "action11");

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

  }
})

export const { clearMessages, setSelectedUser, addMessage, setMessages, setOnlineUsers } = chatSlice.actions;
export default chatSlice.reducer;