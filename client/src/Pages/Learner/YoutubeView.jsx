import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, MonitorPlay, Award, LayoutDashboard } from "lucide-react";

export default function YoutubeView() {
  const { videoId } = useParams();
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/search/youtube/${videoId}`);
        if (!res.ok) throw new Error("Video not found");
        const data = await res.json();
        setVideoData(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setVideoData({ error: true });
      } finally {
        setLoading(false);
      }
    };
    fetchVideoDetails();
  }, [videoId]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-porcelain font-poppins text-lavender-grey animate-pulse">Loading YouTube Video...</div>;
  if (videoData?.error) return <div className="p-10 text-center font-poppins">Video details could not be loaded.</div>;

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
        <div className="flex-1 max-w-[850px]">
          <div className="aspect-video bg-ink-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white relative group">
            <iframe 
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`} 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen 
              className="w-full h-full bg-ink-black"
            ></iframe>
          </div>

          <div className="mt-10 space-y-4 bg-white p-8 rounded-[2rem] border border-soft-linen shadow-sm">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                <MonitorPlay size={14}/> YouTube
              </span>
              <span className="text-lavender-grey text-sm font-medium">
                Channel: <span className="font-bold text-ink-black">{videoData?.channelTitle}</span>
              </span>
            </div>
            <h1 className="text-4xl font-bold font-playfair text-ink-black mt-2">
              {videoData?.title || "External YouTube Resource"}
            </h1>
            <p className="text-lavender-grey leading-relaxed text-lg pb-4 whitespace-pre-line">
              {videoData?.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="w-full xl:w-80 shrink-0 space-y-6">
          <div className="bg-white rounded-[2rem] shadow-sm border border-soft-linen overflow-hidden">
            <div className="p-6 border-b border-soft-linen bg-porcelain/30">
              <h4 className="font-bold text-ink-black text-lg flex items-center gap-2">
                <LayoutDashboard size={20} className="text-soft-periwinkle" />
                Explore More
              </h4>
            </div>
            <div className="p-6 space-y-4 bg-white text-sm text-lavender-grey leading-relaxed">
               <p>This is a free external resource fetched directly from YouTube based on your search.</p>
               <p>Return to the dashboard to find more platform courses or external materials.</p>
               <Link to="/learner/dashboard" className="block text-center w-full py-3 mt-4 bg-soft-periwinkle text-white font-bold rounded-xl hover:bg-soft-periwinkle/90 transition-colors">
                 Back to Search
               </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
