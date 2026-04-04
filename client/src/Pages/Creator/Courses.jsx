import React, { useState, useEffect } from "react";
import { Plus, BookOpen, Edit2, Trash2 } from "lucide-react";
import { Button, Input, Textarea, Select } from "../../components/SharedForms";
import { Card, Modal, Toast } from "../../components/DisplayComponents";
import { useNavigate } from "react-router-dom";

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  });

  useEffect(() => {
    setCourses([
      {
        id: 1,
        title: "Introduction to Web Development",
        description:
          "Master the fundamentals of the modern web: HTML5, CSS3, and JS.",
        category: "Web",
      },
      {
        id: 2,
        title: "Advanced React Patterns",
        description:
          "Deep dive into HOCs, Render Props, and Compound Components.",
        category: "Programming",
      },
    ]);
  }, []);

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
              <div className="w-full h-40 bg-porcelain rounded-2xl mb-6 flex items-center justify-center">
                <BookOpen size={44} className="text-soft-periwinkle/60" />
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setToastMessage("Edit coming soon!");
                  }}
                  className="p-2 text-lavender-grey hover:text-soft-periwinkle hover:bg-porcelain rounded-xl transition-all"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCourses(courses.filter((c) => c.id !== course.id));
                    setToastMessage("Deleted.");
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
        onClose={() => setShowCreate(false)}
        title="New Course Draft"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setCourses([...courses, { id: Date.now(), ...formData }]);
            setShowCreate(false);
            setToastMessage("Course created!");
          }}
          className="space-y-6"
        >
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
              { value: "Web", label: "Web" },
              { value: "Programming", label: "Programming" },
            ]}
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            required
          />
          <div className="flex justify-end gap-3 pt-6">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button type="submit">Publish Draft</Button>
          </div>
        </form>
      </Modal>
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}
    </div>
  );
}
