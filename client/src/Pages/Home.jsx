import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, Play, Video, BookOpen, Star, User } from "lucide-react";
import axios from "axios";

export default function Home() {
  const navigate = useNavigate();
  const [topCourses, setTopCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroVideo, setHeroVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/courses');
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/courses");
        // Limit to 4 courses for the homepage
        setTopCourses(res.data.slice(0, 4));
      } catch (error) {
        console.error("Failed to load courses:", error);
      } finally {
        setLoading(false);
      }
    };
    const fetchHeroVideo = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/search/external?q=programming%20web%20development%20tutorial");
        if (res.data.videos && res.data.videos.length > 0) {
          setHeroVideo(res.data.videos[0]);
        }
      } catch (err) {
        console.error("Failed to load video");
      }
    };
    fetchCourses();
    fetchHeroVideo();
  }, []);

  return (
    <>
      {/* MAIN CONTENT */}
      <main className="grow">
        
        {/* TOP HERO BANNER */}
        <section 
          className="py-32 px-6 border-b border-soft-linen text-center relative overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop')" }}
        >
          <div className="absolute inset-0 bg-ink-black/60"></div>
          <div className="max-w-3xl mx-auto relative z-10 space-y-4">
             <h1 className="font-playfair text-5xl font-bold text-white drop-shadow-lg">Looking for the perfect course?</h1>
             <p className="text-white/90 text-lg drop-shadow-md">Use our search in multiple categories. The knowledge hub offering career choices and best guidance.</p>
             <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto flex items-center bg-white rounded-full p-2 shadow-xl border border-soft-linen">
               <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for 'Web Development'..." 
                  className="flex-1 bg-transparent border-none focus:outline-none px-6 text-ink-black" 
               />
               <button type="submit" className="bg-soft-periwinkle text-white px-6 py-3 rounded-full font-bold hover:bg-[#797A9E] transition-colors">
                 Search
               </button>
             </form>
          </div>
        </section>

        {/* WELCOME & VIDEO SECTION */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="font-playfair text-4xl font-bold leading-tight text-ink-black">
                Welcome to Platform
              </h2>
              <p className="text-lg text-lavender-grey leading-relaxed">
                Where learning is Flexible, Accessible, and Designed for you. Explore Professionally Guided Courses across various fields and start your journey today!
              </p>
              <button onClick={() => navigate('/courses')} className="bg-porcelain text-ink-black px-6 py-2 rounded-xl font-bold border border-soft-linen hover:bg-gray-50 transition-colors inline-block mt-4">
                 Learn more
              </button>
            </div>
            
            {/* HERO VIDEO EMBED */}
            <div className="relative rounded-none lg:rounded-tl-3xl lg:rounded-bl-3xl overflow-hidden aspect-video bg-porcelain flex items-center justify-center group lg:-mr-6">
              {heroVideo ? (
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`https://www.youtube.com/embed/${heroVideo.videoId}?autoplay=0&controls=1`}
                  title={heroVideo.title}
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="absolute inset-0 w-full h-full object-cover z-10"
                ></iframe>
              ) : (
                <div className="text-lavender-grey animate-pulse">Loading video...</div>
              )}
            </div>
          </div>
        </section>

        {/* TOP COURSES SECTION */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
             <div className="flex justify-between items-end mb-10">
               <div>
                  <h2 className="font-playfair font-bold text-3xl text-ink-black mb-2">Top Courses</h2>
                  <p className="text-lavender-grey">Explore trending topics and advance your career today!</p>
               </div>
               <button onClick={() => navigate('/courses')} className="text-soft-periwinkle font-bold hover:underline text-sm hidden sm:block">View all courses</button>
             </div>

             {loading ? (
               <div className="text-center py-20 text-lavender-grey animate-pulse">Loading courses...</div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {topCourses.map((course) => (
                   <div key={course.id} onClick={() => navigate(`/courses/${course.id}`)} className="bg-white rounded-2xl border border-soft-linen overflow-hidden hover:shadow-2xl transition-all flex flex-col group cursor-pointer hover:-translate-y-1">
                      <div className="relative h-40 bg-porcelain w-full overflow-hidden">
                        <img src={course.thumbnailUrl || `https://placehold.co/400x300/e2e8f0/1e293b?text=Course`} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-soft-periwinkle uppercase px-2 py-1 rounded shadow-sm">
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
                            <div className="font-bold text-ink-black">$49.99</div>
                          </div>
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </section>

        {/* WHY CHOOSE US & TESTIMONIALS */}
        <section className="bg-porcelain py-20 px-6 border-y border-soft-linen">
          <div className="max-w-7xl mx-auto space-y-20">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <h2 className="font-playfair font-bold text-3xl text-ink-black">Why Choose Us</h2>
                <p className="text-lavender-grey leading-relaxed">
                  We make education accessible with expert instructors, self-paced learning, recognized certifications, and affordable pricing. Our diverse courses cover various interests and career goals.
                </p>
                <div className="space-y-3">
                  {['Expert Instructors', 'Self-Paced Learning', 'Interactive Community', 'Lifetime Access', 'Recognized Certifications'].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 font-semibold text-ink-black text-sm">
                      <CheckCircle size={18} className="text-green-500" /> {feature}
                    </div>
                  ))}
                </div>
              </div>
              
              <div 
                className="w-full aspect-square md:aspect-4/3 bg-white rounded-3xl border border-soft-linen shadow-xl overflow-hidden flex items-center justify-center p-8 relative group bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=2070')" }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-ink-black/90 via-ink-black/40 to-transparent"></div>
                <div className="text-center z-10 mt-auto pt-20">
                   <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border border-white/30 text-white">
                      <User size={28} />
                   </div>
                   <h3 className="font-bold text-2xl font-playfair text-white drop-shadow-md pb-2">Expert Taught</h3>
                   <p className="text-sm text-gray-200 max-w-xs mx-auto drop-shadow-md">Join thousands of students learning from the best instructors around the world.</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-playfair font-bold text-3xl text-ink-black mb-10 text-center">Testimonials</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((t) => (
                  <div key={t} className="bg-white p-6 rounded-2xl border border-soft-linen shadow-sm relative">
                    <div className="flex items-center gap-4 mb-4">
                       <div className="w-12 h-12 bg-porcelain rounded-full flex items-center justify-center text-soft-periwinkle">
                         <User size={20} />
                       </div>
                       <div>
                         <h4 className="font-bold text-ink-black text-sm">John Doe</h4>
                         <p className="text-[10px] uppercase font-bold text-lavender-grey">Student</p>
                       </div>
                    </div>
                    <p className="text-sm text-lavender-grey italic relative z-10">
                      "I've learned a lot through this platform. The instructors are amazing and the course content is extremely well-structured."
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>
      </main>
    </>
  );
}
