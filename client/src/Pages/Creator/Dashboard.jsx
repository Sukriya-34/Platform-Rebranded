import React, { useState, useEffect } from "react";
import {
  Upload,
  Video,
  FileText,
  BookOpen,
  Plus,
  PlayCircle,
  Clock,
} from "lucide-react";
import { Card, LoadingSkeleton } from "../../components/DisplayComponents";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentContent, setRecentContent] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch both assets and courses concurrently from your API [cite: 351]
        const [assetsResponse, coursesResponse] = await Promise.all([
          fetch("http://localhost:5000/api/courses/all-assets"),
          fetch("http://localhost:5000/api/courses"),
        ]);

        const assets = await assetsResponse.json();
        const courses = await coursesResponse.json();

        // Ensure we are working with arrays to avoid .filter or .map errors [cite: 150]
        const safeAssets = Array.isArray(assets) ? assets : [];
        const safeCourses = Array.isArray(courses) ? courses : [];

        const videoCount = safeAssets.filter((a) => a.type === "video").length;
        const docCount = safeAssets.filter((a) => a.type === "document").length;

        setStats({
          totalCourses: safeCourses.length,
          totalUploads: safeAssets.length,
          totalVideos: videoCount,
          totalDocuments: docCount,
        });

        // Sort by date to show the freshest uploads first [cite: 325]
        setRecentContent(
          safeAssets
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 4),
        );
        setRecentCourses(safeCourses.slice(0, 3));
        setLoading(false);
      } catch (error) {
        console.error("Dashboard load failed", error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const statCards = [
    {
      title: "Total Courses",
      value: stats?.totalCourses || 0,
      icon: BookOpen,
      color: "bg-ink-black",
    },
    {
      title: "Total Uploads",
      value: stats?.totalUploads || 0,
      icon: Upload,
      color: "bg-soft-periwinkle",
    },
    {
      title: "Video Lessons",
      value: stats?.totalVideos || 0,
      icon: Video,
      color: "bg-lavender-grey",
    },
    {
      title: "Documents",
      value: stats?.totalDocuments || 0,
      icon: FileText,
      color: "bg-warm-taupe",
    },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <LoadingSkeleton type="card" count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto font-poppins text-ink-black pb-12 animate-fadeIn">
      {/* Header Section with Quick Navigation [cite: 41, 105] */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold font-playfair tracking-tight mb-2 text-ink-black">
            Welcome back, Creator
          </h1>
          <p className="text-lavender-grey font-medium">
            Here is what is happening in your studio today.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/creator/upload"
            className="px-5 py-2.5 bg-white border border-soft-linen text-ink-black rounded-2xl hover:bg-porcelain transition-all flex items-center gap-2 text-sm font-bold shadow-sm"
          >
            <Upload size={18} className="text-soft-periwinkle" /> Upload Content
          </Link>
          <Link
            to="/creator/courses"
            className="px-5 py-2.5 bg-soft-periwinkle text-white rounded-2xl shadow-lg shadow-soft-periwinkle/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 text-sm font-bold"
          >
            <Plus size={18} /> New Course
          </Link>
        </div>
      </div>

      {/* Grid for Summary Stats [cite: 110, 167] */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="border border-soft-linen bg-white p-6 rounded-[2.5rem] shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center shadow-inner shrink-0`}
                >
                  <Icon size={26} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-lavender-grey uppercase tracking-widest mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold font-playfair text-ink-black">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Interactive Asset List [cite: 32, 113] */}
        <div className="lg:col-span-2">
          <h3 className="text-xl font-bold font-playfair mb-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-soft-periwinkle/10 flex items-center justify-center">
              <Clock size={18} className="text-soft-periwinkle" />
            </div>
            Recently Uploaded Assets
          </h3>
          <Card className="border border-soft-linen p-0 overflow-hidden bg-white rounded-[2.5rem] shadow-sm">
            <div className="divide-y divide-soft-linen">
              {recentContent.length > 0 ? (
                recentContent.map((content) => (
                  <Link
                    to={
                      content.course
                        ? `/creator/courses/${content.course.id}`
                        : "/creator/manage"
                    }
                    key={`${content.type}-${content.id}`}
                    className="flex items-center gap-5 p-6 hover:bg-porcelain/50 transition-all group"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${content.type === "video" ? "bg-soft-periwinkle/10 text-soft-periwinkle group-hover:bg-soft-periwinkle group-hover:text-white" : "bg-porcelain border border-soft-linen text-lavender-grey group-hover:border-soft-periwinkle group-hover:text-soft-periwinkle"}`}
                    >
                      {content.type === "video" ? (
                        <PlayCircle size={22} />
                      ) : (
                        <FileText size={22} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-ink-black group-hover:text-soft-periwinkle transition-colors truncate">
                        {content.title}
                      </h4>
                      <p className="text-xs text-lavender-grey mt-1 font-medium truncate">
                        {content.course?.title || "Unassigned"} •{" "}
                        {new Date(content.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-[10px] font-black px-3 py-1 bg-porcelain border border-soft-linen rounded-full text-lavender-grey uppercase tracking-[0.15em] shrink-0">
                      {content.type}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="p-12 text-center text-lavender-grey font-medium italic">
                  Your library is currently empty.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Dynamic Course Shortcuts [cite: 101, 111] */}
        <div>
          <h3 className="text-xl font-bold font-playfair mb-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-soft-periwinkle/10 flex items-center justify-center">
              <BookOpen size={18} className="text-soft-periwinkle" />
            </div>
            Active Courses
          </h3>
          <div className="space-y-4">
            {recentCourses.length > 0 ? (
              recentCourses.map((course) => (
                <Link
                  to={`/creator/courses/${course.id}`}
                  key={course.id}
                  className="block group"
                >
                  <Card className="border border-soft-linen bg-white p-5 rounded-4xl flex items-center gap-4 group-hover:border-soft-periwinkle/50 group-hover:shadow-md transition-all">
                    <div className="w-16 h-16 bg-porcelain rounded-2xl overflow-hidden shrink-0 border border-soft-linen transition-transform group-hover:scale-105">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lavender-grey/30">
                          <BookOpen size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-ink-black truncate text-sm mb-1">
                        {course.title}
                      </h4>
                      <span className="text-[10px] font-black text-soft-periwinkle uppercase tracking-widest">
                        {course.category}
                      </span>
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <Card className="border border-soft-linen bg-white p-8 text-center rounded-[2.5rem]">
                <p className="text-sm text-lavender-grey font-medium mb-4">
                  No active courses found.
                </p>
                <Link
                  to="/creator/courses"
                  className="text-xs font-black text-soft-periwinkle uppercase tracking-widest hover:text-ink-black transition-colors"
                >
                  Create First Course &rarr;
                </Link>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
