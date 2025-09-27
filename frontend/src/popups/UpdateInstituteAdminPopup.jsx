import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Modal from "../components/common/Modal";
import { updateProfileByAdmin } from "../redux/slices/userSlice";
import { fetchInstitutes } from "../redux/slices/instituteSlice";

export default function UpdateInstituteAdminPopup({ isOpen, onClose, instituteToEdit, adminToEdit }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.user);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm();

  useEffect(() => {
    if (instituteToEdit) {
      reset({
        instituteName: instituteToEdit.instituteName || "",
        emailDomain: instituteToEdit.emailDomain || "",
        collegeCode: instituteToEdit.collegeCode || "",
        contactEmail: instituteToEdit.contactEmail || "",
      });
    }
  }, [instituteToEdit, reset]);

  const onSubmit = async (formData) => {
    if (!isDirty) {
      toast.info("No changes made.");
      return;
    }

    dispatch(updateProfileByAdmin({ id: adminToEdit._id, data: formData })).then((result) => {
      if (updateProfileByAdmin.fulfilled.match(result)) {
        toast.success("Institute updated successfully!");
        dispatch(fetchInstitutes());
        onClose();
      } else {
        toast.error(result.payload?.message || "Update failed");
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-full sm:max-w-lg">
      <div className="bg-white rounded-xl shadow p-5 sm:p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Update Institution Details</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Institute Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Institute Name</label>
            <input
              {...register("instituteName", { required: "Institute name is required" })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.instituteName && (
              <p className="text-red-500 text-xs mt-1">{errors.instituteName.message}</p>
            )}
          </div>

          {/* Email Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Domain</label>
            <input
              {...register("emailDomain", { required: "Domain is required" })}
              placeholder="@example.com"
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.emailDomain && (
              <p className="text-red-500 text-xs mt-1">{errors.emailDomain.message}</p>
            )}
          </div>

          {/* College Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700">College Code</label>
            <input
              {...register("collegeCode", { required: "College code is required" })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.collegeCode && (
              <p className="text-red-500 text-xs mt-1">{errors.collegeCode.message}</p>
            )}
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Email</label>
            <input
              {...register("contactEmail")}
              type="email"
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
