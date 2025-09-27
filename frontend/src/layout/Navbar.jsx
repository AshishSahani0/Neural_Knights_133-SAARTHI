import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import SettingsPopup from "../popups/SettingsPopup";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login", { replace: true });
  };

  const getDashboardTitle = () => {
    const titles = {
      MainAdmin: "Main Admin Dashboard",
      InstitutionAdmin: "Institution Admin Dashboard",
      CollegePsychologist: "Psychologist Dashboard",
      Student: "Student Dashboard",
    };
    return titles[user?.role] || "Dashboard";
  };

  return (
    <>
      <header
        className="sticky top-0 z-30 w-full h-16 px-4 sm:px-6
        flex items-center justify-between 
        bg-white/30 dark:bg-gray-800/30
        backdrop-blur-lg border-b border-white/20 dark:border-gray-700
        shadow-md"
      >
        {/* Dashboard Title */}
        <h1 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white truncate">
          {getDashboardTitle()}
        </h1>

        {/* Settings */}
        <div className="flex items-center gap-3 sm:gap-5">
          <button
            onClick={() => setShowSettings(true)}
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            title="Settings"
          >
            <Cog6ToothIcon className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsPopup
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
