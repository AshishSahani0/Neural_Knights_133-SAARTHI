import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllStudents, deleteStudent } from "../../redux/slices/studentsSlice";
import UpdateStudentPopup from "../../popups/UpdateStudentPopup";
import Modal from "../../components/common/Modal";
import { toast } from "react-toastify";

// Heroicons
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function Students() {
  const dispatch = useDispatch();
  const { students, loading, totalPages } = useSelector((state) => state.students);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Edit modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Delete modal
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchAllStudents({ search: searchTerm, page: currentPage }));
  }, [dispatch, searchTerm, currentPage]);

  const filteredStudents = students.filter((student) => {
    const term = searchTerm.toLowerCase();
    return (
      (student.username || "").toLowerCase().includes(term) ||
      (student.email || "").toLowerCase().includes(term) ||
      (student.institution?.instituteName || "").toLowerCase().includes(term) ||
      (student.institution?.collegeCode || "").toLowerCase().includes(term)
    );
  });

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setStudentToDelete(id);
    setShowConfirmDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      await dispatch(deleteStudent(studentToDelete)).unwrap();
      toast.success("Student deleted successfully");
    } catch (err) {
      toast.error(err?.message || "Failed to delete student");
    } finally {
      setShowConfirmDeleteModal(false);
      setStudentToDelete(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const goToPrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNext = () => {
    if (currentPage < (totalPages || 1)) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Student Directory</h2>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          placeholder="Search by name, email, college name or code..."
          className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-96 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md text-gray-900 dark:text-gray-200"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl shadow-lg bg-white/20 dark:bg-gray-800/20 backdrop-blur-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/30 dark:bg-gray-700/30 sticky top-0 z-10 backdrop-blur-md">
            <tr>
              <th className="px-4 sm:px-6 py-3">Name</th>
              <th className="px-4 sm:px-6 py-3">Email</th>
              <th className="px-4 sm:px-6 py-3">College Name</th>
              <th className="px-4 sm:px-6 py-3">College Code</th>
              <th className="px-4 sm:px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading && students.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500 dark:text-gray-300">
                  Loading...
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500 dark:text-gray-300">
                  No students found.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr
                  key={student._id}
                  className="transition-all duration-300 hover:shadow-lg hover:bg-white/30 dark:hover:bg-gray-700/30"
                >
                  <td className="px-4 sm:px-6 py-4">{student.username}</td>
                  <td className="px-4 sm:px-6 py-4">{student.email}</td>
                  <td className="px-4 sm:px-6 py-4">{student.institution?.instituteName || "N/A"}</td>
                  <td className="px-4 sm:px-6 py-4">{student.institution?.collegeCode || "N/A"}</td>
                  <td className="px-4 sm:px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="Edit"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(student._id)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
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
          className="px-3 py-1 rounded-md border bg-white/20 dark:bg-gray-800/20 text-gray-800 dark:text-gray-200 disabled:opacity-50 backdrop-blur-md"
        >
          Previous
        </button>

        {Array.from({ length: totalPages || 1 }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded-md border backdrop-blur-md ${
              currentPage === i + 1
                ? "bg-blue-600 text-white"
                : "bg-white/20 dark:bg-gray-800/20 text-gray-800 dark:text-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={goToNext}
          disabled={currentPage === (totalPages || 1)}
          className="px-3 py-1 rounded-md border bg-white/20 dark:bg-gray-800/20 text-gray-800 dark:text-gray-200 disabled:opacity-50 backdrop-blur-md"
        >
          Next
        </button>
      </div>

      {/* Update Student Modal */}
      {selectedStudent && (
        <UpdateStudentPopup
          isOpen={isModalOpen}
          onClose={closeModal}
          student={selectedStudent}
        />
      )}

      {/* Confirm Delete Modal */}
      {showConfirmDeleteModal && (
        <Modal
          isOpen={showConfirmDeleteModal}
          onClose={() => setShowConfirmDeleteModal(false)}
          maxWidth="max-w-md"
        >
          <div className="p-6 bg-white/20 dark:bg-gray-800/20 backdrop-blur-lg rounded-2xl">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Confirm Deletion</h3>
            <p className="text-gray-600 dark:text-gray-200 my-4">
              This will delete the student permanently.
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
