import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import otpIllustration from "../assets/auth-illustration.png";

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();

  if (!location.state || !location.state.email) {
    return <Navigate to="/role-selection" replace />;
  }
  const userEmail = location.state.email;

  // State to track the user's input, the loading button, and any backend errors.
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //states for the reset link
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState(null);

  const handleSubmit = async (e) => {
    // Prevent the browser from refreshing the page when they click submit
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResendMessage(null); //clear any old resend messages

    try {
      // Send the email and the code they typed to our Express server
      const response = await fetch("http://localhost:5000/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, otpCode: otp }),
      });

      const data = await response.json();

      // If the backend sends an error (like a 400 status), throw it so our catch block grabs it
      if (!response.ok) {
        throw new Error(data.message || "Invalid OTP");
      }

      // If it passes, send them to the login page and pass a success message in the backpack!
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

    try {
      const response = await fetch(
        "http://localhost:5000/api/resend-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend code");
      }

      setResendMessage("A new code has been sent!");
    } catch (err) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    // Main full-screen container matching the signup/login split layout
    <div className="flex h-screen w-full overflow-hidden font-poppins text-ink-black bg-porcelain">
      {/* Left side: The illustration panel. Hidden on mobile, visible on desktop (lg). */}
      <div className="relative hidden lg:flex w-1/2 h-full bg-soft-periwinkle justify-center items-center">
        <img
          src={otpIllustration}
          alt="OTP Illustration"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Right side: The verification form panel */}
      <div className="w-full lg:w-1/2 h-full flex justify-center items-center px-8 sm:px-16 bg-porcelain overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="text-center mb-10">
            <h1 className="font-playfair text-4xl font-bold mb-3 text-ink-black">
              Verify Your Identity
            </h1>
            <p className="font-playfair text-sm text-gray-600 leading-relaxed">
              We've securely sent a 6-digit code to <br />
              <span className="font-semibold text-ink-black">{userEmail}</span>
            </p>
          </div>

          {/* If the backend throws an error (e.g., wrong code), display this box */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-200 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col">
              <label className="font-playfair text-sm font-medium mb-1.5 text-left">
                Enter Security Code
              </label>
              <input
                type="text"
                maxLength="6"
                // using regex to strip out any letters, forcing numbers only
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                value={otp}
                className="h-12 border border-warm-taupe rounded-md px-4 outline-none focus:border-soft-periwinkle focus:ring-1 focus:ring-soft-periwinkle transition-all bg-white text-center tracking-[0.5em] text-lg font-medium"
                required
              />
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

          {/* Optional resend link  */}
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
