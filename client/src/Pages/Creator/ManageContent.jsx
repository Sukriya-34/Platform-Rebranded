import React, { useState, useEffect } from "react";
import { Video, FileText, Trash2, Search, Edit2 } from "lucide-react";
import {
  Card,
  Toast,
  Modal,
  EditContentModal,
} from "../../components/DisplayComponents";
import { Button } from "../../components/SharedForms";
import { useOutletContext } from "react-router-dom";

export default function ManageContent() {
  const [assets, setAssets] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [editingAsset, setEditingAsset] = useState(null);
  const [deletingAsset, setDeletingAsset] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const { searchQuery = "" } = useOutletContext() || {};

  const fetchAssets = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/courses/all-assets",
      );
      const data = await response.json();
      setAssets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching assets:", error);
      setAssets([]);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deletingAsset) return;
    setIsDeleting(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/courses/asset/${deletingAsset.type}/${deletingAsset.id}`,
        { method: "DELETE" },
      );

      if (response.ok) {
        setToastMessage(
          `${deletingAsset.type === "video" ? "Video" : "Document"} deleted.`,
        );
        fetchAssets();
      } else {
        setToastMessage("Failed to delete asset.");
      }
    } catch (error) {
      setToastMessage("An error occurred.");
    } finally {
      setIsDeleting(false);
      setDeletingAsset(null);
    }
  };

  const filteredAssets = Array.isArray(assets)
    ? assets.filter((asset) => {
        const matchesSearch = asset.title
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesCourse = selectedCourseId
          ? asset.course?.id === selectedCourseId
          : true;
        return matchesSearch && matchesCourse;
      })
    : [];

  const uniqueCourses = Array.isArray(assets)
    ? [
        ...new Map(
          assets.filter((a) => a.course).map((a) => [a.course.id, a.course]),
        ).values(),
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold font-playfair mb-2 tracking-tight">
            Content Library
          </h1>
          <p className="text-lavender-grey font-medium">
            Manage all your uploaded videos and documents.
          </p>
        </div>
        <div className="min-w-62.5">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full bg-white border border-soft-linen rounded-xl px-4 py-3 text-sm text-ink-black focus:border-soft-periwinkle focus:ring-1 focus:ring-soft-periwinkle outline-none transition-all shadow-sm"
          >
            <option value="">All Courses</option>
            {uniqueCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-porcelain text-lavender-grey text-sm border-b border-soft-linen">
                <th className="px-6 py-4 font-semibold">File Name</th>
                <th className="px-6 py-4 font-semibold">Course</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Date Uploaded</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soft-linen">
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => (
                  <tr
                    key={`${asset.type}-${asset.id}`}
                    className="hover:bg-porcelain/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 font-medium text-ink-black">
                        <div
                          className={`p-2 rounded-xl ${asset.type === "video" ? "bg-purple-50 text-soft-periwinkle" : "bg-blue-50 text-blue-500"}`}
                        >
                          {asset.type === "video" ? (
                            <Video size={18} />
                          ) : (
                            <FileText size={18} />
                          )}
                        </div>
                        {asset.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-lavender-grey">
                      {asset.course?.title || "Unknown Course"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-3 py-1 bg-porcelain rounded-full text-lavender-grey uppercase">
                        {asset.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-lavender-grey">
                      {new Date(asset.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-2 text-lavender-grey hover:text-soft-periwinkle hover:bg-porcelain rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAsset(asset);
                          }}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingAsset(asset);
                          }}
                          className="p-2 text-lavender-grey hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-lavender-grey"
                  >
                    No files found in your library.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}

      {/* Edit Modal */}
      <EditContentModal
        isOpen={!!editingAsset}
        content={editingAsset}
        onClose={() => setEditingAsset(null)}
        onSave={async (data) => {
          const formData = new FormData();
          formData.append("title", data.title);

          // CRITICAL FIX: Ensure we only send one or the other
          if (data.file) {
            formData.append(editingAsset.type, data.file);
            formData.append("videoUrl", ""); // Clear URL if a file is uploaded
          } else if (data.videoUrl) {
            formData.append("videoUrl", data.videoUrl);
          }

          const response = await fetch(
            `http://localhost:5000/api/courses/asset/${editingAsset.type}/${editingAsset.id}`,
            {
              method: "PUT",
              body: formData,
            },
          );

          if (response.ok) {
            setEditingAsset(null);
            fetchAssets();
            setToastMessage("Content updated successfully!");
          } else {
            setToastMessage("Failed to update content");
            throw new Error("Update failed");
          }
        }}
        onShowToast={(msg, type) => setToastMessage(msg)}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingAsset}
        onClose={() => setDeletingAsset(null)}
        title="Delete Content"
        size="small"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeletingAsset(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 border-none text-white shadow-lg shadow-red-500/20 px-8"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </>
        }
      >
        <p className="text-ink-black/80 font-medium leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="font-bold">"{deletingAsset?.title}"</span>? This
          action cannot be undone and will permanently remove this{" "}
          {deletingAsset?.type} from the library.
        </p>
      </Modal>
    </div>
  );
}
