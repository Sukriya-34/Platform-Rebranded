import { useState, useEffect } from "react";

const LearnerDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // When the page loads, fetch the courses from our backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/courses");
        if (!response.ok) throw new Error("Failed to fetch courses");
        
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen font-poppins">Loading your courses...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500 font-poppins">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-8 font-poppins text-ink-black bg-porcelain min-h-screen">
      
      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-4xl font-playfair font-bold mb-2">Explore Courses</h1>
        <p className="text-gray-600">Discover new skills and continue your learning journey.</p>
      </div>

      {/* Grid of Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 mt-10">No courses available yet. Check back later!</p>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="bg-white border border-warm-taupe rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col">
              
              {/* HTML5 Video Player streaming directly from Cloudinary */}
              {course.videos && course.videos.length > 0 ? (
                <video 
                  src={course.videos[0].videoUrl} 
                  controls 
                  controlsList="nodownload" // A nice touch to prevent easy downloading
                  className="w-full h-48 object-cover bg-black"
                />
              ) : (
                <div className="w-full h-48 bg-soft-periwinkle/20 flex items-center justify-center text-gray-500 font-medium">
                  No Video Content
                </div>
              )}
              
              {/* Course Details Card */}
              <div className="p-6 flex flex-col flex-grow">
                <h2 className="font-playfair font-bold text-xl mb-2 line-clamp-1" title={course.title}>
                  {course.title}
                </h2>
                
                <p className="text-gray-600 text-sm mb-6 line-clamp-2 flex-grow">
                  {course.description}
                </p>
                
                <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-gray-100">
                  <span className="font-medium bg-soft-periwinkle/10 px-2 py-1 rounded text-soft-periwinkle">
                    👨‍🏫 {course.creator?.fullName || "Unknown Instructor"}
                  </span>
                  <span>
                    📅 {new Date(course.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LearnerDashboard;