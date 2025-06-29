import React, { useState, useEffect } from 'react';
import { Save, Trash2, Edit } from 'lucide-react';
import { Category } from '../types';

interface Draft {
  id: string;
  title: string;
  category: Category | '';
  description: string;
  tags: string[];
  lastModified: Date;
}

interface DraftManagerProps {
  onLoadDraft: (draft: Draft) => void;
  currentDraft?: Partial<Draft>;
  onSaveDraft: () => void;
}

const DraftManager: React.FC<DraftManagerProps> = ({ 
  onLoadDraft, 
  currentDraft, 
  onSaveDraft 
}) => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);

  useEffect(() => {
    // Load drafts from localStorage
    const savedDrafts = localStorage.getItem('creativepro_drafts');
    if (savedDrafts) {
      const parsedDrafts = JSON.parse(savedDrafts).map((draft: any) => ({
        ...draft,
        lastModified: new Date(draft.lastModified)
      }));
      setDrafts(parsedDrafts);
    }
  }, []);

  const saveDraft = () => {
    if (!currentDraft?.title && !currentDraft?.description) return;

    const draft: Draft = {
      id: Date.now().toString(),
      title: currentDraft.title || '',
      category: currentDraft.category || '',
      description: currentDraft.description || '',
      tags: currentDraft.tags || [],
      lastModified: new Date()
    };

    const updatedDrafts = [draft, ...drafts.slice(0, 9)]; // Keep only 10 most recent
    setDrafts(updatedDrafts);
    localStorage.setItem('creativepro_drafts', JSON.stringify(updatedDrafts));
    onSaveDraft();
  };

  const deleteDraft = (draftId: string) => {
    const updatedDrafts = drafts.filter(draft => draft.id !== draftId);
    setDrafts(updatedDrafts);
    localStorage.setItem('creativepro_drafts', JSON.stringify(updatedDrafts));
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2 mb-4">
        <button
          onClick={saveDraft}
          disabled={!currentDraft?.title && !currentDraft?.description}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          <span>Save Draft</span>
        </button>
        
        <button
          onClick={() => setShowDrafts(!showDrafts)}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-md transition"
        >
          <Edit className="h-4 w-4" />
          <span>Drafts ({drafts.length})</span>
        </button>
      </div>

      {showDrafts && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
          {drafts.length > 0 ? (
            <div className="p-2">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex-1 cursor-pointer" onClick={() => onLoadDraft(draft)}>
                    <h4 className="font-medium text-gray-800 truncate">
                      {draft.title || 'Untitled Draft'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {draft.category && `${draft.category} • `}
                      {formatTimeAgo(draft.lastModified)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDraft(draft.id);
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No drafts saved yet
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DraftManager;