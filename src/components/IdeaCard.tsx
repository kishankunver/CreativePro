import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, MessageCircle, Calendar, TrendingUp, Flame } from 'lucide-react';
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

  // Mock trending calculation (in real app, this would be based on recent vote velocity)
  const getTrendingInfo = () => {
    const hoursSinceCreated = (Date.now() - idea.createdAt.getTime()) / (1000 * 60 * 60);
    
    // Only show trending for recent ideas (within 7 days)
    if (hoursSinceCreated > 168) return null;
    
    // Mock trending calculation based on votes and recency
    const trendingScore = Math.floor((idea.upvotes / Math.max(hoursSinceCreated, 1)) * 10);
    
    if (trendingScore > 5) {
      return {
        score: Math.min(trendingScore, 15), // Cap at +15
        isHot: trendingScore > 10
      };
    }
    
    return null;
  };

  const trendingInfo = getTrendingInfo();

  return (
    <Link to={`/idea/${idea.id}`} className="block">
      <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 sm:p-8 lg:p-10 h-full flex flex-col relative border border-gray-100 hover:border-gray-200">
        {/* Credibility indicator */}
        {credibilityBoost > 0 && (
          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 bg-green-100 text-green-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium flex items-center">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            +{credibilityBoost}
          </div>
        )}

        <div className="flex justify-between items-start mb-6 sm:mb-8">
          <span className={`text-xs sm:text-sm px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full font-semibold ${getCategoryColor(idea.category)}`}>
            {idea.category}
          </span>
          
          <div className="flex flex-col items-end space-y-2">
            {/* Main vote button */}
            <button
              onClick={handleVote}
              className={`flex items-center space-x-2 sm:space-x-3 transition-all duration-200 ${
                userVote === 'up'
                  ? 'text-indigo-600 bg-indigo-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl'
                  : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl'
              }`}
            >
              <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="font-bold text-base sm:text-lg">{idea.upvotes}</span>
            </button>
            
            {/* Trending indicator */}
            {trendingInfo && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                trendingInfo.isHot 
                  ? 'bg-orange-100 text-orange-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {trendingInfo.isHot ? (
                  <Flame className="h-3 w-3" />
                ) : (
                  <TrendingUp className="h-3 w-3" />
                )}
                <span>+{trendingInfo.score}</span>
              </div>
            )}
          </div>
        </div>

        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 line-clamp-2 leading-tight">
          {idea.title}
        </h3>

        <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 flex-grow line-clamp-3 leading-relaxed max-w-prose">
          {idea.description}
        </p>

        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
          {idea.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs sm:text-sm bg-gray-100 text-gray-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium"
            >
              #{tag}
            </span>
          ))}
          {idea.tags.length > 3 && (
            <span className="text-xs sm:text-sm text-gray-500 px-3 sm:px-4 py-1.5 sm:py-2">+{idea.tags.length - 3} more</span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">{formatTimeAgo(idea.createdAt)}</span>
            </div>
            {verificationStatus.isVerified && verificationStatus.badge && (
              <VerificationBadge badge={verificationStatus.badge} size="sm" />
            )}
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">{idea.comments.length} comments</span>
          </div>
        </div>

        {/* Author info */}
        <div className="pt-4 sm:pt-6 border-t border-gray-100">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
              {idea.author.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm sm:text-base font-semibold text-gray-700 truncate block">{idea.author.name}</span>
              {verificationStatus.isVerified && verificationStatus.badge && (
                <span className="text-xs sm:text-sm text-gray-500">• Verified</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default IdeaCard;