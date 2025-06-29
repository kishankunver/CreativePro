import React from 'react';
import { X, Lightbulb, CheckCircle, AlertCircle, TrendingUp, AlertTriangle, Search, Building, FileText, Globe } from 'lucide-react';
import { AIValidation } from '../types';

interface AIValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: () => void;
  validation: AIValidation;
}

const AIValidationModal: React.FC<AIValidationModalProps> = ({
  isOpen,
  onClose,
  onPost,
  validation
}) => {
  if (!isOpen) return null;

  const hasResearchData = validation.swotAnalysis.suggestions.some(s => 
    s.includes('competition') || s.includes('patent') || s.includes('market')
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-white">AI Market Research & Validation</h2>
              <p className="text-blue-100 text-sm mt-1">
                {hasResearchData 
                  ? 'Analysis includes real-time web search, patent research, and competitive intelligence'
                  : 'AI-powered analysis with market insights'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Research Status Indicators */}
          {hasResearchData && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-3 flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                Real-time Market Research Completed
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center text-green-700">
                  <Search className="h-3 w-3 mr-1" />
                  Web Search
                </div>
                <div className="flex items-center text-green-700">
                  <Building className="h-3 w-3 mr-1" />
                  Company Analysis
                </div>
                <div className="flex items-center text-green-700">
                  <FileText className="h-3 w-3 mr-1" />
                  Patent Research
                </div>
                <div className="flex items-center text-green-700">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Market Intelligence
                </div>
              </div>
            </div>
          )}

          {/* Scoring Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Novelty Score */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-blue-800">Novelty Score</h3>
                <span className="text-xl font-bold text-blue-600">{validation.noveltyScore}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="h-2 bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${validation.noveltyScore}%` }}
                />
              </div>
              <p className="text-xs text-blue-700 mt-2">
                Based on competitive landscape analysis
              </p>
            </div>

            {/* Market Potential */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-green-800">Market Potential</h3>
                <span className="text-xl font-bold text-green-600">{validation.marketPotential}%</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div
                  className="h-2 bg-green-600 rounded-full transition-all duration-500"
                  style={{ width: `${validation.marketPotential}%` }}
                />
              </div>
              <p className="text-xs text-green-700 mt-2">
                Market size, growth, and opportunity assessment
              </p>
            </div>

            {/* Feasibility Score */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-purple-800">Feasibility</h3>
                <span className="text-xl font-bold text-purple-600">{validation.feasibilityScore}%</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div
                  className="h-2 bg-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${validation.feasibilityScore}%` }}
                />
              </div>
              <p className="text-xs text-purple-700 mt-2">
                Technical complexity and implementation readiness
              </p>
            </div>
          </div>

          {/* SWOT Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Strengths */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="flex items-center text-green-700 font-medium mb-3">
                <CheckCircle className="w-5 h-5 mr-2" />
                Strengths
              </h4>
              <ul className="text-sm text-gray-700 space-y-2">
                {validation.swotAnalysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="flex items-center text-red-700 font-medium mb-3">
                <AlertCircle className="w-5 h-5 mr-2" />
                Weaknesses
              </h4>
              <ul className="text-sm text-gray-700 space-y-2">
                {validation.swotAnalysis.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="flex items-center text-blue-700 font-medium mb-3">
                <TrendingUp className="w-5 h-5 mr-2" />
                Opportunities
              </h4>
              <ul className="text-sm text-gray-700 space-y-2">
                {validation.swotAnalysis.opportunities.map((opportunity, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                    {opportunity}
                  </li>
                ))}
              </ul>
            </div>

            {/* Threats */}
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h4 className="flex items-center text-amber-700 font-medium mb-3">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Threats
              </h4>
              <ul className="text-sm text-gray-700 space-y-2">
                {validation.swotAnalysis.threats.map((threat, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                    {threat}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Market-Informed Recommendations */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200 mb-6">
            <h4 className="flex items-center text-purple-700 font-medium mb-3">
              <Lightbulb className="w-5 h-5 mr-2" />
              {hasResearchData ? 'Market-Informed Recommendations' : 'AI Recommendations'}
            </h4>
            <ul className="text-sm text-gray-700 space-y-3">
              {validation.swotAnalysis.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-purple-100 text-purple-800 rounded-full mr-3 flex-shrink-0 text-xs font-medium">
                    {index + 1}
                  </span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Research Disclaimer */}
          {!hasResearchData && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Limited Research Data</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    This analysis is based on AI reasoning only. For comprehensive market research including 
                    real-time web search, patent analysis, and competitive intelligence, configure the research APIs in your environment.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Go Back & Revise
          </button>
          <button
            onClick={onPost}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
          >
            <span>Post Idea</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIValidationModal;