import { Idea, User } from '../types';
import { aiService } from './ai';

export interface UserInterests {
  categories: { [category: string]: number };
  tags: { [tag: string]: number };
  votingPattern: 'conservative' | 'liberal' | 'balanced';
  engagementLevel: 'low' | 'medium' | 'high';
}

export interface RecommendationScore {
  ideaId: string;
  score: number;
  reasons: string[];
}

export interface PersonalizedRecommendations {
  forYou: Idea[];
  trending: Idea[];
  similar: Idea[];
  newInCategories: Idea[];
}

class RecommendationService {
  private userInterests: Map<string, UserInterests> = new Map();

  // Analyze user behavior to build interest profile
  analyzeUserInterests(userId: string, ideas: Idea[], userVotes: Record<string, 'up' | 'down'>, viewHistory: string[]): UserInterests {
    const categories: { [category: string]: number } = {};
    const tags: { [tag: string]: number } = {};
    let totalVotes = 0;
    let upvotes = 0;

    // Analyze voting patterns
    Object.entries(userVotes).forEach(([ideaId, vote]) => {
      const idea = ideas.find(i => i.id === ideaId);
      if (idea) {
        totalVotes++;
        if (vote === 'up') upvotes++;
        
        // Weight categories and tags based on votes
        const weight = vote === 'up' ? 2 : 0.5;
        categories[idea.category] = (categories[idea.category] || 0) + weight;
        idea.tags.forEach(tag => {
          tags[tag] = (tags[tag] || 0) + weight;
        });
      }
    });

    // Analyze view history
    viewHistory.forEach(ideaId => {
      const idea = ideas.find(i => i.id === ideaId);
      if (idea) {
        categories[idea.category] = (categories[idea.category] || 0) + 0.5;
        idea.tags.forEach(tag => {
          tags[tag] = (tags[tag] || 0) + 0.3;
        });
      }
    });

    const votingPattern = totalVotes === 0 ? 'balanced' : 
      (upvotes / totalVotes > 0.7 ? 'liberal' : 
       upvotes / totalVotes < 0.3 ? 'conservative' : 'balanced');

    const engagementLevel = totalVotes + viewHistory.length > 20 ? 'high' :
      totalVotes + viewHistory.length > 5 ? 'medium' : 'low';

    const interests: UserInterests = {
      categories,
      tags,
      votingPattern,
      engagementLevel
    };

    this.userInterests.set(userId, interests);
    return interests;
  }

  // Generate personalized recommendations
  async generateRecommendations(
    userId: string, 
    allIdeas: Idea[], 
    userVotes: Record<string, 'up' | 'down'>,
    viewHistory: string[]
  ): Promise<PersonalizedRecommendations> {
    const interests = this.analyzeUserInterests(userId, allIdeas, userVotes, viewHistory);
    
    // Filter out ideas user has already voted on or viewed recently
    const candidateIdeas = allIdeas.filter(idea => 
      !userVotes[idea.id] && 
      !viewHistory.slice(-10).includes(idea.id) && // Exclude last 10 viewed
      idea.authorId !== userId // Don't recommend user's own ideas
    );

    const scoredIdeas = await this.scoreIdeas(candidateIdeas, interests);
    
    // Sort by score and take top recommendations
    const sortedRecommendations = scoredIdeas
      .sort((a, b) => b.score - a.score)
      .map(scored => candidateIdeas.find(idea => idea.id === scored.ideaId)!)
      .filter(Boolean);

    return {
      forYou: sortedRecommendations.slice(0, 6),
      trending: this.getTrendingIdeas(allIdeas, userVotes).slice(0, 4),
      similar: await this.getSimilarIdeas(userId, allIdeas, interests),
      newInCategories: this.getNewInFavoriteCategories(allIdeas, interests).slice(0, 4)
    };
  }

  private async scoreIdeas(ideas: Idea[], interests: UserInterests): Promise<RecommendationScore[]> {
    const scores: RecommendationScore[] = [];

    for (const idea of ideas) {
      let score = 0;
      const reasons: string[] = [];

      // Category preference scoring
      const categoryScore = interests.categories[idea.category] || 0;
      score += categoryScore * 10;
      if (categoryScore > 2) {
        reasons.push(`You're interested in ${idea.category}`);
      }

      // Tag preference scoring
      let tagScore = 0;
      idea.tags.forEach(tag => {
        const tagWeight = interests.tags[tag] || 0;
        tagScore += tagWeight;
        if (tagWeight > 1.5) {
          reasons.push(`Matches your interest in #${tag}`);
        }
      });
      score += tagScore * 5;

      // Quality indicators
      const qualityScore = (idea.upvotes - idea.downvotes) / Math.max(1, idea.upvotes + idea.downvotes);
      score += qualityScore * 15;
      if (qualityScore > 0.7) {
        reasons.push('Highly rated by community');
      }

      // Novelty bonus
      if (idea.noveltyScore && idea.noveltyScore > 80) {
        score += 10;
        reasons.push('Innovative concept');
      }

      // Engagement potential
      const engagementScore = idea.comments.length * 2 + (idea.viewCount || 0) * 0.1;
      score += Math.min(engagementScore, 20);
      if (idea.comments.length > 5) {
        reasons.push('Active discussion');
      }

      // Recency bonus (newer ideas get slight boost)
      const daysSinceCreated = (Date.now() - idea.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated < 7) {
        score += (7 - daysSinceCreated) * 2;
        reasons.push('Recently posted');
      }

      // Voting pattern adjustment
      if (interests.votingPattern === 'conservative' && qualityScore < 0.5) {
        score *= 0.7; // Conservative users prefer proven ideas
      } else if (interests.votingPattern === 'liberal') {
        score += 5; // Liberal users like trying new things
      }

      scores.push({
        ideaId: idea.id,
        score: Math.max(0, score),
        reasons: reasons.slice(0, 3) // Limit to top 3 reasons
      });
    }

    return scores;
  }

  private getTrendingIdeas(allIdeas: Idea[], userVotes: Record<string, 'up' | 'down'>): Idea[] {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

    return allIdeas
      .filter(idea => !userVotes[idea.id] && idea.createdAt.getTime() > oneWeekAgo)
      .map(idea => {
        // Calculate trending score based on recent activity
        const age = now - idea.createdAt.getTime();
        const ageWeight = Math.max(0, 1 - (age / (7 * 24 * 60 * 60 * 1000))); // Decay over week
        
        const engagementScore = idea.upvotes + idea.comments.length * 2 + (idea.viewCount || 0) * 0.1;
        const trendingScore = engagementScore * ageWeight;
        
        return { ...idea, trendingScore };
      })
      .sort((a, b) => (b as any).trendingScore - (a as any).trendingScore)
      .map(({ trendingScore, ...idea }) => idea);
  }

  private async getSimilarIdeas(userId: string, allIdeas: Idea[], interests: UserInterests): Promise<Idea[]> {
    // Find ideas similar to user's top interests
    const topCategories = Object.entries(interests.categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([category]) => category);

    const topTags = Object.entries(interests.tags)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);

    return allIdeas
      .filter(idea => 
        idea.authorId !== userId &&
        (topCategories.includes(idea.category) || 
         idea.tags.some(tag => topTags.includes(tag)))
      )
      .sort((a, b) => {
        const aScore = (topCategories.includes(a.category) ? 2 : 0) + 
                      a.tags.filter(tag => topTags.includes(tag)).length;
        const bScore = (topCategories.includes(b.category) ? 2 : 0) + 
                      b.tags.filter(tag => topTags.includes(tag)).length;
        return bScore - aScore;
      })
      .slice(0, 4);
  }

  private getNewInFavoriteCategories(allIdeas: Idea[], interests: UserInterests): Idea[] {
    const topCategories = Object.entries(interests.categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);

    return allIdeas
      .filter(idea => 
        topCategories.includes(idea.category) &&
        idea.createdAt.getTime() > threeDaysAgo
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Get explanation for why an idea was recommended
  getRecommendationReason(ideaId: string, userId: string): string[] {
    // This would be called when user wants to know why something was recommended
    return ['Based on your interests', 'Similar to ideas you liked', 'Trending in your categories'];
  }

  // Update user interests based on new interaction
  updateUserInterests(userId: string, ideaId: string, action: 'view' | 'upvote' | 'downvote' | 'comment', ideas: Idea[]) {
    const interests = this.userInterests.get(userId);
    if (!interests) return;

    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;

    const weight = action === 'upvote' ? 1.5 : 
                  action === 'comment' ? 1.2 : 
                  action === 'view' ? 0.3 : -0.5;

    interests.categories[idea.category] = (interests.categories[idea.category] || 0) + weight;
    idea.tags.forEach(tag => {
      interests.tags[tag] = (interests.tags[tag] || 0) + weight * 0.7;
    });

    this.userInterests.set(userId, interests);
  }
}

export const recommendationService = new RecommendationService();