import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AppRoutes from "./router/AppRouter";
import { loadUser } from "./redux/slices/authSlice";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const AppLoading = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-700">
    <div className="w-12 h-12 rounded-full animate-spin border-4 border-dashed border-blue-600"></div>
  </div>
);

export default function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  useEffect(() => {
    if (
      user &&
      isAuthenticated &&
      !user.passwordUpdated &&
      (user.role === "CollegePsychologist" || user.role === "InstitutionAdmin")
    ) {
      navigate("/update-password");
    }
  }, [user, isAuthenticated, navigate]);

  if (loading || isAuthenticated === null) return <AppLoading />;

  return (
    <>
      <AppRoutes />
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
    </>
  );
}
