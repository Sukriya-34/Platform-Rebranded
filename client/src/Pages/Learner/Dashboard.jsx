import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Card } from "../../components/DisplayComponents";
import { Play, Clock, BookOpen } from "lucide-react";

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const { searchQuery } = useOutletContext() || { searchQuery: "" };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes((searchQuery || "").toLowerCase()) ||
    course.category.toLowerCase().includes((searchQuery || "").toLowerCase())
  );

  useEffect(() => {
    // Fetching the REAL data you just seeded!
    fetch("http://localhost:5000/api/courses")
      .then(res => res.json())
      .then(data => setCourses(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-10 font-poppins">
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-5xl font-bold font-playfair mb-4">Explore Courses</h1>
        <p className="text-lavender-grey text-lg italic">"The beautiful thing about learning is that no one can take it away from you."</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredCourses.length > 0 ? filteredCourses.map((course) => (
          <Card
            key={course.id}
            hover
            className="flex flex-col h-full cursor-pointer"
          >
            <div
              onClick={() => navigate(`/learner/courses/${course.id}`)}
              className="flex-1"
            >
              <div className="w-full h-44 bg-porcelain rounded-2xl mb-6 overflow-hidden flex items-center justify-center group">
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
              <span className="text-xs font-bold px-4 py-1.5 bg-porcelain rounded-full text-soft-periwinkle uppercase tracking-wider flex items-center gap-2">
                 <BookOpen size={14}/> {course.category}
              </span>
              <span className="text-sm font-bold text-soft-periwinkle flex items-center gap-1 group-hover:underline">
                View Details <Play size={14} fill="currentColor" />
              </span>
            </div>
          </Card>
        )) : (
          <div className="col-span-full py-10 text-center text-lavender-grey">
            No courses found matching your search "<b>{searchQuery}</b>".
          </div>
        )}
      </div>
    </div>
  );
}