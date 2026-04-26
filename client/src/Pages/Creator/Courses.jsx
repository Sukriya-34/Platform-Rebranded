import React, { useState, useEffect } from "react";
import { Plus, BookOpen, Edit2, Trash2 } from "lucide-react";
import { Button, Input, Textarea, Select } from "../../components/SharedForms";
import { Card, Modal, Toast } from "../../components/DisplayComponents";
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";

export default function Courses() {
  const { searchQuery } = useOutletContext();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [editingId, setEditingId] = useState(null); // Track if we are editing
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    thumbnail: null,
  });

  const fetchCourses = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/courses");
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Open modal in Edit Mode
  const handleEditClick = (course, e) => {
    e.stopPropagation();
    setEditingId(course.id);
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      thumbnail: null, // Only update if they pick a new file
    });
    setShowCreate(true);
  };

  // Reset form and close modal
  const handleCloseModal = () => {
    setShowCreate(false);
    setEditingId(null);
    setFormData({ title: "", description: "", category: "", thumbnail: null });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    const dataToSend = new FormData();
    dataToSend.append("title", formData.title);
    dataToSend.append("description", formData.description);
    dataToSend.append("category", formData.category);
    dataToSend.append("creatorId", "1");
    if (formData.thumbnail) {
      dataToSend.append("thumbnail", formData.thumbnail);
    }

    // Switch between CREATE and UPDATE based on editingId
    const url = editingId
      ? `http://localhost:5000/api/courses/${editingId}`
      : "http://localhost:5000/api/courses/create";

    const method = editingId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        body: dataToSend,
      });

      if (response.ok) {
        handleCloseModal();
        setToastMessage(
          editingId ? "Course updated!" : "Course created successfully!",
        );
        fetchCourses();
      }
    } catch (error) {
      setToastMessage("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold font-playfair mb-2 tracking-tight">
            My Courses
          </h1>
          <p className="text-lavender-grey font-medium">
            Manage and organize your educational curriculum.
          </p>
        </div>
        <div className="w-fit">
          <Button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl shadow-lg shadow-soft-periwinkle/20"
          >
            <Plus size={20} /> Create Course
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <Card
            key={course.id}
            hover
            className="flex flex-col h-full cursor-pointer"
          >
            <div
              onClick={() => navigate(`/creator/courses/${course.id}`)}
              className="flex-1"
            >
              <div className="w-full h-44 bg-porcelain rounded-2xl mb-6 overflow-hidden flex items-center justify-center">
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <BookOpen size={44} className="text-soft-periwinkle/60" />
                )}
              </div>

              <h3 className="text-xl font-bold mb-2 leading-tight">
                {course.title}
              </h3>
              <p className="text-sm text-lavender-grey mb-6 line-clamp-2 leading-relaxed">
                {course.description}
              </p>
            </div>

            <div className="flex items-center justify-between mt-auto pt-5 border-t border-soft-linen">
              <span className="text-xs font-bold px-4 py-1.5 bg-porcelain rounded-full text-soft-periwinkle uppercase tracking-wider">
                {course.category}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={(e) => handleEditClick(course, e)}
                  className="p-2 text-lavender-grey hover:text-soft-periwinkle hover:bg-porcelain rounded-xl transition-all"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    await fetch(
                      `http://localhost:5000/api/courses/${course.id}`,
                      { method: "DELETE" },
                    );
                    setToastMessage("Deleted.");
                    fetchCourses();
                  }}
                  className="p-2 text-lavender-grey hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showCreate}
        onClose={handleCloseModal}
        title={editingId ? "Edit Course Draft" : "New Course Draft"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
          />
          <Select
            label="Category"
            options={[
              { value: "Development", label: "Development" },
              { value: "Web Development", label: "Web Development" },
              { value: "Mobile Development", label: "Mobile Development" },
              { value: "Programming", label: "Programming" },
              { value: "Backend", label: "Backend" },
              { value: "Data Science", label: "Data Science" },
              { value: "Design", label: "Design" },
              { value: "Business", label: "Business" },
              { value: "Marketing", label: "Marketing" },
              { value: "IT & Software", label: "IT & Software" },
              { value: "Personal Development", label: "Personal Development" },
            ]}
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            required
          />

          <div className="space-y-2">
            <label className="text-sm font-bold text-ink-black">
              {editingId ? "Update Thumbnail (Optional)" : "Course Thumbnail"}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData({ ...formData, thumbnail: e.target.files[0] })
              }
              className="w-full p-3 border border-soft-linen rounded-2xl text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : (editingId ? "Update Course" : "Publish Draft")}
            </Button>
          </div>
        </form>
      </Modal>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}
    </div>
  );
}
