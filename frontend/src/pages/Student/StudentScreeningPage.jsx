import { useEffect, useState } from "react";
import api from "../../api/api";
import ScreeningModal from "../../components/screening/ScreeningModal";
import AssessmentCharts from "../../components/screening/AssessmentCharts";

export default function StudentScreeningPage() {
  const [showScreening, setShowScreening] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [assessments, setAssessments] = useState([]);

  const fetchData = async () => {
    try {
      const res = await api.get("/assessment/student");
      const { assessments, lastAssessmentDate } = res.data;

      setAssessments(assessments);
      const last = lastAssessmentDate ? new Date(lastAssessmentDate) : null;
      const now = new Date();
      const diff = last ? Math.floor((now - last) / (1000 * 60 * 60 * 24)) : Infinity;

      if (diff >= 7) setShowScreening(true);
      else setFeedback(assessments.at(-1)?.feedback);
    } catch (error) {
      console.error("Error fetching assessments:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-100 dark:bg-gray-900">
      {showScreening && (
        <ScreeningModal
          onComplete={(fb) => {
            setShowScreening(false);
            setFeedback(fb);
            fetchData();
          }}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white text-center">
          Weekly Mental Health Screening
        </h1>

        {feedback && (
          <div className="p-4 sm:p-6 bg-white/20 dark:bg-gray-800/20 backdrop-blur-lg rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
            <h2 className="font-semibold mb-2 text-lg sm:text-xl">Your Latest Feedback</h2>
            <p className="text-sm sm:text-base">{feedback}</p>
          </div>
        )}

        {assessments.length > 0 && (
          <div className="p-4 sm:p-6 bg-white/20 dark:bg-gray-800/20 backdrop-blur-lg rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
            <AssessmentCharts assessments={assessments} />
          </div>
        )}
      </div>
    </div>
  );
}
