import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Card } from "../../components/DisplayComponents";
import { Play, Clock, BookOpen, User } from "lucide-react";

export default function MyLearning() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const { searchQuery } = useOutletContext() || { searchQuery: "" };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes((searchQuery || "").toLowerCase()) ||
    course.category.toLowerCase().includes((searchQuery || "").toLowerCase())
  );

  useEffect(() => {
    // For now, we simulate enrolled courses by fetching all and picking a subset.
    // In a real DB, you'd fetch /api/users/:id/enrolled-courses
    fetch("http://localhost:5000/api/courses")
      .then(res => res.json())
      .then(data => {
         if (Array.isArray(data)) {
            // Mock enrollment: slice the first 2 courses or show all if < 2
            setCourses(data.slice(0, 2));
         }
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-10 font-poppins w-full">
      <div className="mb-12 text-center md:text-left flex items-center gap-4">
        <div className="p-4 bg-soft-periwinkle/10 rounded-2xl hidden md:block">
           <User size={32} className="text-soft-periwinkle" />
        </div>
        <div>
           <h1 className="text-4xl font-bold font-playfair mb-2">My Learning Paths</h1>
           <p className="text-lavender-grey">Continue your journey and pick up where you left off.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {courses.length === 0 ? (
          <div className="col-span-full py-20 text-center text-lavender-grey">
             <div className="bg-porcelain w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                 <BookOpen size={48} className="opacity-30" />
             </div>
             <p className="text-xl font-bold text-ink-black mb-2">No courses enrolled yet.</p>
             <p className="mb-6">Explore our library to find something exciting to learn!</p>
             <button 
                onClick={() => navigate('/learner/dashboard')}
                className="px-6 py-3 bg-soft-periwinkle text-white font-bold rounded-xl shadow-lg shadow-soft-periwinkle/20"
             >
                Explore Courses
             </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="col-span-full py-10 text-center text-lavender-grey">
            No enrolled courses found for "<b>{searchQuery}</b>".
          </div>
        ) : filteredCourses.map((course) => (
          <Card
            key={course.id}
            hover
            className="flex flex-col h-full cursor-pointer"
          >
            <div
              onClick={() => navigate(`/learner/courses/${course.id}`)}
              className="flex-1"
            >
              <div className="w-full h-44 bg-porcelain rounded-2xl mb-6 overflow-hidden flex items-center justify-center group relative">
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <BookOpen size={44} className="text-soft-periwinkle/60" />
                )}
                {/* Overlay Progress Simulation */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/50 backdrop-blur-md">
                   <div className="h-full bg-soft-periwinkle w-1/3"></div>
                </div>
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
                 <Clock size={14}/> 30% Complete
              </span>
              <button 
                onClick={() => navigate(`/learner/courses/${course.id}`)}
                className="text-sm font-bold text-soft-periwinkle flex items-center gap-1 hover:underline"
              >
                Resume <Play size={14} fill="currentColor" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
