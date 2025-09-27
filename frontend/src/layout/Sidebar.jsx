import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { logoutUser } from "../redux/slices/authSlice";
import { ArrowLeftOnRectangleIcon, Bars3Icon, XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export default function Sidebar() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(location.pathname);
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (label) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/", { replace: true });
  };

  const groupedLinksByRole = {
    MainAdmin: [
      { to: "/admin-dashboard", label: "Dashboard" },
      {
        label: "Manage",
        children: [
          { to: "/manage-institutes", label: "Institutes" },
          { to: "/psychologists", label: "Psychologists" },
          { to: "/students", label: "Students" },
        ],
      },
    ],
    InstitutionAdmin: [
      { to: "/institution-dashboard", label: "Dashboard" },
      {
        label: "Manage",
        children: [
          { to: "/institution-psychologists", label: "Psychologists" },
          { to: "/institution-students", label: "Students" },
        ],
      },
    ],
    CollegePsychologist: [
      { to: "/psychologist-dashboard", label: "Dashboard" },
      {
        label: "Sessions",
        children: [
          { to: "/psychologist/appointments", label: "Appointments" },
          { to: "/psychologist/sessions", label: "Online" },
          { to: "/psychologist/in-person-sessions", label: "In-Person" },
        ],
      },
      { to: "/journaling", label: "Journaling" },
    ],
    Student: [
      { to: "/student-dashboard", label: "Dashboard" },
      {
        label: "Bookings",
        children: [
          { to: "/student/psychologists", label: "Psychologists" },
          { to: "/student/bookings", label: "Online Bookings" },
          { to: "/student/in-person-bookings", label: "In-Person Bookings" },
        ],
      },
      { to: "/student/screening", label: "Screening" },
      { to: "/journaling", label: "Journaling" },
    ],
  };

  const sidebarItems = groupedLinksByRole[user?.role] || [];

  useEffect(() => {
    setMobileOpen(false);
    setActiveLink(location.pathname);
  }, [location.pathname]);

  const SidebarContent = ({ onLinkClick }) => (
    <aside className="w-64 min-h-screen p-4 flex flex-col
      bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl border border-white/20 dark:border-gray-700 shadow-lg rounded-r-3xl">
      <div className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">SAARTHI</div>

      <nav className="flex-1 flex flex-col gap-2 text-sm font-medium">
        {sidebarItems.map((item, index) => {
          if (item.children) {
            const isOpen = expandedMenus[item.label];
            return (
              <div key={index}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/10 dark:bg-gray-700/20 text-gray-800 dark:text-white hover:bg-white/20 dark:hover:bg-gray-600 transition-all"
                >
                  {item.label}
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="ml-4 mt-2 space-y-1">
                    {item.children.map((child) => {
                      const isActive = activeLink === child.to;
                      return (
                        <Link
                          key={child.to}
                          to={child.to}
                          onClick={onLinkClick}
                          className={`block px-3 py-2 rounded-md transition-all
                            ${
                              isActive
                                ? "bg-white/40 text-gray-900 dark:text-white"
                                : "text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-600"
                            }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          } else {
            const isActive = activeLink === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onLinkClick}
                className={`block px-3 py-2 rounded-lg transition-all
                  ${
                    isActive
                      ? "bg-white/40 text-gray-900 dark:text-white"
                      : "text-gray-800 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-600"
                  }`}
              >
                {item.label}
              </Link>
            );
          }
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-3 p-3 mt-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all shadow-md"
      >
        <ArrowLeftOnRectangleIcon className="w-5 h-5" />
        Logout
      </button>
    </aside>
  );

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-white/30 dark:bg-gray-800/30 backdrop-blur-md text-gray-800 dark:text-white rounded-lg shadow-md"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        <div
          className={`fixed inset-0 bg-black z-30 transition-opacity duration-300 ${
            isMobileOpen ? "opacity-50" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setMobileOpen(false)}
        />

        <div
          className={`fixed top-0 left-0 h-full z-40 w-64 transform transition-transform duration-300 ease-in-out
            ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex justify-end p-2">
            <button
              onClick={() => setMobileOpen(false)}
              className="text-gray-800 dark:text-white p-1 hover:bg-white/20 dark:hover:bg-gray-700 rounded-md"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <SidebarContent onLinkClick={() => setMobileOpen(false)} />
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block fixed top-0 left-0 h-full z-40">
        <SidebarContent />
      </div>
    </>
  );
}
