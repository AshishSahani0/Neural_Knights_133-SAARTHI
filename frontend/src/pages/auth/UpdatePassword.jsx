import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { updatePassword } from "../../redux/slices/authSlice";
import { logoutUser } from "../../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


export default function UpdatePassword() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const newPassword = watch("newPassword");

const navigate = useNavigate();

const onSubmit = async (data) => {
  const result = await dispatch(updatePassword(data));

  if (result.meta.requestStatus === "fulfilled") {
    await dispatch(logoutUser()); // Log out user to clear session
    toast.success("Password updated successfully. Please login again.");
    navigate("/login"); // Navigate to login page
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4 sm:p-6">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800">
          Update Your Password
        </h2>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          For security, you must update the temporary password provided.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full p-2 border rounded mt-1 bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Current Password</label>
            <input
              {...register("currentPassword", { required: "Current password is required" })}
              type="password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">New Password</label>
            <input
              {...register("newPassword", {
                required: "New password is required",
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/,
                  message: "Password must be 8-16 chars, with uppercase, lowercase, number & special char.",
                },
              })}
              type="password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              {...register("confirmNewPassword", {
                required: "Please confirm your new password",
                validate: value => value === newPassword || "Passwords do not match",
              })}
              type="password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.confirmNewPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmNewPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
