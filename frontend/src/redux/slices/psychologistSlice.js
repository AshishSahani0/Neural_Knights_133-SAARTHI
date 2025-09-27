// src/redux/slices/psychologistSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import { toast } from "react-toastify";

// ---------------------- Thunks ----------------------

// 1️⃣ All Psychologists (for Admins)
export const fetchPsychologists = createAsyncThunk(
  "psychologist/fetchPsychologists",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/user/all-psychologists", { params });
      return data; // { psychologists, page, totalPages, total }
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch psychologists" });
    }
  }
);

// 2️⃣ For Student: Only from their institution
export const fetchPsychologistsForStudent = createAsyncThunk(
  "psychologist/fetchPsychologistsForStudent",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/user/student/psychologists");
      return data.psychologists;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch college psychologists" });
    }
  }
);

// 3️⃣ Register Psychologist
export const registerPsychologist = createAsyncThunk(
  "psychologist/registerPsychologist",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/user/register-psychologist", formData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to register psychologist" });
    }
  }
);

// 4️⃣ Update by Admin
export const updatePsychologistByAdmin = createAsyncThunk(
  "psychologist/updatePsychologistByAdmin",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/user/admin/update-profile/${id}`, formData);
      return data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to update psychologist" });
    }
  }
);

// 5️⃣ Delete
export const deletePsychologist = createAsyncThunk(
  "psychologist/deletePsychologist",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/user/admin/delete/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to delete psychologist" });
    }
  }
);

// ---------------------- Initial State ----------------------
const initialState = {
  psychologists: [],
  studentPsychologists: [],
  loading: false,
  page: 1,
  totalPages: 1,
  total: 0,
};

// ---------------------- Slice ----------------------
const psychologistSlice = createSlice({
  name: "psychologist",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const handlePending = (state) => { state.loading = true; };
    const handleRejected = (state, { payload }) => {
      state.loading = false;
      toast.error(payload?.message || "Something went wrong");
    };

    // -------- Admin: Fetch All
    builder
      .addCase(fetchPsychologists.pending, handlePending)
      .addCase(fetchPsychologists.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.psychologists = payload.psychologists || [];
        state.page = payload.page || 1;
        state.totalPages = payload.totalPages || 1;
        state.total = payload.total || 0;
      })
      .addCase(fetchPsychologists.rejected, handleRejected);

    // -------- Student: Fetch only institution Psychologists
    builder
      .addCase(fetchPsychologistsForStudent.pending, handlePending)
      .addCase(fetchPsychologistsForStudent.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.studentPsychologists = payload || [];
      })
      .addCase(fetchPsychologistsForStudent.rejected, handleRejected);

    // -------- Register
    builder
      .addCase(registerPsychologist.pending, handlePending)
      .addCase(registerPsychologist.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload?.psychologist) {
          state.psychologists.unshift(payload.psychologist);
          state.total += 1;
          toast.success(payload.message || "Psychologist registered");
        }
      })
      .addCase(registerPsychologist.rejected, handleRejected);

    // -------- Update
    builder
      .addCase(updatePsychologistByAdmin.pending, handlePending)
      .addCase(updatePsychologistByAdmin.fulfilled, (state, { payload }) => {
        state.loading = false;
        const index = state.psychologists.findIndex(p => p._id === payload._id);
        if (index !== -1) state.psychologists[index] = payload;
        toast.success("Psychologist updated");
      })
      .addCase(updatePsychologistByAdmin.rejected, handleRejected);

    // -------- Delete
    builder
      .addCase(deletePsychologist.pending, handlePending)
      .addCase(deletePsychologist.fulfilled, (state, { payload: id }) => {
        state.loading = false;
        state.psychologists = state.psychologists.filter(p => p._id !== id);
        state.total = Math.max(0, state.total - 1);
        toast.success("Psychologist deleted");
      })
      .addCase(deletePsychologist.rejected, handleRejected);
  },
});

export default psychologistSlice.reducer;
