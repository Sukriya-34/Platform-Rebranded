import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import otpIllustration from "../../assets/auth-illustration.png";

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();

  if (!location.state || !location.state.email) {
    return <Navigate to="/role-selection" replace />;
  }
  const userEmail = location.state.email;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResendMessage(null);

    try {
      const response = await fetch("http://localhost:5000/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, otpCode: otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid verification code.");
      }

      navigate("/login", {
        state: { message: "Account verified! Please log in." },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError(null);
    setResendMessage(null);
    setOtp(""); // Clear the input field for them

    try {
      const response = await fetch("http://localhost:5000/api/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend code.");
      }

      setResendMessage("A new code has been sent!");
    } catch (err) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-poppins text-ink-black bg-porcelain">
      {/* LEFT SIDE: ILLUSTRATION */}
      <div className="relative hidden lg:flex w-1/2 h-full bg-soft-periwinkle justify-center items-center">
        <img
          src={otpIllustration}
          alt="OTP Illustration"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* RIGHT SIDE: VERIFICATION FORM */}
      <div className="w-full lg:w-1/2 h-full flex justify-center items-center px-8 sm:px-16 bg-porcelain overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* HEADER SECTION */}
          <div className="text-center mb-10">
            <h1 className="font-playfair text-4xl font-bold mb-3 text-ink-black">
              Verify Your Identity
            </h1>

            {/* Elegant toggle for the Resend Success message! */}
            {resendMessage ? (
              <p className="font-playfair text-sm text-green-600 font-medium leading-relaxed">
                 {resendMessage}
              </p>
            ) : (
              <p className="font-playfair text-sm text-gray-600 leading-relaxed">
                We've securely sent a 6-digit code to <br />
                <span className="font-semibold text-ink-black">
                  {userEmail}
                </span>
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col">
              <label className="font-playfair text-sm font-medium mb-1.5 text-left">
                Enter Security Code
              </label>
              <input
                type="text"
                maxLength="6"
                onChange={(e) => {
                  setOtp(e.target.value.replace(/[^0-9]/g, ""));
                  setError(null); // Instantly clears the red error state when they start typing
                }}
                value={otp}
                // 👇 Advanced field-level validation styling!
                className={`h-12 border rounded-md px-4 outline-none transition-all bg-white text-center tracking-[0.5em] text-lg font-medium ${
                  error
                    ? "border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-warm-taupe focus:border-soft-periwinkle focus:ring-1 focus:ring-soft-periwinkle"
                }`}
                required
              />
              {/* 👇 The subtle red text underneath the input */}
              {error && (
                <span className="text-red-500 text-xs mt-2 text-center block">
                  {error}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-12 bg-soft-periwinkle hover:bg-lavender-grey text-ink-black font-semibold rounded-md transition-colors duration-200 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Verifying..." : "Confirm & Start Exploring"}
            </button>
          </form>

          {/* RESEND LINK */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              <span className="mr-2">←</span>
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className={`text-soft-periwinkle font-semibold hover:text-lavender-grey hover:underline transition-colors ${resendLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {resendLoading ? "Sending..." : "Resend"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
