import { useState } from "react";
import illustration from "../assets/auth-illustration.png";
import { registerUser } from "../api/auth";
import { useLocation, Navigate, useNavigate } from "react-router-dom";

const Signup = () => {
  const location = useLocation();
  const navigate = useNavigate();

  if (!location.state || !location.state.role) {
    console.warn("No role selected! Redirecting back...");
    return <Navigate to="/role-selection" replace />;
  }

  const userRole = location.state.role;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  // FIX: You were missing this line right here!
  // This tracks which specific field has an error.
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear the specific field's error when they start typing again to fix it
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Clear out any old errors before we check again
    setFieldErrors({});

    // 🛑 1. Check Password Length/Rules
    if (formData.password.length < 8) {
      setFieldErrors({
        password: "Password must be at least 8 characters long.",
      });
      setLoading(false);
      return;
    }

    // 🛑 2. Check if Passwords Match
    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match." });
      setLoading(false);
      return;
    }

    const { confirmPassword, ...dataToSend } = formData;

    const completeUserData = {
      ...dataToSend,
      role: userRole,
    };

    try {
      await registerUser(completeUserData);
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (err) {
      // If the backend sends an error (like "Email already in use"), put it in the general box
      setFieldErrors({ general: err.message });
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-poppins text-ink-black bg-porcelain">
      {/* LEFT SIDE: ILLUSTRATION */}
      <div className="relative hidden lg:flex w-1/2 h-full bg-soft-periwinkle justify-center items-center">
        <img
          src={illustration}
          alt="Auth Illustration"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* RIGHT SIDE: SIGNUP FORM */}
      <div className="w-full lg:w-1/2 h-full flex justify-center items-center px-8 sm:px-16 bg-porcelain overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="text-center mb-10">
            <h1 className="font-playfair text-4xl font-bold mb-3 text-ink-black">
              Create your account
            </h1>
            <p className="font-playfair text-sm text-gray-600 leading-relaxed">
              Begin your journey in Platform. Takes less than a minute.
            </p>
          </div>

          {/* General Error Box (e.g., Email already taken) */}
          {fieldErrors.general && (
            <div className="mb-6 p-3 bg-red-100 border border-red-200 text-red-700 text-sm rounded-md text-center">
              {fieldErrors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* FULL NAME */}
            <div className="flex flex-col">
              <label className="font-playfair text-sm font-medium mb-1.5">
                Full name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="h-12 border border-warm-taupe rounded-md px-4 outline-none focus:border-soft-periwinkle focus:ring-1 focus:ring-soft-periwinkle transition-all bg-porcelain"
                required
              />
            </div>

            {/* EMAIL */}
            <div className="flex flex-col">
              <label className="font-playfair text-sm font-medium mb-1.5">
                Email address<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="username"
                className="h-12 border border-warm-taupe rounded-md px-4 outline-none focus:border-soft-periwinkle focus:ring-1 focus:ring-soft-periwinkle transition-all bg-porcelain"
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="flex flex-col">
              <div className="flex justify-between items-baseline mb-1.5">
                <label className="font-playfair text-sm font-medium">
                  Password<span className="text-red-500">*</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mb-2">
                Password must be at least 8 characters and should have a mixture
                of letters and other characters.
              </p>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                className={`h-12 border rounded-md px-4 outline-none transition-all bg-porcelain ${
                  fieldErrors.password
                    ? "border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-warm-taupe focus:border-soft-periwinkle focus:ring-1 focus:ring-soft-periwinkle"
                }`}
                required
              />
              {fieldErrors.password && (
                <span className="text-red-500 text-xs mt-1">
                  {fieldErrors.password}
                </span>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="flex flex-col">
              <label className="font-playfair text-sm font-medium mb-1.5">
                Confirm Password<span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                className={`h-12 border rounded-md px-4 outline-none transition-all bg-porcelain ${
                  fieldErrors.confirmPassword
                    ? "border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-warm-taupe focus:border-soft-periwinkle focus:ring-1 focus:ring-soft-periwinkle"
                }`}
                required
              />
              {fieldErrors.confirmPassword && (
                <span className="text-red-500 text-xs mt-1">
                  {fieldErrors.confirmPassword}
                </span>
              )}
            </div>

            {/* TERMS & CONDITIONS */}
            <div className="flex items-start mt-2 mb-6">
              <input
                type="checkbox"
                className="mt-1 mr-3 w-4 h-4 cursor-pointer accent-ink-black"
                required
              />
              <p className="text-xs text-gray-600 leading-relaxed">
                By creating an account, I agree to our{" "}
                <a
                  href="#"
                  className="underline font-medium hover:text-ink-black"
                >
                  Terms of use
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="underline font-medium hover:text-ink-black"
                >
                  Privacy Policy
                </a>
              </p>
            </div>

            {/* SUBMIT BUTTON */}
            {/* CREATE ACCOUNT BUTTON */}
            <button
              type="submit"
              className="w-full h-12 bg-soft-periwinkle hover:bg-lavender-grey text-ink-black font-semibold rounded-md transition-colors duration-200"
            >
              Create account
            </button>
          </form>

          {/* SOCIAL LOGIN */}
          <div className="flex items-center my-8">
            <div className="grow border-t border-warm-taupe"></div>
            <span className="mx-4 text-gray-400 text-sm">or</span>
            <div className="grow border-t border-warm-taupe"></div>
          </div>

          <button
            type="button"
            className="w-full h-12 flex items-center justify-center bg-white border border-warm-taupe shadow-sm rounded-md hover:bg-soft-linen transition-colors duration-200 mb-8"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="font-medium text-ink-black">
              Continue with Google
            </span>
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-soft-periwinkle font-semibold hover:text-lavender-grey hover:underline transition-colors"
            >
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
