import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Edit, X, ThumbsUp, MessageCircle, Bookmark, Users, Activity, Handshake } from 'lucide-react';
import Header from '../components/Header';
import IdeaCard from '../components/IdeaCard';
import FollowButton from '../components/FollowButton';
import ActivityFeed from '../components/ActivityFeed';
import CollaborationRequestsInbox from '../components/CollaborationRequestsInbox';
import { useAuth } from '../contexts/AuthContext';
import { useIdeas } from '../contexts/IdeaContext';
import { socialService } from '../services/social';
import { collaborationService } from '../services/collaboration';

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { ideas, getUserById } = useIdeas();
  const [activeTab, setActiveTab] = useState<'ideas' | 'activity' | 'followers' | 'following' | 'collaboration'>('ideas');

  // Get the profile user by userId from URL params
  const profileUser = userId ? getUserById(userId) : null;
  const userIdeas = ideas.filter(idea => idea.authorId === userId);
  const isOwnProfile = user?.id === userId;

  // Get social stats
  const followerCount = socialService.getFollowerCount(userId || '');
  const followingCount = socialService.getFollowingCount(userId || '');
  const isFollowing = user ? socialService.isFollowing(user.id, userId || '') : false;

  // Get collaboration stats
  const collaborationStats = userId ? collaborationService.getCollaborationStats(userId) : null;

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 pt-24">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">User not found</h1>
            <p className="text-gray-600">The user profile you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 604800)}w ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Profile Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {profileUser.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-800">{profileUser.name}</h1>
                      <p className="text-gray-500">
                        @{profileUser.name.toLowerCase().replace(' ', '')} • Member since {profileUser.joinedAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full flex items-center">
                        <ThumbsUp className="h-5 w-5 mr-1" />
                        <span className="font-medium">{profileUser.karma.toLocaleString()} Karma</span>
                      </div>
                      {!isOwnProfile && (
                        <FollowButton
                          userId={userId!}
                          initialFollowing={isFollowing}
                          initialFollowerCount={followerCount}
                          size="md"
                          variant="primary"
                        />
                      )}
                      {isOwnProfile && (
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full transition-colors flex items-center space-x-2">
                          <Edit className="h-4 w-4" />
                          <span>Edit Profile</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-4 text-gray-700">
                    {profileUser.bio}
                  </p>
                  
                  {/* Social Stats */}
                  <div className="flex items-center space-x-6 mt-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{followerCount} followers</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{followingCount} following</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Activity className="h-4 w-4" />
                      <span>{userIdeas.length} ideas</span>
                    </div>
                    {collaborationStats && (
                      <div className="flex items-center space-x-1">
                        <Handshake className="h-4 w-4" />
                        <span>{collaborationStats.ideasReleased + collaborationStats.ideasReceived} collaborations</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('ideas')}
                    className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'ideas'
                        ? 'text-indigo-600 border-indigo-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-transparent'
                    }`}
                  >
                    Ideas ({userIdeas.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'activity'
                        ? 'text-indigo-600 border-indigo-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-transparent'
                    }`}
                  >
                    Activity
                  </button>
                  {isOwnProfile && (
                    <button
                      onClick={() => setActiveTab('collaboration')}
                      className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'collaboration'
                          ? 'text-indigo-600 border-indigo-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-transparent'
                      }`}
                    >
                      Collaboration ({collaborationStats ? collaborationService.getCollaborationRequestsForUser(userId!).filter(r => r.status === 'pending').length : 0})
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab('followers')}
                    className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'followers'
                        ? 'text-indigo-600 border-indigo-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-transparent'
                    }`}
                  >
                    Followers ({followerCount})
                  </button>
                  <button
                    onClick={() => setActiveTab('following')}
                    className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'following'
                        ? 'text-indigo-600 border-indigo-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-transparent'
                    }`}
                  >
                    Following ({followingCount})
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Ideas Tab */}
                {activeTab === 'ideas' && (
                  <div>
                    {userIdeas.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {userIdeas.map((idea) => (
                          <IdeaCard key={idea.id} idea={idea} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-gray-500 text-lg mb-4">No ideas yet</div>
                        <p className="text-gray-400">
                          {isOwnProfile ? "You haven't posted any ideas yet." : "This user hasn't posted any ideas yet."}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                  <ActivityFeed userId={userId} limit={20} />
                )}

                {/* Collaboration Tab */}
                {activeTab === 'collaboration' && isOwnProfile && (
                  <CollaborationRequestsInbox />
                )}

                {/* Followers Tab */}
                {activeTab === 'followers' && (
                  <div className="space-y-4">
                    {socialService.getFollowers(userId || '').map((follow) => {
                      const followerUser = getUserById(follow.followerId);
                      return (
                        <div key={follow.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {followerUser ? followerUser.name.charAt(0) : 'U'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">
                                {followerUser ? followerUser.name : `User ${follow.followerId}`}
                              </div>
                              <div className="text-sm text-gray-500">Followed {formatTimeAgo(follow.createdAt)}</div>
                            </div>
                          </div>
                          {!isOwnProfile && user && (
                            <FollowButton
                              userId={follow.followerId}
                              size="sm"
                              variant="outline"
                            />
                          )}
                        </div>
                      );
                    })}
                    {socialService.getFollowers(userId || '').length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No followers yet
                      </div>
                    )}
                  </div>
                )}

                {/* Following Tab */}
                {activeTab === 'following' && (
                  <div className="space-y-4">
                    {socialService.getFollowing(userId || '').map((follow) => {
                      const followingUser = getUserById(follow.followingId);
                      return (
                        <div key={follow.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {followingUser ? followingUser.name.charAt(0) : 'U'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">
                                {followingUser ? followingUser.name : `User ${follow.followingId}`}
                              </div>
                              <div className="text-sm text-gray-500">Following since {formatTimeAgo(follow.createdAt)}</div>
                            </div>
                          </div>
                          {isOwnProfile && (
                            <FollowButton
                              userId={follow.followingId}
                              initialFollowing={true}
                              size="sm"
                              variant="outline"
                            />
                          )}
                        </div>
                      );
                    })}
                    {socialService.getFollowing(userId || '').length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        Not following anyone yet
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Profile Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Ideas</span>
                  <span className="font-medium">{userIdeas.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Upvotes</span>
                  <span className="font-medium">{userIdeas.reduce((sum, idea) => sum + idea.upvotes, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Karma</span>
                  <span className="font-medium">{profileUser.karma.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium">{profileUser.joinedAt.getFullYear()}</span>
                </div>
                {collaborationStats && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ideas Released</span>
                      <span className="font-medium">{collaborationStats.ideasReleased}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ideas Received</span>
                      <span className="font-medium">{collaborationStats.ideasReceived}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Recent Activity Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <ActivityFeed userId={userId} limit={5} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfilePage;