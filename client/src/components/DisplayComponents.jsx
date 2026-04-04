import React, { useState, useEffect } from "react";
import { FileX, CheckCircle, XCircle, Info, X } from "lucide-react";
import { Button, Input, Textarea, Select, UploadBox } from "./SharedForms";

// --- Reusable Card Component ---
export function Card({ children, className = "", hover = false }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-soft-linen p-6 ${hover ? "transition-all duration-300 hover:shadow-xl hover:-translate-y-1" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// --- Empty State (Used when no data exists) ---
export function EmptyState({ title, description, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-24 h-24 bg-porcelain rounded-full flex items-center justify-center mb-6 shadow-inner">
        <FileX size={48} className="text-lavender-grey" />
      </div>
      <h3 className="text-2xl font-bold text-ink-black mb-2 font-playfair">
        {title}
      </h3>
      <p className="text-lavender-grey mb-8 max-w-md leading-relaxed">
        {description}
      </p>
      {action && onAction && (
        <Button
          onClick={onAction}
          className="px-8 shadow-lg shadow-soft-periwinkle/20"
        >
          {action}
        </Button>
      )}
    </div>
  );
}

// --- Loading Skeleton ---
export function LoadingSkeleton({ type = "card", count = 1 }) {
  if (type === "card") {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-soft-linen p-6 animate-pulse"
          >
            <div className="h-40 bg-porcelain rounded-xl mb-4 w-full"></div>
            <div className="h-6 bg-porcelain rounded w-1/3 mb-4"></div>
            <div className="h-12 bg-porcelain rounded w-full"></div>
          </div>
        ))}
      </>
    );
  }
  return null;
}

// --- Premium Toast Notification ---
export function Toast({ message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="text-soft-periwinkle" size={24} />,
    error: <XCircle className="text-red-500" size={24} />,
    info: <Info className="text-blue-400" size={24} />,
  };

  return (
    <div className="fixed top-6 right-6 z-100 flex items-center gap-4 px-6 py-4 rounded-2xl bg-ink-black text-white shadow-2xl animate-fadeIn border border-gray-700 max-w-sm">
      {icons[type]}
      <p className="text-sm font-medium pr-4">{message}</p>
      <button
        onClick={onClose}
        className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
      >
        <X size={18} className="text-gray-400" />
      </button>
    </div>
  );
}

// --- Modern Glass-Blur Modal ---
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "medium",
}) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;
  const sizes = { small: "max-w-md", medium: "max-w-2xl", large: "max-w-4xl" };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Dynamic Glass Blur Overlay */}
      <div
        className="absolute inset-0 bg-ink-black/40 backdrop-blur-md animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`relative bg-white rounded-4xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col animate-modalPop overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-soft-linen bg-white">
          <h2 className="text-2xl font-bold font-playfair text-ink-black">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-porcelain rounded-full transition-colors text-lavender-grey"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-4 p-8 border-t border-soft-linen bg-porcelain/30">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Refined Edit Content Modal ---
export function EditContentModal({
  isOpen,
  onClose,
  content,
  onSave,
  onShowToast,
}) {
  const [formData, setFormData] = useState({
    title: content?.title || "",
    description: content?.description || "",
    category: content?.category || "",
    file: null,
  });
  const [saving, setSaving] = useState(false);

  const categories = [
    { value: "Web", label: "Web" },
    { value: "Design", label: "Design" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setTimeout(() => {
        onSave(formData);
        setSaving(false);
        onShowToast("Content updated successfully!", "success");
      }, 1000);
    } catch (error) {
      onShowToast("Failed to update content", "error");
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Content Details"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Discard Changes
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="px-8 shadow-lg shadow-soft-periwinkle/20"
          >
            {saving ? "Updating..." : "Save Changes"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-porcelain/50 p-6 rounded-2xl border border-dashed border-soft-linen">
          <p className="text-xs font-bold text-soft-periwinkle uppercase tracking-widest mb-4">
            Update Media Asset
          </p>
          <UploadBox
            type={content?.type || "video"}
            onFileSelect={(f) => setFormData({ ...formData, file: f })}
          />
        </div>

        <div className="space-y-6">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
          />
          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            options={categories}
            required
          />
        </div>
      </form>
    </Modal>
  );
}
