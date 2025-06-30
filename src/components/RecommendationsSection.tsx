import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Heart, Clock, ChevronRight } from 'lucide-react';
import { Idea } from '../types';
import IdeaCard from './IdeaCard';
import { recommendationService, PersonalizedRecommendations } from '../services/recommendations';
import { useAuth } from '../contexts/AuthContext';
import { useIdeas } from '../contexts/IdeaContext';
import LoadingSpinner from './LoadingSpinner';

const RecommendationsSection: React.FC = () => {
  const { user } = useAuth();
  const { ideas, getUserVote } = useIdeas();
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'forYou' | 'trending' | 'similar' | 'newInCategories'>('forYou');

  useEffect(() => {
    if (user) {
      generateRecommendations();
    }
  }, [user, ideas]);

  const generateRecommendations = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get user's voting history
      const userVotes: Record<string, 'up' | 'down'> = {};
      ideas.forEach(idea => {
        const vote = getUserVote(idea.id, user.id);
        if (vote) {
          userVotes[idea.id] = vote;
        }
      });

      // Mock view history (in real app, this would be tracked)
      const viewHistory = ideas
        .filter(() => Math.random() > 0.7) // Simulate 30% of ideas viewed
        .map(idea => idea.id)
        .slice(0, 15);

      const recs = await recommendationService.generateRecommendations(
        user.id,
        ideas,
        userVotes,
        viewHistory
      );

      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 text-center">
        <Sparkles className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Discover Personalized Ideas</h3>
        <p className="text-gray-600 mb-4">
          Sign in to get AI-powered recommendations based on your interests and activity
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <LoadingSpinner size="lg" text="Generating personalized recommendations..." />
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-500">Unable to generate recommendations at this time.</p>
      </div>
    );
  }

  const tabs = [
    { key: 'forYou', label: 'For You', icon: Heart, ideas: recommendations.forYou },
    /*{ key: 'trending', label: 'Trending', icon: TrendingUp, ideas: recommendations.trending },*/
    { key: 'similar', label: 'Similar', icon: Sparkles, ideas: recommendations.similar },
    { key: 'newInCategories', label: 'New', icon: Clock, ideas: recommendations.newInCategories }
  ] as const;

  const activeTabData = tabs.find(tab => tab.key === activeTab);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-white" />
            <h2 className="text-xl font-semibold text-white">Recommended for You</h2>
          </div>
          <button
            onClick={generateRecommendations}
            className="text-white opacity-80 hover:opacity-100 transition-opacity text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'text-indigo-600 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700 border-transparent'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {tab.ideas.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTabData && activeTabData.ideas.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeTabData.ideas.map((idea) => (
                <div key={idea.id} className="relative">
                  <IdeaCard idea={idea} />
                  {activeTab === 'forYou' && (
                    <div className="absolute top-2 left-2 bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                      <Sparkles className="h-3 w-3 inline mr-1" />
                      Recommended
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {activeTabData.ideas.length >= 4 && (
              <div className="mt-6 text-center">
                <button className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 font-medium">
                  <span>View More {activeTabData.label}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">No {activeTabData?.label.toLowerCase()} recommendations available</div>
            <p className="text-sm text-gray-400">
              {activeTab === 'forYou' && 'Interact with more ideas to get better recommendations'}
              {activeTab === 'trending' && 'Check back later for trending ideas'}
              {activeTab === 'similar' && 'Vote on ideas to find similar ones'}
              {activeTab === 'newInCategories' && 'No new ideas in your favorite categories'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsSection;