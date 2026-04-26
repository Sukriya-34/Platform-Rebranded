import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Play,
  ChevronLeft,
  FileText,
  Clock,
  CheckCircle,
  Check,
} from "lucide-react";

// --- HELPER FUNCTION: Extracts the YouTube ID and formats it for iframes ---
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
  const [activeVideo, setActiveVideo] = useState(null);
  const [completedVideos, setCompletedVideos] = useState([]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/courses/${id}`);
        if (!res.ok) throw new Error("Course not found");
        const data = await res.json();

        setCourse(data);
        if (
          data.videos &&
          Array.isArray(data.videos) &&
          data.videos.length > 0
        ) {
          setActiveVideo(data.videos[0]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setCourse({ error: true });
      }
    };
    fetchCourse();
  }, [id]);

  // Function to handle when the video finishes playing
  const handleVideoEnd = async () => {
    if (!activeVideo || !course) return;
    if (completedVideos.includes(activeVideo.id)) return; // Prevent duplicate calls

    try {
      const res = await fetch(
        "http://localhost:5000/api/courses/progress/complete",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: 1, // TODO: Replace with actual logged-in user ID
            videoId: activeVideo.id,
            courseId: course.id,
          }),
        },
      );

      if (res.ok) {
        console.log("Video marked as completed!");
        setCompletedVideos((prev) => [...prev, activeVideo.id]);
      }
    } catch (err) {
      console.error("Error saving progress:", err);
    }
  };

  if (course?.error)
    return (
      <div className="p-10 text-center font-poppins">
        Course not found or Database Error.
      </div>
    );
  if (!course)
    return (
      <div className="h-screen flex items-center justify-center bg-porcelain font-poppins">
        ...Loading...
      </div>
    );

  // Check if the current video is a YouTube link
  const embedUrl = activeVideo?.videoUrl
    ? getYouTubeEmbedUrl(activeVideo.videoUrl)
    : null;
  const isCurrentlyCompleted = completedVideos.includes(activeVideo?.id);

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 font-poppins">
      {/* Breadcrumb */}
      <Link
        to="/creator/courses"
        className="flex items-center gap-2 text-lavender-grey hover:text-soft-periwinkle mb-8 transition-colors group w-fit"
      >
        <ChevronLeft
          size={20}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span className="font-semibold text-sm">Back to Courses</span>
      </Link>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main Player Area */}
        <div className="flex-1 min-w-0">
          <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white relative">
            {activeVideo ? (
              embedUrl ? (
                // 1. YouTube Iframe Player
                <iframe
                  key={embedUrl}
                  className="absolute top-0 left-0 w-full h-full"
                  src={embedUrl}
                  title={activeVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                // 2. Standard HTML5 Video Player for Cloudinary Uploads
                <video
                  key={activeVideo.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                  autoPlay
                  onEnded={handleVideoEnd} // Still works perfectly for direct files
                >
                  <source src={activeVideo.videoUrl} type="video/mp4" />
                </video>
              )
            ) : (
              // 3. Fallback
              <div className="h-full flex flex-col items-center justify-center text-warm-taupe gap-4">
                <Play size={48} className="opacity-20" />
                <p>No video selected</p>
              </div>
            )}
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-4 py-1 bg-soft-periwinkle/10 text-soft-periwinkle rounded-full text-xs font-bold uppercase tracking-widest">
                {course.category}
              </span>

              {/* Manual completion button for YouTube videos since iframes can't trigger onEnded */}
              {embedUrl && activeVideo && (
                <button
                  onClick={handleVideoEnd}
                  disabled={isCurrentlyCompleted}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    isCurrentlyCompleted
                      ? "bg-green-100 text-green-600 cursor-default"
                      : "bg-white border border-soft-linen text-ink-black hover:border-soft-periwinkle hover:text-soft-periwinkle shadow-sm"
                  }`}
                >
                  {isCurrentlyCompleted ? (
                    <>
                      <CheckCircle size={16} /> Completed
                    </>
                  ) : (
                    <>
                      <Check size={16} /> Mark as Complete
                    </>
                  )}
                </button>
              )}
            </div>

            <h1 className="text-4xl font-bold font-playfair text-ink-black">
              {course.title}
            </h1>
            <p className="text-lavender-grey leading-relaxed max-w-3xl">
              {course.description}
            </p>
          </div>
        </div>

        {/* Premium Playlist Sidebar */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-white rounded-4xl shadow-sm border border-soft-linen overflow-hidden sticky top-10">
            <div className="p-6 border-b border-soft-linen bg-porcelain/50">
              <h3 className="font-bold text-ink-black flex items-center gap-3">
                <div className="p-2 bg-soft-periwinkle rounded-lg text-white">
                  <Play size={16} fill="currentColor" />
                </div>
                Course Curriculum
              </h3>
            </div>

            <div className="max-h-125 overflow-y-auto divide-y divide-soft-linen scrollbar-thin">
              {course.videos?.length > 0 ? (
                course.videos.map((vid, index) => {
                  const isCompleted = completedVideos.includes(vid.id);

                  return (
                    <button
                      key={vid.id}
                      onClick={() => setActiveVideo(vid)}
                      className={`w-full text-left p-5 transition-all flex items-start gap-4 group ${
                        activeVideo?.id === vid.id
                          ? "bg-soft-periwinkle/5 border-l-4 border-soft-periwinkle"
                          : "hover:bg-porcelain border-l-4 border-transparent"
                      }`}
                    >
                      <span
                        className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          activeVideo?.id === vid.id
                            ? "bg-soft-periwinkle text-white"
                            : isCompleted
                              ? "bg-green-100 text-green-600"
                              : "bg-porcelain text-lavender-grey group-hover:bg-soft-periwinkle/20"
                        }`}
                      >
                        {isCompleted && activeVideo?.id !== vid.id ? (
                          <CheckCircle size={14} />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-bold truncate ${
                            activeVideo?.id === vid.id
                              ? "text-soft-periwinkle"
                              : "text-ink-black"
                          }`}
                        >
                          {vid.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] text-lavender-grey uppercase font-bold tracking-tighter flex items-center gap-1">
                            <Clock size={10} /> Video Lesson
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-10 text-center text-lavender-grey text-sm">
                  No lessons uploaded yet.
                </div>
              )}
            </div>

            {/* Study Materials Section */}
            {course.documents?.length > 0 && (
              <div className="p-6 bg-porcelain/30 border-t border-soft-linen">
                <h4 className="text-xs font-bold text-warm-taupe uppercase tracking-widest mb-4">
                  Resources
                </h4>
                <div className="space-y-3">
                  {course.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.docUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-soft-linen hover:border-soft-periwinkle transition-colors group"
                    >
                      <FileText
                        size={16}
                        className="text-lavender-grey group-hover:text-soft-periwinkle"
                      />
                      <span className="text-xs font-semibold text-ink-black truncate">
                        {doc.title}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
