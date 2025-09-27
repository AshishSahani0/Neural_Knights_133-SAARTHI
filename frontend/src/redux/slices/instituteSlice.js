import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import { toast } from "react-toastify";

// ---------------------- Async Thunks ----------------------

// 1️⃣ Fetch All Institutes (MainAdmin only)
export const fetchInstitutes = createAsyncThunk(
  "institute/fetchInstitutes",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/user/all-institutes", { params });
      return data; // ✅ data = { success, institutes, total, page, totalPages }
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch institutes" });
    }
  }
);

// 2️⃣ Register a New Institute (MainAdmin only)
export const registerInstitute = createAsyncThunk(
  "institute/registerInstitute",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/user/register-institute", formData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to register institute" });
    }
  }
);

// ---------------------- Initial State ----------------------
const initialState = {
  institutes: [],
  total: 0,
  page: 1,
  totalPages: 1,
  loading: false,
};

// ---------------------- Slice ----------------------
const instituteSlice = createSlice({
  name: "institute",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.loading = true;
    };

    const handleRejected = (state, { payload }) => {
      state.loading = false;
      toast.error(payload?.message || "Something went wrong");
    };

    // 🔄 Fetch Institutes
    builder
      .addCase(fetchInstitutes.pending, handlePending)
      .addCase(fetchInstitutes.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.institutes = payload.institutes || []; // ✅ Corrected from `institutions`
        state.total = payload.total || 0;
        state.page = payload.page || 1;
        state.totalPages = payload.totalPages || 1;
      })
      .addCase(fetchInstitutes.rejected, handleRejected);

    // 🆕 Register Institute
    builder
      .addCase(registerInstitute.pending, handlePending)
      .addCase(registerInstitute.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload?.institute) {
          state.institutes.unshift(payload.institute); // Add to top
          state.total += 1;
          toast.success(payload.message || "Institute registered successfully!");
        } else {
          toast.warn("Institute registered but response is incomplete.");
        }
      })
      .addCase(registerInstitute.rejected, handleRejected);
  },
});

export default instituteSlice.reducer;
