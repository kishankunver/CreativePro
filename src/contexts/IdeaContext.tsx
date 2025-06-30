import React, { createContext, useContext, useState, useEffect } from 'react';
import { Idea, User, Comment, SortOption, Category, Flag } from '../types';
import { recommendationService } from '../services/recommendations';
import { verificationService } from '../services/verification';

interface IdeaContextType {
  ideas: Idea[];
  addIdea: (idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'downvotes' | 'comments'>) => void;
  updateIdea: (id: string, updates: Partial<Idea>) => void;
  voteIdea: (id: string, vote: 'up' | 'down', userId: string) => void;
  addComment: (ideaId: string, content: string, authorId: string, parentId?: string) => void;
  getIdea: (id: string) => Idea | undefined;
  getUserById: (id: string) => User | undefined;
  filteredIdeas: Idea[];
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  categoryFilter: Category | 'all';
  setCategoryFilter: (category: Category | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dateRange: { start: Date | null; end: Date | null };
  setDateRange: (range: { start: Date | null; end: Date | null }) => void;
  flagIdea: (ideaId: string, reason: string, details: string, reporterId: string) => void;
  recordIdeaView: (userId: string, ideaId: string) => void;
  togglePin: (ideaId: string) => void;
  getUserVote: (ideaId: string, userId: string) => 'up' | 'down' | null;
}

const IdeaContext = createContext<IdeaContextType | undefined>(undefined);

export const useIdeas = () => {
  const context = useContext(IdeaContext);
  if (context === undefined) {
    throw new Error('useIdeas must be used within an IdeaProvider');
  }
  return context;
};

// Consolidated mock users data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alex Chen',
    email: 'alex@example.com',
    bio: 'Interactive Designer creating at the intersection of technology, art, and urban spaces.',
    karma: 3800,
    ideas: [],
    followers: 1200,
    following: 340,
    joinedAt: new Date('2023-01-15'),
    verificationStatus: 'verified',
    company: 'Design Studio Inc.'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    bio: 'FinTech innovator passionate about making financial services accessible to everyone.',
    karma: 2100,
    ideas: [],
    followers: 850,
    following: 220,
    joinedAt: new Date('2023-03-22'),
    verificationStatus: 'verified',
    company: 'FinTech Solutions'
  },
  {
    id: '3',
    name: 'Dr. Michael Park',
    email: 'michael@example.com',
    bio: 'Healthcare researcher focused on preventive medicine and digital health solutions.',
    karma: 4200,
    ideas: [],
    followers: 1800,
    following: 450,
    joinedAt: new Date('2022-11-08'),
    verificationStatus: 'verified',
    company: 'Stanford University'
  },
  {
    id: '4',
    name: 'Emma Green',
    email: 'emma@example.com',
    bio: 'Sustainability advocate working on eco-friendly packaging and circular economy solutions.',
    karma: 1800,
    ideas: [],
    followers: 620,
    following: 180,
    joinedAt: new Date('2023-05-14'),
    verificationStatus: 'verified',
    company: 'EcoTech Innovations'
  },
  {
    id: '5',
    name: 'Prof. David Kim',
    email: 'david@example.com',
    bio: 'Computer Science professor specializing in VR/AR technologies and educational applications.',
    karma: 3200,
    ideas: [],
    followers: 1400,
    following: 380,
    joinedAt: new Date('2022-09-30'),
    verificationStatus: 'verified',
    company: 'MIT'
  }
];

// Set up verification badges for mock users
mockUsers.forEach(user => {
  const badge = {
    type: user.company?.includes('University') || user.company?.includes('MIT') ? 'academic' as const : 'company' as const,
    companyName: user.company,
    title: user.name.includes('Dr.') || user.name.includes('Prof.') ? 'Professor' : 'Senior Engineer',
    verifiedAt: new Date(),
    verifiedBy: 'auto-verification',
    credibilityScore: 85 + Math.floor(Math.random() * 15)
  };
  
  // Mock the verification service for these users
  (verificationService as any).verifiedUsers.set(user.id, badge);
});

const mockIdeas: Idea[] = [
  {
    id: '1',
    title: 'Interactive Digital Garden for Urban Spaces',
    description: 'Interactive digital installations that respond to human presence and environmental factors in urban spaces. The idea combines LED panels, motion sensors, and real-time data visualization to create living digital gardens that bloom and evolve based on pedestrian traffic and local weather conditions.',
    category: 'Tech',
    tags: ['UrbanDesign', 'Sustainability', 'DigitalArt', 'InteractiveMedia', 'SmartCities'],
    authorId: '1',
    author: mockUsers[0],
    upvotes: 124,
    downvotes: 8,
    comments: [],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    isPublic: true,
    isPinned: true,
    noveltyScore: 85,
    viewCount: 1250,
    verifiedAuthor: true,
    credibilityBoost: 8,
    swotAnalysis: {
      strengths: ['Innovative approach to urban design', 'Environmental sustainability focus'],
      weaknesses: ['High initial investment required', 'Weather dependency'],
      opportunities: ['Growing smart city market', 'Government sustainability initiatives'],
      threats: ['Vandalism concerns', 'Maintenance complexity'],
      suggestions: ['Partner with city councils', 'Start with pilot installations']
    }
  },
  {
    id: '2',
    title: 'AI-Powered Personal Finance Assistant',
    description: 'An app that uses machine learning to analyze spending habits and provide personalized financial advice to help users save money and invest wisely.',
    category: 'Finance',
    tags: ['AI', 'FinTech', 'PersonalFinance', 'MachineLearning'],
    authorId: '2',
    author: mockUsers[1],
    upvotes: 248,
    downvotes: 12,
    comments: [],
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    isPublic: true,
    isPinned: false,
    noveltyScore: 72,
    viewCount: 890,
    verifiedAuthor: true,
    credibilityBoost: 9
  },
  {
    id: '3',
    title: 'Remote Healthcare Monitoring System',
    description: 'Wearable devices that continuously monitor vital signs and alert healthcare providers about potential issues before they become emergencies.',
    category: 'Health',
    tags: ['HealthTech', 'Wearables', 'IoT', 'PreventiveCare'],
    authorId: '3',
    author: mockUsers[2],
    upvotes: 312,
    downvotes: 15,
    comments: [],
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    isPublic: true,
    isPinned: true,
    noveltyScore: 78,
    viewCount: 1450,
    verifiedAuthor: true,
    credibilityBoost: 10
  },
  {
    id: '4',
    title: 'Sustainable Packaging Solutions for E-commerce',
    description: 'Biodegradable packaging materials made from agricultural waste that can replace traditional plastic packaging for online retailers.',
    category: 'Sustainability',
    tags: ['EcoFriendly', 'Packaging', 'Ecommerce', 'Biodegradable'],
    authorId: '4',
    author: mockUsers[3],
    upvotes: 189,
    downvotes: 7,
    comments: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    isPublic: true,
    isPinned: false,
    noveltyScore: 68,
    viewCount: 720,
    verifiedAuthor: true,
    credibilityBoost: 8
  },
  {
    id: '5',
    title: 'Virtual Reality Learning Platform for History',
    description: 'Immersive VR experiences that allow students to walk through historical events and locations, making history education more engaging and memorable.',
    category: 'Education',
    tags: ['VR', 'Education', 'History', 'Immersive', 'Learning'],
    authorId: '5',
    author: mockUsers[4],
    upvotes: 156,
    downvotes: 9,
    comments: [],
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
    isPublic: true,
    isPinned: false,
    noveltyScore: 82,
    viewCount: 650,
    verifiedAuthor: true,
    credibilityBoost: 10
  }
];

export const IdeaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ideas, setIdeas] = useState<Idea[]>(mockIdeas);
  const [sortBy, setSortBy] = useState<SortOption>('top');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  
  // Track user votes in localStorage
  const [userVotes, setUserVotes] = useState<Record<string, Record<string, 'up' | 'down'>>>(() => {
    const saved = localStorage.getItem('creativepro_votes');
    return saved ? JSON.parse(saved) : {};
  });

  // Save votes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('creativepro_votes', JSON.stringify(userVotes));
  }, [userVotes]);

  const getUserById = (id: string): User | undefined => {
    return mockUsers.find(user => user.id === id);
  };

  const addIdea = (newIdea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'downvotes' | 'comments'>) => {
    // Check if author is verified and add credibility boost
    const verificationStatus = verificationService.getVerificationStatus(newIdea.authorId);
    const credibilityBoost = verificationStatus.isVerified && verificationStatus.badge 
      ? Math.floor(verificationStatus.badge.credibilityScore / 10) 
      : 0;

    const idea: Idea = {
      ...newIdea,
      id: Date.now().toString(),
      upvotes: 0,
      downvotes: 0,
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0,
      verifiedAuthor: verificationStatus.isVerified,
      credibilityBoost
    };
    setIdeas(prev => [idea, ...prev]);
  };

  const updateIdea = (id: string, updates: Partial<Idea>) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === id ? { ...idea, ...updates, updatedAt: new Date() } : idea
    ));
  };

  const togglePin = (ideaId: string) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === ideaId ? { ...idea, isPinned: !idea.isPinned } : idea
    ));
  };

  const voteIdea = (id: string, vote: 'up' | 'down', userId: string) => {
    const currentVote = userVotes[userId]?.[id];
    
    // If user already voted the same way, remove the vote
    if (currentVote === vote) {
      setUserVotes(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          [id]: undefined as any
        }
      }));
      
      setIdeas(prev => prev.map(idea => {
        if (idea.id === id) {
          return {
            ...idea,
            upvotes: vote === 'up' ? idea.upvotes - 1 : idea.upvotes,
            downvotes: vote === 'down' ? idea.downvotes - 1 : idea.downvotes
          };
        }
        return idea;
      }));
      return;
    }

    // Update user vote tracking
    setUserVotes(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [id]: vote
      }
    }));

    // Update idea vote counts
    setIdeas(prev => prev.map(idea => {
      if (idea.id === id) {
        let newUpvotes = idea.upvotes;
        let newDownvotes = idea.downvotes;

        // If switching from opposite vote, remove the old vote first
        if (currentVote === 'up' && vote === 'down') {
          newUpvotes -= 1;
          newDownvotes += 1;
        } else if (currentVote === 'down' && vote === 'up') {
          newDownvotes -= 1;
          newUpvotes += 1;
        } else if (vote === 'up') {
          newUpvotes += 1;
        } else if (vote === 'down') {
          newDownvotes += 1;
        }

        return {
          ...idea,
          upvotes: newUpvotes,
          downvotes: newDownvotes
        };
      }
      return idea;
    }));

    // Update recommendation service with user interaction
    recommendationService.updateUserInterests(userId, id, vote === 'up' ? 'upvote' : 'downvote', ideas);
  };

  const getUserVote = (ideaId: string, userId: string): 'up' | 'down' | null => {
    return userVotes[userId]?.[ideaId] || null;
  };

  const addComment = (ideaId: string, content: string, authorId: string, parentId?: string) => {
    const commentAuthor = getUserById(authorId) || mockUsers[0]; // Fallback to first user
    
    const comment: Comment = {
      id: Date.now().toString(),
      content,
      authorId,
      author: commentAuthor,
      ideaId,
      parentId,
      upvotes: 0,
      createdAt: new Date()
    };

    setIdeas(prev => prev.map(idea => {
      if (idea.id === ideaId) {
        return {
          ...idea,
          comments: [...idea.comments, comment]
        };
      }
      return idea;
    }));

    // Update recommendation service with user interaction
    recommendationService.updateUserInterests(authorId, ideaId, 'comment', ideas);
  };

  const flagIdea = (ideaId: string, reason: string, details: string, reporterId: string) => {
    const flag: Flag = {
      id: Date.now().toString(),
      reason,
      details,
      reporterId,
      createdAt: new Date(),
      status: 'pending'
    };

    setIdeas(prev => prev.map(idea => {
      if (idea.id === ideaId) {
        return {
          ...idea,
          flags: [...(idea.flags || []), flag]
        };
      }
      return idea;
    }));
  };

  const recordIdeaView = (userId: string, ideaId: string) => {
    // Update recommendation service with user interaction
    recommendationService.updateUserInterests(userId, ideaId, 'view', ideas);
  };

  const getIdea = (id: string) => {
    return ideas.find(idea => idea.id === id);
  };

  const filteredIdeas = React.useMemo(() => {
    let filtered = ideas;

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(idea => idea.category === categoryFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(idea =>
        idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by date range
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(idea => 
        idea.createdAt >= dateRange.start! && idea.createdAt <= dateRange.end!
      );
    }

    // Sort with credibility boost consideration
    switch (sortBy) {
      case 'top':
        return filtered.sort((a, b) => {
          const aScore = (a.upvotes - a.downvotes) + (a.credibilityBoost || 0);
          const bScore = (b.upvotes - b.downvotes) + (b.credibilityBoost || 0);
          return bScore - aScore;
        });
      case 'latest':
        return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      case 'trending':
        // Enhanced trending algorithm with credibility boost
        return filtered.sort((a, b) => {
          const aScore = a.upvotes + a.comments.length + (a.viewCount || 0) * 0.1 + (a.credibilityBoost || 0) * 2;
          const bScore = b.upvotes + b.comments.length + (b.viewCount || 0) * 0.1 + (b.credibilityBoost || 0) * 2;
          return bScore - aScore;
        });
      default:
        return filtered;
    }
  }, [ideas, sortBy, categoryFilter, searchQuery, dateRange]);

  return (
    <IdeaContext.Provider value={{
      ideas,
      addIdea,
      updateIdea,
      voteIdea,
      addComment,
      getIdea,
      getUserById,
      filteredIdeas,
      sortBy,
      setSortBy,
      categoryFilter,
      setCategoryFilter,
      searchQuery,
      setSearchQuery,
      dateRange,
      setDateRange,
      flagIdea,
      recordIdeaView,
      togglePin,
      getUserVote
    }}>
      {children}
    </IdeaContext.Provider>
  );
};