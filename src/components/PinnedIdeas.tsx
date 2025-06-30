import React from 'react';
import { Pin } from 'lucide-react';
import { Idea } from '../types';
import IdeaCard from './IdeaCard';

interface PinnedIdeasProps {
  ideas: Idea[];
}

const PinnedIdeas: React.FC<PinnedIdeasProps> = ({ ideas }) => {
  const pinnedIdeas = ideas.filter(idea => idea.isPinned).slice(0, 3);

  if (pinnedIdeas.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center space-x-3 mb-8">
        <Pin className="h-6 w-6 text-indigo-600" />
        <h2 className="text-2xl font-bold text-gray-800">Pinned Ideas</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {pinnedIdeas.map((idea) => (
          <div key={idea.id} className="relative">
            <IdeaCard idea={idea} />
            <div className="absolute top-4 left-4 bg-indigo-600 text-white p-2 rounded-full shadow-lg">
              <Pin className="h-4 w-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PinnedIdeas;