import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import Modal from "../components/common/Modal";
import { toast } from "react-toastify";
import { updatePsychologistByAdmin } from "../redux/slices/psychologistSlice";

export default function UpdatePsychologistPopup({
  isOpen,
  onClose,
  psychologist,
  onSuccess,
  canEdit = true,
}) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.psychologist);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      username: psychologist?.username || "",
      email: psychologist?.email || "",
      password: "",
    },
  });

  useEffect(() => {
    reset({
      username: psychologist?.username || "",
      email: psychologist?.email || "",
      password: "",
    });
  }, [psychologist, reset]);

  const onSubmit = async (formData) => {
    if (!psychologist?._id) return;
    if (!formData.password) delete formData.password;

    try {
      await dispatch(updatePsychologistByAdmin({ id: psychologist._id, formData })).unwrap();
      toast.success("Psychologist updated successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.message || "Update failed");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-full sm:max-w-md">
      <div className="p-6 sm:p-8 bg-white/20 dark:bg-gray-800/30 backdrop-blur-xl rounded-3xl shadow-2xl w-full sm:w-[90%] md:w-full mx-auto transform transition-all duration-300">
        <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Update Psychologist
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              {...register("username", { required: "Name is required" })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/30 dark:bg-gray-700/30 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm"
              placeholder="Enter name"
              disabled={!canEdit || loading}
            />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email format",
                },
              })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/30 dark:bg-gray-700/30 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm"
              placeholder="Enter email"
              disabled={!canEdit || loading}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input
              type="password"
              {...register("password", {
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/,
                  message: "Password must be 8-16 chars with upper, lower, number & special char",
                },
              })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/30 dark:bg-gray-700/30 focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm"
              placeholder="New Password (leave blank to keep current)"
              disabled={!canEdit || loading}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !canEdit}
            className={`w-full py-3 rounded-2xl text-white text-lg font-semibold transition ${
              canEdit ? "bg-green-600 hover:bg-green-700" : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </form>
      </div>
    </Modal>
  );
}
