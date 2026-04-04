import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreatorLayout from "../../components/CreatorLayout";

const CreateCourse = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Mock user ID for now until Auth is hooked up
      const payload = { ...formData, createdBy: 1 };
      const res = await fetch("http://localhost:5000/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        navigate(`/creator/courses/${data.id}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <CreatorLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold font-playfair mb-8">
          Create New Course
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-soft-linen p-8 rounded-2xl shadow-sm"
        >
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-ink-black">
              Course Title
            </label>
            <input
              type="text"
              required
              className="w-full bg-porcelain border border-warm-taupe rounded-xl px-4 py-3 focus:outline-none focus:border-soft-periwinkle"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-ink-black">
              Description
            </label>
            <textarea
              required
              rows="4"
              className="w-full bg-porcelain border border-warm-taupe rounded-xl px-4 py-3 focus:outline-none focus:border-soft-periwinkle resize-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            ></textarea>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium mb-2 text-ink-black">
              Category
            </label>
            <select
              required
              className="w-full bg-porcelain border border-warm-taupe rounded-xl px-4 py-3 focus:outline-none focus:border-soft-periwinkle"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="">Select a category...</option>
              <option value="development">Web Development</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-soft-periwinkle text-white px-6 py-3 rounded-xl font-medium hover:bg-opacity-90 w-full"
            >
              Create Course
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-warm-taupe bg-opacity-30 text-ink-black px-6 py-3 rounded-xl font-medium hover:bg-opacity-50 w-full"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </CreatorLayout>
  );
};

export default CreateCourse;
