import React, { useState } from "react";
// We can just reuse your existing auth illustration here to keep it simple!
import illustration from "../assets/auth-illustration.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Sending reset link to:", email);
    // TODO: Add Node.js password reset API call here
    alert("If an account exists, a reset link will be sent to your email!");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-poppins text-ink-black bg-porcelain">
      {/* LEFT SIDE (Same Full Bleed Image) */}
      <div className="relative hidden lg:flex w-1/2 h-full bg-soft-periwinkle justify-center items-center">
        <img
          src={illustration}
          alt="Forgot Password Illustration"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 h-full flex justify-center items-center px-8 sm:px-16 bg-porcelain overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-playfair text-4xl font-bold mb-3 text-ink-black">
              Reset password
            </h1>
            <p className="font-playfair text-sm text-gray-600 leading-relaxed">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col">
              <label className="font-playfair text-sm font-medium mb-1.5">
                Email address<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border border-warm-taupe rounded-md px-4 outline-none focus:border-soft-periwinkle focus:ring-1 focus:ring-soft-periwinkle transition-all bg-porcelain"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-soft-periwinkle hover:bg-lavender-grey text-ink-black font-semibold rounded-md transition-colors duration-200"
            >
              Send reset link
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-8 text-center">
            <a
              href="/login"
              className="text-sm text-soft-periwinkle font-semibold hover:text-lavender-grey hover:underline transition-colors flex items-center justify-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to log in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
