import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext, useLocation } from "react-router-dom";
import { Card } from "../../components/DisplayComponents";
import { Play, Clock, BookOpen, User, Bookmark, Search, Compass, Award, BrainCircuit, FileText, Calendar } from "lucide-react";

export default function MyLearning() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || "enrolled";

  const [activeTab, setActiveTab] = useState(initialTab); // "enrolled", "saved", or "history"
  const [enrolled, setEnrolled] = useState([]);
  const [saved, setSaved] = useState([]);
  const [history, setHistory] = useState([]);
  
  const navigate = useNavigate();
  const { searchQuery } = useOutletContext() || { searchQuery: "" };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab && ['enrolled', 'saved', 'history'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const loadData = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) return;

    // Fetch Enrollments
    fetch(`http://localhost:5000/api/learner/enrolled-courses/${user.id}`)
      .then(res => res.json())
      .then(data => {
         if (Array.isArray(data)) setEnrolled(data);
      });

    // Fetch Saved
    fetch(`http://localhost:5000/api/learner/saved-courses/${user.id}`)
      .then(res => res.json())
      .then(data => {
         if (Array.isArray(data)) setSaved(data);
      });

    // Fetch History
    fetch(`http://localhost:5000/api/learner/history/${user.id}`)
      .then(res => res.json())
      .then(data => {
         if (Array.isArray(data)) setHistory(data);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reload history specifically when the tab switches to pull latest completions
  useEffect(() => {
    if (activeTab === "history") {
       const user = JSON.parse(localStorage.getItem("user") || "{}");
       if (user.id) {
          fetch(`http://localhost:5000/api/learner/history/${user.id}`)
            .then(res => res.json())
            .then(data => {
               if (Array.isArray(data)) setHistory(data);
            });
       }
    }
  }, [activeTab]);

  const activeList = activeTab === "enrolled" ? enrolled : saved;

  const filteredItems = activeList.filter((item) =>
    item.course.title.toLowerCase().includes((searchQuery || "").toLowerCase()) ||
    item.course.category.toLowerCase().includes((searchQuery || "").toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-10 font-poppins w-full text-ink-black">
      
      {/* 1. Header Area */}
      <div className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-6 xl:gap-0 border-b border-soft-linen pb-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-soft-periwinkle/10 rounded-2xl hidden md:block border border-soft-periwinkle/20">
             <User size={32} className="text-soft-periwinkle" />
          </div>
          <div className="text-left">
             <h1 className="text-4xl font-bold font-playfair mb-2">My Learning Hub</h1>
             <p className="text-lavender-grey text-sm">Continue your courses, inspect saved content, or review your learning activities.</p>
          </div>
        </div>
        
        {/* Tab Navigation Menu */}
          <div className="flex bg-porcelain p-1.5 rounded-xl border border-soft-linen shadow-inner w-full max-w-[500px]">
             <button 
             onClick={() => { setActiveTab('enrolled'); navigate('/learner/my-courses?tab=enrolled'); }}
             className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'enrolled' ? 'bg-white text-ink-black shadow-md font-semibold' : 'text-lavender-grey hover:bg-white/50'}`}
             >
             <Play size={15} /> In Progress
             </button>
             <button 
             onClick={() => { setActiveTab('saved'); navigate('/learner/my-courses?tab=saved'); }}
             className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'saved' ? 'bg-white text-ink-black shadow-md font-semibold' : 'text-lavender-grey hover:bg-white/50'}`}
             >
             <Bookmark size={15} /> Saved Resources
             </button>
             <button 
             onClick={() => { setActiveTab('history'); navigate('/learner/my-courses?tab=history'); }}
             className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'history' ? 'bg-white text-ink-black shadow-md font-semibold' : 'text-lavender-grey hover:bg-white/50'}`}
             >
             <Calendar size={15} /> Learning History
           </button>
        </div>
      </div>

      {/* 2. Grid Render or Timeline Render */}
      {activeTab === "history" ? (
         
         // Timeline Display
         <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
            <h2 className="text-xl font-bold font-playfair mb-8 text-center md:text-left flex items-center gap-2">
               <Calendar size={20} className="text-soft-periwinkle" /> 
               Timeline of Learning Activities
            </h2>
            {history.length === 0 ? (
               <div className="text-center py-20 text-lavender-grey bg-white rounded-3xl border border-soft-linen shadow-sm p-8">
                  <div className="bg-porcelain w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Calendar size={40} className="opacity-30" />
                  </div>
                  <p className="text-lg font-bold text-ink-black mb-2">No learning history recorded yet.</p>
                  <p className="mb-6 max-w-sm mx-auto">Activities like viewing courses, reading PDFs, and completing quizzes will be chronologically tracked here.</p>
                  <button 
                     onClick={() => navigate('/learner/dashboard')}
                     className="px-6 py-2.5 bg-soft-periwinkle text-white font-bold rounded-xl shadow-md shadow-soft-periwinkle/10 hover:shadow-soft-periwinkle/30 transition-all cursor-pointer"
                  >
                     Explore Courses
                  </button>
               </div>
            ) : (
               <div className="relative border-l-2 border-soft-linen ml-6 space-y-6 py-2 pl-4">
                  {history.map((log) => {
                     let Icon = Play;
                     let colorClasses = "bg-soft-periwinkle/10 text-soft-periwinkle border border-soft-periwinkle/20";
                     let label = log.action;
                     let detail = log.metadata || "";

                     if (log.action === "SEARCH") {
                        Icon = Search;
                        colorClasses = "bg-blue-50 text-blue-600 border border-blue-200";
                        label = "Search Query";
                        detail = `Searched for "${log.metadata}"`;
                     } else if (log.action === "VIEW_COURSE") {
                        Icon = Compass;
                        colorClasses = "bg-purple-50 text-purple-600 border border-purple-200";
                        label = "Viewed Course Details";
                        detail = `Checked course specs for: "${log.metadata}"`;
                     } else if (log.action === "ENROLL") {
                        Icon = Award;
                        colorClasses = "bg-green-50 text-green-600 border border-green-200";
                        label = "Enrolled in Program";
                     } else if (log.action === "COMPLETE_RESOURCE") {
                        Icon = detail.toLowerCase().includes("read study material") ? FileText : Play;
                        colorClasses = "bg-teal-50 text-teal-600 border border-teal-200";
                        label = "Completed Module Item";
                     } else if (log.action === "COMPLETED_QUIZ") {
                        Icon = BrainCircuit;
                        colorClasses = "bg-amber-50 text-amber-700 border border-amber-200";
                        label = "Assessment Completed";
                     } else if (log.action === "TOGGLE_SAVE") {
                        Icon = Bookmark;
                        colorClasses = "bg-rose-50 text-rose-600 border border-rose-200";
                        label = "Saved Bookmark Update";
                     }

                     return (
                        <div key={log.id} className="relative pl-6 group">
                           {/* Circle node on timeline */}
                           <div className={`absolute -left-[29px] top-1 w-8 h-8 rounded-full flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-110 ${colorClasses}`}>
                              <Icon size={14} />
                           </div>
                           <div className="bg-white p-5 rounded-2xl border border-soft-linen shadow-sm group-hover:shadow-md transition-shadow relative">
                              <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
                                 <span className="text-xs font-bold text-ink-black uppercase tracking-wider">{label}</span>
                                 <span className="text-[10px] font-bold text-lavender-grey uppercase bg-porcelain px-2.5 py-0.5 rounded-full">
                                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(log.createdAt).toLocaleDateString()}
                                 </span>
                              </div>
                              <p className="text-sm text-lavender-grey leading-relaxed">{detail}</p>
                           </div>
                        </div>
                     );
                  })}
               </div>
            )}
         </div>

      ) : (
         
         // Enrolled / Saved Grid Display
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           {activeList.length === 0 ? (
             <div className="col-span-full py-20 text-center text-lavender-grey">
                <div className="bg-porcelain w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    {activeTab === 'enrolled' ? <BookOpen size={48} className="opacity-30" /> : <Bookmark size={48} className="opacity-30" />}
                </div>
                <p className="text-xl font-bold text-ink-black mb-2">No {activeTab} courses yet.</p>
                <p className="mb-6">{activeTab === 'enrolled' ? 'Explore our library to find something exciting to learn!' : 'Bookmark courses from Explore to review them later.'}</p>
                <button 
                   onClick={() => navigate('/learner/dashboard')}
                   className="px-6 py-3 bg-soft-periwinkle text-white font-bold rounded-xl shadow-lg shadow-soft-periwinkle/20 transition-all hover:-translate-y-1 cursor-pointer"
                >
                   Explore Courses
                </button>
             </div>
           ) : filteredItems.length === 0 ? (
             <div className="col-span-full py-10 text-center text-lavender-grey">
               No matches found for "<b>{searchQuery}</b>".
             </div>
           ) : filteredItems.map((item) => {
             const course = item.course;
             const isEnrolled = activeTab === 'enrolled';
             
             return (
               <Card
                 key={course.id}
                 hover
                 className="flex flex-col h-full cursor-pointer"
               >
                 <div
                   onClick={() => navigate(`/learner/courses/${course.id}`)}
                   className="flex-1"
                 >
                   <div className="w-full h-44 bg-porcelain rounded-2xl mb-6 overflow-hidden flex items-center justify-center group relative border border-soft-linen">
                     <span className="absolute top-3 left-3 bg-white/90 text-soft-periwinkle text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-sm z-10 backdrop-blur-sm">
                       {course.category}
                     </span>
                     {course.thumbnailUrl ? (
                       <img
                         src={course.thumbnailUrl}
                         alt={course.title}
                         className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                       />
                     ) : (
                       <BookOpen size={44} className="text-soft-periwinkle/60 group-hover:scale-110 transition-transform duration-500" />
                     )}
                     {isEnrolled && (
                       <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/50 backdrop-blur-md">
                          <div className="h-full bg-soft-periwinkle transition-all" style={{ width: `${item.progress}%` }}></div>
                       </div>
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
                   {isEnrolled ? (
                     <span className="text-xs font-bold px-4 py-1.5 bg-porcelain rounded-full text-soft-periwinkle uppercase tracking-wider flex items-center gap-2">
                        <Clock size={14}/> {item.progress}% Complete
                     </span>
                   ) : (
                     <span className="text-xs font-bold text-lavender-grey uppercase flex items-center gap-1">
                        <BookOpen size={14} /> Saved Resource
                     </span>
                   )}
                   <button 
                     onClick={() => navigate(`/learner/courses/${course.id}`)}
                     className="text-sm font-bold bg-soft-periwinkle/10 px-4 py-1.5 rounded-full text-soft-periwinkle flex items-center gap-1 hover:bg-soft-periwinkle hover:text-white transition-colors cursor-pointer"
                   >
                     {isEnrolled ? "Resume" : "View"} <Play size={12} fill="currentColor" />
                   </button>
                 </div>
               </Card>
             );
           })}
         </div>
      )}
    </div>
  );
}
