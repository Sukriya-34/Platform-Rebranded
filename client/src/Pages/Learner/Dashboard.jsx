import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Flame, Sparkles, BookMarked, ArrowRight, BookOpen, Play, MonitorPlay, FileText, Loader2, Video } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ continueLearning: [], recommended: [], trending: [] });
  const [loading, setLoading] = useState(true);

  // New state for external resources
  const [externalVideos, setExternalVideos] = useState([]);
  const [externalDocs, setExternalDocs] = useState([]);
  const [isSearchingExternal, setIsSearchingExternal] = useState(false);

  const { searchQuery } = useOutletContext() || { searchQuery: "" };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get user from local storage to show personalized enrollments
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = user.id || 1; // Fallback to 1 for demo

        const res = await fetch(`http://localhost:5000/api/learner/dashboard-data/${userId}`);
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Debounced External Search
  useEffect(() => {
    const fetchExternal = async () => {
      if (!searchQuery || searchQuery.length < 3) {
        setExternalVideos([]);
        setExternalDocs([]);
        return;
      }
      
      setIsSearchingExternal(true);
      try {
        const res = await fetch(`http://localhost:5000/api/search/external?q=${encodeURIComponent(searchQuery)}`);
        const result = await res.json();
        if (result.videos) setExternalVideos(result.videos);
        if (result.documents) setExternalDocs(result.documents);
      } catch(err) {
        console.error("External search error:", err);
      } finally {
        setIsSearchingExternal(false);
      }
    };

    const timerId = setTimeout(() => {
      fetchExternal();
    }, 800);

    return () => clearTimeout(timerId);
  }, [searchQuery]);

  if (loading) return <div className="p-20 text-center animate-pulse">Loading Experience...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-14 font-poppins">
      
      {/* 1. WELCOME BANNER */}
      <section className="relative rounded-3xl overflow-hidden bg-ink-black p-12 shadow-2xl">
        <div className="relative z-10 space-y-3">
          <p className="text-soft-periwinkle text-sm font-medium tracking-widest uppercase">Welcome back</p>
          <h1 className="font-playfair text-white text-5xl font-bold leading-tight">
            Continue your journey,<br />
            <span className="text-soft-periwinkle">Learner</span>
          </h1>
        </div>
      </section>

      {/* 2. CONTINUE LEARNING (From Enrollments) */}
      <section className="space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-soft-periwinkle/10 flex items-center justify-center"><BookMarked className="text-soft-periwinkle" /></div>
          <div><h2 className="font-playfair font-bold text-ink-black text-2xl">Continue Learning</h2></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(data.continueLearning || []).map((item) => (
            <CourseCard key={item.id} course={item.course} progress={item.progress} navigate={navigate} />
          ))}
        </div>
      </section>

      {/* 3. RECOMMENDED SECTION */}
      <section className="space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-soft-periwinkle/10 flex items-center justify-center"><Sparkles className="text-soft-periwinkle" /></div>
          <div><h2 className="font-playfair font-bold text-ink-black text-2xl">Recommended for You</h2></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(data.recommended || []).map((course) => (
            <CourseCard key={course.id} course={course} navigate={navigate} />
          ))}
        </div>
      </section>

      {/* 4. TRENDING COURSES SECTION */}
      <section className="space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-soft-periwinkle/10 flex items-center justify-center"><Flame className="text-soft-periwinkle" /></div>
          <div><h2 className="font-playfair font-bold text-ink-black text-2xl">Trending Courses</h2></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(data.trending || []).map((course) => (
            <CourseCard key={course.id} course={course} navigate={navigate} />
          ))}
        </div>
      </section>

      {/* 5. EXTERNAL RESOURCES SECTION */}
      {searchQuery && searchQuery.length >= 3 && (
        <section className="space-y-8 border-t border-soft-linen pt-12 mt-12">
          {isSearchingExternal ? (
             <div className="flex items-center gap-3 text-soft-periwinkle font-semibold py-10">
                <Loader2 size={24} className="animate-spin" /> Fetching free external resources...
             </div>
          ) : (
            <>
              {/* YouTube Videos */}
              <div className="space-y-5">
                 <div className="flex items-start gap-3">
                   <div className="w-10 h-10 rounded-xl bg-soft-periwinkle/10 flex items-center justify-center"><MonitorPlay className="text-soft-periwinkle" /></div>
                   <div>
                     <h2 className="font-playfair font-bold text-ink-black text-2xl">Educational Videos</h2>
                     <p className="text-sm text-lavender-grey">Free tutorials matching your search</p>
                   </div>
                 </div>
                 {externalVideos.length > 0 ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                     {externalVideos.map((video) => (
                        <div key={video.videoId} onClick={() => navigate(`/learner/external-video/${video.videoId}`)} className="bg-white rounded-2xl border border-soft-linen overflow-hidden hover:shadow-xl transition-all cursor-pointer flex flex-col h-full group">
                           <div className="w-full h-44 bg-porcelain relative overflow-hidden flex items-center justify-center p-3">
                             {video.thumbnailUrl ? <img src={video.thumbnailUrl} className="absolute inset-0 w-full h-full object-cover" /> : <MonitorPlay size={40} className="text-lavender-grey/50 absolute" />}
                             <span className="absolute top-3 left-3 bg-white text-soft-periwinkle text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-sm z-10">YouTube Video</span>
                           </div>
                           <div className="p-5 flex-1 flex flex-col">
                             <h3 className="font-bold text-[15px] leading-tight text-ink-black mb-2 line-clamp-1" dangerouslySetInnerHTML={{ __html: video.title }}></h3>
                             <p className="text-xs text-lavender-grey line-clamp-2 mb-4 flex-1">Channel: {video.channelTitle}</p>
                             <div className="mt-auto flex items-center justify-between text-xs text-lavender-grey font-semibold border-t border-soft-linen pt-3">
                                <div className="flex items-center gap-1"><Play size={14} className="text-soft-periwinkle" /> 1 video</div>
                             </div>
                           </div>
                        </div>
                     ))}
                   </div>
                 ) : (
                   <p className="text-lavender-grey italic text-sm">No videos found.</p>
                 )}
              </div>


            </>
          )}
        </section>
      )}
    </div>
  );
}

// Reusable Card Component
function CourseCard({ course, navigate, progress = null }) {
  return (
    <div onClick={() => navigate(`/learner/courses/${course.id}`)} className="bg-white rounded-2xl border border-soft-linen overflow-hidden hover:shadow-xl transition-all cursor-pointer flex flex-col h-full group">
      <div className="w-full h-44 bg-porcelain relative overflow-hidden flex items-center justify-center p-3">
        <img src={course.thumbnailUrl || `https://picsum.photos/seed/${course.title.replace(/\s+/g, '')}/400/300`} className="absolute inset-0 w-full h-full object-cover" />
        <span className="absolute top-3 left-3 bg-white text-soft-periwinkle text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-sm z-10">{course.category || "General"}</span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-[15px] leading-tight text-ink-black mb-2 line-clamp-1">{course.title}</h3>
        <p className="text-xs text-lavender-grey line-clamp-2 mb-4 flex-1">{course.description}</p>
        
        <div className="mt-auto flex items-center justify-between text-xs text-lavender-grey font-semibold border-t border-soft-linen pt-3">
           <div className="flex items-center gap-1"><Video size={14} className="text-soft-periwinkle" /> {course._count?.videos || 0} videos</div>
           {progress !== null && (
             <div className="flex items-center gap-2 w-1/2 justify-end">
               <div className="w-full max-w-[4rem] h-1.5 bg-porcelain rounded-full overflow-hidden">
                 <div className="h-full bg-soft-periwinkle" style={{ width: `${progress}%` }}></div>
               </div>
               <span className="text-soft-periwinkle font-bold text-[10px]">{progress}%</span>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}