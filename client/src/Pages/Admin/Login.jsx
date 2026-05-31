import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to log in");
      }

      const role = data.user.role.toLowerCase().replace(/\s+/g, "");

      if (role !== "admin") {
        throw new Error("Access Denied: You do not have administrator privileges.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-black font-poppins relative overflow-hidden">
      {/* Abstract Background Design */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-soft-periwinkle rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-warm-taupe rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-2xl relative z-10 border border-white/10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-porcelain rounded-full mb-4">
             <img src="/pathway.svg" alt="Logo" className="w-8 h-8 opacity-80" />
          </div>
          <h1 className="text-3xl font-bold font-playfair text-ink-black mb-2">Admin Portal</h1>
          <p className="text-sm text-lavender-grey">Enter your credentials to securely access the management system.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-semibold rounded shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@platformx.com"
              className="w-full h-12 bg-porcelain border border-soft-linen rounded-lg px-4 outline-none focus:border-soft-periwinkle focus:bg-white transition-all text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full h-12 bg-porcelain border border-soft-linen rounded-lg px-4 outline-none focus:border-soft-periwinkle focus:bg-white transition-all text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-ink-black hover:bg-gray-800 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl uppercase tracking-widest text-sm disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Secure Login"}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-soft-linen text-center">
          <a href="/" className="text-xs text-lavender-grey hover:text-soft-periwinkle font-semibold transition-colors">
            &larr; Return to Public Site
          </a>
        </div>
      </div>
    </div>
  );
}
