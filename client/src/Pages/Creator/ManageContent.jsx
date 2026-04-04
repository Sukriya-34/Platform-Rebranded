import React, { useState } from 'react';
import { Video, FileText, Edit2, Trash2, Search as SearchIcon, Filter } from 'lucide-react';
import { Card, Modal, Toast } from '../../components/DisplayComponents';
import { Button } from '../../components/SharedForms';

export default function ManageContent() {
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const [contents, setContents] = useState([
    { id: 1, title: 'Introduction to React Hooks', category: 'Web Development', type: 'video', size: '45.2 MB', date: 'Mar 15, 2024' },
    { id: 2, title: 'JavaScript ES6+ Features', category: 'Programming', type: 'document', size: '2.8 MB', date: 'Mar 14, 2024' },
    { id: 3, title: 'CSS Grid Layout Masterclass', category: 'Web Development', type: 'video', size: '67.5 MB', date: 'Mar 13, 2024' },
    { id: 4, title: 'API Design Best Practices', category: 'Backend', type: 'document', size: '1.5 MB', date: 'Mar 12, 2024' }
  ]);

  const filteredContents = contents.filter(c => {
    const matchesFilter = filterType === 'all' || c.type === filterType;
    return matchesFilter && c.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto font-poppins text-ink-black">
      <div className="mb-10">
        <h1 className="text-4xl font-bold font-playfair mb-2">Content Library</h1>
        <p className="text-lavender-grey">Manage your individual videos and documents across all courses.</p>
      </div>

      {/* spacious Toolbar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm ring-1 ring-soft-linen">
          {['all', 'video', 'document'].map((t) => (
            <button key={t} onClick={() => setFilterType(t)} className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${filterType === t ? 'bg-soft-periwinkle text-white shadow-md' : 'text-lavender-grey hover:bg-porcelain'}`}>
              {t === 'all' ? 'All Assets' : t + 's'}
            </button>
          ))}
        </div>
        
        <div className="relative w-full lg:w-96">
          <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-lavender-grey" />
          <input
            type="text"
            placeholder="Filter library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-soft-linen rounded-2xl focus:outline-none focus:ring-2 focus:ring-soft-periwinkle/30 transition-all text-sm shadow-sm"
          />
        </div>
      </div>

      {/* Table with Proper Breathing Room */}
      <Card className="p-0 border-none shadow-sm ring-1 ring-soft-linen overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-porcelain/50 border-b border-soft-linen">
                <th className="py-5 px-8 text-xs uppercase tracking-widest font-bold text-lavender-grey">Asset Name</th>
                <th className="py-5 px-8 text-xs uppercase tracking-widest font-bold text-lavender-grey">Category</th>
                <th className="py-5 px-8 text-xs uppercase tracking-widest font-bold text-lavender-grey">Added On</th>
                <th className="py-5 px-8 text-xs uppercase tracking-widest font-bold text-lavender-grey">File Size</th>
                <th className="py-5 px-8 text-xs uppercase tracking-widest font-bold text-lavender-grey text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soft-linen/50">
              {filteredContents.map((content) => (
                <tr key={content.id} className="group hover:bg-porcelain/30 transition-all">
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${content.type === 'video' ? 'bg-purple-50 text-soft-periwinkle' : 'bg-blue-50 text-blue-400'}`}>
                        {content.type === 'video' ? <Video size={22} /> : <FileText size={22} />}
                      </div>
                      <p className="font-bold text-ink-black group-hover:text-soft-periwinkle transition-colors">{content.title}</p>
                    </div>
                  </td>
                  <td className="py-5 px-8"><span className="text-sm font-medium text-lavender-grey bg-porcelain px-3 py-1 rounded-full">{content.category}</span></td>
                  <td className="py-5 px-8 text-sm text-lavender-grey">{content.date}</td>
                  <td className="py-5 px-8 text-sm font-medium">{content.size}</td>
                  <td className="py-5 px-8">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2.5 bg-white border border-soft-linen text-lavender-grey hover:text-soft-periwinkle hover:shadow-sm rounded-xl transition-all"><Edit2 size={18} /></button>
                      <button onClick={() => { setSelectedContent(content); setDeleteModalOpen(true); }} className="p-2.5 bg-white border border-soft-linen text-lavender-grey hover:text-red-500 hover:shadow-sm rounded-xl transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Permanent Deletion" size="small">
        <div className="py-2 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={32}/></div>
          <p className="text-lavender-grey mb-6">Are you sure you want to delete <span className="text-ink-black font-bold">"{selectedContent?.title}"</span>? This cannot be undone.</p>
          <div className="flex gap-3"><Button className="flex-1" variant="secondary" onClick={() => setDeleteModalOpen(false)}>Keep It</Button><Button className="flex-1" variant="danger" onClick={() => { setContents(contents.filter(c => c.id !== selectedContent.id)); setDeleteModalOpen(false); setToastMsg('Asset removed.'); }}>Delete Asset</Button></div>
        </div>
      </Modal>

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}
    </div>
  );
}