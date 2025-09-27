import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPsychologists,
  deletePsychologist,
} from "../../redux/slices/psychologistSlice";
import RegisterPsychologistPopup from "../../popups/RegisterPsychologist";
import UpdatePsychologistPopup from "../../popups/UpdatePsychologistPopup";
import Modal from "../../components/common/Modal";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

export default function InstitutionPsychologists() {
  const dispatch = useDispatch();
  const { psychologists, loading, totalPages } = useSelector(
    (state) => state.psychologist
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [selectedPsychologist, setSelectedPsychologist] = useState(null);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [psychologistToDelete, setPsychologistToDelete] = useState(null);

  const fetchPage = (pageNum) => {
    setCurrentPage(pageNum);
    dispatch(fetchPsychologists({ page: pageNum }));
  };

  useEffect(() => {
    fetchPage(currentPage);
  }, [dispatch, currentPage]);

  const goToPrevious = () => {
    if (currentPage > 1) fetchPage(currentPage - 1);
  };
  const goToNext = () => {
    if (currentPage < (totalPages || 1)) fetchPage(currentPage + 1);
  };
  const handleUpdateClick = (psychologist) =>
    setSelectedPsychologist(psychologist);
  const handleDeleteClick = (id) => {
    setPsychologistToDelete(id);
    setShowConfirmDeleteModal(true);
  };
  const confirmDelete = async () => {
    if (!psychologistToDelete) return;
    await dispatch(deletePsychologist(psychologistToDelete));
    setShowConfirmDeleteModal(false);
    setPsychologistToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
          Manage Psychologists
        </h2>
        <button
          onClick={() => setShowRegisterPopup(true)}
          className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md text-gray-900 dark:text-white px-4 py-2 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 flex items-center gap-2 transition shadow-md"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Register Psychologist</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl shadow-lg backdrop-blur-lg bg-white/30 dark:bg-gray-800/30">
        <table className="min-w-full text-left">
          <thead className="bg-white/40 dark:bg-gray-700/40">
            <tr>
              {["Name", "Email", "Role", "Actions"].map((title) => (
                <th
                  key={title}
                  className="px-4 sm:px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-6 text-gray-500 dark:text-gray-300"
                >
                  Loading...
                </td>
              </tr>
            ) : psychologists.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-6 text-gray-500 dark:text-gray-300"
                >
                  No psychologists found.
                </td>
              </tr>
            ) : (
              psychologists.map((psych) => (
                <tr
                  key={psych._id}
                  className="transition-all duration-300 rounded-xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-md hover:bg-white/30 dark:hover:bg-gray-800/30 hover:shadow-lg"
                >
                  <td className="px-4 sm:px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {psych.username}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-gray-700 dark:text-gray-200">
                    {psych.email}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-gray-700 dark:text-gray-200">
                    {psych.role}
                  </td>
                  <td className="px-4 sm:px-6 py-4 flex gap-3">
                    <button
                      onClick={() => handleUpdateClick(psych)}
                      className="text-blue-600 hover:text-blue-800 transition"
                      title="Edit"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(psych._id)}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Delete"
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

      {/* Pagination */}
      <div className="flex justify-end gap-2 mt-2 flex-wrap items-center">
        <button
          onClick={goToPrevious}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md border bg-white/30 dark:bg-gray-800/30 text-gray-800 dark:text-gray-200 disabled:opacity-50 transition"
        >
          Previous
        </button>
        {Array.from({ length: totalPages || 1 }, (_, i) => (
          <button
            key={i}
            onClick={() => fetchPage(i + 1)}
            className={`px-3 py-1 rounded-md border transition ${
              currentPage === i + 1
                ? "bg-blue-600 text-white"
                : "bg-white/30 dark:bg-gray-800/30 text-gray-800 dark:text-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={goToNext}
          disabled={currentPage === (totalPages || 1)}
          className="px-3 py-1 rounded-md border bg-white/30 dark:bg-gray-800/30 text-gray-800 dark:text-gray-200 disabled:opacity-50 transition"
        >
          Next
        </button>
      </div>

      {/* Popups */}
      {showRegisterPopup && (
        <RegisterPsychologistPopup
          isOpen={showRegisterPopup}
          onClose={() => setShowRegisterPopup(false)}
          onSuccess={() => fetchPage(currentPage)}
        />
      )}
      {selectedPsychologist && (
        <UpdatePsychologistPopup
          isOpen={true}
          onClose={() => setSelectedPsychologist(null)}
          psychologist={selectedPsychologist}
          onSuccess={() => fetchPage(currentPage)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmDeleteModal && (
        <Modal
          isOpen={showConfirmDeleteModal}
          onClose={() => setShowConfirmDeleteModal(false)}
          maxWidth="max-w-md"
        >
          <div className="p-6 bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 dark:text-gray-200 my-4">
              This will delete the psychologist permanently.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button
                onClick={() => setShowConfirmDeleteModal(false)}
                className="px-4 py-2 bg-gray-200/50 dark:bg-gray-700/50 rounded w-full sm:w-auto backdrop-blur-md transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full sm:w-auto transition"
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
