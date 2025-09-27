import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPsychologists } from "../../redux/slices/psychologistSlice";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import UpdatePsychologistPopup from "../../popups/UpdatePsychologistPopup";
import Modal from "../../components/common/Modal";
import api from "../../api/api";
import { toast } from "react-toastify";

export default function ManagePsychologists() {
  const dispatch = useDispatch();
  const { psychologists, loading } = useSelector((state) => state.psychologist);

  const [searchTerm, setSearchTerm] = useState("");
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [selectedPsychologist, setSelectedPsychologist] = useState(null);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [psychologistToDelete, setPsychologistToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchPsychologists({ search: searchTerm }));
  }, [dispatch, searchTerm]);

  const filteredPsychologists = psychologists.filter((psy) => {
    const term = searchTerm.toLowerCase();
    return (
      (psy.username || "").toLowerCase().includes(term) ||
      (psy.email || "").toLowerCase().includes(term) ||
      (psy.institution?.instituteName || "").toLowerCase().includes(term) ||
      (psy.institution?.collegeCode || "").toLowerCase().includes(term)
    );
  });

  const handleUpdateClick = (psy) => {
    setSelectedPsychologist(psy);
    setShowUpdatePopup(true);
  };

  const handleDeleteClick = (id) => {
    setPsychologistToDelete(id);
    setShowConfirmDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!psychologistToDelete) return;
    try {
      await api.delete(`/user/delete/${psychologistToDelete}`);
      toast.success("Deleted successfully");
      dispatch(fetchPsychologists({ search: searchTerm }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Deletion failed");
    } finally {
      setShowConfirmDeleteModal(false);
      setPsychologistToDelete(null);
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Psychologists</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, institute or code..."
            className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md text-gray-900 dark:text-gray-200"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl shadow-lg bg-white/20 dark:bg-gray-800/20 backdrop-blur-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/30 dark:bg-gray-700/30 sticky top-0 z-10 backdrop-blur-md">
            <tr>
              <th className="px-4 sm:px-6 py-3">Name</th>
              <th className="px-4 sm:px-6 py-3">Email</th>
              <th className="px-4 sm:px-6 py-3">Institute</th>
              <th className="px-4 sm:px-6 py-3">College Code</th>
              <th className="px-4 sm:px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading && filteredPsychologists.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500 dark:text-gray-300">
                  Loading...
                </td>
              </tr>
            ) : filteredPsychologists.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500 dark:text-gray-300">
                  No matching psychologists found.
                </td>
              </tr>
            ) : (
              filteredPsychologists.map((psy) => (
                <tr
                  key={psy._id}
                  className="transition-all duration-300 hover:shadow-lg hover:bg-white/30 dark:hover:bg-gray-700/30"
                >
                  <td className="px-4 sm:px-6 py-4">{psy.username}</td>
                  <td className="px-4 sm:px-6 py-4">{psy.email}</td>
                  <td className="px-4 sm:px-6 py-4">{psy.institution?.instituteName || "N/A"}</td>
                  <td className="px-4 sm:px-6 py-4">{psy.institution?.collegeCode || "N/A"}</td>
                  <td className="px-4 sm:px-6 py-4 flex gap-3 justify-center">
                    <button
                      onClick={() => handleUpdateClick(psy)}
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(psy._id)}
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

      {/* UPDATE POPUP */}
      {showUpdatePopup && selectedPsychologist && (
        <UpdatePsychologistPopup
          isOpen={showUpdatePopup}
          onClose={() => setShowUpdatePopup(false)}
          psychologistToEdit={selectedPsychologist}
          onSuccess={() => dispatch(fetchPsychologists({ search: searchTerm }))}
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
              This will delete the psychologist permanently.
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
