import React, { useState, useEffect } from "react";
import { User, Mail, BookOpen, KeyRound, Award, Sparkles, Check, ArrowLeft } from "lucide-react";
import { Card, Toast } from "../../components/DisplayComponents";
import { Button, Input, Textarea } from "../../components/SharedForms";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    bio: "",
    skills: "",
    avatar: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Modern avatar presets
  const avatarPresets = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150", // Female 1
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150", // Male 1
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150", // Female 2
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150", // Male 2
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150", // Female 3
    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=150", // Male 3
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
        // Update user details in local storage (sync navbars)
        localStorage.setItem("user", JSON.stringify({
          ...storedUser,
          fullName: updated.fullName,
          email: updated.email,
          role: updated.role,
        }));
        setToastType("success");
        setToastMessage("Profile updated successfully!");
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 font-poppins text-ink-black min-h-screen">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold text-lavender-grey hover:text-soft-periwinkle transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Side: Avatar selector card */}
        <div className="w-full md:w-80 shrink-0">
          <Card className="text-center flex flex-col items-center">
            <div className="relative mb-6">
              <img
                src={formData.avatar || avatarPresets[0]}
                alt="Profile Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-soft-periwinkle/30 shadow-md"
              />
              <div className="absolute bottom-0 right-0 p-2 bg-soft-periwinkle text-white rounded-full shadow-md">
                <Sparkles size={16} />
              </div>
            </div>
            <h3 className="text-xl font-bold font-playfair mb-1">{formData.fullName}</h3>
            <p className="text-xs uppercase font-bold text-lavender-grey tracking-wider mb-6">
              Platform Member
            </p>

            <div className="w-full border-t border-soft-linen pt-6">
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
              <div className="grid grid-cols-3 gap-3">
                {avatarPresets.map((presetUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setAvatarFile(null); setFormData({ ...formData, avatar: presetUrl }); }}
                    className={`relative rounded-full overflow-hidden w-14 h-14 border-2 transition-all hover:scale-105 ${
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
          </Card>
        </div>

        {/* Right Side: Details editing form */}
        <div className="flex-1">
          <Card>
            <h2 className="text-2xl font-bold font-playfair mb-6 flex items-center gap-2">
              <User size={24} className="text-soft-periwinkle" /> Edit Profile Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                label="Bio / About Me"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Brief description about your background, achievements, or interests..."
                rows={3}
              />

              <Input
                label="Skills / Areas of Expertise"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="e.g. React, UI/UX, Python, Copywriting (comma separated)"
              />

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="px-10 py-3 shadow-lg shadow-soft-periwinkle/20"
                >
                  {saving ? "Saving Changes..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>

          <Card className="mt-8">
            <h2 className="text-2xl font-bold font-playfair mb-6 flex items-center gap-2">
              <KeyRound size={24} className="text-soft-periwinkle" /> Change Password
            </h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (passwordData.newPassword !== passwordData.confirmPassword) {
                setToastType("error");
                setToastMessage("Passwords do not match!");
                return;
              }
              setPasswordSaving(true);
              const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
              try {
                const res = await fetch(`http://localhost:5000/api/profile/${storedUser.id}/password`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword }),
                });
                if (res.ok) {
                  setToastType("success");
                  setToastMessage("Password changed successfully!");
                  setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
                } else {
                  const errBody = await res.json();
                  setToastType("error");
                  setToastMessage(errBody.message || "Failed to change password");
                }
              } catch(err) {
                setToastType("error");
                setToastMessage("Network error occurred.");
              } finally {
                setPasswordSaving(false);
              }
            }} className="space-y-6">
              <Input
                label="Old Password"
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                required
              />
              <Input
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
              />
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={passwordSaving}
                  className="px-10 py-3 shadow-lg shadow-soft-periwinkle/20"
                >
                  {passwordSaving ? "Updating Password..." : "Update Password"}
                </Button>
              </div>
            </form>
          </Card>
        </div>

      </div>

      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />
      )}
    </div>
  );
}
