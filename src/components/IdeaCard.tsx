import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, MessageCircle, Calendar, TrendingUp } from 'lucide-react';
import { Idea } from '../types';
import { useIdeas } from '../contexts/IdeaContext';
import { useAuth } from '../contexts/AuthContext';
import VerificationBadge from './VerificationBadge';
import { verificationService } from '../services/verification';

interface IdeaCardProps {
  idea: Idea;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea }) => {
  const { voteIdea, getUserVote } = useIdeas();
  const { user } = useAuth();

  const handleVote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert('Please log in to vote on ideas');
      return;
    }
    
    voteIdea(idea.id, 'up', user.id);
  };

  const userVote = user ? getUserVote(idea.id, user.id) : null;
  const verificationStatus = verificationService.getVerificationStatus(idea.author.id);

  const getCategoryColor = (category: string) => {
    const colors = {
      Tech: 'bg-purple-100 text-purple-800',
      Health: 'bg-red-100 text-red-800',
      Finance: 'bg-blue-100 text-blue-800',
      Education: 'bg-yellow-100 text-yellow-800',
      Sustainability: 'bg-green-100 text-green-800',
      Other: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.Other;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Calculate credibility boost from verified author
  const credibilityBoost = verificationStatus.isVerified && verificationStatus.badge 
    ? Math.floor(verificationStatus.badge.credibilityScore / 10) 
    : 0;

  return (
    <Link to={`/idea/${idea.id}`} className="block">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 h-full flex flex-col relative">
        {/* Credibility indicator */}
        {credibilityBoost > 0 && (
          <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            +{credibilityBoost}
          </div>
        )}

        <div className="flex justify-between items-start mb-3">
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${getCategoryColor(idea.category)}`}>
            {idea.category}
          </span>
          <button
            onClick={handleVote}
            className={`flex items-center space-x-1 transition-colors ${
              userVote === 'up'
                ? 'text-indigo-600 bg-indigo-50 px-2 py-1 rounded'
                : 'text-gray-500 hover:text-indigo-600'
            }`}
          >
            <ArrowUp className="h-4 w-4" />
            <span className="font-medium">{idea.upvotes}</span>
          </button>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {idea.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">
          {idea.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {idea.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
            >
              #{tag}
            </span>
          ))}
          {idea.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{idea.tags.length - 3} more</span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatTimeAgo(idea.createdAt)}</span>
            </div>
            {verificationStatus.isVerified && verificationStatus.badge && (
              <VerificationBadge badge={verificationStatus.badge} size="sm" />
            )}
          </div>
          <div className="flex items-center space-x-1">
            <MessageCircle className="h-4 w-4" />
            <span>{idea.comments.length} comments</span>
          </div>
        </div>

        {/* Author info */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {idea.author.name.charAt(0)}
            </div>
            <span className="text-sm text-gray-600">{idea.author.name}</span>
            {verificationStatus.isVerified && verificationStatus.badge && (
              <span className="text-xs text-gray-500">• Verified</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default IdeaCard;