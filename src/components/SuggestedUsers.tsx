import React, { useState, useEffect } from 'react';
import { Users, X } from 'lucide-react';
import { User } from '../types';
import { socialService } from '../services/social';
import { useAuth } from '../contexts/AuthContext';
import FollowButton from './FollowButton';
import VerificationBadge from './VerificationBadge';
import { verificationService } from '../services/verification';
import { Link } from 'react-router-dom';

interface SuggestedUsersProps {
  className?: string;
  limit?: number;
}

const SuggestedUsers: React.FC<SuggestedUsersProps> = ({ className = '', limit = 5 }) => {
  const { user } = useAuth();
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [dismissedUsers, setDismissedUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSuggestedUsers();
    }
  }, [user]);

  const loadSuggestedUsers = () => {
    if (!user) return;

    setIsLoading(true);
    const suggestions = socialService.getSuggestedUsers(user.id, limit + dismissedUsers.size);
    
    // Filter out dismissed users
    const filteredSuggestions = suggestions
      .filter(suggestedUser => !dismissedUsers.has(suggestedUser.id))
      .slice(0, limit);
    
    setSuggestedUsers(filteredSuggestions);
    setIsLoading(false);
  };

  const dismissUser = (userId: string) => {
    setDismissedUsers(prev => new Set([...prev, userId]));
    setSuggestedUsers(prev => prev.filter(user => user.id !== userId));
  };

  if (!user || isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:p-8 ${className}`}>
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                </div>
                <div className="w-16 h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (suggestedUsers.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">Suggested for You</h3>
        </div>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Discover interesting people to follow
        </p>
      </div>

      {/* Suggested Users List */}
      <div className="divide-y divide-gray-100">
        {suggestedUsers.map((suggestedUser) => {
          const verificationStatus = verificationService.getVerificationStatus(suggestedUser.id);
          
          return (
            <div key={suggestedUser.id} className="p-4 sm:p-6 lg:p-8 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3 sm:space-x-4">
                {/* User Avatar */}
                <Link to={`/profile/${suggestedUser.id}`} className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                    {suggestedUser.name.charAt(0)}
                  </div>
                </Link>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Link 
                      to={`/profile/${suggestedUser.id}`}
                      className="font-medium text-gray-800 hover:text-indigo-600 transition-colors text-sm sm:text-base truncate"
                    >
                      {suggestedUser.name}
                    </Link>
                    {verificationStatus.isVerified && verificationStatus.badge && (
                      <div className="flex-shrink-0">
                        <VerificationBadge badge={verificationStatus.badge} size="sm" />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2 break-words">
                    {suggestedUser.bio || 'No bio available'}
                  </p>
                  
                  <div className="flex items-center space-x-3 sm:space-x-4 text-xs text-gray-500">
                    <span className="truncate">{suggestedUser.followers.toLocaleString()} followers</span>
                    {suggestedUser.company && (
                      <span className="truncate">• {suggestedUser.company}</span>
                    )}
                    {suggestedUser.interests && suggestedUser.interests.length > 0 && (
                      <span className="truncate">• {suggestedUser.interests.slice(0, 2).join(', ')}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <FollowButton
                    userId={suggestedUser.id}
                    initialFollowing={socialService.isFollowing(user.id, suggestedUser.id)}
                    initialFollowerCount={suggestedUser.followers}
                    size="sm"
                    variant="outline"
                  />
                  
                  <button
                    onClick={() => dismissUser(suggestedUser.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    title="Dismiss suggestion"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 border-t border-gray-200 bg-gray-50">
        <button
          onClick={loadSuggestedUsers}
          className="text-sm sm:text-base text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Refresh suggestions
        </button>
      </div>
    </div>
  );
};

export default SuggestedUsers;