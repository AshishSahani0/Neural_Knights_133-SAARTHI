import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchPsychologistsForStudent } from "../../redux/slices/psychologistSlice";
import SkeletonDashboard from "../../components/SkeletonDashboard";

const PsychologistList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { studentPsychologists = [], loading } = useSelector((state) => state.psychologist);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchPsychologistsForStudent());
  }, [dispatch]);

  const filteredPsychologists = studentPsychologists.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.username?.toLowerCase().includes(query) ||
      p.email?.toLowerCase().includes(query)
    );
  });

  if (loading) return <SkeletonDashboard />;

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      
      {/* Search Input */}
      <div className="max-w-md mx-auto mb-8">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/30 dark:bg-gray-800/30 backdrop-blur-md shadow-md text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Grid of Psychologists */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPsychologists.length > 0 ? (
          filteredPsychologists.map((p) => (
            <div
              key={p._id}
              onClick={() => navigate(`/student/book/${p._id}`)}
              className="cursor-pointer rounded-2xl p-6 bg-white/50 dark:bg-gray-800/40 backdrop-blur-md border border-white/20 dark:border-gray-700 shadow-lg transition hover:scale-[1.02] hover:shadow-2xl flex flex-col items-center gap-4"
            >
              <img
                src={p.profileImage?.url || "/default-avatar.png"}
                alt={p.username}
                className="w-24 h-24 rounded-full object-cover shadow-inner border-4 border-white dark:border-gray-700"
              />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{p.username}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{p.email}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-600 dark:text-gray-400">
            No psychologists found.
          </div>
        )}
      </div>
    </div>
  );
};

export default PsychologistList;
