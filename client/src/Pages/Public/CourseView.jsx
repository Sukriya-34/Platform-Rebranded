import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Play, ChevronLeft, FileText, Lock, ShieldAlert, BookOpen, Send, BrainCircuit, Award } from "lucide-react";

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) return `https://www.youtube.com/embed/${match[2]}`;
  return null;
};

export default function PublicCourseView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  
  const [activeItem, setActiveItem] = useState(null);
  const [itemType, setItemType] = useState('video');
  const [activeTab, setActiveTab] = useState('curriculum');
  
  // Local Notes state for guests
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/courses/${id}`);
        if (!res.ok) throw new Error("Course not found");
        const data = await res.json();
        
        setCourse(data);
        if (data.videos && Array.isArray(data.videos) && data.videos.length > 0) {
          const firstFree = data.videos.find(v => v.isFreePreview);
          if (firstFree) {
            setActiveItem(firstFree);
            setItemType('video');
            setNotes(JSON.parse(localStorage.getItem(`guest_notes_${firstFree.id}`) || "[]"));
          } else {
            setActiveItem({ isLocked: true, title: data.title, type: 'video' });
          }
        }
      } catch (err) {
        setCourse({ error: true });
      }
    };
    fetchCourse();
  }, [id]);

  const handleItemSelect = (item, type) => {
    if (item.isFreePreview) {
      setActiveItem(item);
      setItemType(type);
      setNotes(JSON.parse(localStorage.getItem(`guest_notes_${item.id}`) || "[]"));
    } else {
      setActiveItem({ isLocked: true, title: item.title, type });
      setItemType(type);
    }
  };

  const saveNote = () => {
    if (!newNote.trim() || !activeItem || activeItem.isLocked) return;
    const newN = { id: Date.now(), content: newNote, createdAt: new Date() };
    const updated = [newN, ...notes];
    setNotes(updated);
    localStorage.setItem(`guest_notes_${activeItem.id}`, JSON.stringify(updated));
    setNewNote("");
  };

  if (course?.error) return <div className="p-20 text-center font-playfair text-2xl">Course not found.</div>;
  if (!course) return <div className="h-[70vh] flex items-center justify-center bg-porcelain font-poppins text-lavender-grey animate-pulse">Loading Course Data...</div>;

  return (
    <div className="max-w-[1400px] mx-auto p-6 md:p-10 font-poppins w-full min-h-[80vh]">
      <Link
        to="/courses"
        className="flex items-center gap-2 text-lavender-grey hover:text-soft-periwinkle mb-6 transition-colors w-fit"
      >
        <ChevronLeft size={20} />
        <span className="font-semibold text-sm">Back to Catalog</span>
      </Link>

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <div className="aspect-video bg-ink-black rounded-3xl overflow-hidden shadow-2xl border border-soft-linen relative flex flex-col items-center justify-center">
            {activeItem && !activeItem.isLocked ? (
              itemType === 'document' ? (
                <iframe src={activeItem.docUrl} className="w-full h-full bg-white transition-all" title={activeItem.title} />
              ) : getYouTubeEmbedUrl(activeItem.videoUrl) ? (
                <iframe
                  key={getYouTubeEmbedUrl(activeItem.videoUrl)}
                  className="absolute top-0 left-0 w-full h-full"
                  src={getYouTubeEmbedUrl(activeItem.videoUrl)}
                  title={activeItem.title}
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              ) : (
                <video
                  key={activeItem.videoUrl}
                  controls
                  className="w-full h-full object-contain bg-ink-black"
                  autoPlay
                >
                  <source src={activeItem.videoUrl} type="video/mp4" />
                </video>
              )
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-white gap-6 bg-gradient-to-br from-ink-black to-gray-900 p-8 text-center">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse shadow-lg">
                  <Lock size={40} className="text-soft-periwinkle" />
                </div>
                <div>
                   <h3 className="text-2xl font-bold font-playfair mb-2">{activeItem?.title || "Premium Content Locked"}</h3>
                   <p className="text-gray-400 max-w-md mx-auto mb-6">
                     This {activeItem?.type || "lesson"} is premium. Enroll to unlock.
                   </p>
                   <button onClick={() => navigate('/login')} className="bg-soft-periwinkle hover:bg-[#797A9E] text-white px-8 py-3 rounded-xl font-bold transition-colors">
                     Login / Enroll Now
                   </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 bg-white p-8 rounded-3xl border border-soft-linen shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Award size={120} />
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-4 py-1.5 bg-soft-periwinkle/10 text-soft-periwinkle rounded-full text-xs font-bold uppercase tracking-widest">
                {course.category}
              </span>
              <span className="text-lavender-grey text-sm flex items-center gap-1 font-medium">
                <ShieldAlert size={16} /> Free Preview Available
              </span>
            </div>
            <h1 className="text-4xl font-bold font-playfair text-ink-black mb-4 pr-20">
              {course.title}
            </h1>
            <p className="text-lavender-grey leading-relaxed text-lg max-w-3xl pb-6">
              {course.description}
            </p>
            <div className="pt-6 border-t border-soft-linen flex items-center gap-4">
               <button onClick={() => navigate('/login')} className="bg-ink-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">
                 Enroll in Course for $49.99
               </button>
            </div>
          </div>
        </div>

        <div className="w-full xl:w-[400px] shrink-0 flex flex-col max-h-[calc(100vh-100px)] sticky top-6">
          <div className="bg-white rounded-3xl shadow-sm border border-soft-linen overflow-hidden flex flex-col h-full">
            <div className="flex border-b border-soft-linen bg-porcelain/30">
              <button 
                onClick={() => setActiveTab('curriculum')}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'curriculum' ? 'text-soft-periwinkle border-b-2 border-soft-periwinkle bg-white' : 'text-lavender-grey hover:bg-porcelain/50'}`}
              >
                <BookOpen size={16} /> Course Content
              </button>
              <button 
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'notes' ? 'text-soft-periwinkle border-b-2 border-soft-periwinkle bg-white' : 'text-lavender-grey hover:bg-porcelain/50'}`}
              >
                <FileText size={16} /> My Notes
              </button>
            </div>

            {activeTab === 'curriculum' && (
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-porcelain/10">
                <div className="p-4 bg-porcelain/30 border-b border-soft-linen sticky top-0 backdrop-blur-md z-10">
                  <span className="text-xs font-bold text-warm-taupe uppercase tracking-widest">Video Lessons</span>
                </div>
                <div className="divide-y divide-soft-linen">
                  {course.videos?.map((vid, index) => {
                    const isPlaying = activeItem?.id === vid.id && itemType === 'video';
                    const isLocked = !vid.isFreePreview;
                    return (
                      <button
                        key={vid.id}
                        onClick={() => handleItemSelect(vid, 'video')}
                        className={`w-full text-left p-4 transition-all flex items-start gap-4 group ${isPlaying ? "bg-soft-periwinkle/5 border-l-4 border-soft-periwinkle" : "hover:bg-porcelain border-l-4 border-transparent"}`}
                      >
                        <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold ${isPlaying ? 'bg-soft-periwinkle text-white' : isLocked ? 'bg-gray-100 text-gray-400' : 'bg-white text-ink-black border border-soft-linen'}`}>
                           {isLocked ? <Lock size={12} /> : (isPlaying ? <Play size={10} fill="currentColor"/> : index + 1)}
                        </span>
                        <div>
                          <p className={`text-sm font-bold ${isPlaying ? "text-soft-periwinkle" : isLocked ? "text-gray-500" : "text-ink-black"}`}>{vid.title}</p>
                          <span className={`${isPlaying ? 'text-soft-periwinkle' : isLocked ? 'text-gray-400' : 'text-green-600'} text-[10px] uppercase font-bold flex items-center gap-1 mt-1`}>
                             {isLocked ? <Lock size={10} /> : <Play size={10} />} {isLocked ? 'Premium' : 'Free Preview'}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {course.documents?.length > 0 && (
                  <>
                    <div className="p-4 bg-porcelain/30 border-y border-soft-linen sticky top-0 backdrop-blur-md z-10 mt-4">
                      <span className="text-xs font-bold text-warm-taupe uppercase tracking-widest">Study Materials</span>
                    </div>
                    <div className="divide-y divide-soft-linen">
                      {course.documents.map((doc) => {
                         const isPlaying = activeItem?.id === doc.id && itemType === 'document';
                         const isLocked = !doc.isFreePreview;
                         return (
                          <button
                            key={doc.id}
                            onClick={() => handleItemSelect(doc, 'document')}
                            className={`w-full text-left p-4 transition-all flex items-start gap-4 group ${isPlaying ? "bg-soft-periwinkle/5 border-l-4 border-soft-periwinkle" : "hover:bg-porcelain border-l-4 border-transparent"}`}
                          >
                            <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-lg font-bold ${isPlaying ? 'bg-soft-periwinkle text-white' : isLocked ? 'bg-gray-100 text-gray-400' : 'bg-white text-ink-black border border-soft-linen'}`}>
                              {isLocked ? <Lock size={12} /> : <FileText size={12} />}
                            </span>
                            <div>
                              <p className={`text-sm font-bold ${isPlaying ? "text-soft-periwinkle" : isLocked ? "text-gray-500" : "text-ink-black"}`}>{doc.title}</p>
                              <span className={`${isPlaying ? 'text-soft-periwinkle' : isLocked ? 'text-gray-400' : 'text-green-600'} text-[10px] uppercase font-bold flex items-center gap-1 mt-1`}>
                                 {isLocked ? <Lock size={10} /> : <FileText size={10} />} {isLocked ? 'Premium' : 'Free Preview'}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}

                <div className="p-4 border-t border-soft-linen bg-white mt-auto sticky bottom-0 z-10 w-full shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                   <button onClick={() => navigate(`/quiz/${course.id}`)} className="w-full bg-ink-black text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-md">
                      <BrainCircuit size={18} /> Test Your Knowledge (Free)
                   </button>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="flex-1 flex flex-col bg-porcelain/20 overflow-hidden">
                <div className="bg-soft-periwinkle/10 p-3 flex items-center gap-2 justify-center text-xs text-soft-periwinkle font-semibold border-b border-soft-periwinkle/20">
                   <ShieldAlert size={14} /> Notes are saved locally. Login to sync across devices.
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                  {notes.length === 0 ? (
                    <div className="text-center py-10 opacity-60">
                       <FileText size={40} className="mx-auto mb-3 text-lavender-grey" />
                       <p className="text-sm text-ink-black font-semibold">No notes yet</p>
                       <p className="text-xs text-lavender-grey mt-1">Capture your key takeaways below.</p>
                    </div>
                  ) : (
                    notes.map(n => (
                      <div key={n.id} className="bg-white p-4 rounded-2xl shadow-sm border border-soft-linen relative group">
                        <p className="text-sm text-ink-black leading-relaxed">{n.content}</p>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-lavender-grey mt-3">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="p-4 bg-white border-t border-soft-linen shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                  <div className="bg-porcelain/50 rounded-2xl p-2 border border-soft-linen focus-within:border-soft-periwinkle focus-within:ring-1 focus-within:ring-soft-periwinkle transition-all">
                    <textarea 
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      placeholder={activeItem?.isLocked ? "Unlock lesson to take notes" : `Notes for "${activeItem?.title || 'this lesson'}"...`}
                      disabled={activeItem?.isLocked}
                      className="w-full bg-transparent p-2 text-sm border-none resize-none outline-none text-ink-black"
                      rows="3"
                    />
                    <div className="flex justify-end pt-2">
                       <button 
                         onClick={saveNote}
                         disabled={!newNote.trim() || activeItem?.isLocked}
                         className="bg-ink-black hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-ink-black text-white p-2 rounded-xl transition-colors shadow-md"
                       >
                         <Send size={16} />
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
