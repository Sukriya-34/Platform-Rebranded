import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CreatorLayout from "../../components/CreatorLayout";

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // We will replace this with an actual API call later
  useEffect(() => {
    fetch("http://localhost:5000/api/courses")
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch courses", err);
        setLoading(false);
      });
  }, []);

  return (
    <CreatorLayout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold font-playfair mb-2">My Courses</h1>
          <p className="text-lavender-grey text-sm">
            {courses.length} courses total
          </p>
        </div>
        <Link
          to="/creator/courses/new"
          className="bg-soft-periwinkle text-white px-6 py-2.5 rounded-xl font-medium hover:bg-opacity-90 transition-all shadow-sm"
        >
          + Create Course
        </Link>
      </div>

      {loading ? (
        <p>Loading courses...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/creator/courses/${course.id}`}
              className="block group"
            >
              <div className="bg-soft-linen rounded-2xl p-6 h-full border border-transparent group-hover:border-warm-taupe transition-all shadow-sm">
                <div className="w-full h-40 bg-porcelain rounded-xl mb-6 flex items-center justify-center opacity-70">
                  <span className="text-4xl text-soft-periwinkle">📖</span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-ink-black">
                  {course.title}
                </h3>
                <p className="text-sm text-lavender-grey mb-4 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 mt-auto">
                  <div className="flex gap-4 text-xs font-medium text-lavender-grey">
                    <span>🎥 0 videos</span>
                    <span>📄 0 docs</span>
                  </div>
                  <span className="px-3 py-1 bg-white text-soft-periwinkle rounded-lg text-xs font-medium uppercase tracking-wider">
                    {course.category}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </CreatorLayout>
  );
};

export default MyCourses;
