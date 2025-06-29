import React, { useState } from 'react';
import Header from '../components/Header';
import IdeaCard from '../components/IdeaCard';
import PinnedIdeas from '../components/PinnedIdeas';
import DateRangeFilter from '../components/DateRangeFilter';
import LoadingSpinner from '../components/LoadingSpinner';
import RecommendationsSection from '../components/RecommendationsSection';
import ActivityFeed from '../components/ActivityFeed';
import SuggestedUsers from '../components/SuggestedUsers';
import { useIdeas } from '../contexts/IdeaContext';
import { useAuth } from '../contexts/AuthContext';
import { Category, SortOption } from '../types';

const HomePage: React.FC = () => {
  const {
    filteredIdeas,
    ideas,
    sortBy,
    setSortBy,
    categoryFilter,
    setCategoryFilter,
    setDateRange
  } = useIdeas();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const categories: (Category | 'all')[] = ['all', 'Tech', 'Health', 'Finance', 'Education', 'Sustainability', 'Other'];

  const handleDateRangeChange = (range: { start: Date | null; end: Date | null }) => {
    setDateRange(range);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Pinned Ideas */}
            <PinnedIdeas ideas={ideas} />

            {/* AI Recommendations Section - Only show for logged in users */}
            {user && <RecommendationsSection />}

            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {user ? 'All Ideas' : 'Discover Ideas'}
              </h2>
              {!user && (
                <p className="text-gray-600 text-sm">
                  Sign in to get personalized recommendations
                </p>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 space-y-4 lg:space-y-0">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSortBy('top')}
                    className={`px-4 py-2 rounded-md font-medium transition ${
                      sortBy === 'top'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Top
                  </button>
                  <button
                    onClick={() => setSortBy('latest')}
                    className={`px-4 py-2 rounded-md font-medium transition ${
                      sortBy === 'latest'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Latest
                  </button>
                  <button
                    onClick={() => setSortBy('trending')}
                    className={`px-4 py-2 rounded-md font-medium transition ${
                      sortBy === 'trending'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Trending
                  </button>
                </div>

                <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
              </div>

              <div className="flex items-center space-x-2">
                <label htmlFor="category-filter" className="text-gray-700 font-medium">
                  Filter by:
                </label>
                <select
                  id="category-filter"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as Category | 'all')}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" text="Loading ideas..." />
              </div>
            )}

            {/* Ideas Grid */}
            {!isLoading && (
              <>
                {filteredIdeas.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredIdeas.map((idea) => (
                      <IdeaCard key={idea.id} idea={idea} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-500 text-lg mb-4">No ideas found</div>
                    <p className="text-gray-400">Try adjusting your filters or search terms</p>
                  </div>
                )}

                {/* Load More Button */}
                {filteredIdeas.length > 0 && (
                  <div className="flex justify-center mt-12">
                    <button
                      onClick={() => {
                        setIsLoading(true);
                        // Simulate loading more ideas
                        setTimeout(() => setIsLoading(false), 1000);
                      }}
                      className="bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 hover:bg-gray-50 transition font-medium"
                    >
                      Load More Ideas
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Suggested Users */}
            {user && <SuggestedUsers limit={4} />}

            {/* Activity Feed */}
            <ActivityFeed 
              showFollowingOnly={!!user}
              limit={8}
              className="sticky top-24"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;