import React, { useState, useEffect } from "react";
import { Upload, Video, FileText, TrendingUp } from "lucide-react";
import { Card, LoadingSkeleton } from "../../components/DisplayComponents";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentContent, setRecentContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TEMPORARY MOCK DATA: Simulating a backend call
    const loadDashboardData = async () => {
      setLoading(true);
      setTimeout(() => {
        setStats({
          totalUploads: 5,
          totalVideos: 3,
          totalDocuments: 2,
        });
        setRecentContent([
          {
            id: 1,
            title: "Introduction to React Hooks",
            category: "Web Development",
            type: "video",
            fileSize: "45.2 MB",
            uploadDate: "2024-03-15",
            duration: "24:30",
          },
          {
            id: 2,
            title: "JavaScript ES6+ Features",
            category: "Programming",
            type: "document",
            fileSize: "2.8 MB",
            uploadDate: "2024-03-14",
          },
          {
            id: 3,
            title: "CSS Grid Layout Masterclass",
            category: "Web Development",
            type: "video",
            fileSize: "67.5 MB",
            uploadDate: "2024-03-13",
            duration: "38:15",
          },
        ]);
        setLoading(false);
      }, 800); // 800ms delay to show your nice loading skeleton!
    };

    loadDashboardData();
  }, []);

  const statCards = [
    {
      title: "Total Uploads",
      value: stats?.totalUploads || 0,
      icon: Upload,
      color: "bg-soft-periwinkle", // Using your primary color
      trend: "+12%",
    },
    {
      title: "Total Videos",
      value: stats?.totalVideos || 0,
      icon: Video,
      color: "bg-ink-black", // Using your dark color for contrast
      trend: "+8%",
    },
    {
      title: "Total Documents",
      value: stats?.totalDocuments || 0,
      icon: FileText,
      color: "bg-lavender-grey", // Using your accent color
      trend: "+15%",
    },
  ];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <LoadingSkeleton type="card" count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto font-poppins text-ink-black">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-playfair">Dashboard</h1>
        <p className="text-lavender-grey mt-1">
          Overview of your creator studio.
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} hover className="border-soft-linen">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-lavender-grey mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-ink-black">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp size={14} className="text-soft-periwinkle" />
                    <span className="text-sm font-medium text-soft-periwinkle">
                      {stat.trend}
                    </span>
                    <span className="text-sm text-lavender-grey">
                      from last month
                    </span>
                  </div>
                </div>
                <div
                  className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center shadow-sm`}
                >
                  <Icon size={28} className="text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Uploads List */}
      <Card className="border-soft-linen p-0 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-soft-linen bg-porcelain">
          <h3 className="text-lg font-semibold text-ink-black">
            Recent Uploads
          </h3>
        </div>

        <div className="divide-y divide-soft-linen">
          {recentContent.map((content) => (
            <div
              key={content.id}
              className="flex items-center gap-4 p-6 hover:bg-porcelain/50 transition-colors"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  content.type === "video"
                    ? "bg-soft-linen"
                    : "bg-porcelain border border-soft-linen"
                }`}
              >
                {content.type === "video" ? (
                  <Video size={24} className="text-soft-periwinkle" />
                ) : (
                  <FileText size={24} className="text-lavender-grey" />
                )}
              </div>

              <div className="flex-1">
                <h4 className="font-medium text-ink-black">{content.title}</h4>
                <p className="text-sm text-lavender-grey">
                  {content.category} • {content.uploadDate}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium text-ink-black">
                  {content.fileSize}
                </p>
                {content.duration && (
                  <p className="text-sm text-lavender-grey">
                    {content.duration}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
