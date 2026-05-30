import { useState, useRef } from 'react';
import { Upload, FileVideo, FileText, X } from 'lucide-react';

export default function UploadBox({ accept, onFileSelect, type = 'video' }) {
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

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file) => {
    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (onFileSelect) {
      onFileSelect(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = () => {
    if (!selectedFile) {
      return type === 'video' ? <FileVideo size={48} /> : <FileText size={48} />;
    }
    return type === 'video' ? <FileVideo size={48} className="text-[#9893DA]" /> : <FileText size={48} className="text-[#9893DA]" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
        onClick={!selectedFile ? handleClick : undefined}
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
          isDragging
            ? 'border-[#9893DA] bg-purple-50'
            : selectedFile
            ? 'border-[#9893DA] bg-purple-50'
            : 'border-gray-300 hover:border-[#9893DA] hover:bg-gray-50 cursor-pointer'
        }`}
      >
        {selectedFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getFileIcon()}
              <div>
                <p className="font-medium text-[#101219]">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
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
            <p className="text-lg font-medium text-[#101219] mb-2">
              Drop your {type} here or click to browse
            </p>
            <p className="text-sm text-gray-500">
              {type === 'video' ? 'MP4, MOV, AVI up to 500MB' : 'PDF, DOCX, TXT up to 50MB'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
