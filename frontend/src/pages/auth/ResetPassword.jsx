import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword } from "../../redux/slices/authSlice";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();
  const { loading } = useSelector((state) => state.auth);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const newPassword = watch("password");

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await dispatch(resetPassword({ token, passwords: data })).unwrap();
      toast.success(res.message || "Password reset successful");
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Reset failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 sm:p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8 w-full max-w-md">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Reset Password
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block font-medium text-gray-700 mb-1">New Password</label>
            <input
              {...register("password", {
                required: "New password is required",
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,16}$/,
                  message:
                    "Password must be 8-16 chars with uppercase, lowercase, number & special char",
                },
              })}
              type="password"
              placeholder="Enter new password"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              {...register("confirmPassword", { required: "Please confirm password" })}
              type="password"
              placeholder="Re-enter new password"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-green-300 transition-colors"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
