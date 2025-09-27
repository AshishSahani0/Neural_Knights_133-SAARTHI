import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import { toast } from "react-toastify";

// Fetch all MainAdmin data (students, psychologists, institutes)
export const fetchMainAdminData = createAsyncThunk(
  "mainAdmin/fetchData",
  async (_, { rejectWithValue }) => {
    try {
      const [studentsRes, psychologistsRes, institutesRes] = await Promise.all([
        api.get("/user/all-students"),
        api.get("/user/all-psychologists"),
        api.get("/user/all-institutes"),
      ]);

      return {
        students: studentsRes?.data?.students || [],
        psychologists: psychologistsRes?.data?.psychologists || [],
        institutes: institutesRes?.data?.institutes || [],
      };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to fetch data.";
      toast.error(message);
      return rejectWithValue({ message });
    }
  }
);

const mainAdminSlice = createSlice({
  name: "mainAdmin",
  initialState: {
    students: [],
    psychologists: [],
    institutes: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMainAdminData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMainAdminData.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload.students;
        state.psychologists = action.payload.psychologists;
        state.institutes = action.payload.institutes;
      })
      .addCase(fetchMainAdminData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Error fetching data";
        state.students = [];
        state.psychologists = [];
        state.institutes = [];
      });
  },
});

export default mainAdminSlice.reducer;
