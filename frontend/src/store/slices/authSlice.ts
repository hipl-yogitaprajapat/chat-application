"use client";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { googlelogin, loginUser, logout, registerAction } from "../action/authAction";
import { setCookies } from "@/utils/commons";

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  message: '',
  success: false,
  token: ""
};

const updatedInitialState: AuthState = {
  ...initialState,
};

export const registerUserThunk = createAsyncThunk<
AuthResponse,
any,
{rejectValue:AuthResponse}
>("auth/register-user",async(userData:any,{rejectWithValue})=>{
    userData;
    const response = await registerAction(userData)
     if (!response.success) return rejectWithValue(response);
  return response;
})


export const loginUserThunk = createAsyncThunk<
AuthResponse,
any,
{rejectValue:AuthResponse}
>("auth/login-user",async(userData:any,{rejectWithValue})=>{
    userData;
    const response = await loginUser(userData)
    if(response.success){
      setCookies("token",response.jwtToken)
      setCookies("is_login",true)
    }
    
     if (!response.success) return rejectWithValue(response);
  return response;
})

export const LogoutUser = createAsyncThunk<
AuthResponse,
void,
{rejectValue:AuthResponse}
>("auth/logout-user",async(_,{rejectWithValue})=>{
      try {
    const response = await logout();
       return response    
  } catch (error) {
    console.log(error);
  }
})

export const googleAuth = createAsyncThunk<
AuthResponse,
any,
{rejectValue:AuthResponse}
>("auth/google-auth",async(code,{rejectWithValue})=>{
    const response = await googlelogin(code)    
       if(response.success){
      setCookies("token",response.token)
      setCookies("is_login",true)
    }
     if (!response.success) return rejectWithValue(response);
   return response;
})


const authSlice = createSlice({
    name:"auth",
    initialState:updatedInitialState,
    reducers:{
      clearMessages: (state) => {
      state.error = null;
      state.message = '';
    },
    },
    extraReducers:(builder)=>{
        builder.addCase(registerUserThunk.pending,(state)=>{
            state.isLoading = true,
            state.error=null
        })
         builder.addCase(registerUserThunk.fulfilled, (state, action) => {    
            state.isLoading = false;
            state.success = true;
            state.user = action.payload;
            state.message = action.payload.message;
        })
        builder.addCase(registerUserThunk.rejected, (state, action) => {
            state.isLoading = true
            state.error = action.payload;
        })
            builder.addCase(loginUserThunk.pending,(state)=>{
            state.isLoading = true,
            state.error=null
        })
         builder.addCase(loginUserThunk.fulfilled, (state, action) => { 
            state.isLoading = false;
            state.success = true;
            state.user = action.payload;
            state.message = action.payload.message;
            localStorage.setItem("userId",action?.payload?._id)
            const fullName = `${action?.payload?.firstName || ""} ${action?.payload?.lastName || ""}`.trim();
            localStorage.setItem("name",fullName)
            localStorage.setItem("company",action?.payload?.company)
        })
        builder.addCase(loginUserThunk.rejected, (state, action) => {
            state.isLoading = true
            state.error = action.payload;
        })
         builder.addCase(LogoutUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        builder.addCase(LogoutUser.fulfilled, (state, action) => {
          console.log(action,"actioniiiii");
          
            state.isLoading = false;
            state.success = true;
            state.message = action.payload.message;
            state.user = action.payload;
            localStorage.removeItem("name")
            localStorage.removeItem("company")
            localStorage.removeItem("userId")
        })
        builder.addCase(LogoutUser.rejected, (state, action) => {
            state.isLoading = true
            state.error = action.payload;

        })
         builder.addCase(googleAuth.pending, (state) => {
            state.isLoading = true;
            state.error = null;
            state.success = false;

        })
        builder.addCase(googleAuth.fulfilled, (state, action) => {
            state.isLoading = false;
            state.success = true;
            state.message = action.payload.message;
        })
        builder.addCase(googleAuth.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.success = false;
        });

    }
})

export const {clearMessages}= authSlice.actions;
export default authSlice.reducer;