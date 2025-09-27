import { useSelector, useDispatch } from "react-redux";
import { updateProfile, logoutUser } from "../redux/slices/authSlice";
import { useForm } from "react-hook-form";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import Modal from "../components/common/Modal";
import { toast } from "react-toastify";
import { useState } from "react";

export default function SettingsPopup({ isOpen, onClose }) {
  const { user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [animateSuccess, setAnimateSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const triggerSuccessAnimation = () => {
    setAnimateSuccess(true);
    setTimeout(() => setAnimateSuccess(false), 800);
  };

  const handleSubmitProfile = async (data) => {
    try {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("email", data.email);
      if (data.password) formData.append("password", data.password);
      if (data.profileImage) formData.append("profileImage", data.profileImage[0]);

      await dispatch(updateProfile(formData)).unwrap();

      toast.success("Profile updated successfully!");
      triggerSuccessAnimation();

      reset({
        username: data.username,
        email: data.email,
        password: "",
        confirmPassword: "",
      });

      onClose();
    } catch (err) {
      toast.error(err?.message || "Failed to update profile.");
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setValue("profileImage", e.target.files);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="p-4 sm:p-6 rounded-2xl bg-white/30 dark:bg-gray-800/20 backdrop-blur-md border border-white/20 dark:border-gray-700 shadow-2xl transition-all">
        
        {/* Profile Image & Header */}
        <div className={`text-center mb-6 transition-transform duration-500 ${animateSuccess ? "scale-105" : ""}`}>
          <label htmlFor="profileImageInput" className="relative cursor-pointer group inline-block">
            <img
              src={user?.profileImage?.url || "/default-avatar.jpg"}
              alt="Profile"
              className={`w-24 h-24 rounded-full border-4 border-white object-cover mx-auto shadow-lg transition-transform ${
                animateSuccess ? "scale-110" : ""
              }`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/default-avatar.jpg";
              }}
            />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
              Change
            </div>
          </label>
          <input
            id="profileImageInput"
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageSelect}
          />
          <h3 className={`text-xl font-semibold mt-3 text-gray-800 dark:text-white ${animateSuccess ? "text-green-500" : ""}`}>
            {user?.username}
          </h3>
          <p className={`text-sm text-gray-600 dark:text-gray-300 ${animateSuccess ? "text-green-500" : ""}`}>
            {user?.email}
          </p>
          <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded">
            {user?.role || "User"}
          </span>
        </div>

        {/* Profile Update Form */}
        <form onSubmit={handleSubmit(handleSubmitProfile)} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            {...register("username", { required: "Name is required" })}
            className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-gray-900/40 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          />
          {errors.username && <p className="text-red-500 text-xs">{errors.username.message}</p>}

          <input
            type="email"
            placeholder="Email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email",
              },
            })}
            className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-gray-900/40 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}

          <input
            type="password"
            placeholder="New Password"
            {...register("password", {
              minLength: { value: 8, message: "Minimum 8 characters" },
              maxLength: { value: 16, message: "Maximum 16 characters" },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                message: "Must include uppercase, lowercase, number, special char",
              },
            })}
            className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-gray-900/40 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          />
          {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}

          <input
            type="password"
            placeholder="Confirm Password"
            {...register("confirmPassword", {
              validate: (value) => value === password || "Passwords do not match",
            })}
            className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-gray-900/40 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all text-sm"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>

        {/* Logout Button */}
        <button
          onClick={() => dispatch(logoutUser())}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all text-sm"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          Logout
        </button>
      </div>
    </Modal>
  );
}
