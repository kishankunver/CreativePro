import React, { useState } from 'react';
import { X, Sparkles, ExternalLink, Zap, CheckCircle, Search, Building, FileText, TrendingUp, CreditCard } from 'lucide-react';
import { aiService } from '../services/ai';
import { researchService } from '../services/research';

const AISetupBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(!aiService.isConfigured() || !researchService.isConfigured());

  const aiConfigured = aiService.isConfigured();
  const researchConfigured = researchService.isConfigured();
  const fullyConfigured = aiConfigured && researchConfigured;
  const stripeConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

  if (!isVisible) {
    if (fullyConfigured && stripeConfigured) {
      return (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5" />
              <div>
                <span className="font-semibold">Full Platform Active</span>
                <span className="text-sm opacity-90 ml-2">
                  AI research, payments, and all features enabled
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:text-gray-200 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4">
      <div className="container mx-auto">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-6 w-6" />
            <div>
              <h3 className="font-semibold text-lg">Complete Platform Setup</h3>
              <p className="text-sm opacity-90">
                Enable AI research, payments, and all premium features
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-gray-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Search className="h-4 w-4" />
              <span className="font-medium text-sm">Web Search</span>
            </div>
            <p className="text-xs opacity-80">Real-time Google & Brave search for existing solutions</p>
            <div className="mt-2">
              <span className={`text-xs px-2 py-1 rounded ${
                import.meta.env.VITE_SERP_API_KEY || import.meta.env.VITE_BRAVE_SEARCH_API_KEY 
                  ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {import.meta.env.VITE_SERP_API_KEY || import.meta.env.VITE_BRAVE_SEARCH_API_KEY ? 'Configured' : 'Setup Required'}
              </span>
            </div>
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Building className="h-4 w-4" />
              <span className="font-medium text-sm">Company Research</span>
            </div>
            <p className="text-xs opacity-80">Crunchbase integration for competitor analysis</p>
            <div className="mt-2">
              <span className={`text-xs px-2 py-1 rounded ${
                import.meta.env.VITE_CRUNCHBASE_API_KEY ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {import.meta.env.VITE_CRUNCHBASE_API_KEY ? 'Configured' : 'Setup Required'}
              </span>
            </div>
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-4 w-4" />
              <span className="font-medium text-sm">Patent Search</span>
            </div>
            <p className="text-xs opacity-80">Google Patents API for IP landscape analysis</p>
            <div className="mt-2">
              <span className={`text-xs px-2 py-1 rounded ${
                import.meta.env.VITE_GOOGLE_PATENTS_API_KEY ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {import.meta.env.VITE_GOOGLE_PATENTS_API_KEY ? 'Configured' : 'Setup Required'}
              </span>
            </div>
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium text-sm">Market Intelligence</span>
            </div>
            <p className="text-xs opacity-80">News API & market data for trend analysis</p>
            <div className="mt-2">
              <span className={`text-xs px-2 py-1 rounded ${
                import.meta.env.VITE_NEWS_API_KEY ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {import.meta.env.VITE_NEWS_API_KEY ? 'Configured' : 'Setup Required'}
              </span>
            </div>
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <CreditCard className="h-4 w-4" />
              <span className="font-medium text-sm">Payments</span>
            </div>
            <p className="text-xs opacity-80">Stripe integration for tips and subscriptions</p>
            <div className="mt-2">
              <span className={`text-xs px-2 py-1 rounded ${
                stripeConfigured ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {stripeConfigured ? 'Configured' : 'Setup Required'}
              </span>
            </div>
          </div>
        </div>

        {/* Setup Links */}
        <div className="flex flex-wrap items-center gap-3">
          {!aiConfigured && (
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg text-sm font-medium transition"
            >
              <Zap className="h-3 w-3" />
              <span>Get OpenRouter Key</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          
          <a
            href="https://serpapi.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg text-sm font-medium transition"
          >
            <Search className="h-3 w-3" />
            <span>SerpAPI (Web Search)</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          <a
            href="https://data.crunchbase.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg text-sm font-medium transition"
          >
            <Building className="h-3 w-3" />
            <span>Crunchbase API</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          <a
            href="https://stripe.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg text-sm font-medium transition"
          >
            <CreditCard className="h-3 w-3" />
            <span>Stripe Setup</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="mt-3 text-xs opacity-80">
          💡 <strong>Pro Tip:</strong> Start with Supabase + OpenRouter for core features, then add research APIs and Stripe for the complete experience
        </div>
      </div>
    </div>
  );
};

export default AISetupBanner;