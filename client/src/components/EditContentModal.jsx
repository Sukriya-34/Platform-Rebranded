import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import Textarea from './Textarea';
import Select from './Select';
import UploadBox from './UploadBox';
import { updateContent } from '../services/api';

export default function EditContentModal({ isOpen, onClose, content, onSave, onShowToast }) {
  const [formData, setFormData] = useState({
    title: content.title,
    description: content.description,
    category: content.category,
    file: null
  });
  const [saving, setSaving] = useState(false);

  const categories = [
    { value: 'Web Development', label: 'Web Development' },
    { value: 'Programming', label: 'Programming' },
    { value: 'Backend', label: 'Backend' },
    { value: 'Design', label: 'Design' },
    { value: 'Data Science', label: 'Data Science' },
    { value: 'Mobile Development', label: 'Mobile Development' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (file) => {
    setFormData(prev => ({ ...prev, file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      const updatedContent = await updateContent(content.id, formData);
      onSave(updatedContent);
    } catch (error) {
      console.error('Error updating content:', error);
      onShowToast('Failed to update content', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Content"
      size="large"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="text-sm text-gray-600 mb-2">Replace file (optional)</p>
          <UploadBox
            type={content.type}
            accept={content.type === 'video' ? 'video/*' : '.pdf,.doc,.docx,.txt'}
            onFileSelect={handleFileSelect}
          />
        </div>

        <Input
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter content title"
          required
        />

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe your content"
          required
          rows={4}
        />

        <Select
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          options={categories}
          placeholder="Select a category"
          required
        />
      </form>
    </Modal>
  );
}
