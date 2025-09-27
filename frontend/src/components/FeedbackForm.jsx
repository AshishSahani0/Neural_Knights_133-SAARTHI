// src/components/FeedbackForm.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaStar } from 'react-icons/fa';

export default function FeedbackForm({ booking, onSubmit, onCancel }) {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!rating) {
            toast.error("Please select a rating.");
            return;
        }
        onSubmit({ rating, comment });
    };

    if (!booking) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/30 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md transform transition-all scale-100 sm:p-8 p-6">
                <h3 className="text-2xl font-bold mb-4 text-center text-gray-900">Give Feedback</h3>
                <p className="mb-6 text-gray-700 text-center">
                    How was your session with <span className="font-semibold">{booking.psychologist?.username}</span>?
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col">
                    {/* Star Rating */}
                    <div className="mb-6 text-center">
                        <label className="block text-gray-700 font-semibold mb-2">Rating</label>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="focus:outline-none"
                                >
                                    <FaStar
                                        size={32}
                                        className={`cursor-pointer transition-colors ${
                                            star <= (hoverRating || rating)
                                                ? 'text-yellow-400'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comments */}
                    <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-2">Comments (Optional)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows="4"
                            className="w-full p-3 border border-white/50 rounded-xl bg-white/20 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none overflow-y-auto text-gray-900 placeholder-gray-700 transition"
                            placeholder="Share your experience..."
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="bg-gray-300/70 text-black px-5 py-2 rounded-xl hover:bg-gray-400/80 transition backdrop-blur-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600/80 text-white px-5 py-2 rounded-xl hover:bg-blue-700/90 transition backdrop-blur-sm"
                        >
                            Submit Feedback
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
