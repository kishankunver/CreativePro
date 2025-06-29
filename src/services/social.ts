import { User, Follow, ActivityFeedItem, Notification, UserStats, SocialInteraction } from '../types';

export interface FollowResult {
  success: boolean;
  isFollowing: boolean;
  followerCount: number;
  message: string;
}

export interface ActivityFeedOptions {
  userId?: string;
  following?: boolean;
  limit?: number;
  offset?: number;
  types?: ActivityFeedItem['type'][];
}

class SocialService {
  private follows: Map<string, Follow[]> = new Map(); // userId -> follows
  private followers: Map<string, Follow[]> = new Map(); // userId -> followers
  private activityFeed: ActivityFeedItem[] = [];
  private notifications: Map<string, Notification[]> = new Map();
  private userStats: Map<string, UserStats> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock some follow relationships
    const mockFollows: Follow[] = [
      {
        id: 'follow_1',
        followerId: '1',
        followingId: '2',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        notificationsEnabled: true
      },
      {
        id: 'follow_2',
        followerId: '1',
        followingId: '3',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        notificationsEnabled: true
      },
      {
        id: 'follow_3',
        followerId: '2',
        followingId: '1',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        notificationsEnabled: false
      },
      {
        id: 'follow_4',
        followerId: '3',
        followingId: '1',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        notificationsEnabled: true
      }
    ];

    // Organize follows by follower and following
    mockFollows.forEach(follow => {
      // Add to follower's following list
      if (!this.follows.has(follow.followerId)) {
        this.follows.set(follow.followerId, []);
      }
      this.follows.get(follow.followerId)!.push(follow);

      // Add to following's followers list
      if (!this.followers.has(follow.followingId)) {
        this.followers.set(follow.followingId, []);
      }
      this.followers.get(follow.followingId)!.push(follow);
    });

    // Mock activity feed
    this.activityFeed = [
      {
        id: 'activity_1',
        type: 'idea_posted',
        userId: '2',
        user: { id: '2', name: 'Sarah Johnson' } as User,
        targetId: '2',
        targetType: 'idea',
        targetData: { title: 'AI-Powered Personal Finance Assistant' },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isPublic: true,
        engagement: { likes: 12, comments: 3, shares: 2 }
      },
      {
        id: 'activity_2',
        type: 'user_followed',
        userId: '3',
        user: { id: '3', name: 'Dr. Michael Park' } as User,
        targetId: '1',
        targetType: 'user',
        targetData: { name: 'Alex Chen' },
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isPublic: true,
        engagement: { likes: 5, comments: 0, shares: 0 }
      },
      {
        id: 'activity_3',
        type: 'idea_upvoted',
        userId: '1',
        user: { id: '1', name: 'Alex Chen' } as User,
        targetId: '3',
        targetType: 'idea',
        targetData: { title: 'Remote Healthcare Monitoring System' },
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        isPublic: true,
        engagement: { likes: 8, comments: 1, shares: 1 }
      },
      {
        id: 'activity_4',
        type: 'comment_posted',
        userId: '2',
        user: { id: '2', name: 'Sarah Johnson' } as User,
        targetId: '1',
        targetType: 'idea',
        targetData: { title: 'Interactive Digital Garden for Urban Spaces' },
        content: 'This is such an innovative approach to urban design! Have you considered integrating with existing smart city infrastructure?',
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        isPublic: true,
        engagement: { likes: 15, comments: 2, shares: 0 }
      },
      {
        id: 'activity_5',
        type: 'achievement_earned',
        userId: '1',
        user: { id: '1', name: 'Alex Chen' } as User,
        targetData: { achievement: 'First Verified Idea', description: 'Posted your first verified idea!' },
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        isPublic: true,
        engagement: { likes: 20, comments: 5, shares: 3 }
      }
    ];
  }

  // Follow/Unfollow user
  async followUser(followerId: string, followingId: string): Promise<FollowResult> {
    if (followerId === followingId) {
      return {
        success: false,
        isFollowing: false,
        followerCount: this.getFollowerCount(followingId),
        message: "You can't follow yourself"
      };
    }

    const existingFollow = this.isFollowing(followerId, followingId);
    
    if (existingFollow) {
      // Unfollow
      this.removeFollow(followerId, followingId);
      
      // Remove from activity feed
      this.removeActivityFeedItem('user_followed', followerId, followingId);
      
      return {
        success: true,
        isFollowing: false,
        followerCount: this.getFollowerCount(followingId),
        message: 'Unfollowed successfully'
      };
    } else {
      // Follow
      const follow: Follow = {
        id: `follow_${Date.now()}_${followerId}_${followingId}`,
        followerId,
        followingId,
        createdAt: new Date(),
        notificationsEnabled: true
      };

      this.addFollow(follow);
      
      // Add to activity feed
      this.addActivityFeedItem({
        id: `activity_${Date.now()}`,
        type: 'user_followed',
        userId: followerId,
        user: { id: followerId } as User, // Will be populated with full user data
        targetId: followingId,
        targetType: 'user',
        createdAt: new Date(),
        isPublic: true,
        engagement: { likes: 0, comments: 0, shares: 0 }
      });

      // Create notification for the followed user
      this.createNotification(followingId, {
        type: 'follow',
        title: 'New Follower',
        message: 'started following you',
        fromUserId: followerId
      });

      return {
        success: true,
        isFollowing: true,
        followerCount: this.getFollowerCount(followingId),
        message: 'Following successfully'
      };
    }
  }

  // Check if user is following another user
  isFollowing(followerId: string, followingId: string): boolean {
    const userFollows = this.follows.get(followerId) || [];
    return userFollows.some(follow => follow.followingId === followingId);
  }

  // Get followers of a user
  getFollowers(userId: string): Follow[] {
    return this.followers.get(userId) || [];
  }

  // Get users that a user is following
  getFollowing(userId: string): Follow[] {
    return this.follows.get(userId) || [];
  }

  // Get follower count
  getFollowerCount(userId: string): number {
    return this.getFollowers(userId).length;
  }

  // Get following count
  getFollowingCount(userId: string): number {
    return this.getFollowing(userId).length;
  }

  // Get activity feed
  getActivityFeed(options: ActivityFeedOptions = {}): ActivityFeedItem[] {
    let feed = [...this.activityFeed];

    // Filter by user if specified
    if (options.userId) {
      feed = feed.filter(item => item.userId === options.userId);
    }

    // Filter by following if specified
    if (options.following && options.userId) {
      const following = this.getFollowing(options.userId).map(f => f.followingId);
      feed = feed.filter(item => following.includes(item.userId) || item.userId === options.userId);
    }

    // Filter by types if specified
    if (options.types && options.types.length > 0) {
      feed = feed.filter(item => options.types!.includes(item.type));
    }

    // Sort by creation date (newest first)
    feed.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 20;
    
    return feed.slice(offset, offset + limit);
  }

  // Add activity feed item
  addActivityFeedItem(item: ActivityFeedItem): void {
    this.activityFeed.unshift(item);
    
    // Keep only last 1000 items to prevent memory issues
    if (this.activityFeed.length > 1000) {
      this.activityFeed = this.activityFeed.slice(0, 1000);
    }
  }

  // Remove activity feed item
  removeActivityFeedItem(type: ActivityFeedItem['type'], userId: string, targetId: string): void {
    this.activityFeed = this.activityFeed.filter(item => 
      !(item.type === type && item.userId === userId && item.targetId === targetId)
    );
  }

  // Get notifications for user
  getNotifications(userId: string, unreadOnly: boolean = false): Notification[] {
    const userNotifications = this.notifications.get(userId) || [];
    
    if (unreadOnly) {
      return userNotifications.filter(n => !n.isRead);
    }
    
    return userNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Mark notification as read
  markNotificationAsRead(userId: string, notificationId: string): boolean {
    const userNotifications = this.notifications.get(userId) || [];
    const notification = userNotifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.isRead = true;
      return true;
    }
    
    return false;
  }

  // Mark all notifications as read
  markAllNotificationsAsRead(userId: string): void {
    const userNotifications = this.notifications.get(userId) || [];
    userNotifications.forEach(notification => {
      notification.isRead = true;
    });
  }

  // Get unread notification count
  getUnreadNotificationCount(userId: string): number {
    return this.getNotifications(userId, true).length;
  }

  // Create notification
  createNotification(userId: string, notification: Partial<Notification>): void {
    const fullNotification: Notification = {
      id: `notification_${Date.now()}_${Math.random()}`,
      userId,
      type: notification.type!,
      title: notification.title!,
      message: notification.message!,
      actionUrl: notification.actionUrl,
      isRead: false,
      createdAt: new Date(),
      fromUserId: notification.fromUserId,
      fromUser: notification.fromUser,
      metadata: notification.metadata
    };

    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }

    this.notifications.get(userId)!.unshift(fullNotification);
    
    // Keep only last 100 notifications per user
    const userNotifications = this.notifications.get(userId)!;
    if (userNotifications.length > 100) {
      this.notifications.set(userId, userNotifications.slice(0, 100));
    }
  }

  // Get user statistics
  getUserStats(userId: string): UserStats {
    // Return cached stats if available
    if (this.userStats.has(userId)) {
      return this.userStats.get(userId)!;
    }

    // Calculate stats (in real app, this would be from database)
    const stats: UserStats = {
      totalIdeas: 3,
      totalUpvotes: 684,
      totalComments: 45,
      totalFollowers: this.getFollowerCount(userId),
      totalFollowing: this.getFollowingCount(userId),
      averageIdeaScore: 228,
      topCategories: [
        { category: 'Tech', count: 2 },
        { category: 'Sustainability', count: 1 }
      ],
      joinedDaysAgo: 365,
      activityStreak: 7
    };

    this.userStats.set(userId, stats);
    return stats;
  }

  // Get suggested users to follow
  getSuggestedUsers(userId: string, limit: number = 5): User[] {
    // Mock suggested users based on interests, mutual follows, etc.
    const mockSuggestions: User[] = [
      {
        id: '4',
        name: 'Emma Green',
        email: 'emma@ecotech.com',
        bio: 'Sustainability advocate and green tech entrepreneur',
        karma: 1800,
        ideas: [],
        followers: 420,
        following: 180,
        joinedAt: new Date('2023-03-10'),
        verificationStatus: 'verified',
        company: 'EcoTech Innovations',
        interests: ['Sustainability', 'CleanTech', 'Environment']
      } as User,
      {
        id: '5',
        name: 'Prof. David Kim',
        email: 'dkim@mit.edu',
        bio: 'AI researcher and professor at MIT',
        karma: 3200,
        ideas: [],
        followers: 890,
        following: 120,
        joinedAt: new Date('2022-09-15'),
        verificationStatus: 'verified',
        company: 'MIT',
        interests: ['AI', 'Machine Learning', 'Research']
      } as User
    ];

    // Filter out users already being followed
    const following = this.getFollowing(userId).map(f => f.followingId);
    return mockSuggestions
      .filter(user => user.id !== userId && !following.includes(user.id))
      .slice(0, limit);
  }

  // Get mutual followers
  getMutualFollowers(userId: string, otherUserId: string): User[] {
    const userFollowers = this.getFollowers(userId).map(f => f.followerId);
    const otherUserFollowers = this.getFollowers(otherUserId).map(f => f.followerId);
    
    const mutualFollowerIds = userFollowers.filter(id => otherUserFollowers.includes(id));
    
    // Return mock user data for mutual followers
    return mutualFollowerIds.map(id => ({ id, name: `User ${id}` } as User));
  }

  // Private helper methods
  private addFollow(follow: Follow): void {
    // Add to follower's following list
    if (!this.follows.has(follow.followerId)) {
      this.follows.set(follow.followerId, []);
    }
    this.follows.get(follow.followerId)!.push(follow);

    // Add to following's followers list
    if (!this.followers.has(follow.followingId)) {
      this.followers.set(follow.followingId, []);
    }
    this.followers.get(follow.followingId)!.push(follow);
  }

  private removeFollow(followerId: string, followingId: string): void {
    // Remove from follower's following list
    const userFollows = this.follows.get(followerId) || [];
    this.follows.set(followerId, userFollows.filter(f => f.followingId !== followingId));

    // Remove from following's followers list
    const userFollowers = this.followers.get(followingId) || [];
    this.followers.set(followingId, userFollowers.filter(f => f.followerId !== followerId));
  }
}

export const socialService = new SocialService();