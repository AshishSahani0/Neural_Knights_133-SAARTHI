import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Modal from "../components/common/Modal";
import { registerPsychologist } from "../redux/slices/psychologistSlice";

export default function RegisterPsychologistPopup({ isOpen, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.psychologist);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = (formData) => {
    dispatch(registerPsychologist(formData)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        toast.success(res.payload?.message || "Psychologist registered");
        reset();
        onSuccess?.();
        onClose();
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="p-6 sm:p-8 bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-xl">
        <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 dark:text-white text-center">
          Register New Psychologist
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200">Username</label>
            <input
              {...register("username", { required: "Username is required" })}
              className="w-full px-4 py-2 rounded-xl border border-white/30 dark:border-gray-600 bg-white/20 dark:bg-gray-700/20 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="e.g., Dr. Smith"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200">Email</label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email format",
                },
              })}
              className="w-full px-4 py-2 rounded-xl border border-white/30 dark:border-gray-600 bg-white/20 dark:bg-gray-700/20 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="e.g., psychologist@college.edu"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200">Password</label>
            <input
              type="password"
              {...register("password", {
                required: "Password is required",
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/,
                  message: "Password must be 8-16 characters with uppercase, lowercase, number & special character",
                },
              })}
              className="w-full px-4 py-2 rounded-xl border border-white/30 dark:border-gray-600 bg-white/20 dark:bg-gray-700/20 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="Strong password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:bg-blue-300"
          >
            {loading ? "Registering..." : "Register Psychologist"}
          </button>
        </form>
      </div>
    </Modal>
  );
}
