import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, User, Lightbulb, Trophy, Clock, TrendingUp } from 'lucide-react';
import { ActivityFeedItem, User as UserType } from '../types';
import { socialService, ActivityFeedOptions } from '../services/social';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import VerificationBadge from './VerificationBadge';
import { verificationService } from '../services/verification';

interface ActivityFeedProps {
  userId?: string;
  showFollowingOnly?: boolean;
  limit?: number;
  className?: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  userId, 
  showFollowingOnly = false, 
  limit = 10,
  className = ''
}) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ideas' | 'social' | 'achievements'>('all');

  useEffect(() => {
    loadActivityFeed();
  }, [userId, showFollowingOnly, filter]);

  const loadActivityFeed = () => {
    setIsLoading(true);
    
    const options: ActivityFeedOptions = {
      userId: showFollowingOnly ? user?.id : userId,
      following: showFollowingOnly,
      limit,
    };

    // Apply filter
    if (filter !== 'all') {
      const typeMap = {
        ideas: ['idea_posted', 'idea_upvoted', 'idea_bookmarked'],
        social: ['user_followed', 'comment_posted'],
        achievements: ['achievement_earned']
      };
      options.types = typeMap[filter] as ActivityFeedItem['type'][];
    }

    const feedItems = socialService.getActivityFeed(options);
    setActivities(feedItems);
    setIsLoading(false);
  };

  const getActivityIcon = (type: ActivityFeedItem['type']) => {
    switch (type) {
      case 'idea_posted':
        return <Lightbulb className="h-6 w-6 text-yellow-500" />;
      case 'idea_upvoted':
        return <TrendingUp className="h-6 w-6 text-green-500" />;
      case 'comment_posted':
        return <MessageCircle className="h-6 w-6 text-blue-500" />;
      case 'user_followed':
        return <User className="h-6 w-6 text-purple-500" />;
      case 'idea_bookmarked':
        return <Heart className="h-6 w-6 text-red-500" />;
      case 'achievement_earned':
        return <Trophy className="h-6 w-6 text-orange-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getActivityText = (activity: ActivityFeedItem) => {
    switch (activity.type) {
      case 'idea_posted':
        return (
          <span>
            posted a new idea: <Link to={`/idea/${activity.targetId}`} className="font-semibold text-indigo-600 hover:text-indigo-800">
              {activity.targetData?.title}
            </Link>
          </span>
        );
      case 'idea_upvoted':
        return (
          <span>
            upvoted <Link to={`/idea/${activity.targetId}`} className="font-semibold text-indigo-600 hover:text-indigo-800">
              {activity.targetData?.title}
            </Link>
          </span>
        );
      case 'comment_posted':
        return (
          <span>
            commented on <Link to={`/idea/${activity.targetId}`} className="font-semibold text-indigo-600 hover:text-indigo-800">
              {activity.targetData?.title}
            </Link>
          </span>
        );
      case 'user_followed':
        return (
          <span>
            started following <Link to={`/profile/${activity.targetId}`} className="font-semibold text-indigo-600 hover:text-indigo-800">
              {activity.targetData?.name}
            </Link>
          </span>
        );
      case 'idea_bookmarked':
        return (
          <span>
            bookmarked <Link to={`/idea/${activity.targetId}`} className="font-semibold text-indigo-600 hover:text-indigo-800">
              {activity.targetData?.title}
            </Link>
          </span>
        );
      case 'achievement_earned':
        return (
          <span>
            earned the <span className="font-semibold text-orange-600">
              {activity.targetData?.achievement}
            </span> achievement
          </span>
        );
      default:
        return 'had some activity';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleEngagement = (activityId: string, type: 'like' | 'comment' | 'share') => {
    // Handle engagement actions
    console.log(`${type} on activity ${activityId}`);
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-2xl shadow-sm p-10 ${className}`}>
        <div className="animate-pulse space-y-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex space-x-5">
              <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-4">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-10 py-8 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-800">
            {showFollowingOnly ? 'Following Activity' : 'Recent Activity'}
          </h3>
          
          {/* Filter Tabs */}
          <div className="flex space-x-2 bg-gray-100 rounded-xl p-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'ideas', label: 'Ideas' },
              { key: 'social', label: 'Social' },
              { key: 'achievements', label: 'Achievements' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  filter === tab.key
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="divide-y divide-gray-100">
        {activities.length > 0 ? (
          activities.map((activity) => {
            const verificationStatus = verificationService.getVerificationStatus(activity.userId);
            
            return (
              <div key={activity.id} className="p-10 hover:bg-gray-50 transition-colors">
                <div className="flex space-x-5">
                  {/* User Avatar */}
                  <Link to={`/profile/${activity.userId}`} className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {activity.user.name?.charAt(0) || 'U'}
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    {/* Activity Header */}
                    <div className="flex items-center space-x-4 mb-3">
                      {getActivityIcon(activity.type)}
                      <Link 
                        to={`/profile/${activity.userId}`}
                        className="font-bold text-gray-800 hover:text-indigo-600 text-lg"
                      >
                        {activity.user.name || 'Unknown User'}
                      </Link>
                      {verificationStatus.isVerified && verificationStatus.badge && (
                        <VerificationBadge badge={verificationStatus.badge} size="sm" />
                      )}
                      <span className="text-gray-600 text-lg">
                        {getActivityText(activity)}
                      </span>
                    </div>

                    {/* Activity Content */}
                    {activity.content && (
                      <div className="mt-4 text-gray-700 bg-gray-50 rounded-xl p-5 text-base">
                        "{activity.content}"
                      </div>
                    )}

                    {/* Achievement Details */}
                    {activity.type === 'achievement_earned' && activity.targetData && (
                      <div className="mt-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-5">
                        <div className="flex items-center space-x-4">
                          <Trophy className="h-7 w-7 text-orange-500" />
                          <div>
                            <div className="font-bold text-orange-800 text-lg">
                              {activity.targetData.achievement}
                            </div>
                            <div className="text-base text-orange-600">
                              {activity.targetData.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Activity Footer */}
                    <div className="flex items-center justify-between mt-5">
                      <div className="flex items-center space-x-8 text-base text-gray-500">
                        <span>{formatTimeAgo(activity.createdAt)}</span>
                        
                        {/* Engagement Actions */}
                        <div className="flex items-center space-x-6">
                          <button
                            onClick={() => handleEngagement(activity.id, 'like')}
                            className="flex items-center space-x-2 hover:text-red-500 transition-colors"
                          >
                            <Heart className="h-5 w-5" />
                            <span>{activity.engagement?.likes || 0}</span>
                          </button>
                          
                          <button
                            onClick={() => handleEngagement(activity.id, 'comment')}
                            className="flex items-center space-x-2 hover:text-blue-500 transition-colors"
                          >
                            <MessageCircle className="h-5 w-5" />
                            <span>{activity.engagement?.comments || 0}</span>
                          </button>
                          
                          <button
                            onClick={() => handleEngagement(activity.id, 'share')}
                            className="flex items-center space-x-2 hover:text-green-500 transition-colors"
                          >
                            <Share2 className="h-5 w-5" />
                            <span>{activity.engagement?.shares || 0}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-16 text-center text-gray-500">
            <Clock className="h-20 w-20 mx-auto mb-8 text-gray-300" />
            <h4 className="font-bold text-gray-800 mb-4 text-xl">No activity yet</h4>
            <p className="text-lg">
              {showFollowingOnly 
                ? "Follow some users to see their activity here"
                : "Activity will appear here as users interact with ideas"
              }
            </p>
          </div>
        )}
      </div>

      {/* Load More */}
      {activities.length >= limit && (
        <div className="px-10 py-8 border-t border-gray-200">
          <button
            onClick={loadActivityFeed}
            className="w-full text-center text-indigo-600 hover:text-indigo-800 font-semibold text-lg"
          >
            Load More Activity
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;