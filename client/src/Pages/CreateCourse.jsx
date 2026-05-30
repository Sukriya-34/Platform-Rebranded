import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateCourse = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get the logged-in user's ID from local storage
  const user = JSON.parse(localStorage.getItem("user"));

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Who is uploading?", user);
    if (!videoFile) return alert("Please select a video to upload.");

    setLoading(true);

    // We MUST use FormData when uploading files!
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("creatorId", user.id);
    formData.append("video", videoFile);

    try {
      const response = await fetch("http://localhost:5000/api/courses/create", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      alert("Course uploaded successfully!");
      navigate("/creator-dashboard"); // Send them back to their dashboard
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 font-poppins">
      <h1 className="text-3xl font-playfair font-bold mb-6">
        Create New Course
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col">
          <label className="font-medium mb-2">Course Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-3 rounded-md"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="font-medium mb-2">Course Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-3 rounded-md h-32"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="font-medium mb-2">Upload Video</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files[0])}
            className="border p-3 rounded-md"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-soft-periwinkle hover:bg-lavender-grey text-ink-black font-semibold p-4 rounded-md transition-colors"
        >
          {loading ? "Uploading..." : "Publish Course"}
        </button>
      </form>
    </div>
  );
};

export default CreateCourse;
