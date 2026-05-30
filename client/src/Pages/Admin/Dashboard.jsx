import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, Flag, Shield, Trash2, Check, ArrowLeft, RefreshCw } from "lucide-react";
import { Card } from "../../components/DisplayComponents";
import { Button } from "../../components/SharedForms";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ usersCount: 0, coursesCount: 0, flaggedCount: 0, enrollmentsCount: 0 });
  const [users, setUsers] = useState([]);
  const [flaggedCourses, setFlaggedCourses] = useState([]);
  const [pendingContent, setPendingContent] = useState([]);
  const [activeTab, setActiveTab] = useState("users"); // 'users', 'moderation', 'approvals'
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");

  const checkAdminAuth = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "Admin") {
      alert("Access Denied: Admin permission required.");
      navigate("/learner/dashboard");
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, flaggedRes, pendingRes] = await Promise.all([
        fetch("http://localhost:5000/api/admin/stats"),
        fetch("http://localhost:5000/api/admin/users"),
        fetch("http://localhost:5000/api/admin/flagged-courses"),
        fetch("http://localhost:5000/api/admin/pending-content")
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (flaggedRes.ok) setFlaggedCourses(await flaggedRes.json());
      if (pendingRes.ok) setPendingContent(await pendingRes.json());
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminAuth();
    loadAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setActionMessage("User role updated successfully!");
        loadAdminData();
        setTimeout(() => setActionMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUserDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setActionMessage("User deleted successfully!");
        loadAdminData();
        setTimeout(() => setActionMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnflagCourse = async (courseId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/courses/${courseId}/flag`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFlagged: false })
      });
      if (res.ok) {
        setActionMessage("Course approved and unflagged!");
        loadAdminData();
        setTimeout(() => setActionMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm("Are you sure you want to delete this course? All associated videos and enrollments will be deleted.")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/courses/${courseId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setActionMessage("Course successfully deleted from the platform!");
        loadAdminData();
        setTimeout(() => setActionMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateContentStatus = async (type, id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/content/${type}/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setActionMessage(`Content ${status.toLowerCase()} successfully!`);
        loadAdminData();
        setTimeout(() => setActionMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-20 text-center animate-pulse text-lavender-grey">Loading Admin Controls...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-poppins text-ink-black min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <button 
            onClick={() => navigate("/learner/dashboard")}
            className="flex items-center gap-2 text-xs font-bold text-lavender-grey hover:text-soft-periwinkle transition-colors mb-3"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold font-playfair tracking-tight flex items-center gap-3">
            <Shield className="text-soft-periwinkle" size={36} /> Admin Command Center
          </h1>
          <p className="text-lavender-grey mt-1">Manage user roles, platform metrics, and moderate content.</p>
        </div>
        <Button 
          onClick={loadAdminData}
          variant="secondary"
          className="flex items-center gap-2 border-soft-linen shadow-sm bg-white"
        >
          <RefreshCw size={16} /> Refresh
        </Button>
      </div>

      {actionMessage && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 mb-6 animate-fadeIn">
          {actionMessage}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="flex items-center gap-5">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Users size={28} /></div>
          <div>
            <p className="text-sm font-bold text-lavender-grey uppercase tracking-wider">Total Users</p>
            <h3 className="text-3xl font-extrabold">{stats.usersCount}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-5">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl"><BookOpen size={28} /></div>
          <div>
            <p className="text-sm font-bold text-lavender-grey uppercase tracking-wider">Total Courses</p>
            <h3 className="text-3xl font-extrabold">{stats.coursesCount}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-5">
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl"><Flag size={28} /></div>
          <div>
            <p className="text-sm font-bold text-lavender-grey uppercase tracking-wider">Flagged Courses</p>
            <h3 className="text-3xl font-extrabold">{stats.flaggedCount}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-5">
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl"><Shield size={28} /></div>
          <div>
            <p className="text-sm font-bold text-lavender-grey uppercase tracking-wider">Enrollments</p>
            <h3 className="text-3xl font-extrabold">{stats.enrollmentsCount}</h3>
          </div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-soft-linen mb-8">
        <button
          onClick={() => setActiveTab("users")}
          className={`py-4 px-6 font-bold text-sm border-b-2 transition-all ${
            activeTab === "users"
              ? "border-soft-periwinkle text-soft-periwinkle"
              : "border-transparent text-lavender-grey hover:text-ink-black"
          }`}
        >
          User Accounts Management ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("moderation")}
          className={`py-4 px-6 font-bold text-sm border-b-2 transition-all ${
            activeTab === "moderation"
              ? "border-soft-periwinkle text-soft-periwinkle"
              : "border-transparent text-lavender-grey hover:text-ink-black"
          }`}
        >
          Flagged Courses ({flaggedCourses.length})
        </button>
        <button
          onClick={() => setActiveTab("approvals")}
          className={`py-4 px-6 font-bold text-sm border-b-2 transition-all ${
            activeTab === "approvals"
              ? "border-soft-periwinkle text-soft-periwinkle"
              : "border-transparent text-lavender-grey hover:text-ink-black"
          }`}
        >
          Content Approvals ({pendingContent.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "users" ? (
        <Card className="overflow-hidden border border-soft-linen p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-porcelain border-b border-soft-linen">
                  <th className="py-4 px-6 text-xs font-bold uppercase text-lavender-grey tracking-wider">Full Name</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase text-lavender-grey tracking-wider">Email Address</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase text-lavender-grey tracking-wider">Verification</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase text-lavender-grey tracking-wider">Role</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase text-lavender-grey tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-linen bg-white">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-porcelain/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-sm">{u.fullName}</td>
                    <td className="py-4 px-6 text-sm text-lavender-grey">{u.email}</td>
                    <td className="py-4 px-6">
                      <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${u.isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {u.isVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-white border border-soft-linen rounded-xl px-3 py-1.5 text-xs font-bold text-ink-black focus:outline-none focus:ring-1 focus:ring-soft-periwinkle"
                      >
                        <option value="Learner">Learner</option>
                        <option value="ContentCreator">Content Creator</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleUserDelete(u.id)}
                        className="p-2 text-lavender-grey hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : activeTab === "moderation" ? (
        <div className="space-y-6">
          {flaggedCourses.length === 0 ? (
            <Card className="text-center py-16 text-lavender-grey">
              <div className="w-20 h-20 bg-porcelain rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={36} className="text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-ink-black mb-1">Clear Horizon</h3>
              <p className="text-sm">There are no flagged courses needing moderation review right now.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {flaggedCourses.map((c) => (
                <Card key={c.id} className="flex flex-col h-full">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold uppercase bg-red-100 text-red-700 px-3 py-1 rounded-full">
                        Flagged
                      </span>
                      <span className="text-xs text-lavender-grey font-medium">Category: {c.category}</span>
                    </div>
                    <h3 className="text-xl font-bold font-playfair mb-2 leading-snug">{c.title}</h3>
                    <p className="text-sm text-lavender-grey leading-relaxed mb-6">{c.description}</p>
                    <div className="bg-porcelain/50 p-4 rounded-xl border border-soft-linen text-xs text-lavender-grey space-y-1">
                      <p><b>Created By:</b> {c.creator?.fullName}</p>
                      <p><b>Creator Email:</b> {c.creator?.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6 pt-4 border-t border-soft-linen">
                    <button
                      onClick={() => handleUnflagCourse(c.id)}
                      className="flex-1 py-2 px-4 rounded-xl text-xs font-bold bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Check size={14} /> Approve & Dismiss Flag
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(c.id)}
                      className="py-2 px-4 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Trash2 size={14} /> Delete Course
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === "approvals" ? (
        <div className="space-y-6">
          {pendingContent.length === 0 ? (
            <Card className="text-center py-16 text-lavender-grey">
              <div className="w-20 h-20 bg-porcelain rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={36} className="text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-ink-black mb-1">All Caught Up!</h3>
              <p className="text-sm">There are no pending videos or documents waiting for approval.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingContent.map((asset) => (
                <Card key={asset.id} className="flex flex-col h-full">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold uppercase bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                        Pending {asset.type}
                      </span>
                      <span className="text-xs text-lavender-grey font-medium">Uploaded: {new Date(asset.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-xl font-bold font-playfair mb-2 leading-snug">{asset.title}</h3>
                    <div className="bg-porcelain/50 p-4 rounded-xl border border-soft-linen text-xs text-lavender-grey space-y-1 mt-4">
                      <p><b>Course:</b> {asset.course?.title}</p>
                      <p><b>Creator:</b> {asset.course?.creator?.fullName} ({asset.course?.creator?.email})</p>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6 pt-4 border-t border-soft-linen">
                    <button
                      onClick={() => handleUpdateContentStatus(asset.type, asset.id, "APPROVED")}
                      className="flex-1 py-2 px-4 rounded-xl text-xs font-bold bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Check size={14} /> Approve Content
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt("Enter a reason for rejection (this will be sent to the creator):");
                        if (reason !== null) handleUpdateContentStatus(asset.type, asset.id, "REJECTED");
                      }}
                      className="py-2 px-4 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Trash2 size={14} /> Reject
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
