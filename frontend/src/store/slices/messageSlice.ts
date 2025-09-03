"use client";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { registerAction } from "../action/authAction";
import { chatSidebar } from "../action/messageAction";

const initialState: MessageState = {
  users: [],
  isLoading: false,
  error: null,
  text: '',
  message:"",
  success: false,
};

const updatedInitialState: MessageState = {
  ...initialState,
};

export const chatSidebarThunk = createAsyncThunk<
MessageResponse,
void,
{rejectValue:MessageResponse}
>("auth/chat-sidebar",async(_,{rejectWithValue})=>{
    const response = await chatSidebar()
  return response;
})



const chatSlice = createSlice({
    name:"auth",
    initialState:updatedInitialState,
    reducers:{
      clearMessages: (state) => {
      state.error = null;
      state.message = '';
    },
    },
    extraReducers:(builder)=>{
        builder.addCase(chatSidebarThunk.pending,(state)=>{
            state.isLoading = true,
            state.error=null
        })
         builder.addCase(chatSidebarThunk.fulfilled, (state, action) => {    
            console.log(action,"action");         
            state.isLoading = false;
            state.success = true;
            state.users = action.payload;

        })
        builder.addCase(chatSidebarThunk.rejected, (state, action) => {
            console.log(action,"action11");
            
            state.isLoading = true
            // state.error = action.payload;
        })
    }
})

export const {clearMessages}= chatSlice.actions;
export default chatSlice.reducer;