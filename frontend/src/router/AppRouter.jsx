import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../layout/DashboardLayout";

// Auth Pages
import HomePage from "../pages/auth/HomePage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyOtp from "../pages/auth/VerifyOtp";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import UpdatePassword from "../pages/auth/UpdatePassword";
import NotFoundPage from "../pages/auth/NotFoundPage";

// Dashboards
import MainAdminDashboard from "../pages/dashboard/MainAdminDashboard";
import InstitutionAdminDashboard from "../pages/dashboard/InstitutionAdminDashboard";
import CollegePsychologistDashboard from "../pages/dashboard/CollegePsychologistDashboard";
import StudentDashboard from "../pages/dashboard/StudentDashboard";

// MainAdmin Pages
import ManageInstitutions from "../pages/mainAdmin/ManageInstitutionAdmins";
import Psychologists from "../pages/mainAdmin/ManagePsychologists";
import Students from "../pages/mainAdmin/Students";

// InstitutionAdmin Pages
import InstitutionPsychologists from "../pages/institution/InstitutionPsychologists";
import InstitutionStudents from "../pages/institution/InstitutionStudents";

// Psychologist Pages
import AppointmentPage from "../pages/Psychologist/AppointmentPage";
import PsychologistSessionsPage from "../pages/Psychologist/PsychologistSessionsPage";
import PsychologistInPersonPage from "../pages/Psychologist/PsychologistInPersonPage";

// Student Pages
import ChatOrCall from "../pages/Student/ChatOrCall";
import StudentScreeningPage from "../pages/Student/StudentScreeningPage";
import PsychologistList from "../pages/Student/PsychologistList";
import BookingPage from "../pages/Student/BookingPage";
import BookAppointment from "../pages/Student/BookAppointment";
import StudentInPersonBookings from "../pages/Student/StudentInPersonBookings";
import JournalingPage from "../components/journaling/JournalingPage";
import AboutPage from "../pages/auth/AboutPage";
import ResourcesPage from "../pages/auth/ResourcesPage";

const getRedirectPath = (role) => {
  const paths = {
    MainAdmin: "/admin-dashboard",
    InstitutionAdmin: "/institution-dashboard",
    CollegePsychologist: "/psychologist-dashboard",
    Student: "/student-dashboard",
  };
  return paths[role] || "/login";
};

export default function AppRoutes() {
  const { isAuthenticated, user, otpRequired, loading } = useSelector((state) => state.auth);
  const redirectPath = getRedirectPath(user?.role);

  if (loading || isAuthenticated === null) return null;

  return (
    <Routes>

      {/* PUBLIC ROUTES: These routes are for all users, logged in or not */}
      
      <Route path="/home" element={isAuthenticated ? <Navigate to={redirectPath} replace /> : <HomePage />} />
      <Route path="/about" element={isAuthenticated ? <Navigate to={redirectPath} replace /> : <AboutPage/>} />
      <Route path="/resources" element={isAuthenticated ? <Navigate to={redirectPath} replace /> : <ResourcesPage/>} />



      {/* Public Routes */}
      <Route path="/" element={isAuthenticated ? <Navigate to={redirectPath} replace /> : <HomePage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to={redirectPath} replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={redirectPath} replace /> : <Register />} />
      <Route path="/verify-otp" element={otpRequired ? <VerifyOtp /> : <Navigate to="/login" replace />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route
        path="/update-password"
        element={
          isAuthenticated &&
          !user?.passwordUpdated &&
          ["InstitutionAdmin", "CollegePsychologist"].includes(user?.role) ? (
            <UpdatePassword />
          ) : (
            <Navigate to={redirectPath} replace />
          )
        }
      />
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>

        <Route path="/journaling" element={<JournalingPage/>} />
          {/* MainAdmin */}
          <Route element={<ProtectedRoute allowedRoles={["MainAdmin"]} />}>
            <Route path="/admin-dashboard" element={<MainAdminDashboard />} />
            <Route path="/manage-institutes" element={<ManageInstitutions />} />
            <Route path="/psychologists" element={<Psychologists />} />
            <Route path="/students" element={<Students />} />
          </Route>

          {/* InstitutionAdmin */}
          <Route element={<ProtectedRoute allowedRoles={["InstitutionAdmin"]} />}>
            <Route path="/institution-dashboard" element={<InstitutionAdminDashboard />} />
            <Route path="/institution-psychologists" element={<InstitutionPsychologists />} />
            <Route path="/institution-students" element={<InstitutionStudents />} />
          </Route>

          {/* CollegePsychologist */}
          <Route element={<ProtectedRoute allowedRoles={["CollegePsychologist"]} />}>
            <Route path="/psychologist-dashboard" element={<CollegePsychologistDashboard />} />
            <Route path="/psychologist/appointments" element={<AppointmentPage />} />
            <Route path="/psychologist/sessions" element={<PsychologistSessionsPage />} />
            <Route path="/psychologist/session/:bookingId" element={<ChatOrCall />} />
            <Route path="/psychologist/in-person-sessions" element={<PsychologistInPersonPage />} />
          </Route>

          {/* Student */}
          <Route element={<ProtectedRoute allowedRoles={["Student"]} />}>
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/student/psychologists" element={<PsychologistList />} />
            <Route path="/student/bookings" element={<BookingPage />} />
            <Route path="/student/book/:id" element={<BookAppointment />} />
            <Route path="/student/screening" element={<StudentScreeningPage />} />
            <Route path="/student/chat-or-call/:bookingId" element={<ChatOrCall />} />
            <Route path="/student/in-person-bookings" element={<StudentInPersonBookings />} />
            
          </Route>
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
