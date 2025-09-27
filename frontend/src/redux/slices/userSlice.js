import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";
import { toast } from "react-toastify";

// Fetch users, optionally filtered by role
export const fetchAllUsers = createAsyncThunk(
  "user/fetchAllUsers",
  async (params = {}, { rejectWithValue }) => {
    try {
      // This assumes a backend route /api/user/all that can filter users
      const { data } = await api.get("/user/all", { params });
      return data.users;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// Update a user's profile (as an admin)
export const updateProfileByAdmin = createAsyncThunk(
  "user/updateProfileByAdmin",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/user/admin/update-profile/${id}`, data);

      toast.success(response.data.message || "Profile updated successfully!");
      return response.data.user;
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed.");
      return rejectWithValue(err.response?.data);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [], // To store lists of users, e.g., all admins
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch All Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload?.message || "Failed to fetch users.");
      })
      // Update Profile By Admin
      .addCase(updateProfileByAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileByAdmin.fulfilled, (state, action) => {
        state.loading = false;
        // Update the specific user in the users array if they exist
        const updatedUser = action.payload;
        if (updatedUser) {
          const index = state.users.findIndex(u => u._id === updatedUser._id);
          if (index !== -1) {
            state.users[index] = updatedUser;
          }
        }
      })
      .addCase(updateProfileByAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;

