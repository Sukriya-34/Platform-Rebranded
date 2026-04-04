import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CreatorLayout from "../../components/CreatorLayout";

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [contents, setContents] = useState([]);
  const [file, setFile] = useState(null);
  const [uploadData, setUploadData] = useState({ title: "", type: "video" });

  useEffect(() => {
    // Fetch Course info
    fetch(`http://localhost:5000/api/courses/${id}`)
      .then((res) => res.json())
      .then((data) => setCourse(data));

    // Fetch Content
    fetch(`http://localhost:5000/api/content/course/${id}`)
      .then((res) => res.json())
      .then((data) => setContents(data));
  }, [id]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", uploadData.title);
    formData.append("type", uploadData.type);
    formData.append("courseId", id);
    formData.append("uploadedBy", 1); // Mock user ID

    try {
      const res = await fetch("http://localhost:5000/api/content/upload", {
        method: "POST",
        body: formData, // Fetch automatically sets correct Content-Type for FormData
      });
      const data = await res.json();
      if (res.ok) {
        setContents([...contents, data]);
        setUploadData({ title: "", type: "video" });
        setFile(null);
      }
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  if (!course)
    return (
      <CreatorLayout>
        <p>Loading...</p>
      </CreatorLayout>
    );

  return (
    <CreatorLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Course Info & Content List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-soft-linen p-8 rounded-2xl shadow-sm">
            <span className="px-3 py-1 bg-white text-soft-periwinkle rounded-lg text-xs font-medium uppercase tracking-wider mb-4 inline-block">
              {course.category}
            </span>
            <h1 className="text-3xl font-bold font-playfair mb-4 text-ink-black">
              {course.title}
            </h1>
            <p className="text-lavender-grey">{course.description}</p>
          </div>

          <div className="bg-porcelain border border-soft-linen p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">Course Content</h2>
            {contents.length === 0 ? (
              <p className="text-sm text-warm-taupe">
                No content uploaded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {contents.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-soft-linen"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">
                        {item.type === "video" ? "🎥" : "📄"}
                      </span>
                      <div>
                        <p className="font-medium text-ink-black">
                          {item.title}
                        </p>
                        <a
                          href={`http://localhost:5000${item.url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-soft-periwinkle hover:underline"
                        >
                          View File
                        </a>
                      </div>
                    </div>
                    <span className="text-xs text-warm-taupe uppercase">
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Upload Form */}
        <div>
          <div className="bg-soft-linen p-6 rounded-2xl shadow-sm sticky top-0">
            <h3 className="font-bold text-lg mb-4 text-ink-black">
              Upload Content
            </h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-lavender-grey">
                  Content Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-porcelain border border-warm-taupe rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-soft-periwinkle"
                  value={uploadData.title}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-lavender-grey">
                  Type
                </label>
                <select
                  className="w-full bg-porcelain border border-warm-taupe rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-soft-periwinkle"
                  value={uploadData.type}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, type: e.target.value })
                  }
                >
                  <option value="video">Video (MP4)</option>
                  <option value="document">Document (PDF)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-lavender-grey">
                  File
                </label>
                <input
                  type="file"
                  required
                  accept={
                    uploadData.type === "video"
                      ? "video/mp4"
                      : "application/pdf"
                  }
                  className="w-full bg-porcelain border border-warm-taupe rounded-lg px-3 py-2 text-sm text-ink-black file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-soft-periwinkle file:text-white"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-soft-periwinkle text-white py-2.5 rounded-xl font-medium text-sm hover:bg-opacity-90 transition-all mt-4"
              >
                Upload File
              </button>
            </form>
          </div>
        </div>
      </div>
    </CreatorLayout>
  );
};

export default CourseDetail;
