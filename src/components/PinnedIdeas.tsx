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
    <div className="mb-16">
      <div className="flex items-center space-x-4 mb-10">
        <Pin className="h-7 w-7 text-indigo-600" />
        <h2 className="text-3xl font-bold text-gray-800">Pinned Ideas</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {pinnedIdeas.map((idea) => (
          <div key={idea.id} className="relative">
            <IdeaCard idea={idea} />
            <div className="absolute top-6 left-6 bg-indigo-600 text-white p-3 rounded-full shadow-lg">
              <Pin className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PinnedIdeas;