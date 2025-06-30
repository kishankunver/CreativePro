import React, { useState } from 'react';
import Header from '../components/Header';
import IdeaCard from '../components/IdeaCard';
import PinnedIdeas from '../components/PinnedIdeas';
import DateRangeFilter from '../components/DateRangeFilter';
import LoadingSpinner from '../components/LoadingSpinner';
import RecommendationsSection from '../components/RecommendationsSection';
import ActivityFeed from '../components/ActivityFeed';
import SuggestedUsers from '../components/SuggestedUsers';
import StripeCheckout from '../components/StripeCheckout';
import SubscriptionStatus from '../components/SubscriptionStatus';
import { useIdeas } from '../contexts/IdeaContext';
import { useAuth } from '../contexts/AuthContext';
import { Category, SortOption } from '../types';
import { Search } from 'lucide-react';

const HomePage: React.FC = () => {
  const {
    filteredIdeas,
    ideas,
    sortBy,
    setSortBy,
    categoryFilter,
    setCategoryFilter,
    setDateRange,
    searchQuery,
    setSearchQuery
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
      
      {/* Mobile Search Bar */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 mt-20">
        <div className="relative">
          <input
            type="text"
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3 pl-12 pr-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
          />
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] xl:grid-cols-[4fr_1.5fr] gap-6 lg:gap-8">

          {/* Main Content */}
          <div className="lg:col-span-3 xl:col-span-4 space-y-8 lg:space-y-12">
            {/* Pinned Ideas */}
            <PinnedIdeas ideas={ideas} />

            {/* AI Recommendations Section - Only show for logged in users */}
            {user && <RecommendationsSection />}

            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 space-y-4 sm:space-y-0">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
                {user ? 'All Ideas' : 'Discover Ideas'}
              </h2>
              {!user && (
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                  Sign in to get personalized recommendations
                </p>
              )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8 mb-6 lg:mb-10">
              <div className="flex flex-col space-y-6 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 lg:gap-8">
                  <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4 w-full sm:w-auto">
                    <button
                      onClick={() => setSortBy('top')}
                      className={`px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-lg lg:rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 ${
                        sortBy === 'top'
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      Top
                    </button>
                    <button
                      onClick={() => setSortBy('latest')}
                      className={`px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-lg lg:rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 ${
                        sortBy === 'latest'
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      Latest
                    </button>
                    <button
                      onClick={() => setSortBy('trending')}
                      className={`px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-lg lg:rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 ${
                        sortBy === 'trending'
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      Trending
                    </button>
                  </div>

                  <div className="hidden sm:block">
                    <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <label htmlFor="category-filter" className="text-gray-700 font-semibold text-sm sm:text-base lg:text-lg whitespace-nowrap">
                    Filter by:
                  </label>
                  <select
                    id="category-filter"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as Category | 'all')}
                    className="border border-gray-300 lg:border-2 rounded-lg lg:rounded-xl px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white min-w-[140px] sm:min-w-[160px] lg:min-w-[180px] font-medium text-sm sm:text-base"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Mobile Date Filter */}
              <div className="sm:hidden mt-4 pt-4 border-t border-gray-200">
                <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-12 lg:py-20">
                <LoadingSpinner size="lg" text="Loading ideas..." />
              </div>
            )}

            {/* Ideas Grid */}
            {!isLoading && (
              <>
                {filteredIdeas.length > 0 ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 xl:gap-10">
                    {filteredIdeas.map((idea) => (
                      <IdeaCard key={idea.id} idea={idea} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 lg:py-20 bg-white rounded-xl lg:rounded-2xl shadow-sm">
                    <div className="text-gray-500 text-xl lg:text-2xl mb-4 lg:mb-6">No ideas found</div>
                    <p className="text-gray-400 text-base lg:text-lg">Try adjusting your filters or search terms</p>
                  </div>
                )}

                {/* Load More Button */}
                {filteredIdeas.length > 0 && (
                  <div className="flex justify-center mt-10 lg:mt-16">
                    <button
                      onClick={() => {
                        setIsLoading(true);
                        // Simulate loading more ideas
                        setTimeout(() => setIsLoading(false), 1000);
                      }}
                      className="bg-white border border-gray-300 lg:border-2 rounded-lg lg:rounded-xl px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold text-sm sm:text-base lg:text-lg shadow-sm"
                    >
                      Load More Ideas
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 xl:col-span-1 space-y-6 lg:space-y-8">
            {/* Subscription Status - Only show for logged in users */}
            {user && <SubscriptionStatus />}

            {/* Stripe Checkout */}
            <StripeCheckout />

            {/* Suggested Users */}
            {user && <SuggestedUsers limit={4} />}

            {/* Activity Feed */}
            <div className="lg:sticky lg:top-24 xl:top-32">
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:p-8">
                <ActivityFeed showFollowingOnly={!!user} limit={6} />
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;