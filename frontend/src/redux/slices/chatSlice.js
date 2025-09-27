import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

// ----------------- FETCH CHAT HISTORY -----------------
export const fetchChatHistory = createAsyncThunk(
  "chat/fetchChatHistory",
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/chat/${roomId}`);
      return response.data.messages?.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    activeRoomId: null,
    loading: false,
    error: null,
    lastMessageAt: null,
  },
  reducers: {
    addMessage: (state, action) => {
      const exists = state.messages.some((msg) => msg._id === action.payload._id);
      if (!exists) {
        state.messages.push(action.payload);
        state.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        state.lastMessageAt = state.messages[state.messages.length - 1]?.createdAt;
      }
    },
    mergeMessages: (state, action) => {
      const incoming = action.payload || [];
      let updated = false;
      incoming.forEach((msg) => {
        const exists = state.messages.some((m) => m._id === msg._id);
        if (!exists) {
          state.messages.push(msg);
          updated = true;
        }
      });
      if (updated) {
        state.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        state.lastMessageAt = state.messages[state.messages.length - 1]?.createdAt;
      }
    },
    updateMessageReadBy: (state, action) => {
      const { messageId, userId } = action.payload;
      const msg = state.messages.find((m) => m._id === messageId);
      if (msg && !msg.readBy?.includes(userId)) {
        msg.readBy = [...(msg.readBy || []), userId];
      }
    },
    removeMessage: (state, action) => {
      state.messages = state.messages.filter((msg) => msg._id !== action.payload);
      state.lastMessageAt = state.messages[state.messages.length - 1]?.createdAt || null;
    },
    clearChat: (state) => {
      state.messages = [];
      state.activeRoomId = null;
      state.error = null;
      state.lastMessageAt = null;
    },
    setActiveRoomId: (state, action) => { state.activeRoomId = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
    setLoading: (state, action) => { state.loading = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
        state.lastMessageAt = state.messages[state.messages.length - 1]?.createdAt || null;
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const {
  addMessage,
  mergeMessages,
  updateMessageReadBy,
  removeMessage,
  clearChat,
  setActiveRoomId,
  setError,
  setLoading,
} = chatSlice.actions;

export default chatSlice.reducer;