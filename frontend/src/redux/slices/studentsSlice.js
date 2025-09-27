import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import { toast } from "react-toastify";

// ----------------- FETCH ALL STUDENTS -----------------
export const fetchAllStudents = createAsyncThunk(
  "students/fetchAllStudents",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/user/all-students", { params });
      return data; // { success, students, total, page, totalPages }
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch students" });
    }
  }
);

// ----------------- DELETE STUDENT -----------------
export const deleteStudent = createAsyncThunk(
  "students/deleteStudent",
  async (studentId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/user/admin/delete/${studentId}`);
      toast.success(data?.message || "Student deleted successfully");
      return studentId;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete student");
      return rejectWithValue(err.response?.data || { message: "Failed to delete student" });
    }
  }
);

// ----------------- UPDATE STUDENT -----------------
export const updateStudentByAdmin = createAsyncThunk(
  "students/updateStudentByAdmin",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/user/admin/update-profile/${id}`, formData);
      toast.success(data?.message || "Student updated successfully");
      return data.user;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update student");
      return rejectWithValue(err.response?.data || { message: "Failed to update student" });
    }
  }
);

// ----------------- GET PSYCHOLOGISTS FOR STUDENT -----------------
export const getPsychologistsForStudent = createAsyncThunk(
  "students/getPsychologistsForStudent",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/user/student/psychologists");
      return data.psychologists || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch psychologists" });
    }
  }
);

// ----------------- Slice -----------------
const studentsSlice = createSlice({
  name: "students",
  initialState: {
    students: [],
    total: 0,
    page: 1,
    totalPages: 1,
    psychologists: [], // 👈 For student-side psychologist list
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    const setLoading = (state) => {
      state.loading = true;
    };

    const setError = (state, { payload }) => {
      state.loading = false;
      toast.error(payload?.message || "Something went wrong");
    };

    builder
      // --- Fetch Students ---
      .addCase(fetchAllStudents.pending, setLoading)
      .addCase(fetchAllStudents.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.students = payload.students || [];
        state.total = payload.total || 0;
        state.page = payload.page || 1;
        state.totalPages = payload.totalPages || 1;
      })
      .addCase(fetchAllStudents.rejected, setError)

      // --- Delete Student ---
      .addCase(deleteStudent.pending, setLoading)
      .addCase(deleteStudent.fulfilled, (state, { payload: deletedId }) => {
        state.loading = false;
        state.students = state.students.filter((s) => s._id !== deletedId);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteStudent.rejected, setError)

      // --- Update Student ---
      .addCase(updateStudentByAdmin.pending, setLoading)
      .addCase(updateStudentByAdmin.fulfilled, (state, { payload: updatedUser }) => {
        state.loading = false;
        const index = state.students.findIndex((s) => s._id === updatedUser._id);
        if (index !== -1) state.students[index] = updatedUser;
      })
      .addCase(updateStudentByAdmin.rejected, setError)

      // --- Get Psychologists for Student ---
      .addCase(getPsychologistsForStudent.pending, setLoading)
      .addCase(getPsychologistsForStudent.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.psychologists = payload;
      })
      .addCase(getPsychologistsForStudent.rejected, setError);
  },
});

export default studentsSlice.reducer;
