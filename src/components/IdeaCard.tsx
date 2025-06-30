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
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-10 h-full flex flex-col relative border border-gray-100 hover:border-gray-200">
        {/* Credibility indicator */}
        {credibilityBoost > 0 && (
          <div className="absolute top-6 right-6 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            +{credibilityBoost}
          </div>
        )}

        <div className="flex justify-between items-start mb-8">
          <span className={`text-sm px-5 py-2.5 rounded-full font-semibold ${getCategoryColor(idea.category)}`}>
            {idea.category}
          </span>
          <button
            onClick={handleVote}
            className={`flex items-center space-x-3 transition-all duration-200 ${
              userVote === 'up'
                ? 'text-indigo-600 bg-indigo-50 px-4 py-3 rounded-xl'
                : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-3 rounded-xl'
            }`}
          >
            <ArrowUp className="h-6 w-6" />
            <span className="font-bold text-lg">{idea.upvotes}</span>
          </button>
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-6 line-clamp-2 leading-tight">
          {idea.title}
        </h3>

        <p className="text-gray-600 text-lg mb-8 flex-grow line-clamp-3 leading-relaxed">
          {idea.description}
        </p>

        <div className="flex flex-wrap gap-3 mb-8">
          {idea.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-sm bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-medium"
            >
              #{tag}
            </span>
          ))}
          {idea.tags.length > 3 && (
            <span className="text-sm text-gray-500 px-4 py-2">+{idea.tags.length - 3} more</span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span className="text-base">{formatTimeAgo(idea.createdAt)}</span>
            </div>
            {verificationStatus.isVerified && verificationStatus.badge && (
              <VerificationBadge badge={verificationStatus.badge} size="sm" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span className="text-base">{idea.comments.length} comments</span>
          </div>
        </div>

        {/* Author info */}
        <div className="pt-6 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {idea.author.name.charAt(0)}
            </div>
            <div className="flex-1">
              <span className="text-base font-semibold text-gray-700">{idea.author.name}</span>
              {verificationStatus.isVerified && verificationStatus.badge && (
                <span className="text-sm text-gray-500 ml-3">• Verified</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default IdeaCard;