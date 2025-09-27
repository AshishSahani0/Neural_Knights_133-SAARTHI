import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendEmergencyAlert } from "../../redux/slices/emergencySlice";
import Modal from "../common/Modal";
import { toast } from "react-toastify";
import { ExclamationCircleIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";

export default function CrisisModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.emergency);
  const [message, setMessage] = useState("");
  const { user } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to send an alert.");
      return;
    }
    
    // Dispatch the thunk with the message
    await dispatch(sendEmergencyAlert({ message })).unwrap();
    
    // Close the modal and reset state
    setMessage("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="p-6 text-center">
        <div className="flex items-center justify-center text-red-500 mb-4">
          <ExclamationCircleIcon className="h-16 w-16" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Emergency Alert
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Clicking this button will send an urgent, non-anonymous alert to your institution's counselors and admin.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="4"
            placeholder="Share what you're feeling (optional)..."
            className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
          >
            {loading ? "Sending Alert..." : <>Send Urgent Alert <PaperAirplaneIcon className="h-5 w-5 transform rotate-90" /></>}
          </button>
        </form>
      </div>
    </Modal>
  );
}