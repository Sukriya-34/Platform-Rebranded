import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MessageSquare, Award, BookOpen, Clock, ChevronLeft, User, Sparkles } from "lucide-react";
import { Card } from "../../components/DisplayComponents";
import { Button } from "../../components/SharedForms";

export default function ContributorProfile() {
  const { creatorId } = useParams();
  const navigate = useNavigate();
  const [contributor, setContributor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContributor = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/profile/contributor/${creatorId}`);
        if (res.ok) {
          setContributor(await res.json());
        }
      } catch (err) {
        console.error("Error loading contributor profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContributor();
  }, [creatorId]);

  const handleMessageClick = () => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!currentUser.id) {
      alert("Please log in first to message instructors.");
      navigate("/login");
      return;
    }
    // Navigate to Chat and pass the receiver contact id as state
    navigate("/learner/chat", { state: { selectContactId: parseInt(creatorId) } });
  };

  if (loading) {
    return <div className="p-20 text-center animate-pulse text-lavender-grey">Loading portfolio...</div>;
  }

  if (!contributor) {
    return (
      <div className="p-20 text-center text-lavender-grey">
        <p className="text-xl font-bold mb-4">Instructor portfolio not found</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const skillsList = contributor.skills ? contributor.skills.split(",").map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-poppins text-ink-black min-h-screen">
      {/* Back breadcrumb */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold text-lavender-grey hover:text-soft-periwinkle transition-colors mb-8"
      >
        <ChevronLeft size={18} /> Back
      </button>

      {/* Portfolio Card */}
      <Card className="mb-12 p-8 md:p-12 relative overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-soft-periwinkle/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <img
            src={contributor.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150"}
            alt={contributor.fullName}
            className="w-32 h-32 rounded-full object-cover border-4 border-soft-periwinkle/20 shadow-md"
          />

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold font-playfair tracking-tight mb-2">
                  {contributor.fullName}
                </h1>
                <p className="text-xs uppercase font-bold text-soft-periwinkle tracking-widest flex items-center justify-center md:justify-start gap-1">
                  <Award size={14} /> Certified Contributor
                </p>
              </div>

              <Button
                onClick={handleMessageClick}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl shadow-lg shadow-soft-periwinkle/15"
              >
                <MessageSquare size={16} /> Message Instructor
              </Button>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-bold text-lavender-grey uppercase tracking-wider mb-2">Bio / Professional Background</h3>
              <p className="text-lavender-grey leading-relaxed max-w-3xl">
                {contributor.bio || "No biography provided by the instructor yet."}
              </p>
            </div>

            {skillsList.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-bold text-lavender-grey uppercase tracking-wider mb-3">Expertise & Skills</h3>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {skillsList.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 bg-porcelain text-ink-black text-xs font-semibold rounded-full border border-soft-linen flex items-center gap-1"
                    >
                      <Sparkles size={10} className="text-soft-periwinkle" /> {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Courses list */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold font-playfair flex items-center gap-2">
          <BookOpen size={24} className="text-soft-periwinkle" /> Courses Created by {contributor.fullName}
        </h2>

        {contributor.courses && contributor.courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {contributor.courses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/learner/courses/${course.id}`)}
                className="bg-white rounded-2xl border border-soft-linen overflow-hidden hover:shadow-xl transition-all cursor-pointer flex flex-col h-full group"
              >
                <div className="w-full h-44 bg-porcelain relative overflow-hidden">
                  <img
                    src={course.thumbnailUrl || `https://placehold.co/400x300/e2e8f0/1e293b?text=Course`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt={course.title}
                  />
                  <span className="absolute top-3 left-3 bg-white text-soft-periwinkle text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-sm">
                    {course.category}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-[15px] leading-tight text-ink-black mb-2 line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-lavender-grey line-clamp-2 mb-4 flex-1">
                    {course.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between text-xs text-lavender-grey font-semibold border-t border-soft-linen pt-3">
                    <div className="flex items-center gap-1">
                      <Clock size={12} /> {course._count?.videos || 0} Lessons
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12 text-lavender-grey">
            <p>No courses published by this instructor yet.</p>
          </Card>
        )}
      </section>
    </div>
  );
}
