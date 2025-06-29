export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  karma: number;
  ideas: string[];
  followers: number;
  following: number;
  joinedAt: Date;
  isVerified?: boolean;
  company?: string;
  website?: string;
  // New verification fields
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  verificationBadge?: VerificationBadge;
  companyRole?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  // Enhanced social fields
  location?: string;
  interests?: string[];
  socialLinks?: SocialLinks;
  activityScore?: number;
  lastActive?: Date;
  isOnline?: boolean;
}

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  portfolio?: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
  notificationsEnabled: boolean;
}

export interface ActivityFeedItem {
  id: string;
  type: 'idea_posted' | 'idea_upvoted' | 'comment_posted' | 'user_followed' | 'idea_bookmarked' | 'achievement_earned';
  userId: string;
  user: User;
  targetId?: string; // ID of idea, comment, or user being acted upon
  targetType?: 'idea' | 'comment' | 'user';
  targetData?: any; // Additional data about the target
  content?: string; // For comments or custom messages
  createdAt: Date;
  isPublic: boolean;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: 'follow' | 'idea_upvote' | 'comment' | 'mention' | 'achievement' | 'idea_featured';
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: Date;
  fromUserId?: string;
  fromUser?: User;
  metadata?: any;
}

export interface UserStats {
  totalIdeas: number;
  totalUpvotes: number;
  totalComments: number;
  totalFollowers: number;
  totalFollowing: number;
  averageIdeaScore: number;
  topCategories: { category: string; count: number }[];
  joinedDaysAgo: number;
  activityStreak: number;
}

export interface SocialInteraction {
  id: string;
  type: 'like' | 'share' | 'mention' | 'collaboration_request';
  fromUserId: string;
  toUserId: string;
  targetId: string;
  targetType: 'idea' | 'comment' | 'activity';
  createdAt: Date;
  metadata?: any;
}

export interface VerificationBadge {
  type: 'company' | 'founder' | 'investor' | 'expert' | 'academic';
  companyName?: string;
  title?: string;
  verifiedAt: Date;
  verifiedBy: string; // Admin who verified
  credibilityScore: number; // 1-100
}

export interface VerificationRequest {
  id: string;
  userId: string;
  user: User;
  requestType: 'company' | 'founder' | 'investor' | 'expert' | 'academic';
  companyName?: string;
  companyWebsite?: string;
  jobTitle?: string;
  workEmail?: string;
  linkedinProfile?: string;
  githubProfile?: string;
  portfolioUrl?: string;
  additionalInfo?: string;
  documents: VerificationDocument[];
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
  credibilityScore?: number;
}

export interface VerificationDocument {
  id: string;
  type: 'company_email' | 'linkedin' | 'business_card' | 'company_page' | 'portfolio' | 'other';
  url?: string;
  description: string;
  verified: boolean;
}

// Proof of Originality System Types
export interface OriginalityProof {
  id: string;
  ideaId: string;
  contentHash: string; // SHA-256 hash of idea content
  submissionTimestamp: Date;
  blockchainHash?: string; // Future blockchain integration
  ipfsHash?: string; // IPFS hash for decentralized storage
  witnessSignatures: WitnessSignature[];
  proofCertificate: ProofCertificate;
  verificationStatus: 'pending' | 'verified' | 'disputed';
}

export interface WitnessSignature {
  id: string;
  witnessId: string;
  witnessName: string;
  signature: string;
  timestamp: Date;
  witnessType: 'system' | 'user' | 'external';
}

export interface ProofCertificate {
  certificateId: string;
  issuedAt: Date;
  expiresAt?: Date;
  issuer: string;
  digitalSignature: string;
  metadata: {
    algorithm: string;
    version: string;
    chainOfCustody: ChainOfCustodyEntry[];
  };
}

export interface ChainOfCustodyEntry {
  id: string;
  action: 'created' | 'modified' | 'verified' | 'disputed' | 'resolved';
  timestamp: Date;
  actor: string;
  details: string;
  previousHash?: string;
  currentHash: string;
}

export interface OriginalityDispute {
  id: string;
  originalIdeaId: string;
  disputingIdeaId: string;
  disputeType: 'prior_art' | 'plagiarism' | 'similar_concept' | 'trademark_conflict';
  submittedBy: string;
  submittedAt: Date;
  evidence: DisputeEvidence[];
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  resolution?: DisputeResolution;
}

export interface DisputeEvidence {
  id: string;
  type: 'url' | 'document' | 'patent' | 'publication' | 'other';
  description: string;
  url?: string;
  submittedAt: Date;
  verificationStatus: 'pending' | 'verified' | 'invalid';
}

export interface DisputeResolution {
  id: string;
  resolvedAt: Date;
  resolvedBy: string;
  decision: 'original_upheld' | 'dispute_upheld' | 'both_original' | 'insufficient_evidence';
  reasoning: string;
  actions: string[];
}

export interface OriginalitySearchResult {
  ideaId: string;
  title: string;
  similarity: number; // 0-100%
  submissionDate: Date;
  author: string;
  matchingElements: string[];
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  authorId: string;
  author: User;
  upvotes: number;
  downvotes: number;
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  isPinned?: boolean;
  noveltyScore?: number;
  swotAnalysis?: SwotAnalysis;
  flags?: Flag[];
  viewCount?: number;
  // Enhanced credibility features
  credibilityBoost?: number; // Boost from verified author
  verifiedAuthor?: boolean; // Quick check for verified status
  // Enhanced social features
  bookmarks?: number;
  shares?: number;
  collaborators?: string[]; // User IDs of collaborators
  isLookingForCollaborators?: boolean;
  collaborationDetails?: string;
  // Proof of Originality
  originalityProof?: OriginalityProof;
  priorArtReferences?: PriorArtReference[];
  similarIdeas?: string[]; // IDs of similar ideas found during submission
}

export interface PriorArtReference {
  id: string;
  type: 'patent' | 'publication' | 'website' | 'existing_idea' | 'other';
  title: string;
  url?: string;
  description: string;
  relevanceScore: number; // 0-100%
  foundAt: Date;
  source: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: User;
  ideaId: string;
  parentId?: string;
  replies?: Comment[];
  upvotes: number;
  createdAt: Date;
  // Enhanced social features
  mentions?: string[]; // User IDs mentioned in comment
  isEdited?: boolean;
  editedAt?: Date;
}

export interface Flag {
  id: string;
  reason: string;
  details?: string;
  reporterId: string;
  createdAt: Date;
  status: 'pending' | 'reviewed' | 'resolved';
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  subject: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
  ideaId?: string;
  // Enhanced messaging
  threadId?: string;
  messageType?: 'direct' | 'collaboration' | 'system';
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  type: 'link' | 'image' | 'document';
  url: string;
  name: string;
  size?: number;
}

export interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  suggestions: string[];
}

export interface AIValidation {
  noveltyScore: number;
  swotAnalysis: SwotAnalysis;
  marketPotential: number;
  feasibilityScore: number;
}

export type Category = 'Tech' | 'Health' | 'Finance' | 'Education' | 'Sustainability' | 'Other';

export type SortOption = 'top' | 'latest' | 'trending';