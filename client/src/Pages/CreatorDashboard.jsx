import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreatorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    fileUrl: "",
  });

  const user = JSON.parse(localStorage.getItem("user")) || {
    fullName: "Creator",
  };

  const handleChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
    setMessage({ type: "", text: "" });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You must be logged in to upload.");

      const response = await fetch("http://localhost:5000/api/courses/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(courseData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload course.");
      }

      setMessage({
        type: "success",
        text: "✨ Course published successfully!",
      });
      setCourseData({ title: "", description: "", fileUrl: "" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-porcelain font-poppins text-ink-black">
      {/* TOP NAVIGATION BAR */}
      <nav className="h-16 bg-white border-b border-warm-taupe flex items-center justify-between px-8 shadow-sm">
        <h1 className="font-playfair text-2xl font-bold text-soft-periwinkle tracking-wide">
          Platform.
        </h1>

        {/* Upgraded Premium User Menu */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            {/* Cute Avatar Circle */}
            <div className="w-8 h-8 rounded-full bg-porcelain border border-warm-taupe text-soft-periwinkle flex items-center justify-center font-bold font-playfair text-lg shadow-sm">
              {user.fullName ? user.fullName[0].toUpperCase() : "C"}
            </div>
            <span className="text-sm font-medium text-ink-black">
              Hello, {user.fullName || "Creator"}
            </span>
          </div>

          {/* Vertical Divider */}
          <div className="h-6 w-px bg-warm-taupe opacity-50"></div>

          {/* Styled Logout Button */}
          <button
            onClick={handleLogout}
            className="text-sm px-4 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-md font-medium transition-all"
          >
            Log out
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-3xl mx-auto py-12 px-6">
        <div className="mb-8">
          <h2 className="font-playfair text-3xl font-bold mb-2">Creator Hub</h2>
          <p className="text-gray-600 text-sm">
            Upload new learning materials and resources for your students.
          </p>
        </div>

        {/* UPLOAD FORM CARD */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-warm-taupe">
          <h3 className="font-playfair text-xl font-semibold mb-6 border-b border-gray-100 pb-4">
            Publish a New Course
          </h3>

          {message.text && (
            <div
              className={`mb-6 p-3 text-sm rounded-md text-center ${message.type === "success" ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-5">
            <div className="flex flex-col">
              <label className="font-playfair text-sm font-medium mb-1.5">
                Course Title<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={courseData.title}
                onChange={handleChange}
                placeholder="e.g., Introduction to React"
                className="h-12 border border-warm-taupe rounded-md px-4 outline-none focus:border-soft-periwinkle focus:ring-1 focus:ring-soft-periwinkle transition-all"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="font-playfair text-sm font-medium mb-1.5">
                Course Description
              </label>
              <textarea
                name="description"
                value={courseData.description}
                onChange={handleChange}
                placeholder="What will students learn in this course?"
                rows="3"
                className="border border-warm-taupe rounded-md p-4 outline-none focus:border-soft-periwinkle focus:ring-1 focus:ring-soft-periwinkle transition-all resize-none"
              ></textarea>
            </div>

            <div className="flex flex-col">
              <label className="font-playfair text-sm font-medium mb-1.5">
                Resource Link (Video/Document URL)
                <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="fileUrl"
                value={courseData.fileUrl}
                onChange={handleChange}
                placeholder="https://youtube.com/..."
                className="h-12 border border-warm-taupe rounded-md px-4 outline-none focus:border-soft-periwinkle focus:ring-1 focus:ring-soft-periwinkle transition-all bg-white [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[0_0_0_30px_#ffffff_inset]"
                required
              />
              {/* <span className="text-xs text-gray-400 mt-1">
                For this demo, paste a link to a YouTube video or Google Doc.
              </span> */}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-12 mt-4 bg-soft-periwinkle hover:bg-lavender-grey text-ink-black font-semibold rounded-md transition-colors duration-200 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? "Publishing..." : "Publish Course"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
