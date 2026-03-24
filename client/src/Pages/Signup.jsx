import React, { useState } from "react";
//vite handles import automatically. make sure you named your image 'auth-illustration.png'
import illustration from "../assets/auth-illustration.png";
import { registerUser } from "../api/auth";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const[message, setMessage] = useState(null);
  const[error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  //fetch function that sends data to your express bakecnd
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    console.log("Sending to backend:", formData);
  

  try {
    const data = await registerUser(formData); 
    setMessage(`Success! Your new email is: ${data.assignedEmail}`);
    setFormData({ fullName: "", email: "", password: "" });
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    // MAIN WRAPPER: Takes up full screen height (h-screen) and width (w-full).
    // Uses Poppins as default font, Ink Black as default text color.
    <div className="flex h-screen w-full overflow-hidden font-poppins text-ink-black bg-porcelain">
      {/* LEFT SIDE: THE ILLUSTRATION (Desktop Only)*/}

      <div className="relative hidden lg:flex w-1/2 h-full bg-soft-periwinkle justify-center items-center">
        {/* We removed the old containment classes. The image now fills the column. */}
        <img
          src={illustration}
          alt="Auth Illustration"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* RIGHT SIDE: THE SIGNUP FORM*/}
      <div className="w-full lg:w-1/2 h-full flex justify-center items-center px-8 sm:px-16 bg-porcelain overflow-y-auto">
        {/* Maximum width of the form arecdto keep it contained (max-w-md = 400px) */}
        <div className="w-full max-w-md py-8">
          {" "}
          {/* Form Header */}
          <div className="text-center mb-10">
            {/* The title (already Playfair) */}
            <h1 className="font-playfair text-4xl font-bold mb-3 text-ink-black">
              Create your account
            </h1>

            {/* NEW FONT FIX: Description text updated to Playfair */}
            <p className="font-playfair text-sm text-gray-600 leading-relaxed">
              Begin your journey in Platform. Takes less than a minute.
            </p>
          </div>
          {/* The Actual Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* FULL NAME FIELD */}
            <div className="flex flex-col">
              {/* NEW FONT FIX: Label updated to Playfair */}
              <label className="font-playfair text-sm font-medium mb-1.5">
                Full name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                // The border is your warm-taupe, and it glows periwinkle when clicked!
                className="h-12 border border-warm-taupe rounded-md px-4 outline-none focus:border-soft-periwinkle focus:ring-1 focus:ring-soft-periwinkle transition-all bg-porcelain"
                required
              />
            </div>

            {/* EMAIL FIELD */}
            <div className="flex flex-col">
              {/* NEW FONT FIX: Label updated to Playfair */}
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

            {/* PASSWORD FIELD */}
            <div className="flex flex-col">
              {/* NEW FONT FIX: Label updated to Playfair */}
              <label className="font-playfair text-sm font-medium mb-1.5">
                Password<span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                className="h-12 border border-warm-taupe rounded-md px-4 outline-none focus:border-soft-periwinkle focus:ring-1 focus:ring-soft-periwinkle transition-all bg-porcelain"
                required
              />
            </div>

            {/* TERMS & CONDITIONS CHECKBOX */}
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

            {/* CREATE ACCOUNT BUTTON */}
            <button
              type="submit"
              className="w-full h-12 bg-soft-periwinkle hover:bg-lavender-grey text-ink-black font-semibold rounded-md transition-colors duration-200"
            >
              Create account
            </button>
          </form>
          {/* SOCIAL LOGIN & FOOTER*/}
          {/* The "OR" divider line */}
          <div className="flex items-center my-8">
            <div className="grow border-t border-warm-taupe"></div>
            <span className="mx-4 text-gray-400 text-sm">or</span>
            <div className="grow border-t border-warm-taupe"></div>
          </div>
          {/* GOOGLE SIGN IN BUTTON */}
          <button
            type="button"
            // Notice the 'shadow-sm' class here to give it that slight lift!
            className="w-full h-12 flex items-center justify-center bg-white border border-warm-taupe shadow-sm rounded-md hover:bg-soft-linen transition-colors duration-200 mb-8"
          >
            {/* Standard Google "G" SVG Icon */}
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
          {/* LINK TO LOGIN PAGE */}
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
