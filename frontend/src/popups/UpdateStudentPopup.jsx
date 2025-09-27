import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import Modal from "../components/common/Modal";
import { toast } from "react-toastify";
import { updateStudentByAdmin } from "../redux/slices/studentsSlice";

export default function UpdateStudentPopup({ isOpen, onClose, student, onSuccess }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.students);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: student?.username || "",
      email: student?.email || "",
    },
  });

  useEffect(() => {
    reset({
      username: student?.username || "",
      email: student?.email || "",
    });
  }, [student, reset]);

  const onSubmit = async (formData) => {
    if (!student?._id) return;
    try {
      await dispatch(updateStudentByAdmin({ id: student._id, formData })).unwrap();
      toast.success("Student updated successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.message || "Failed to update student");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="p-6 bg-white/20 dark:bg-gray-900/30 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-gray-700 transition-all">
        <h3 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800 dark:text-white text-center">
          Update Student
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              {...register("username", { required: "Name is required" })}
              className="w-full px-4 py-2 mt-2 rounded-lg border border-white/30 dark:border-gray-600 bg-white/30 dark:bg-gray-800/30 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              placeholder="Enter name"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email format",
                },
              })}
              className="w-full px-4 py-2 mt-2 rounded-lg border border-white/30 dark:border-gray-600 bg-white/30 dark:bg-gray-800/30 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              placeholder="Enter email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
            <input
              type="password"
              {...register("password", {
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/,
                  message: "Password must be 8-16 chars with upper, lower, number, special char",
                },
              })}
              className="w-full px-4 py-2 mt-2 rounded-lg border border-white/30 dark:border-gray-600 bg-white/30 dark:bg-gray-800/30 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              placeholder="New Password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition text-sm sm:text-base font-medium"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </form>
      </div>
    </Modal>
  );
}
