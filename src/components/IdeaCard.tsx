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
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-8 h-full flex flex-col relative border border-gray-100 hover:border-gray-200">
        {/* Credibility indicator */}
        {credibilityBoost > 0 && (
          <div className="absolute top-4 right-4 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-medium flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            +{credibilityBoost}
          </div>
        )}

        <div className="flex justify-between items-start mb-6">
          <span className={`text-sm px-4 py-2 rounded-full font-medium ${getCategoryColor(idea.category)}`}>
            {idea.category}
          </span>
          <button
            onClick={handleVote}
            className={`flex items-center space-x-2 transition-all duration-200 ${
              userVote === 'up'
                ? 'text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg'
                : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg'
            }`}
          >
            <ArrowUp className="h-5 w-5" />
            <span className="font-semibold text-base">{idea.upvotes}</span>
          </button>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-4 line-clamp-2 leading-tight">
          {idea.title}
        </h3>

        <p className="text-gray-600 text-base mb-6 flex-grow line-clamp-3 leading-relaxed">
          {idea.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {idea.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-sm bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg"
            >
              #{tag}
            </span>
          ))}
          {idea.tags.length > 3 && (
            <span className="text-sm text-gray-500 px-3 py-1.5">+{idea.tags.length - 3} more</span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-3">
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
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {idea.author.name.charAt(0)}
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">{idea.author.name}</span>
              {verificationStatus.isVerified && verificationStatus.badge && (
                <span className="text-xs text-gray-500 ml-2">• Verified</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default IdeaCard;