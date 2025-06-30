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
      
      <main className="container mx-auto px-6 pt-28 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-10">
            {/* Pinned Ideas */}
            <PinnedIdeas ideas={ideas} />

            {/* AI Recommendations Section - Only show for logged in users */}
            {user && <RecommendationsSection />}

            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                {user ? 'All Ideas' : 'Discover Ideas'}
              </h2>
              {!user && (
                <p className="text-gray-600 text-base">
                  Sign in to get personalized recommendations
                </p>
              )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setSortBy('top')}
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                        sortBy === 'top'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      Top
                    </button>
                    <button
                      onClick={() => setSortBy('latest')}
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                        sortBy === 'latest'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      Latest
                    </button>
                    <button
                      onClick={() => setSortBy('trending')}
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                        sortBy === 'trending'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      Trending
                    </button>
                  </div>

                  <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
                </div>

                <div className="flex items-center space-x-3">
                  <label htmlFor="category-filter" className="text-gray-700 font-medium text-base">
                    Filter by:
                  </label>
                  <select
                    id="category-filter"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as Category | 'all')}
                    className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white min-w-[160px]"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-16">
                <LoadingSpinner size="lg" text="Loading ideas..." />
              </div>
            )}

            {/* Ideas Grid */}
            {!isLoading && (
              <>
                {filteredIdeas.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredIdeas.map((idea) => (
                      <IdeaCard key={idea.id} idea={idea} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                    <div className="text-gray-500 text-xl mb-4">No ideas found</div>
                    <p className="text-gray-400 text-base">Try adjusting your filters or search terms</p>
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
                      className="bg-white border border-gray-300 rounded-xl px-8 py-4 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-base shadow-sm"
                    >
                      Load More Ideas
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Suggested Users */}
            {user && <SuggestedUsers limit={4} />}

            {/* Activity Feed */}
            <ActivityFeed 
              showFollowingOnly={!!user}
              limit={8}
              className="sticky top-28"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;