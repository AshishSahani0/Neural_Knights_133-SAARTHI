import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInstitutes } from "../../redux/slices/instituteSlice.js";
import { fetchAllUsers } from "../../redux/slices/userSlice.js";
import RegisterInstitutePopup from "../../popups/RegisterInstitutePopup.jsx";
import UpdateInstituteAdminPopup from "../../popups/UpdateInstituteAdminPopup.jsx";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";
import api from "../../api/api.js";
import Modal from "../../components/common/Modal.jsx";

export default function ManageInstitutions() {
  const dispatch = useDispatch();
  const { institutes, loading: instituteLoading } = useSelector((state) => state.institute);
  const { users = [], loading: userLoading } = useSelector((state) => state.user);

  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [selectedData, setSelectedData] = useState({ institute: null, admin: null });
  const [itemToDelete, setItemToDelete] = useState(null);
  const [queuedInstituteToEdit, setQueuedInstituteToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchInstitutes());
    dispatch(fetchAllUsers({ role: "InstitutionAdmin" }));
  }, [dispatch]);

  const handleUpdateClick = (institute) => {
    const admin = users.find((user) => String(user.institution?._id || user.institution) === String(institute._id));
    setSelectedData({ institute, admin });
    setShowUpdatePopup(true);
  };

  useEffect(() => {
    if (queuedInstituteToEdit && !userLoading && users.length > 0) {
      const admin = users.find((user) => String(user.institution?._id || user.institution) === String(queuedInstituteToEdit._id));
      if (admin) {
        setSelectedData({ institute: queuedInstituteToEdit, admin });
        setShowUpdatePopup(true);
      } else {
        toast.error("Admin not found after loading");
      }
      setQueuedInstituteToEdit(null);
    }
  }, [userLoading, users, queuedInstituteToEdit]);

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setShowConfirmDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/user/admin/delete/${itemToDelete}`);
      toast.success("Deleted successfully");
      dispatch(fetchInstitutes());
      dispatch(fetchAllUsers({ role: "InstitutionAdmin" }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Deletion failed");
    } finally {
      setShowConfirmDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const isLoading = instituteLoading || userLoading;

  const filteredInstitutes = institutes.filter((inst) => {
    const term = searchTerm.toLowerCase();
    return (
      (inst.instituteName || "").toLowerCase().includes(term) ||
      (inst.emailDomain || "").toLowerCase().includes(term) ||
      (inst.contactEmail || "").toLowerCase().includes(term) ||
      (inst.collegeCode || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 p-4">
      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Institutes</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, domain, email or code..."
            className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md text-gray-900 dark:text-gray-200"
          />
          <button
            onClick={() => setShowRegisterPopup(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 w-full sm:w-auto transition backdrop-blur-md"
          >
            Register New Institute
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl shadow-lg bg-white/20 dark:bg-gray-800/20 backdrop-blur-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/30 dark:bg-gray-700/30 sticky top-0 z-10 backdrop-blur-md">
            <tr>
              <th className="px-4 sm:px-6 py-3">Institute Name</th>
              <th className="px-4 sm:px-6 py-3">Email Domain</th>
              <th className="px-4 sm:px-6 py-3">Contact Email</th>
              <th className="px-4 sm:px-6 py-3">College Code</th>
              <th className="px-4 sm:px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading && filteredInstitutes.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500 dark:text-gray-300">
                  Loading...
                </td>
              </tr>
            ) : filteredInstitutes.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500 dark:text-gray-300">
                  No matching institutes found.
                </td>
              </tr>
            ) : (
              filteredInstitutes.map((inst) => (
                <tr
                  key={inst._id}
                  className="transition-all duration-300 hover:shadow-lg hover:bg-white/30 dark:hover:bg-gray-700/30"
                >
                  <td className="px-4 sm:px-6 py-4">{inst.instituteName}</td>
                  <td className="px-4 sm:px-6 py-4">{inst.emailDomain}</td>
                  <td className="px-4 sm:px-6 py-4">{inst.contactEmail}</td>
                  <td className="px-4 sm:px-6 py-4">{inst.collegeCode}</td>
                  <td className="px-4 sm:px-6 py-4 flex gap-3 justify-center">
                    <button
                      onClick={() => handleUpdateClick(inst)}
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(inst._id)}
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* POPUPS */}
      {showRegisterPopup && (
        <RegisterInstitutePopup
          isOpen={showRegisterPopup}
          onClose={() => setShowRegisterPopup(false)}
        />
      )}

      {showUpdatePopup && selectedData.institute && selectedData.admin && (
        <UpdateInstituteAdminPopup
          isOpen={showUpdatePopup}
          onClose={() => setShowUpdatePopup(false)}
          instituteToEdit={selectedData.institute}
          adminToEdit={selectedData.admin}
          onSuccess={() => {
            dispatch(fetchInstitutes());
            dispatch(fetchAllUsers({ role: "InstitutionAdmin" }));
          }}
        />
      )}

      {/* DELETE MODAL */}
      {showConfirmDeleteModal && (
        <Modal
          isOpen={showConfirmDeleteModal}
          onClose={() => setShowConfirmDeleteModal(false)}
          maxWidth="max-w-md"
        >
          <div className="p-6 bg-white/20 dark:bg-gray-800/20 backdrop-blur-lg rounded-2xl">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Confirm Deletion</h3>
            <p className="text-gray-600 dark:text-gray-200 my-4">
              This will delete the institution and its associated admin.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button
                onClick={() => setShowConfirmDeleteModal(false)}
                className="px-4 py-2 bg-gray-200/50 dark:bg-gray-700/50 rounded w-full sm:w-auto backdrop-blur-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full sm:w-auto backdrop-blur-md"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
