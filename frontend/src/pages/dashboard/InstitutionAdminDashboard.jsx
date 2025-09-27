import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllStudents } from "../../redux/slices/studentsSlice";
import { fetchPsychologists } from "../../redux/slices/psychologistSlice";

export default function InstitutionAdminDashboard() {
  const dispatch = useDispatch();

  const { students = [] } = useSelector((state) => state.students || {});
  const { psychologists = [] } = useSelector((state) => state.psychologist || {});

  useEffect(() => {
    dispatch(fetchAllStudents({ role: "Student" }));
    dispatch(fetchPsychologists({ institution: true }));
  }, [dispatch]);

  const stats = [
    { name: "Total Students", value: students.length },
    { name: "Total Psychologists", value: psychologists.length },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="p-6 rounded-2xl bg-white/30 dark:bg-gray-800/40 backdrop-blur-lg shadow-xl flex flex-col items-center sm:items-start transition hover:scale-105"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-gray-600 dark:text-gray-300">
              {stat.name}
            </h2>
            <p className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mt-3">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
