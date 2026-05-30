import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Flame, Sparkles, BookMarked, ArrowRight, BookOpen, Play, MonitorPlay, FileText, Loader2, Video, GraduationCap, Laptop, Heart, Compass, Search, MessageSquare, Info } from 'lucide-react';
import { Modal } from '../../components/DisplayComponents';
import { Button } from '../../components/SharedForms';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ 
    continueLearning: [], 
    recommended: [], 
    trending: [],
    categories: []
  });
  const [loading, setLoading] = useState(true);

  // States for search and external results
  const [localCourses, setLocalCourses] = useState([]);
  const [externalVideos, setExternalVideos] = useState([]);
  const [externalDocs, setExternalDocs] = useState([]);
  const [isSearchingExternal, setIsSearchingExternal] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("hasSeenWelcomeTips")) {
      const timer = setTimeout(() => setShowWelcomeModal(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismissWelcome = () => {
    localStorage.setItem("hasSeenWelcomeTips", "true");
    setShowWelcomeModal(false);
  };

  useEffect(() => {
    if (data.categories && data.categories.length > 0 && !selectedCategory) {
      setSelectedCategory(data.categories[0].title);
    }
  }, [data.categories, selectedCategory]);

  const { searchQuery } = useOutletContext() || { searchQuery: "" };

  useEffect(() => {
    const loadData = async () => {
      try {
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

  // Debounced Search (Local & External unified)
  useEffect(() => {
    const fetchSearchData = async () => {
      if (!searchQuery || searchQuery.length < 3) {
        setLocalCourses([]);
        setExternalVideos([]);
        setExternalDocs([]);
        return;
      }
      
      // Log Search Activity for Personalization Engine
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user.id) {
           fetch("http://localhost:5000/api/learner/activity", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ userId: user.id, action: "SEARCH", metadata: searchQuery })
           });
        }
      } catch (e) {}

      setIsSearchingExternal(true);
      try {
        const res = await fetch(`http://localhost:5000/api/search/external?q=${encodeURIComponent(searchQuery)}`);
        const result = await res.json();
        if (result.localCourses) setLocalCourses(result.localCourses);
        if (result.videos) setExternalVideos(result.videos);
        if (result.documents) setExternalDocs(result.documents);
      } catch(err) {
        console.error("Search error:", err);
      } finally {
        setIsSearchingExternal(false);
      }
    };

    const timerId = setTimeout(() => {
      fetchSearchData();
    }, 800);

    return () => clearTimeout(timerId);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-lavender-grey animate-pulse gap-3 font-poppins">
         <Loader2 size={40} className="animate-spin text-soft-periwinkle" />
         <p className="font-bold text-lg">Loading Rebranded Experience...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-14 font-poppins text-ink-black">
      
      {/* 1. WELCOME BANNER */}
      <section className="relative rounded-3xl overflow-hidden bg-ink-black p-12 shadow-2xl bg-gradient-to-r from-ink-black to-[#2A2B3D]">
        <div className="relative z-10 space-y-3">
          <p className="text-soft-periwinkle text-sm font-semibold tracking-widest uppercase animate-pulse">Your Learning Path</p>
          <h1 className="font-playfair text-white text-5xl font-bold leading-tight">
            Elevate your mindset,<br />
            <span className="text-soft-periwinkle">one milestone</span> at a time
          </h1>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none p-6">
          <Compass size={200} className="text-white" />
        </div>
      </section>

      {/* 2. UNIFIED SEARCH RESULTS VIEW */}
      {searchQuery && searchQuery.length >= 3 && (
        <section className="space-y-10 border-t border-soft-linen pt-12 mt-12">
          {isSearchingExternal ? (
             <div className="flex items-center gap-3 text-soft-periwinkle font-semibold py-10">
                <Loader2 size={24} className="animate-spin" /> Searching platform & external vaults...
             </div>
          ) : (
            <>
              {/* Local courses match */}
              <div className="space-y-5">
                 <div className="flex items-start gap-3">
                   <div className="w-10 h-10 rounded-xl bg-soft-periwinkle/10 flex items-center justify-center"><BookOpen className="text-soft-periwinkle" /></div>
                   <div>
                     <h2 className="font-playfair font-bold text-ink-black text-2xl">Pathway Courses</h2>
                     <p className="text-sm text-lavender-grey">Premium structured platform courses</p>
                   </div>
                 </div>
                 {localCourses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
                      {localCourses.map((course) => (
                         <CourseCard key={course.id} course={course} navigate={navigate} />
                      ))}
                    </div>
                 ) : (
                    <p className="text-lavender-grey italic text-sm">No core courses found matching "{searchQuery}".</p>
                 )}
              </div>

              {/* YouTube Videos */}
              <div className="space-y-5">
                 <div className="flex items-start gap-3">
                   <div className="w-10 h-10 rounded-xl bg-soft-periwinkle/10 flex items-center justify-center"><MonitorPlay className="text-soft-periwinkle" /></div>
                   <div>
                     <h2 className="font-playfair font-bold text-ink-black text-2xl">Educational Videos</h2>
                     <p className="text-sm text-lavender-grey">Free YouTube tutorial matches</p>
                   </div>
                 </div>
                 {externalVideos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
                      {externalVideos.map((video) => (
                         <div 
                           key={video.videoId} 
                           onClick={() => navigate(`/learner/external-video/${video.videoId}`)} 
                           className="bg-white rounded-2xl border border-soft-linen overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col h-full group"
                         >
                            <div className="w-full h-44 bg-porcelain relative overflow-hidden flex items-center justify-center p-3">
                              {video.thumbnailUrl ? <img src={video.thumbnailUrl} className="absolute inset-0 w-full h-full object-cover" /> : <MonitorPlay size={40} className="text-lavender-grey/50 absolute" />}
                              <span className="absolute top-3 left-3 bg-white text-soft-periwinkle text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-sm z-10">YouTube Video</span>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                              <h3 className="font-bold text-[15px] leading-tight text-ink-black mb-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: video.title }}></h3>
                              <p className="text-xs text-lavender-grey line-clamp-1 mb-4 flex-1">Channel: {video.channelTitle}</p>
                              <div className="mt-auto flex items-center justify-between text-xs text-lavender-grey font-semibold border-t border-soft-linen pt-3">
                                 <div className="flex items-center gap-1"><Play size={14} className="text-soft-periwinkle" /> Watch Tutorial</div>
                              </div>
                            </div>
                         </div>
                      ))}
                    </div>
                 ) : (
                    <p className="text-lavender-grey italic text-sm">No external videos found.</p>
                 )}
              </div>

              {/* OpenLibrary Books */}
              <div className="space-y-5">
                 <div className="flex items-start gap-3">
                   <div className="w-10 h-10 rounded-xl bg-soft-periwinkle/10 flex items-center justify-center"><FileText className="text-soft-periwinkle" /></div>
                   <div>
                     <h2 className="font-playfair font-bold text-ink-black text-2xl">Study Books & Library Docs</h2>
                     <p className="text-sm text-lavender-grey">Free educational materials & literature matches</p>
                   </div>
                 </div>
                 {externalDocs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
                      {externalDocs.map((doc, index) => (
                         <a 
                           key={index} 
                           href={doc.url} 
                           target="_blank" 
                           rel="noreferrer" 
                           className="bg-white rounded-2xl border border-soft-linen overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col h-full group"
                         >
                            <div className="w-full h-44 bg-porcelain relative overflow-hidden flex items-center justify-center p-3">
                              <FileText size={44} className="text-soft-periwinkle/60 group-hover:scale-110 transition-transform duration-500" />
                              <span className="absolute top-3 left-3 bg-white text-soft-periwinkle text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-sm z-10">Library Book</span>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                              <h3 className="font-bold text-[15px] leading-tight text-ink-black mb-2 line-clamp-2">{doc.title}</h3>
                              <p className="text-xs text-lavender-grey line-clamp-1 mb-4 flex-1">{doc.description}</p>
                              <div className="mt-auto flex items-center justify-between text-xs text-lavender-grey font-semibold border-t border-soft-linen pt-3">
                                 <div className="flex items-center gap-1"><FileText size={14} className="text-soft-periwinkle" /> Read on OpenLibrary</div>
                              </div>
                            </div>
                         </a>
                      ))}
                    </div>
                 ) : (
                    <p className="text-lavender-grey italic text-sm">No document matches found.</p>
                 )}
              </div>
            </>
          )}
        </section>
      )}

      {/* SEARCH QUERY IS INACTIVE - SHOW NORMAL DASHBOARD */}
      {!searchQuery && (
        <>
          {/* 3. CONTINUE LEARNING (From Enrollments) */}
          {data.continueLearning && data.continueLearning.length > 0 && (
            <section className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-soft-periwinkle/10 flex items-center justify-center"><BookMarked className="text-soft-periwinkle" /></div>
                <div>
                  <h2 className="font-playfair font-bold text-ink-black text-2xl">Continue Learning</h2>
                  <p className="text-xs text-lavender-grey">Pick up right where you left off</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.continueLearning.map((item) => (
                  <CourseCard key={item.id} course={item.course} progress={item.progress} navigate={navigate} />
                ))}
              </div>
            </section>
          )}

          {/* 4. RECOMMENDED SECTION */}
          {data.recommended && data.recommended.length > 0 && (
            <section className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-soft-periwinkle/10 flex items-center justify-center"><Sparkles className="text-soft-periwinkle" /></div>
                <div>
                  <h2 className="font-playfair font-bold text-ink-black text-2xl">Recommended for You</h2>
                  <p className="text-xs text-lavender-grey">Smarter personalization based on your activity</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {data.recommended.map((course) => (
                  <CourseCard key={course.id} course={course} reason={course.reason} navigate={navigate} />
                ))}
              </div>
            </section>
          )}

          {/* 5. CATEGORY TABS */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-soft-linen pb-5 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-soft-periwinkle/10 flex items-center justify-center"><Compass className="text-soft-periwinkle" /></div>
                <div>
                  <h2 className="font-playfair font-bold text-ink-black text-2xl">Browse by Categories</h2>
                  <p className="text-sm text-lavender-grey">Explore specific topics</p>
                </div>
              </div>
              
              {/* Tab Toggles (Dynamic) */}
              <div className="flex bg-porcelain p-1 rounded-xl shadow-sm self-start overflow-x-auto max-w-full">
                {(data.categories || []).map((cat, idx) => (
                   <button 
                     key={idx}
                     onClick={() => setSelectedCategory(cat.title)}
                     className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${selectedCategory === cat.title ? 'bg-white text-ink-black shadow-md font-semibold' : 'text-lavender-grey hover:bg-white/50'}`}
                   >
                     {cat.title}
                   </button>
                ))}
              </div>
            </div>

            {/* Categorized Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
               {data.categories?.find(c => c.title === selectedCategory)?.courses?.map((course) => (
                  <CourseCard key={course.id} course={course} navigate={navigate} />
               ))}
               {(!data.categories || data.categories.length === 0) && (
                  <p className="text-lavender-grey italic text-sm col-span-full py-6">No categories found.</p>
               )}
            </div>
          </section>

          {/* 6. TRENDING COURSES SECTION */}
          <section className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-soft-periwinkle/10 flex items-center justify-center"><Flame className="text-soft-periwinkle" /></div>
              <div>
                <h2 className="font-playfair font-bold text-ink-black text-2xl">Trending Courses</h2>
                <p className="text-xs text-lavender-grey">The most popular enrollments this week</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(data.trending || []).map((course) => (
                <CourseCard key={course.id} course={course} navigate={navigate} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* 7. Platform Usage Tips Modal */}
      <Modal 
        isOpen={showWelcomeModal} 
        onClose={handleDismissWelcome}
        title="Welcome to Platform.X!"
        size="large"
        footer={
          <Button onClick={handleDismissWelcome} className="w-full py-4 text-base shadow-xl">
            Let's Start Learning
          </Button>
        }
      >
        <div className="space-y-6">
           <div className="bg-soft-periwinkle/10 p-6 rounded-2xl border border-soft-periwinkle/20">
              <h3 className="font-bold text-lg text-ink-black flex items-center gap-2 mb-2"><BookMarked size={20} className="text-soft-periwinkle"/> Bookmarking & Saving</h3>
              <p className="text-sm text-lavender-grey leading-relaxed">Save courses to your <strong>My Learning</strong> tab by clicking the Bookmark icon on any course page. Access them later at your convenience!</p>
           </div>
           
           <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
              <h3 className="font-bold text-lg text-ink-black flex items-center gap-2 mb-2"><Play size={20} className="text-purple-500"/> Tracking Your Progress</h3>
              <p className="text-sm text-lavender-grey leading-relaxed">As you watch videos and complete quizzes, the progress bar on your course cards will update automatically. Hit 100% to earn certificates!</p>
           </div>

           <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
              <h3 className="font-bold text-lg text-ink-black flex items-center gap-2 mb-2"><MessageSquare size={20} className="text-amber-500"/> Engaging with Instructors</h3>
              <p className="text-sm text-lavender-grey leading-relaxed">Have a question? Use the <strong>Messages</strong> tab in the sidebar to chat directly with your course instructors.</p>
           </div>
        </div>
      </Modal>

    </div>
  );
}

// Reusable Card Component
function CourseCard({ course, navigate, progress = null, reason = null }) {
  const handleCourseClick = () => {
     // Log Click Activity based on category
     try {
       const user = JSON.parse(localStorage.getItem("user") || "{}");
       if (user.id) {
          fetch("http://localhost:5000/api/learner/activity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, action: "VIEW_COURSE", metadata: course.title })
          });
       }
     } catch (e) {}

     navigate(`/learner/courses/${course.id}`);
  };

  return (
    <div onClick={handleCourseClick} className="bg-white rounded-2xl border border-soft-linen overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full group relative">
      <div className="w-full h-44 bg-porcelain relative overflow-hidden flex items-center justify-center p-3">
        <img src={course.thumbnailUrl || `https://placehold.co/400x300/e2e8f0/1e293b?text=Course`} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute top-3 left-3 bg-white text-soft-periwinkle text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-sm z-10 border border-soft-linen/50">{course.category || "General"}</span>

      </div>
      
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-1 mb-4">
          {reason && (
            <span className="text-[9px] bg-soft-periwinkle/15 text-soft-periwinkle px-2 py-0.5 rounded-md font-bold inline-block leading-none uppercase tracking-wide">
              {reason}
            </span>
          )}
          <h3 className="font-bold text-[15px] leading-tight text-ink-black line-clamp-1 group-hover:text-soft-periwinkle transition-colors">{course.title}</h3>
          <p className="text-xs text-lavender-grey line-clamp-2 leading-relaxed">{course.description}</p>
        </div>
        
        <div className="mt-auto flex items-center justify-between text-xs text-lavender-grey font-semibold border-t border-soft-linen pt-3">
           <div className="flex items-center gap-1"><Video size={14} className="text-soft-periwinkle" /> {course._count?.videos || 0} lessons</div>
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