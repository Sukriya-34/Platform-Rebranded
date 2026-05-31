import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { User, Play, Lock, BookOpen, Clock, FileText } from "lucide-react";

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return null;
};

export default function PublicCourseView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  
  const [activeItem, setActiveItem] = useState(null);
  const [itemType, setItemType] = useState('video'); // 'video', 'document', or 'quiz'

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/courses/${id}`);
        if (!res.ok) throw new Error("Course not found");
        const data = await res.json();
        setCourse(data);
        if (data.videos && Array.isArray(data.videos) && data.videos.length > 0) {
          setActiveItem(data.videos[0]);
          setItemType('video');
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setCourse({ error: true });
      }
    };
    fetchCourse();
  }, [id]);

  if (!course) {
    return <div className="p-20 text-center font-poppins">Loading course details...</div>;
  }
  
  if (course.error) {
    return (
      <div className="p-20 text-center font-poppins">
        <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
        <Link to="/courses" className="text-blue-500 hover:underline">Back to Courses</Link>
      </div>
    );
  }

  // Determine if the current selected item is locked
  // The first video is unlocked. Everything else is locked for public preview.
  const isLocked = activeItem && !(itemType === 'video' && course.videos?.[0]?.id === activeItem.id);

  return (
    <div className="font-poppins bg-porcelain min-h-screen">
      {/* Immersive Player Header */}
      <div className="w-full bg-ink-black py-10 border-b border-white/10 relative">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Main Player Area */}
            <div className="flex-1 min-w-0">
              <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/5 relative group">
                
                {/* LOCKED OVERLAY */}
                {isLocked && (
                  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center text-white bg-ink-black/80 backdrop-blur-md p-8 text-center animate-fadeIn">
                     <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center shadow-xl border border-white/10 mb-6 relative overflow-hidden">
                       <Lock size={32} className="text-soft-periwinkle relative z-10" />
                     </div>
                     <h3 className="text-2xl md:text-3xl font-bold font-playfair mb-3 drop-shadow-md">
                        Content Locked
                     </h3>
                     <p className="text-white/70 max-w-sm mx-auto mb-8 text-sm">
                        You are previewing this course. Enroll now to unlock all videos, documents, quizzes, and track your progress!
                     </p>
                     <button 
                       onClick={() => navigate('/login')}
                       className="bg-soft-periwinkle hover:bg-white hover:text-ink-black text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg text-sm uppercase tracking-wider"
                     >
                        Enroll Now
                     </button>
                  </div>
                )}

                {!isLocked && activeItem ? (
                  itemType === 'video' ? (
                    getYouTubeEmbedUrl(activeItem.videoUrl) ? (
                      <iframe
                        key={getYouTubeEmbedUrl(activeItem.videoUrl)}
                        className="absolute top-0 left-0 w-full h-full"
                        src={getYouTubeEmbedUrl(activeItem.videoUrl)}
                        title={activeItem.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                        <video
                          key={activeItem.videoUrl}
                          controls
                          className="w-full h-full object-contain"
                        >
                          <source src={activeItem.videoUrl} type="video/mp4" />
                        </video>
                    )
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-white/50">
                      <FileText size={48} className="mb-4" />
                      <p>Document Viewer (Locked)</p>
                    </div>
                  )
                ) : !isLocked && (
                  <div className="h-full flex flex-col items-center justify-center text-white/50">
                    <Play size={48} className="mb-4 opacity-30" />
                    <p>No preview available</p>
                  </div>
                )}
              </div>

              {/* Course Info Below Player */}
              <div className="mt-8 text-white">
                <span className="px-3 py-1 bg-soft-periwinkle/20 text-soft-periwinkle rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                  {course.category}
                </span>
                <h1 className="text-3xl md:text-5xl font-bold font-playfair mb-4 drop-shadow-md">
                  {course.title}
                </h1>
                <p className="text-sm text-white/70 leading-relaxed max-w-3xl mb-8">
                  {course.description}
                </p>
                
                <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                   <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center overflow-hidden border border-white/20">
                      {course.creator?.profilePic ? (
                         <img src={course.creator.profilePic} alt="Instructor" className="w-full h-full object-cover" />
                      ) : (
                         <User size={24} className="text-white/50" />
                      )}
                   </div>
                   <div>
                      <p className="text-xs text-white/50 font-bold uppercase tracking-wider">Instructor</p>
                      <p className="text-sm font-semibold">{course.creator?.fullName || "Instructor Name"}</p>
                   </div>
                   <div className="ml-auto">
                     <button 
                       onClick={() => navigate('/login')}
                       className="bg-white text-ink-black hover:bg-soft-periwinkle hover:text-white px-6 py-2.5 rounded-lg font-bold transition-colors text-sm uppercase tracking-wide"
                     >
                        Enroll: Rs. {course.price}
                     </button>
                   </div>
                </div>
              </div>
            </div>

            {/* Sidebar Curriculum */}
            <div className="w-full lg:w-[400px] shrink-0">
              <div className="bg-white rounded-2xl shadow-xl border border-soft-linen overflow-hidden flex flex-col h-full max-h-[800px]">
                <div className="p-6 border-b border-soft-linen bg-porcelain">
                  <h3 className="font-bold text-lg font-playfair text-ink-black mb-1">Course Content</h3>
                  <p className="text-xs text-lavender-grey font-medium">
                    {course.videos?.length || 0} Videos • {course.documents?.length || 0} Documents
                  </p>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                  <div className="space-y-1">
                    {/* Videos */}
                    {course.videos?.length > 0 && course.videos.map((video, idx) => {
                      const isActive = activeItem?.id === video.id && itemType === 'video';
                      const isFreePreview = idx === 0;
                      return (
                        <button
                          key={video.id}
                          onClick={() => { setActiveItem(video); setItemType('video'); }}
                          className={`w-full text-left p-4 rounded-xl flex items-start gap-4 transition-all group ${
                            isActive ? "bg-soft-periwinkle/10 border-soft-periwinkle/30 border" : "hover:bg-porcelain border border-transparent"
                          }`}
                        >
                          <div className={`mt-0.5 ${isActive ? "text-soft-periwinkle" : "text-lavender-grey group-hover:text-ink-black"}`}>
                            {isFreePreview ? <Play size={18} /> : <Lock size={18} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-semibold truncate ${isActive ? "text-soft-periwinkle" : "text-ink-black"}`}>
                              {video.title}
                            </h4>
                            <p className="text-xs text-lavender-grey mt-1 flex items-center gap-1">
                              <Clock size={12} /> Video
                              {isFreePreview && <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded uppercase font-bold">Free Preview</span>}
                            </p>
                          </div>
                        </button>
                      );
                    })}

                    {/* Documents */}
                    {course.documents?.length > 0 && course.documents.map((doc) => {
                      const isActive = activeItem?.id === doc.id && itemType === 'document';
                      return (
                        <button
                          key={doc.id}
                          onClick={() => { setActiveItem(doc); setItemType('document'); }}
                          className={`w-full text-left p-4 rounded-xl flex items-start gap-4 transition-all group ${
                            isActive ? "bg-soft-periwinkle/10 border-soft-periwinkle/30 border" : "hover:bg-porcelain border border-transparent"
                          }`}
                        >
                          <div className={`mt-0.5 ${isActive ? "text-soft-periwinkle" : "text-lavender-grey group-hover:text-ink-black"}`}>
                            <Lock size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-semibold truncate ${isActive ? "text-soft-periwinkle" : "text-ink-black"}`}>
                              {doc.title}
                            </h4>
                            <p className="text-xs text-lavender-grey mt-1 flex items-center gap-1">
                              <FileText size={12} /> Document
                            </p>
                          </div>
                        </button>
                      );
                    })}
                    
                    {/* Quizzes */}
                    {course.quizzes?.length > 0 && course.quizzes.map((quiz) => {
                      const isActive = activeItem?.id === quiz.id && itemType === 'quiz';
                      return (
                        <button
                          key={quiz.id}
                          onClick={() => { setActiveItem(quiz); setItemType('quiz'); }}
                          className={`w-full text-left p-4 rounded-xl flex items-start gap-4 transition-all group ${
                            isActive ? "bg-soft-periwinkle/10 border-soft-periwinkle/30 border" : "hover:bg-porcelain border border-transparent"
                          }`}
                        >
                          <div className={`mt-0.5 ${isActive ? "text-soft-periwinkle" : "text-lavender-grey group-hover:text-ink-black"}`}>
                            <Lock size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-semibold truncate ${isActive ? "text-soft-periwinkle" : "text-ink-black"}`}>
                              {quiz.title}
                            </h4>
                            <p className="text-xs text-lavender-grey mt-1 flex items-center gap-1">
                              <BookOpen size={12} /> Quiz
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
