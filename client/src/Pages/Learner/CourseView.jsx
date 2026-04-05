import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, ChevronLeft, FileText, Clock, Award } from "lucide-react";

export default function CourseView() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/courses/${id}`);
        if (!res.ok) throw new Error("Course not found");
        const data = await res.json();
        
        setCourse(data);
        if (data.videos && Array.isArray(data.videos) && data.videos.length > 0) {
          setActiveVideo(data.videos[0]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setCourse({ error: true });
      }
    };
    fetchCourse();
  }, [id]);

  if (course?.error) return <div className="p-10 text-center">Course not found or Database Error.</div>;
  if (!course) return <div className="h-screen flex items-center justify-center bg-porcelain font-poppins text-lavender-grey animate-pulse">Loading Course...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 font-poppins w-full">
      {/* Breadcrumb */}
      <Link
        to="/learner/dashboard"
        className="flex items-center gap-2 text-lavender-grey hover:text-soft-periwinkle mb-8 transition-colors group w-fit"
      >
        <ChevronLeft
          size={20}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span className="font-semibold text-sm">Back to Dashboard</span>
      </Link>

      <div className="flex flex-col xl:flex-row gap-10">
        {/* Main Player Area */}
        <div className="flex-1">
          <div className="aspect-video bg-ink-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white relative group">
            {activeVideo ? (
              <video
                key={activeVideo.videoUrl}
                controls
                className="w-full h-full object-contain bg-ink-black"
                autoPlay
              >
                <source src={activeVideo.videoUrl} type="video/mp4" />
              </video>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-warm-taupe gap-4 bg-ink-black/90">
                <Play size={48} className="opacity-20" />
                <p>No video selected</p>
              </div>
            )}
          </div>

          <div className="mt-10 space-y-4 bg-white p-8 rounded-[2rem] border border-soft-linen shadow-sm">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1 bg-soft-periwinkle/10 text-soft-periwinkle rounded-full text-xs font-bold uppercase tracking-widest">
                {course.category}
              </span>
              <span className="text-lavender-grey text-sm flex items-center gap-1 font-medium">
                <Award size={16} /> Certificate Included
              </span>
            </div>
            <h1 className="text-4xl font-bold font-playfair text-ink-black mt-2">
              {course.title}
            </h1>
            <p className="text-lavender-grey leading-relaxed text-lg pb-4">
              {course.description}
            </p>
          </div>
        </div>

        {/* Course Playlist & Resources Sidebar */}
        <div className="w-full xl:w-96 shrink-0 space-y-6">
          <div className="bg-white rounded-[2rem] shadow-sm border border-soft-linen overflow-hidden">
            <div className="p-6 border-b border-soft-linen bg-porcelain/50">
              <h3 className="font-bold text-ink-black flex items-center gap-3 text-lg">
                <div className="p-2 bg-soft-periwinkle rounded-lg text-white shadow-md">
                  <Play size={16} fill="currentColor" />
                </div>
                Course Lessons
              </h3>
            </div>

            <div className="max-h-[450px] overflow-y-auto divide-y divide-soft-linen custom-scrollbar">
              {course.videos?.length > 0 ? (
                course.videos.map((vid, index) => (
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
                      className={`text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-sm ${
                        activeVideo?.id === vid.id
                          ? "bg-soft-periwinkle text-white"
                          : "bg-white text-lavender-grey group-hover:bg-soft-periwinkle/20 border border-soft-linen"
                      }`}
                    >
                      {index + 1}
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
                ))
              ) : (
                <div className="p-10 text-center text-lavender-grey text-sm">
                  No lessons available yet.
                </div>
              )}
            </div>
          </div>

          {/* Study Materials Section */}
          {course.documents?.length > 0 && (
            <div className="bg-white rounded-[2rem] shadow-sm border border-soft-linen overflow-hidden">
              <div className="p-6 border-b border-soft-linen bg-porcelain/30">
                <h4 className="font-bold text-ink-black text-lg flex items-center gap-2">
                  <FileText size={20} className="text-soft-periwinkle" />
                  Study Resources
                </h4>
              </div>
              <div className="p-6 space-y-3 bg-white">
                {course.documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-4 bg-porcelain/50 rounded-xl border border-soft-linen hover:border-soft-periwinkle transition-colors group hover:shadow-sm"
                  >
                    <div className="p-2 bg-white rounded-lg group-hover:text-soft-periwinkle text-lavender-grey shadow-sm">
                       <FileText size={18} />
                    </div>
                    <span className="text-sm font-semibold text-ink-black truncate flex-1 block">
                      {doc.title}
                    </span>
                    <span className="text-xs text-soft-periwinkle font-semibold opacity-0 group-hover:opacity-100 transition-opacity">View</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
