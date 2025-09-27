import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, otpRequired, isAuthenticated, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading || isAuthenticated === null) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;

  if (otpRequired && location.pathname !== "/verify-otp")
    return <Navigate to="/verify-otp" replace state={{ from: location }} />;

  if (allowedRoles.length && (!user?.role || !allowedRoles.includes(user.role))) {
    const redirectMap = {
      MainAdmin: "/admin-dashboard",
      InstitutionAdmin: "/institution-dashboard",
      CollegePsychologist: "/psychologist-dashboard",
      Student: "/student-dashboard",
    };
    return <Navigate to={redirectMap[user?.role] || "/login"} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
