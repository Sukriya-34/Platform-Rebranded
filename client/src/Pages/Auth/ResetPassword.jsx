import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import illustration from "../../assets/auth-illustration.png";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", text: "" });

  // Automatically hide the toast after 5 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ ...toast, show: false }), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setToast({ show: true, type: "error", text: "Passwords do not match." });
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        setToast({ show: true, type: "success", text: "Password updated! Redirecting..." });
        setTimeout(() => navigate("/login"), 3000);
      } else {
        throw new Error();
      }
    } catch (err) {
      setToast({ show: true, type: "error", text: "Failed to update password. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-poppins text-ink-black bg-porcelain">
      
      {/* MODERN TOAST NOTIFICATION (Top Pop-up) */}
      {toast.show && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 bg-white border ${
            toast.type === "success" ? "border-soft-periwinkle" : "border-red-200"
          }`}>
            <span className="text-lg">{toast.type === "success" ? "✨" : "⚠️"}</span>
            <p className="text-sm font-medium whitespace-nowrap">
              {toast.text}
            </p>
            <button 
              onClick={() => setToast({ ...toast, show: false })} 
              className="ml-2 text-gray-400 hover:text-ink-black"
            >✕</button>
          </div>
        </div>
      )}

      {/* LEFT SIDE (Periwinkle Image Section) */}
      <div className="relative hidden lg:flex w-1/2 h-full bg-soft-periwinkle justify-center items-center">
        <img
          src={illustration}
          alt="Reset"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* RIGHT SIDE (Form Section) */}
      <div className="w-full lg:w-1/2 h-full flex justify-center items-center px-10 md:px-20 bg-porcelain">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="font-playfair text-4xl font-bold mb-3 text-ink-black">
              New Password
            </h1>
            <p className="font-playfair text-sm text-gray-600">
              Set a secure password for{" "}
              <span className="text-soft-periwinkle font-semibold">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5 flex flex-col">
              <label className="font-playfair text-sm font-medium uppercase tracking-widest text-lavender-grey text-[10px]">
                New Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border border-warm-taupe rounded-md px-4 outline-none focus:border-soft-periwinkle focus:ring-1 focus:ring-soft-periwinkle transition-all bg-porcelain"
              />
            </div>
            <div className="space-y-1.5 flex flex-col">
              <label className="font-playfair text-sm font-medium uppercase tracking-widest text-lavender-grey text-[10px]">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 border border-warm-taupe rounded-md px-4 outline-none focus:border-soft-periwinkle focus:ring-1 focus:ring-soft-periwinkle transition-all bg-porcelain"
              />
            </div>

            {/* CORRECTED BUTTON: Periwinkle to Lavender Grey */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-12 bg-soft-periwinkle hover:bg-lavender-grey text-ink-black font-semibold rounded-md transition-colors duration-200 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;