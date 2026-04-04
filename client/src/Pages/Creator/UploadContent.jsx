import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Card } from '../../components/DisplayComponents';
import { Button, Input, Textarea, Select, UploadBox } from '../../components/SharedForms';

export default function UploadContent() {
  const [contentType, setContentType] = useState('video');
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    category: '', 
    courseId: '', 
    file: null 
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // The exact categories from your Bolt.new screenshot
  const categories = [
    { value: 'Web Development', label: 'Web Development' },
    { value: 'Programming', label: 'Programming' },
    { value: 'Backend', label: 'Backend' },
    { value: 'Design', label: 'Design' },
    { value: 'Data Science', label: 'Data Science' },
    { value: 'Mobile Development', label: 'Mobile Development' }
  ];

  // Dummy courses so we can attach this video to a specific course in the database
  const myCourses = [
    { value: '1', label: 'Introduction to Web Development' },
    { value: '2', label: 'Advanced React Patterns' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) return alert('Please select a file');

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress before we hook up the Express backend
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setUploadSuccess(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', category: '', courseId: '', file: null });
    setUploadProgress(0);
    setUploadSuccess(false);
  };

  return (
    <div className="max-w-4xl mx-auto font-poppins text-ink-black">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-playfair">Upload Content</h1>
      </div>

      <Card>
        {/* Toggle Video / Document (Just like the screenshot) */}
        <div className="flex items-center gap-4 mb-6 border-b border-soft-linen pb-4">
          <button
            onClick={() => setContentType('video')}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              contentType === 'video' ? 'bg-soft-periwinkle text-white' : 'bg-porcelain text-lavender-grey hover:bg-soft-linen'
            }`}
          >
            Upload Video
          </button>
          <button
            onClick={() => setContentType('document')}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              contentType === 'document' ? 'bg-soft-periwinkle text-white' : 'bg-porcelain text-lavender-grey hover:bg-soft-linen'
            }`}
          >
            Upload Document
          </button>
        </div>

        {uploadSuccess ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <h3 className="text-2xl font-bold mb-2 font-playfair">Upload Successful!</h3>
            <p className="text-lavender-grey mb-6">Your content is now attached to the course.</p>
            <Button onClick={resetForm}>Upload Another</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* The exact Upload Box from your components */}
            <UploadBox
              type={contentType}
              accept={contentType === 'video' ? 'video/mp4,video/x-m4v,video/*' : '.pdf,.doc,.docx'}
              onFileSelect={(f) => setFormData({ ...formData, file: f })}
            />

            {/* Inputs styled just like the screenshot */}
            <Input
              label="Title"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={`Enter ${contentType} title`}
              required
            />

            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={`Describe your ${contentType} content`}
              required
              rows={4}
            />

            {/* Database Requirement: Link to Course */}
            <Select
              label="Select a Course"
              name="courseId"
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              options={myCourses}
              placeholder="Select a course to attach this to"
              required
            />

            {/* UI Requirement: Exact Category Dropdown from Screenshot */}
            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={categories}
              placeholder="Select a category"
              required
            />

            {uploading && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm text-lavender-grey">
                  <span>Uploading...</span>
                  <span className="font-medium text-soft-periwinkle">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-porcelain rounded-full overflow-hidden">
                  <div className="h-full bg-soft-periwinkle transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={resetForm} disabled={uploading}>Cancel</Button>
              <Button type="submit" disabled={!formData.file || uploading}>
                {uploading ? 'Uploading...' : 'Upload Content'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}