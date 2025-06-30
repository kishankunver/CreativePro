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
      
      <main className="container mx-auto px-8 pt-32 pb-20 max-w-7xl">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-12">
            {/* Pinned Ideas */}
            <PinnedIdeas ideas={ideas} />

            {/* AI Recommendations Section - Only show for logged in users */}
            {user && <RecommendationsSection />}

            {/* Section Header */}
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-4xl font-bold text-gray-800">
                {user ? 'All Ideas' : 'Discover Ideas'}
              </h2>
              {!user && (
                <p className="text-gray-600 text-lg">
                  Sign in to get personalized recommendations
                </p>
              )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-10">
              <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between space-y-8 xl:space-y-0">
                <div className="flex flex-wrap items-center gap-8">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setSortBy('top')}
                      className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 ${
                        sortBy === 'top'
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      Top
                    </button>
                    <button
                      onClick={() => setSortBy('latest')}
                      className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 ${
                        sortBy === 'latest'
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      Latest
                    </button>
                    <button
                      onClick={() => setSortBy('trending')}
                      className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 ${
                        sortBy === 'trending'
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      Trending
                    </button>
                  </div>

                  <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
                </div>

                <div className="flex items-center space-x-4">
                  <label htmlFor="category-filter" className="text-gray-700 font-semibold text-lg">
                    Filter by:
                  </label>
                  <select
                    id="category-filter"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as Category | 'all')}
                    className="border-2 border-gray-300 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white min-w-[180px] font-medium"
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
              <div className="flex justify-center py-20">
                <LoadingSpinner size="lg" text="Loading ideas..." />
              </div>
            )}

            {/* Ideas Grid */}
            {!isLoading && (
              <>
                {filteredIdeas.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {filteredIdeas.map((idea) => (
                      <IdeaCard key={idea.id} idea={idea} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                    <div className="text-gray-500 text-2xl mb-6">No ideas found</div>
                    <p className="text-gray-400 text-lg">Try adjusting your filters or search terms</p>
                  </div>
                )}

                {/* Load More Button */}
                {filteredIdeas.length > 0 && (
                  <div className="flex justify-center mt-16">
                    <button
                      onClick={() => {
                        setIsLoading(true);
                        // Simulate loading more ideas
                        setTimeout(() => setIsLoading(false), 1000);
                      }}
                      className="bg-white border-2 border-gray-300 rounded-xl px-10 py-5 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold text-lg shadow-sm"
                    >
                      Load More Ideas
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-10">
            {/* Suggested Users */}
            {user && <SuggestedUsers limit={4} />}

            {/* Activity Feed */}
            <ActivityFeed 
              showFollowingOnly={!!user}
              limit={8}
              className="sticky top-32"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;