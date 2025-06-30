import React from 'react';
import { Users, Crown, User } from 'lucide-react';
import { IdeaRelease } from '../types';
import { useIdeas } from '../contexts/IdeaContext';
import { Link } from 'react-router-dom';

interface CollaboratorBadgeProps {
  ideaId: string;
  release?: IdeaRelease;
  className?: string;
}

const CollaboratorBadge: React.FC<CollaboratorBadgeProps> = ({ 
  ideaId, 
  release, 
  className = '' 
}) => {
  const { getUserById } = useIdeas();

  if (!release) return null;

  const originalOwner = getUserById(release.originalOwnerId);
  const collaborator = getUserById(release.releasedToUserId);

  return (
    <div className={`bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-3">
        <Users className="h-5 w-5 text-purple-600" />
        <h4 className="font-medium text-purple-800">Active Collaboration</h4>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Original Owner */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {originalOwner ? originalOwner.name.charAt(0) : 'O'}
            </div>
            <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <Link 
              to={`/profile/${release.originalOwnerId}`}
              className="text-sm font-medium text-purple-800 hover:text-purple-900"
            >
              {originalOwner ? originalOwner.name : 'Original Owner'}
            </Link>
            <div className="text-xs text-purple-600">Idea Creator</div>
          </div>
        </div>

        {/* Collaboration Arrow */}
        <div className="flex items-center">
          <div className="w-8 border-t-2 border-purple-300"></div>
          <Users className="h-4 w-4 text-purple-500 mx-1" />
          <div className="w-8 border-t-2 border-purple-300"></div>
        </div>

        {/* Collaborator */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {collaborator ? collaborator.name.charAt(0) : 'C'}
          </div>
          <div>
            <Link 
              to={`/profile/${release.releasedToUserId}`}
              className="text-sm font-medium text-purple-800 hover:text-purple-900"
            >
              {collaborator ? collaborator.name : 'Collaborator'}
            </Link>
            <div className="text-xs text-purple-600">Active Collaborator</div>
          </div>
        </div>
      </div>

      {/* Release Info */}
      <div className="mt-3 pt-3 border-t border-purple-200">
        <div className="flex items-center justify-between text-xs text-purple-600">
          <span>Released {new Date(release.releasedAt).toLocaleDateString()}</span>
          {release.tipAmount && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
              ${release.tipAmount} tip sent
            </span>
          )}
        </div>
        {release.releaseNotes && (
          <p className="text-sm text-purple-700 mt-2 italic">
            "{release.releaseNotes}"
          </p>
        )}
      </div>
    </div>
  );
};

export default CollaboratorBadge;