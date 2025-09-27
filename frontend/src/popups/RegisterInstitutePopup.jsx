import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { registerInstitute } from "../redux/slices/instituteSlice";
import Modal from "../components/common/Modal";
import { toast } from "react-toastify";

export default function RegisterInstitutePopup({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.institute);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = (data) => {
    dispatch(registerInstitute(data)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        toast.success("Institute registered successfully!");
        reset();
        onClose();
      } else {
        toast.error(res.payload?.message || "Registration failed.");
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-full sm:max-w-md">
      <div className="relative p-6 sm:p-8 bg-white/20 dark:bg-gray-900/20 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-full sm:max-w-md mx-auto transform transition-all duration-300 ease-in-out scale-95 sm:scale-100 opacity-100">
        <h3 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800 dark:text-white text-center">
          Register New Institute
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Institute Name */}
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Institute Name</label>
            <input
              {...register("instituteName", { required: "Institute name is required" })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition outline-none bg-white/30 dark:bg-gray-800/30 text-gray-900 dark:text-gray-100 shadow-sm"
              placeholder="NIET Greater Noida"
            />
            {errors.instituteName && <p className="text-red-500 text-sm mt-1">{errors.instituteName.message}</p>}
          </div>

          {/* Email Domain */}
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Email Domain</label>
            <input
              {...register("emailDomain", { required: "Email domain is required" })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition outline-none bg-white/30 dark:bg-gray-800/30 text-gray-900 dark:text-gray-100 shadow-sm"
              placeholder="@niet.co.in"
            />
            {errors.emailDomain && <p className="text-red-500 text-sm mt-1">{errors.emailDomain.message}</p>}
          </div>

          {/* College Code */}
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">College Code</label>
            <input
              {...register("collegeCode", { required: "College code is required" })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition outline-none bg-white/30 dark:bg-gray-800/30 text-gray-900 dark:text-gray-100 shadow-sm"
              placeholder="12345"
            />
            {errors.collegeCode && <p className="text-red-500 text-sm mt-1">{errors.collegeCode.message}</p>}
          </div>

          {/* Contact Email */}
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Contact Email</label>
            <input
              {...register("contactEmail", {
                required: "Contact email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email format",
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition outline-none bg-white/30 dark:bg-gray-800/30 text-gray-900 dark:text-gray-100 shadow-sm"
              placeholder="admin@niet.co.in"
            />
            {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Password</label>
            <input
              type="password"
              {...register("password", {
                required: "Password is required",
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/,
                  message: "8-16 chars with uppercase, lowercase, number & special char",
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition outline-none bg-white/30 dark:bg-gray-800/30 text-gray-900 dark:text-gray-100 shadow-sm"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-semibold shadow-md"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </Modal>
  );
}
