import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import { toast } from "react-toastify";

// -------------------- THUNKS --------------------
export const sendEmergencyAlert = createAsyncThunk(
  "emergency/sendAlert",
  async (messageData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/emergency/alert", messageData);
      toast.success(data.message);
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send emergency alert.");
      return rejectWithValue(err.response?.data);
    }
  }
);

// -------------------- SLICE --------------------
const emergencySlice = createSlice({
  name: "emergency",
  initialState: {
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sendEmergencyAlert.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendEmergencyAlert.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendEmergencyAlert.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default emergencySlice.reducer;