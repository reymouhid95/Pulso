import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { refreshAccessToken } from "../services/AuthServices";

export const refreshAccessTokenAsync = createAsyncThunk(
  "auth/refreshAcczssToken",
  async (refreshToken, { dispatch, rejectWithValue }) => {
    try {
      const response = await refreshAccessToken(refreshToken);
      dispatch(setToken(response)); 
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  user: null,
  user_id: null, 
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.user_id = action.payload ? action.payload.user_id : null; 
    },
    setToken: (state, action) => {
      state.user = action.payload.user;
      state.user_id = action.payload.user_id; 
      state.token = action.payload.access;
      state.expiry = action.payload.expiry
    },
    logout: (state) => {
      state.user = null;
      state.user_id = null; 
      state.token = null;
      state.expiry = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(refreshAccessTokenAsync.fulfilled, (state, action) => {
      const { access, user } = action.payload;
      state.token = access;
      state.user = user;
      state.expiry = action.payload.expiry;
    });
    builder.addCase(refreshAccessTokenAsync.rejected, (state, action) => {
      state.user = null;
      state.token = null;
      state.expiry = null;
      throw action.error;
    });
  },
});

const persistConfig = {
  key: 'auth',
  storage,
};

export const persistedAuthReducer = persistReducer(persistConfig, authSlice.reducer);

export const { setUser, setToken, logout } = authSlice.actions;
export const selectUser = (state) => state.auth.user;
export const selectUserId = (state) => state.auth.user_id; 
export const selectToken = (state) => state.auth.token;
export const selectTokenExpiry = (state) => state.auth.expiry;

export default persistedAuthReducer;
