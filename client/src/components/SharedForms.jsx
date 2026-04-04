import React, { useState, useRef } from "react";
import { Upload, FileVideo, FileText, X } from "lucide-react";

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "medium",
  disabled = false,
  type = "button",
  className = "",
}) {
  const baseStyles =
    "font-medium rounded-xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary:
      "bg-[#9893DA] hover:bg-[#797A9E] text-white focus:ring-[#9893DA] disabled:bg-gray-300 disabled:cursor-not-allowed",
    secondary:
      "bg-white hover:bg-gray-50 text-ink-black border border-gray-300 focus:ring-gray-400",
    danger:
      "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 disabled:bg-red-300",
    ghost: "bg-transparent hover:bg-gray-100 text-ink-black",
  };
  const sizes = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  disabled = false,
  className = "",
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-ink-black mb-2"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-soft-periwinkle focus:border-transparent transition-all ${
          error ? "border-red-500" : "border-gray-300"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function Textarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  disabled = false,
  rows = 4,
  className = "",
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-ink-black mb-2"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-soft-periwinkle focus:border-transparent transition-all resize-none ${
          error ? "border-red-500" : "border-gray-300"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function Select({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  error,
  disabled = false,
  placeholder = "Select an option",
  className = "",
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-ink-black mb-2"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-soft-periwinkle focus:border-transparent transition-all ${
          error ? "border-red-500" : "border-gray-300"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
      >
        <option value="">{placeholder}</option>
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function UploadBox({ accept, onFileSelect, type = "video" }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0)
      handleFileSelection(e.dataTransfer.files[0]);
  };

  const handleFileSelection = (file) => {
    setSelectedFile(file);
    if (onFileSelect) onFileSelect(file);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) handleFileSelection(e.target.files[0]);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (onFileSelect) onFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getFileIcon = () => {
    if (!selectedFile)
      return type === "video" ? (
        <FileVideo size={48} />
      ) : (
        <FileText size={48} />
      );
    return type === "video" ? (
      <FileVideo size={48} className="text-soft-periwinkle" />
    ) : (
      <FileText size={48} className="text-soft-periwinkle" />
    );
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={
          !selectedFile ? () => fileInputRef.current?.click() : undefined
        }
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
          isDragging || selectedFile
            ? "border-soft-periwinkle bg-purple-50"
            : "border-gray-300 hover:border-soft-periwinkle hover:bg-gray-50 cursor-pointer"
        }`}
      >
        {selectedFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getFileIcon()}
              <div>
                <p className="font-medium text-ink-black">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-4 text-gray-400">
              <Upload size={48} />
            </div>
            <p className="text-lg font-medium text-ink-black mb-2">
              Drop your {type} here or click to browse
            </p>
            <p className="text-sm text-gray-500">
              {type === "video"
                ? "MP4, MOV, AVI up to 500MB"
                : "PDF, DOCX, TXT up to 50MB"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
