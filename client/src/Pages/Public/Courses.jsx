import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, Star, Video, PlayCircle, Clock, ShieldCheck, CheckCircle, User } from "lucide-react";
import axios from "axios";

export default function PublicCourses() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') || "";

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/courses");
        setCourses(res.data);
      } catch (error) {
        console.error("Failed to load courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Filter courses based on search query
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group courses by category
  const categorizedCourses = filteredCourses.reduce((acc, course) => {
    const category = course.category || "General";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(course);
    return acc;
  }, {});

  return (
    <div className="w-full">
      {/* HEADER BANNER */}
      <section 
        className="py-32 px-6 text-center relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-ink-black/60 backdrop-blur-sm"></div>
        <div className="max-w-3xl mx-auto relative z-10 space-y-6">
           <h1 className="font-playfair text-5xl font-bold leading-tight text-white drop-shadow-lg">
             Enhancing Education Through Outstanding Support
           </h1>
           <p className="text-white/90 text-lg drop-shadow-md max-w-2xl mx-auto">
             Explore thousands of categories and transform your career with expertly guided lessons.
           </p>
           
           <div className="mt-8 max-w-xl mx-auto flex items-center bg-white rounded-full p-2 shadow-2xl">
             <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for courses, skills, or topics..." 
                className="flex-1 bg-transparent border-none focus:outline-none px-6 text-ink-black" 
             />
             <button className="bg-soft-periwinkle text-white px-8 py-3 rounded-full font-bold hover:bg-[#797A9E] transition-colors">
               Search
             </button>
           </div>
        </div>
      </section>

      {/* CATEGORY GROUPS */}
      <section className="py-20 px-6 bg-white space-y-24">
        <div className="max-w-7xl mx-auto space-y-20">
           {loading ? (
             <div className="text-center py-20 text-lavender-grey animate-pulse">Loading all premium courses...</div>
           ) : Object.keys(categorizedCourses).length > 0 ? (
             Object.entries(categorizedCourses).map(([category, catCourses]) => (
               <div key={category} className="space-y-6">
                 <h2 className="font-playfair font-bold text-3xl text-ink-black border-b border-soft-linen pb-3">{category}</h2>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                   {catCourses.map((course) => (
                     <CourseCard key={course.id} course={course} navigate={navigate} />
                   ))}
                 </div>
               </div>
             ))
           ) : (
             <div className="text-center py-20 text-lavender-grey">No courses available at the moment.</div>
           )}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="bg-porcelain py-20 px-6 border-y border-soft-linen">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="font-playfair font-bold text-3xl text-ink-black">How it works?</h2>
            <p className="text-lavender-grey leading-relaxed">
               Visual tours with zoom. Get an exclusive look at how you can interact with our platform to accelerate your learning journey natively. 
            </p>
            <div className="space-y-4 mt-6">
              {[
                'Create Profile',
                'Select Your Courses',
                'Learn From Experts',
                'Get Certifications',
                'Lifetime Access & Community'
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3 font-semibold text-ink-black text-sm">
                  <div className="w-6 h-6 rounded-full bg-soft-periwinkle text-white flex items-center justify-center text-xs font-bold">{i + 1}</div>
                  {step}
                </div>
              ))}
            </div>
          </div>
          
          <div className="w-full aspect-square md:aspect-video bg-warm-taupe/20 rounded-3xl border-4 border-white shadow-xl overflow-hidden flex items-center justify-center relative">
             <PlayCircle size={64} className="text-soft-periwinkle/50 z-10 absolute" />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-playfair font-bold text-3xl text-ink-black mb-10">Testimonials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((t) => (
              <div key={t} className="bg-white p-6 rounded-2xl border border-soft-linen shadow-sm relative">
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-12 h-12 bg-ink-black rounded-full flex items-center justify-center text-white font-bold">
                     JD
                   </div>
                   <div>
                     <h4 className="font-bold text-ink-black text-sm">John Doe</h4>
                     <p className="text-[10px] uppercase font-bold text-lavender-grey">UI/UX Designer</p>
                   </div>
                </div>
                <p className="text-sm text-lavender-grey italic relative z-10">
                  "I've learned a lot through this platform. The instructors are amazing and the course content is extremely well-structured."
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

// Reusable Course Card specifically matching wireframe
function CourseCard({ course, navigate }) {
  return (
    <div onClick={() => navigate(`/courses/${course.id}`)} className="bg-white rounded-2xl border border-soft-linen overflow-hidden hover:shadow-2xl transition-all flex flex-col group cursor-pointer hover:-translate-y-1">
      <div className="relative h-44 bg-porcelain w-full overflow-hidden">
        <img 
          src={course.thumbnailUrl || `https://placehold.co/400x300/e2e8f0/1e293b?text=Course`} 
          alt={course.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-soft-periwinkle uppercase px-3 py-1 rounded-full shadow-sm">
          {course.category}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-base text-ink-black mb-2 line-clamp-2 leading-tight group-hover:text-soft-periwinkle transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-lavender-grey line-clamp-2 mb-4">
          {course.description}
        </p>
        
        <div className="mt-auto">
          <div className="flex items-center gap-1 text-sm font-bold text-ink-black mb-3">
            <span className="text-yellow-500 flex"><Star size={14} fill="currentColor" /></span>
            4.8 <span className="text-xs text-lavender-grey font-normal">(1,204 ratings)</span>
          </div>
          <div className="flex items-center justify-between border-t border-soft-linen pt-3">
            <div className="flex items-center gap-1 text-xs text-lavender-grey font-bold">
              <Video size={14} className="text-soft-periwinkle"/> {course._count?.videos || 0} Videos
            </div>
            <button className="bg-porcelain text-ink-black px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-soft-periwinkle hover:text-white transition-colors">
              Explore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
