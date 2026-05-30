import React, { useState, useEffect } from "react";
import { User, MessageSquare, Award, Sparkles, Check, Loader2 } from "lucide-react";
import { Card, Toast } from "../../components/DisplayComponents";
import { Button, Input, Textarea } from "../../components/SharedForms";
import { useNavigate } from "react-router-dom";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    bio: "",
    skills: "",
    avatar: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Modern avatar presets
  const avatarPresets = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150", 
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150", 
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150", 
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150", 
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150", 
    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=150", 
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (!storedUser.id) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/profile/${storedUser.id}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            fullName: data.fullName || "",
            email: data.email || "",
            bio: data.bio || "",
            skills: data.skills || "",
            avatar: data.avatar || avatarPresets[0],
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

    try {
      let bodyData;
      let headers = {};

      if (avatarFile) {
        bodyData = new FormData();
        bodyData.append("fullName", formData.fullName);
        bodyData.append("email", formData.email);
        bodyData.append("bio", formData.bio);
        bodyData.append("skills", formData.skills);
        bodyData.append("avatarFile", avatarFile);
      } else {
        bodyData = JSON.stringify(formData);
        headers = { "Content-Type": "application/json" };
      }

      const res = await fetch(`http://localhost:5000/api/profile/${storedUser.id}`, {
        method: "PUT",
        headers,
        body: bodyData,
      });

      if (res.ok) {
        const updated = await res.json();
        localStorage.setItem("user", JSON.stringify({
          ...storedUser,
          fullName: updated.fullName,
          email: updated.email,
          role: updated.role,
        }));
        setToastType("success");
        setToastMessage("Creator profile updated successfully!");
        setAvatarFile(null); // Reset file input state
      } else {
        setToastType("error");
        setToastMessage("Failed to update profile details.");
      }
    } catch (err) {
      console.error(err);
      setToastType("error");
      setToastMessage("Network error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-20 text-center animate-pulse text-lavender-grey">Loading Profile Settings...</div>;
  }

  const skillsList = formData.skills ? formData.skills.split(",").map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="font-poppins text-ink-black animate-fadeIn">
      {toastMessage && (
        <Toast type={toastType} message={toastMessage} onClose={() => setToastMessage("")} />
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-playfair font-bold">Creator Profile Settings</h1>
        <p className="text-sm text-lavender-grey">Manage your public persona and instructor details.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Details editing form */}
        <div className="flex-1 max-w-2xl">
          <Card className="mb-6">
            <h2 className="text-xl font-bold font-playfair mb-6 flex items-center gap-2">
              <User size={20} className="text-soft-periwinkle" /> Edit Profile Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="w-full border-b border-soft-linen pb-6 mb-6">
                <p className="text-xs font-bold text-lavender-grey uppercase tracking-wider text-left mb-4">
                  Upload Custom Avatar
                </p>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                       setAvatarFile(e.target.files[0]);
                       setFormData({ ...formData, avatar: URL.createObjectURL(e.target.files[0]) });
                    }
                  }}
                  className="mb-6 w-full text-sm text-lavender-grey file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-soft-periwinkle/10 file:text-soft-periwinkle hover:file:bg-soft-periwinkle/20"
                />
                
                <p className="text-xs font-bold text-lavender-grey uppercase tracking-wider text-left mb-4">
                  Or Select Preset
                </p>
                <div className="flex flex-wrap gap-3">
                  {avatarPresets.map((presetUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => { setAvatarFile(null); setFormData({ ...formData, avatar: presetUrl }); }}
                      className={`relative rounded-full overflow-hidden w-12 h-12 border-2 transition-all hover:scale-105 ${
                        formData.avatar === presetUrl ? "border-soft-periwinkle scale-105 shadow-md" : "border-transparent"
                      }`}
                    >
                      <img src={presetUrl} className="w-full h-full object-cover" alt="Preset" />
                      {formData.avatar === presetUrl && (
                        <div className="absolute inset-0 bg-soft-periwinkle/20 flex items-center justify-center text-white">
                          <Check size={16} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />

              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <Textarea
                label="Bio / Professional Background"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Brief description about your background, achievements, or interests..."
                rows={4}
              />

              <Input
                label="Skills & Expertise Categories (Comma separated)"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="e.g. React, UI/UX, Web Development, Design"
              />

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={saving} className="px-8 flex items-center gap-2">
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? "Saving Changes..." : "Save Profile"}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Side: Live Profile Preview */}
        <div className="w-full lg:w-[450px] xl:w-[500px] shrink-0 sticky top-10">
          <p className="text-xs font-bold text-lavender-grey uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Live Public Preview</span>
            <span className="flex items-center gap-1 text-[10px] text-green-500 bg-green-50 px-2 py-0.5 rounded-full"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Live</span>
          </p>
          
          <Card className="p-8 relative overflow-hidden bg-white shadow-2xl shadow-soft-periwinkle/10 border-2 border-soft-periwinkle/10 pointer-events-none">
            <div className="absolute top-0 right-0 w-40 h-40 bg-soft-periwinkle/5 rounded-full blur-2xl -z-10"></div>
            
            <div className="flex flex-col items-center text-center gap-4">
              <img
                src={formData.avatar || avatarPresets[0]}
                alt={formData.fullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-soft-periwinkle/20 shadow-md transition-all duration-300"
              />

              <div>
                <h1 className="text-2xl font-bold font-playfair tracking-tight mb-1">
                  {formData.fullName || "Your Name"}
                </h1>
                <p className="text-[10px] uppercase font-bold text-soft-periwinkle tracking-widest flex items-center justify-center gap-1">
                  <Award size={12} /> Certified Contributor
                </p>
              </div>

              <div className="flex items-center gap-2 px-6 py-2.5 rounded-xl shadow-lg shadow-soft-periwinkle/15 bg-soft-periwinkle text-white text-sm font-semibold opacity-80">
                <MessageSquare size={16} /> Message Instructor
              </div>

              <div className="mt-4 w-full">
                <h3 className="text-[11px] font-bold text-lavender-grey uppercase tracking-wider mb-2">Bio</h3>
                <p className="text-xs text-lavender-grey leading-relaxed">
                  {formData.bio || "Your biography will appear here..."}
                </p>
              </div>

              {skillsList.length > 0 && (
                <div className="mt-4 w-full border-t border-soft-linen pt-4">
                  <h3 className="text-[11px] font-bold text-lavender-grey uppercase tracking-wider mb-2">Expertise</h3>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {skillsList.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-porcelain text-ink-black text-[10px] font-semibold rounded-full border border-soft-linen flex items-center gap-1 transition-all"
                      >
                        <Sparkles size={8} className="text-soft-periwinkle" /> {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
          <p className="text-[10px] text-center text-lavender-grey mt-3">This is exactly how learners will see your profile and chat button.</p>
        </div>
      </div>
    </div>
  );
}
