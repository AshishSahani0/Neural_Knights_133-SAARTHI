import { useState } from "react";
import { useSelector } from "react-redux";
import api from "../../api/api";
import { ALL_QUESTIONS } from "./question.js";

export default function ScreeningModal({ onComplete }) {
  const { user } = useSelector((state) => state.auth);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAnswer = (score) => {
    const updated = [...answers, score];
    setAnswers(updated);

    if (step + 1 < ALL_QUESTIONS.length) {
      setStep(step + 1);
    } else {
      submitAssessment(updated);
    }
  };

  const submitAssessment = async (answers) => {
    setLoading(true);
    try {
      const res = await api.post("/assessment", {
        studentId: user._id,
        answers,
      });
      onComplete(res.data.feedback);
    } catch (err) {
      console.error("Submit error", err);
    } finally {
      setLoading(false);
    }
  };

  const q = ALL_QUESTIONS[step];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="relative w-full max-w-xl">
        <div
          key={step} // ensures animation on question change
          className="bg-white/30 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 relative animate-slide-in flex flex-col"
        >
          {/* Progress Bar */}
          <div className="w-full bg-white/30 h-2 rounded-full mb-6 overflow-hidden">
            <div
              className="bg-blue-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / ALL_QUESTIONS.length) * 100}%` }}
            />
          </div>

          {/* Question */}
          <h2 className="text-xl md:text-2xl font-semibold mb-6 text-gray-900">
            {q.question}
          </h2>

          {/* Options */}
          <div className="flex flex-col gap-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={loading}
                className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 active:scale-95 transition transform duration-200 shadow-md"
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Step Indicator */}
          <p className="text-sm text-gray-700 mt-4 text-center">
            Question {step + 1} of {ALL_QUESTIONS.length}
          </p>

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
              <div className="loader border-t-4 border-blue-400 border-solid rounded-full w-10 h-10 animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes slide-in {
            from { opacity: 0; transform: translateX(50px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-slide-in {
            animation: slide-in 0.3s ease-out forwards;
          }
          .loader {
            border-top-color: transparent;
          }
        `}
      </style>
    </div>
  );
}
