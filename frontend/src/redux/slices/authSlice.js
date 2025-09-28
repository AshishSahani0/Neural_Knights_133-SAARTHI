import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import { toast } from "react-toastify";

const VERIFICATION_EMAIL_KEY = "emailForVerification";

// -------------------- Thunks --------------------

// Registration
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/register", userData, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// OTP Verification
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (otpData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/verify-otp", otpData, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// Resend OTP
export const resendOtp = createAsyncThunk(
  "auth/resendOtp",
  async ({ email }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/resend-otp", { email }, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// Load user
export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/auth/me", { withCredentials: true });
      return data.user;
    } catch {
      console.error("loadUser error:", err);
      return rejectWithValue(null);
    }
  }
);

// Login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await api.post("/auth/login", credentials, { withCredentials: true });
      await dispatch(loadUser());
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// Logout
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/auth/logout", { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// Forgot Password
export const forgotPassword = createAsyncThunk( // Corrected function name
  "auth/forgotPassword",
  async (emailData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/forgot-password", emailData, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// Reset Password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, passwords }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/auth/reset-password/${token}`, passwords, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// Update Password
export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async (passwords, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/auth/update-password", passwords, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// Update Profile
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/user/update-profile", profileData, {
        headers: {"Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// -------------------- Slice --------------------
const initialState = {
  user: null,
  isAuthenticated: null, // initially unknown
  loading: false,
  otpRequired: false,
  registeredEmail: localStorage.getItem(VERIFICATION_EMAIL_KEY) || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthStates: (state) => {
      state.loading = false;
      state.otpRequired = false;
      state.registeredEmail = null;
      localStorage.removeItem(VERIFICATION_EMAIL_KEY);
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => { state.loading = true; };
    const handleRejected = (state, { payload }) => {
      state.loading = false;
      if (payload?.message) toast.error(payload.message);
    };

    builder
      // register / OTP
      .addCase(registerUser.pending, handlePending)
      .addCase(registerUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.otpRequired = true;
        state.registeredEmail = payload.user.email;
        localStorage.setItem(VERIFICATION_EMAIL_KEY, payload.user.email);
        toast.success(payload.message);
      })
      .addCase(registerUser.rejected, handleRejected)

      .addCase(verifyOtp.pending, handlePending)
      .addCase(verifyOtp.fulfilled, (state) => {
        state.loading = false;
        state.otpRequired = false;
        state.registeredEmail = null;
        localStorage.removeItem(VERIFICATION_EMAIL_KEY);
        toast.success("OTP verified successfully");
      })
      .addCase(verifyOtp.rejected, handleRejected)

      .addCase(resendOtp.pending, handlePending)
      .addCase(resendOtp.fulfilled, (state, { payload }) => {
        state.loading = false;
        toast.success(payload.message);
      })
      .addCase(resendOtp.rejected, handleRejected)

      // login / logout
      .addCase(loginUser.pending, handlePending)
      .addCase(loginUser.fulfilled, (state) => { state.loading = false; toast.success("Login successful"); })
      .addCase(loginUser.rejected, handleRejected)

      .addCase(logoutUser.pending, handlePending)
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        toast.success("Logged out successfully");
      })
      .addCase(logoutUser.rejected, handleRejected)

      // load user
      .addCase(loadUser.pending, handlePending)
      .addCase(loadUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
        state.isAuthenticated = !!payload;
      })
      .addCase(loadUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      // update password / profile
      .addCase(updatePassword.pending, handlePending)
      .addCase(updatePassword.fulfilled, (state, { payload }) => {
        state.loading = false;
        toast.success(payload.message || "Password updated successfully");
      })
      .addCase(updatePassword.rejected, handleRejected)

      .addCase(updateProfile.pending, handlePending)
      .addCase(updateProfile.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload.user || state.user;
        toast.success(payload.message || "Profile updated successfully");
      })
      .addCase(updateProfile.rejected, handleRejected)

      // forgot/reset
      .addCase(forgotPassword.pending, handlePending)
      .addCase(forgotPassword.fulfilled, (state, { payload }) => {
        state.loading = false;
        toast.success(payload.message);
      })
      .addCase(forgotPassword.rejected, handleRejected)

      .addCase(resetPassword.pending, handlePending)
      .addCase(resetPassword.fulfilled, (state, { payload }) => {
        state.loading = false;
        toast.success(payload.message);
      })
      .addCase(resetPassword.rejected, handleRejected);
  },
});

export const { clearAuthStates } = authSlice.actions;
export default authSlice.reducer;
