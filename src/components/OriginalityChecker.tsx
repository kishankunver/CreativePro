import React, { useState } from 'react';
import { Shield, Clock, AlertTriangle, CheckCircle, FileText, Search, Download, Eye } from 'lucide-react';
import { originalityService, OriginalityCheckResult } from '../services/originality';
import { OriginalityProof, OriginalitySearchResult, PriorArtReference } from '../types';

interface OriginalityCheckerProps {
  title: string;
  description: string;
  tags: string[];
  existingIdeas: any[];
  onCheckComplete?: (result: OriginalityCheckResult) => void;
  className?: string;
}

const OriginalityChecker: React.FC<OriginalityCheckerProps> = ({
  title,
  description,
  tags,
  existingIdeas,
  onCheckComplete,
  className = ''
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<OriginalityCheckResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleCheck = async () => {
    if (!title.trim() || !description.trim()) {
      alert('Please enter a title and description first');
      return;
    }

    setIsChecking(true);
    try {
      const result = await originalityService.checkOriginality(title, description, tags, existingIdeas);
      setCheckResult(result);
      onCheckComplete?.(result);
    } catch (error) {
      console.error('Originality check failed:', error);
      alert('Failed to check originality. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity < 30) return 'text-green-600';
    if (similarity < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSimilarityBadgeColor = (similarity: number) => {
    if (similarity < 30) return 'bg-green-100 text-green-800';
    if (similarity < 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-800">Originality Check</h3>
        </div>
        
        <button
          onClick={handleCheck}
          disabled={isChecking || !title.trim() || !description.trim()}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isChecking ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Checking...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span>Check Originality</span>
            </>
          )}
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4">
        Verify the originality of your idea by checking against existing submissions and prior art.
      </p>

      {/* Results */}
      {checkResult && (
        <div className="space-y-4">
          {/* Overall Result */}
          <div className={`p-4 rounded-lg border ${
            checkResult.isOriginal 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              {checkResult.isOriginal ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
              <h4 className={`font-semibold ${
                checkResult.isOriginal ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {checkResult.isOriginal ? 'Idea Appears Original' : 'Similar Ideas Found'}
              </h4>
            </div>
            
            <p className={`text-sm ${
              checkResult.isOriginal ? 'text-green-700' : 'text-yellow-700'
            }`}>
              {checkResult.isOriginal 
                ? 'Your idea appears to be unique based on our analysis.'
                : `Found ${checkResult.similarIdeas.length} similar ideas with up to ${Math.round(checkResult.similarityScore)}% similarity.`
              }
            </p>

            {/* Similarity Score */}
            {checkResult.similarityScore > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Highest Similarity</span>
                  <span className={`font-medium ${getSimilarityColor(checkResult.similarityScore)}`}>
                    {Math.round(checkResult.similarityScore)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      checkResult.similarityScore < 30 ? 'bg-green-500' :
                      checkResult.similarityScore < 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${checkResult.similarityScore}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {checkResult.recommendedActions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-800 mb-2">Recommendations</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                {checkResult.recommendedActions.map((action, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Details Toggle */}
          {(checkResult.similarIdeas.length > 0 || checkResult.priorArt.length > 0) && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 transition"
            >
              <Eye className="h-4 w-4" />
              <span>{showDetails ? 'Hide' : 'Show'} Detailed Results</span>
            </button>
          )}

          {/* Detailed Results */}
          {showDetails && (
            <div className="space-y-4">
              {/* Similar Ideas */}
              {checkResult.similarIdeas.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-800 mb-3">Similar Ideas Found</h5>
                  <div className="space-y-3">
                    {checkResult.similarIdeas.map((similar) => (
                      <div key={similar.ideaId} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <h6 className="font-medium text-gray-800 flex-1">{similar.title}</h6>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSimilarityBadgeColor(similar.similarity)}`}>
                            {Math.round(similar.similarity)}% similar
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          By {similar.author} • {similar.submissionDate.toLocaleDateString()}
                        </div>
                        
                        {similar.matchingElements.length > 0 && (
                          <div className="text-sm">
                            <span className="text-gray-600">Matching elements: </span>
                            <span className="text-gray-800">{similar.matchingElements.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prior Art */}
              {checkResult.priorArt.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-800 mb-3">Prior Art References</h5>
                  <div className="space-y-3">
                    {checkResult.priorArt.map((art) => (
                      <div key={art.id} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <h6 className="font-medium text-gray-800 flex-1">{art.title}</h6>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                            {art.type}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{art.description}</p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            Relevance: {art.relevanceScore}% • Source: {art.source}
                          </span>
                          {art.url && (
                            <a
                              href={art.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 transition"
                            >
                              View →
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      {!checkResult && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">How Originality Check Works:</p>
              <ul className="space-y-1">
                <li>• Compares your idea against existing submissions</li>
                <li>• Searches for relevant prior art and patents</li>
                <li>• Provides similarity scores and recommendations</li>
                <li>• Helps ensure your idea is unique and original</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OriginalityChecker;