import React, { useState } from 'react';
import { UserPlus, UserMinus, Loader } from 'lucide-react';
import { socialService } from '../services/social';
import { useAuth } from '../contexts/AuthContext';

interface FollowButtonProps {
  userId: string;
  initialFollowing?: boolean;
  initialFollowerCount?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  showCount?: boolean;
  className?: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  initialFollowing = false,
  initialFollowerCount = 0,
  size = 'md',
  variant = 'primary',
  showCount = false,
  className = ''
}) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    if (!user) {
      alert('Please log in to follow users');
      return;
    }

    if (user.id === userId) {
      return; // Can't follow yourself
    }

    setIsLoading(true);
    
    try {
      const result = await socialService.followUser(user.id, userId);
      
      if (result.success) {
        setIsFollowing(result.isFollowing);
        setFollowerCount(result.followerCount);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Follow error:', error);
      alert('Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show follow button for own profile
  if (user?.id === userId) {
    return null;
  }

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: isFollowing 
      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
      : 'bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-600',
    secondary: isFollowing
      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
      : 'bg-purple-600 text-white hover:bg-purple-700 border border-purple-600',
    outline: isFollowing
      ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
      : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-600'
  };

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className={`
        inline-flex items-center space-x-2 font-medium rounded-lg transition-all duration-200
        ${sizeClasses[size]} ${variantClasses[variant]}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <UserMinus className="h-4 w-4" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      
      <span>
        {isFollowing ? 'Following' : 'Follow'}
        {showCount && ` (${followerCount.toLocaleString()})`}
      </span>
    </button>
  );
};

export default FollowButton;