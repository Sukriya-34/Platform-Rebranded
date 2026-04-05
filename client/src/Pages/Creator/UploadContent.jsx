import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios for the progress bar
import { CheckCircle, Loader2 } from "lucide-react";
import { Card } from "../../components/DisplayComponents";
import {
  Button,
  Input,
  Textarea,
  Select,
  UploadBox,
} from "../../components/SharedForms";

export default function UploadContent() {
  const [contentType, setContentType] = useState("video");
  const [myCourses, setMyCourses] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    courseId: "",
    file: null,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // The Green Line state
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const categories = [
    { value: "Web Development", label: "Web Development" },
    { value: "Programming", label: "Programming" },
    { value: "Backend", label: "Backend" },
    { value: "Design", label: "Design" },
    { value: "Data Science", label: "Data Science" },
    { value: "Mobile Development", label: "Mobile Development" },
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/courses");
        const options = res.data.map((c) => ({ value: c.id, label: c.title }));
        setMyCourses(options);
      } catch (err) {
        console.error("Failed to load courses", err);
      }
    };
    fetchCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) return alert("Please select a file");

    setUploading(true);
    setUploadProgress(0);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("courseId", formData.courseId);
    data.append("category", formData.category);
    data.append("type", contentType);
    data.append(contentType, formData.file);

    try {
      // AXIOS handles the progress bar logic here
      const response = await axios.post(
        "http://localhost:5000/api/courses/upload-content",
        data,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(percentCompleted); // This moves the green line!
          },
        },
      );

      if (response.status === 201) {
        setUploadSuccess(true);
      }
    } catch (error) {
      console.error(error);
      alert("Upload failed. Make sure your server is running.");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      courseId: "",
      file: null,
    });
    setUploadProgress(0);
    setUploadSuccess(false);
  };

  return (
    <div className="max-w-4xl mx-auto font-poppins text-ink-black">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-playfair tracking-tight">
          Upload Content
        </h1>
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-6 border-b border-soft-linen pb-4">
          <button
            type="button"
            onClick={() => setContentType("video")}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              contentType === "video"
                ? "bg-soft-periwinkle text-white shadow-md"
                : "bg-porcelain text-lavender-grey"
            }`}
          >
            Upload Video
          </button>
          <button
            type="button"
            onClick={() => setContentType("document")}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              contentType === "document"
                ? "bg-soft-periwinkle text-white shadow-md"
                : "bg-porcelain text-lavender-grey"
            }`}
          >
            Upload Document
          </button>
        </div>

        {uploadSuccess ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <h3 className="text-2xl font-bold mb-2 font-playfair">
              Upload Successful!
            </h3>
            <p className="text-lavender-grey mb-6">
              Your content is now attached to the course.
            </p>
            <Button onClick={resetForm}>Upload Another</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <UploadBox
              type={contentType}
              accept={contentType === "video" ? "video/*" : ".pdf,.doc,.docx"}
              onFileSelect={(f) => setFormData({ ...formData, file: f })}
            />

            <Input
              label="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder={`Enter ${contentType} title`}
              required
            />

            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder={`Describe your content`}
              required
              rows={4}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Select a Course"
                value={formData.courseId}
                onChange={(e) =>
                  setFormData({ ...formData, courseId: e.target.value })
                }
                options={myCourses}
                placeholder="Attach to course"
                required
              />

              <Select
                label="Category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                options={categories}
                placeholder="Select category"
                required
              />
            </div>

            {/* THE GREEN PROGRESS BAR IS BACK! */}
            {uploading && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm text-lavender-grey">
                  <span>Uploading to Cloudinary...</span>
                  <span className="font-bold text-soft-periwinkle">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-porcelain rounded-full overflow-hidden border border-soft-linen">
                  <div
                    className="h-full bg-green-500 transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={resetForm}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!formData.file || uploading}>
                {uploading ? "Processing..." : "Upload Content"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
