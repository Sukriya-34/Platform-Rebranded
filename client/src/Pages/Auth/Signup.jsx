import { useState } from "react";
import illustration from "../../assets/auth-illustration.png";
import { registerUser } from "../../api/auth";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google"; // Using the hook instead!

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
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: null });
    }
  };

  // --- STANDARD SIGNUP ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    if (formData.password.length < 8) {
      setFieldErrors({
        password: "Password must be at least 8 characters long.",
      });
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match." });
      setLoading(false);
      return;
    }

    const { confirmPassword, ...dataToSend } = formData;
    const completeUserData = { ...dataToSend, role: userRole };

    try {
      await registerUser(completeUserData);
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (err) {
      setFieldErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  // --- GOOGLE SIGNUP/LOGIN ---
  const googleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // We pass the role here so the backend knows what to create them as!
          body: JSON.stringify({
            access_token: tokenResponse.access_token,
            role: userRole,
          }),
        });

        const data = await response.json();

        if (!response.ok)
          throw new Error(data.message || "Google signup failed.");

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        const fetchedRole = data.user.role;

        // 1. Normalize the role (lowercase and remove spaces)
        const cleanRole = fetchedRole.toLowerCase().replace(/\s+/g, "");

        // 2. Use the correct paths that match your App.jsx
        if (cleanRole === "admin") {
          navigate("/admin/dashboard");
        } else if (cleanRole === "contentcreator" || cleanRole === "creator") {
          navigate("/creator/dashboard");
        } else {
          navigate("/learner/dashboard");
        }
      } catch (err) {
        setFieldErrors({ general: err.message });
      } finally {
        setLoading(false);
      }
    },
    onError: () =>
      setFieldErrors({ general: "Google Auth failed or was cancelled." }),
  });

  return (
    <div className="flex h-screen w-full overflow-hidden font-poppins text-ink-black bg-porcelain">
      <div className="relative hidden lg:flex w-1/2 h-full bg-soft-periwinkle justify-center items-center">
        <img
          src={illustration}
          alt="Auth Illustration"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

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

          {fieldErrors.general && (
            <div className="mb-6 p-3 bg-red-100 border border-red-200 text-red-700 text-sm rounded-md text-center">
              {fieldErrors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <div className="flex flex-col">
              <label className="font-playfair text-sm font-medium mb-1.5">
                Password<span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Password must be at least 8 characters.
              </p>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                className={`h-12 border rounded-md px-4 outline-none transition-all bg-porcelain ${fieldErrors.password ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-warm-taupe focus:border-soft-periwinkle focus:ring-1 focus:ring-soft-periwinkle"}`}
                required
              />
              {fieldErrors.password && (
                <span className="text-red-500 text-xs mt-1">
                  {fieldErrors.password}
                </span>
              )}
            </div>

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
                className={`h-12 border rounded-md px-4 outline-none transition-all bg-porcelain ${fieldErrors.confirmPassword ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-warm-taupe focus:border-soft-periwinkle focus:ring-1 focus:ring-soft-periwinkle"}`}
                required
              />
              {fieldErrors.confirmPassword && (
                <span className="text-red-500 text-xs mt-1">
                  {fieldErrors.confirmPassword}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-soft-periwinkle hover:bg-lavender-grey text-ink-black font-semibold rounded-md transition-colors duration-200 mt-4"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="flex items-center my-8">
            <div className="grow border-t border-warm-taupe"></div>
            <span className="mx-4 text-gray-400 text-sm">or</span>
            <div className="grow border-t border-warm-taupe"></div>
          </div>

          {/* ACTIVE GOOGLE BUTTON */}
          <button
            type="button"
            onClick={() => googleSignup()}
            disabled={loading}
            className={`w-full h-12 flex items-center justify-center bg-white border border-warm-taupe shadow-sm rounded-md hover:bg-soft-linen transition-colors duration-200 mb-8 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
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
              {loading ? "Authenticating..." : "Sign up with Google"}
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
