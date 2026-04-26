import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Play, ChevronLeft, FileText, Clock, Award, BookOpen, Send, CheckCircle, BrainCircuit } from "lucide-react";

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return null;
};

export default function CourseView() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  
  // Unified item tracking
  const [activeItem, setActiveItem] = useState(null);
  const [itemType, setItemType] = useState('video'); // 'video' or 'document'
  const [activeTab, setActiveTab] = useState('curriculum'); // 'curriculum' or 'notes'
  
  // Notes & Progress state
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [completedItems, setCompletedItems] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  
  const navigate = useNavigate();

  const fetchNotes = async (itemId, type) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id || 1;
      const p = new URLSearchParams({ userId });
      if (type === 'video') p.append('videoId', itemId);
      else p.append('docId', itemId);
      
      const res = await fetch(`http://localhost:5000/api/learner/notes?${p.toString()}`);
      if (res.ok) setNotes(await res.json());
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // Fetch course and progress simultaneously
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = user.id || 1;
        const [res, progRes] = await Promise.all([
          fetch(`http://localhost:5000/api/courses/${id}`),
          fetch(`http://localhost:5000/api/learner/progress/${id}/${userId}`)
        ]);
        
        if (!res.ok) throw new Error("Course not found");
        const data = await res.json();
        const completedArr = progRes.ok ? await progRes.json() : [];
        setCompletedItems(completedArr);
        
        if (data.enrollments && data.enrollments.length > 0) {
           setProgressPercent(data.enrollments[0].progress);
        }
        
        setCourse(data);
        if (data.videos && Array.isArray(data.videos) && data.videos.length > 0) {
          setActiveItem(data.videos[0]);
          setItemType('video');
          fetchNotes(data.videos[0].id, 'video');
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setCourse({ error: true });
      }
    };
    fetchCourse();
  }, [id]);

  const handleItemSelect = (item, type) => {
    setActiveItem(item);
    setItemType(type);
    fetchNotes(item.id, type);
  };

  const saveNote = async () => {
    if (!newNote.trim() || !activeItem) return;
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await fetch("http://localhost:5000/api/learner/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id || 1,
          videoId: itemType === 'video' ? activeItem.id : null,
          docId: itemType === 'document' ? activeItem.id : null,
          content: newNote
        })
      });
      setNewNote("");
      fetchNotes(activeItem.id, itemType);
    } catch(err) {
      console.error("Failed to save note", err);
    }
  };

  const handleItemComplete = async () => {
    if (!activeItem) return;
    if (completedItems.includes(activeItem.id)) return;
    
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id || 1;
      
      const payload = { userId, courseId: course.id };
      if (itemType === 'video') payload.videoId = activeItem.id;
      if (itemType === 'document') payload.docId = activeItem.id;

      const res = await fetch("http://localhost:5000/api/learner/update-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const body = await res.json();
        setCompletedItems(prev => [...prev, activeItem.id]);
        if (body.progress !== undefined) setProgressPercent(body.progress);
      }
    } catch(err) {
      console.error(err);
    }
  };

  if (course?.error) return <div className="p-10 text-center">Course not found or Database Error.</div>;
  if (!course) return <div className="h-screen flex items-center justify-center bg-porcelain font-poppins text-lavender-grey animate-pulse">Loading Course...</div>;

  return (
    <div className="max-w-[1400px] mx-auto p-6 md:p-8 font-poppins w-full">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
          <Link
            to="/learner/dashboard"
            className="flex items-center gap-2 text-lavender-grey hover:text-soft-periwinkle transition-colors w-fit"
          >
            <ChevronLeft size={20} />
            <span className="font-semibold text-sm">Dashboard</span>
          </Link>
          <div className="bg-white px-4 py-1.5 rounded-full border border-soft-linen shadow-sm flex items-center gap-3">
             <span className="text-xs font-bold text-lavender-grey uppercase tracking-widest">Progress</span>
             <div className="w-24 h-2 bg-porcelain rounded-full overflow-hidden">
                <div className="h-full bg-soft-periwinkle transition-all" style={{ width: `${progressPercent}%` }}></div>
             </div>
             <span className="text-xs font-bold text-ink-black">{progressPercent}%</span>
          </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        {/* Main Player Area */}
        <div className="flex-1 min-w-0">
          <div className="aspect-video bg-ink-black rounded-3xl overflow-hidden shadow-2xl border border-soft-linen relative">
            {activeItem ? (
              itemType === 'document' ? (
                // PDF / Doc Viewer embedded
                <iframe src={activeItem.docUrl} className="w-full h-full bg-white transition-all" title={activeItem.title} />
              ) : (
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
                      className="w-full h-full object-contain bg-ink-black"
                      autoPlay
                      onEnded={handleItemComplete}
                    >
                      <source src={activeItem.videoUrl} type="video/mp4" />
                    </video>
                )
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-warm-taupe gap-4 bg-ink-black/90">
                <Play size={48} className="opacity-20" />
                <p>No material selected</p>
              </div>
            )}
          </div>

          <div className="mt-8 bg-white p-8 rounded-3xl border border-soft-linen shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-4 py-1.5 bg-soft-periwinkle/10 text-soft-periwinkle rounded-full text-xs font-bold uppercase tracking-widest">
                {course.category}
              </span>
              {activeItem && !completedItems.includes(activeItem.id) && (
                <button
                   onClick={handleItemComplete}
                   className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1.5 rounded-full hover:bg-green-200 transition-colors"
                >
                   Mark as Completed
                </button>
              )}
            </div>
            <h1 className="text-4xl font-bold font-playfair text-ink-black mb-4">
              {course.title}
            </h1>
            <p className="text-lavender-grey leading-relaxed text-lg max-w-3xl">
              {course.description}
            </p>
          </div>
        </div>

        {/* Right Sidebar (Curriculum & Notes Split) */}
        <div className="w-full xl:w-[400px] shrink-0 flex flex-col max-h-[calc(100vh-100px)] sticky top-6">
          <div className="bg-white rounded-3xl shadow-sm border border-soft-linen overflow-hidden flex flex-col h-full">
            {/* Tabs */}
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

            {/* CURRICULUM TAB */}
            {activeTab === 'curriculum' && (
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-porcelain/10">
                {/* Videos Section */}
                <div className="p-4 bg-porcelain/30 border-b border-soft-linen sticky top-0 backdrop-blur-md z-10">
                  <span className="text-xs font-bold text-warm-taupe uppercase tracking-widest">Video Lessons</span>
                </div>
                <div className="divide-y divide-soft-linen">
                  {course.videos?.map((vid, index) => (
                    <button
                      key={vid.id}
                      onClick={() => handleItemSelect(vid, 'video')}
                      className={`w-full text-left p-4 transition-all flex items-start gap-4 group ${
                        activeItem?.id === vid.id && itemType === 'video'
                          ? "bg-soft-periwinkle/5 border-l-4 border-soft-periwinkle"
                          : "hover:bg-porcelain border-l-4 border-transparent"
                      }`}
                    >
                      <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold ${activeItem?.id === vid.id && itemType === 'video' ? 'bg-soft-periwinkle text-white' : completedItems.includes(vid.id) ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500 group-hover:bg-soft-periwinkle/20'}`}>
                         {completedItems.includes(vid.id) ? <CheckCircle size={14}/> : (index + 1)}
                      </span>
                      <div>
                        <p className={`text-sm font-bold ${activeItem?.id === vid.id && itemType === 'video' ? "text-soft-periwinkle" : "text-ink-black"}`}>{vid.title}</p>
                        <span className="text-[10px] text-lavender-grey uppercase font-bold flex items-center gap-1 mt-1"><Play size={10} /> Video</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Documents Section */}
                {course.documents?.length > 0 && (
                  <>
                    <div className="p-4 bg-porcelain/30 border-y border-soft-linen sticky top-0 backdrop-blur-md z-10 mt-4">
                      <span className="text-xs font-bold text-warm-taupe uppercase tracking-widest">Study Materials</span>
                    </div>
                    <div className="divide-y divide-soft-linen">
                      {course.documents.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => handleItemSelect(doc, 'document')}
                          className={`w-full text-left p-4 transition-all flex items-start gap-4 group ${
                            activeItem?.id === doc.id && itemType === 'document'
                              ? "bg-soft-periwinkle/5 border-l-4 border-soft-periwinkle"
                              : "hover:bg-porcelain border-l-4 border-transparent"
                          }`}
                        >
                          <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-lg font-bold ${activeItem?.id === doc.id && itemType === 'document' ? 'bg-soft-periwinkle text-white' : completedItems.includes(doc.id) ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500 group-hover:bg-soft-periwinkle/20'}`}>
                            {completedItems.includes(doc.id) ? <CheckCircle size={14}/> : <FileText size={12} />}
                          </span>
                          <div>
                            <p className={`text-sm font-bold ${activeItem?.id === doc.id && itemType === 'document' ? "text-soft-periwinkle" : "text-ink-black"}`}>{doc.title}</p>
                            <span className="text-[10px] text-lavender-grey uppercase font-bold flex items-center gap-1 mt-1"><FileText size={10} /> Document Reader</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* Quiz Section */}
                <div className="p-4 border-t border-soft-linen bg-white mt-auto sticky bottom-0 z-10 w-full shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                   <button onClick={() => navigate(`/quiz/${course.id}`)} className="w-full bg-ink-black text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-md">
                      <BrainCircuit size={18} /> Test Your Knowledge
                   </button>
                </div>
              </div>
            )}

            {/* NOTES TAB */}
            {activeTab === 'notes' && (
              <div className="flex-1 flex flex-col bg-porcelain/20 overflow-hidden">
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
                
                {/* Note Taking Input */}
                <div className="p-4 bg-white border-t border-soft-linen shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                  <div className="bg-porcelain/50 rounded-2xl p-2 border border-soft-linen focus-within:border-soft-periwinkle focus-within:ring-1 focus-within:ring-soft-periwinkle transition-all">
                    <textarea 
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      placeholder={`Notes for "${activeItem?.title || 'this lesson'}"...`}
                      className="w-full bg-transparent p-2 text-sm border-none resize-none outline-none text-ink-black"
                      rows="3"
                    />
                    <div className="flex justify-end pt-2">
                       <button 
                         onClick={saveNote}
                         disabled={!newNote.trim()}
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
