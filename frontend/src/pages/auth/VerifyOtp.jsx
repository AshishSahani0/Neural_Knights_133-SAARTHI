import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { verifyOtp, resendOtp } from "../../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function VerifyOtp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading: authLoading, registeredEmail } = useSelector(
    (state) => state.auth
  );
  const { register, handleSubmit, formState: { errors } } = useForm();

  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!registeredEmail) {
      toast.info("No verification process is active. Please register first.");
      navigate("/register", { replace: true });
    }
  }, [registeredEmail, navigate]);

  const onSubmit = (data) => {
    if (!registeredEmail) return;
    dispatch(verifyOtp({ email: registeredEmail, otp: data.otp }))
      .unwrap()
      .then(() => {
        navigate("/login");
      })
      .catch(() => {});
  };

  const handleResend = async () => {
    if (!registeredEmail) return;
    setIsResending(true);
    try {
      await dispatch(resendOtp({ email: registeredEmail })).unwrap();
    } finally {
      setIsResending(false);
    }
  };

  if (!registeredEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6">
      <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 w-full max-w-md text-center border border-gray-200">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-800">
          Verify Your Email
        </h2>
        <p className="mb-6 text-gray-600 text-sm sm:text-base">
          An OTP has been sent to <strong>{registeredEmail}</strong>
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <input
              {...register("otp", {
                required: "OTP is required",
                pattern: { value: /^\d{6}$/, message: "OTP must be 6 digits" },
              })}
              type="text"
              inputMode="numeric"
              maxLength="6"
              placeholder="Enter OTP"
              className="w-full text-center tracking-[1rem] text-2xl sm:text-3xl font-mono px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition outline-none shadow-sm"
            />
            {errors.otp && (
              <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors font-semibold shadow-md"
          >
            {authLoading && !isResending ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
        <div className="mt-4 text-sm sm:text-base text-gray-600">
          Didn't receive the code?{" "}
          <button
            onClick={handleResend}
            disabled={authLoading || isResending}
            className="text-blue-600 font-medium hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}
