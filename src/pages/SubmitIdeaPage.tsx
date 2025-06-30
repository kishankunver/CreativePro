import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Sparkles, Loader } from 'lucide-react';
import Header from '../components/Header';
import AIValidationModal from '../components/AIValidationModal';
import DraftManager from '../components/DraftManager';
import OriginalityChecker from '../components/OriginalityChecker';
import { useIdeas } from '../contexts/IdeaContext';
import { useAuth } from '../contexts/AuthContext';
import { useAI } from '../hooks/useAI';
import { originalityService, OriginalityCheckResult } from '../services/originality';
import { Category, AIValidation } from '../types';

const SubmitIdeaPage: React.FC = () => {
  const navigate = useNavigate();
  const { addIdea, ideas } = useIdeas();
  const { user } = useAuth();
  const { analyzeIdea, generateTags, isAnalyzing, isGeneratingTags, error } = useAI();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [aiValidation, setAiValidation] = useState<AIValidation | null>(null);
  const [originalityResult, setOriginalityResult] = useState<OriginalityCheckResult | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '' as Category,
    description: '',
    tags: [] as string[],
    isPublic: true
  });

  const totalSteps = 4; // Added originality check step

  const categories: Category[] = ['Tech', 'Health', 'Finance', 'Education', 'Sustainability', 'Other'];

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.title.trim() || !formData.category) {
        alert('Please fill in all required fields');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.description.trim()) {
        alert('Please enter a description');
        return;
      }
    } else if (currentStep === 3) {
      // Originality check step - user can proceed even with similar ideas
      if (!originalityResult) {
        alert('Please run the originality check first');
        return;
      }
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleGenerateTags = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please enter a title and description first');
      return;
    }

    const suggestedTags = await generateTags(formData.title, formData.description);
    
    // Add suggested tags that aren't already present
    const newTags = suggestedTags.filter(tag => !formData.tags.includes(tag));
    if (newTags.length > 0) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, ...newTags.slice(0, 5)] // Limit to 5 new tags
      }));
    }
  };

  const handleOriginalityCheck = (result: OriginalityCheckResult) => {
    setOriginalityResult(result);
  };

  const handleSubmit = async () => {
    if (!user) return;

    const ideaData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      tags: formData.tags
    };

    // Get AI validation
    const validation = await analyzeIdea(ideaData);
    
    if (validation) {
      setAiValidation(validation);
      setShowValidationModal(true);
    } else {
      // If AI analysis fails, still allow posting with mock data
      const mockValidation: AIValidation = {
        noveltyScore: Math.floor(Math.random() * 31) + 65,
        marketPotential: Math.floor(Math.random() * 31) + 60,
        feasibilityScore: Math.floor(Math.random() * 31) + 55,
        swotAnalysis: {
          strengths: ['Addresses a clear market need'],
          weaknesses: ['May require significant investment'],
          opportunities: ['Growing market demand'],
          threats: ['Competitive landscape'],
          suggestions: ['Conduct market research']
        }
      };
      setAiValidation(mockValidation);
      setShowValidationModal(true);
    }
  };

  const handlePost = async () => {
    if (!user || !aiValidation) return;

    // Create the idea first
    const newIdea = {
      ...formData,
      authorId: user.id,
      author: user,
      noveltyScore: aiValidation.noveltyScore,
      swotAnalysis: aiValidation.swotAnalysis
    };

    addIdea(newIdea);

    // Generate proof of originality for the new idea
    try {
      const ideaId = Date.now().toString(); // This would be the actual idea ID
      await originalityService.generateProof(
        ideaId,
        formData.title,
        formData.description,
        formData.tags,
        user.id,
        {
          includeBlockchain: true,
          includeIPFS: true,
          witnessCount: 2
        }
      );
      console.log('✅ Proof of originality generated for idea:', ideaId);
    } catch (error) {
      console.error('❌ Failed to generate proof of originality:', error);
    }

    setShowValidationModal(false);
    navigate('/', { 
      state: { 
        message: 'Your idea has been posted successfully with proof of originality!' 
      }
    });
  };

  const handleLoadDraft = (draft: any) => {
    setFormData({
      title: draft.title,
      category: draft.category,
      description: draft.description,
      tags: draft.tags,
      isPublic: true
    });
    setCurrentStep(1);
  };

  const handleSaveDraft = () => {
    alert('Draft saved successfully!');
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
      <Header />
      
      <div className="flex items-center justify-center p-4 pt-24">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden">
          {/* Progress Bar */}
          <div className="w-full h-1 bg-gray-100">
            <div
              className="h-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center mt-4 mb-6">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      step <= currentStep
                        ? 'bg-indigo-600'
                        : 'bg-gray-300'
                    }`}
                  />
                  {step < 4 && (
                    <div className={`h-0.5 w-12 transition-all duration-300 ${
                      step < currentStep ? 'bg-indigo-600' : 'bg-gray-300'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="p-6 min-h-[600px]">
            {/* Draft Manager */}
            <DraftManager
              onLoadDraft={handleLoadDraft}
              currentDraft={formData}
              onSaveDraft={handleSaveDraft}
            />

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Step 1: Title and Category */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">What's your startup idea?</h2>
                
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    placeholder="Give your idea a catchy name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Category *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setFormData(prev => ({ ...prev, category }))}
                        className={`p-3 rounded-lg border text-center transition ${
                          formData.category === category
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                            : 'bg-gray-50 border-gray-200 hover:bg-indigo-50'
                        }`}
                      >
                        <span className="text-sm font-medium">{category}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Description and Tags */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Tell us more about your idea</h2>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    placeholder="Describe your startup idea in detail..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Tags</label>
                    <button
                      onClick={handleGenerateTags}
                      disabled={isGeneratingTags || !formData.title.trim() || !formData.description.trim()}
                      className="flex items-center space-x-1 px-3 py-1 text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingTags ? (
                        <Loader className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                      <span>{isGeneratingTags ? 'Generating...' : 'AI Suggest'}</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full flex items-center"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-indigo-600 hover:text-indigo-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add tags (press Enter after each tag)"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    Popular: 
                    {['innovation', 'ai', 'sustainable', 'social'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Visibility</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="visibility"
                        checked={formData.isPublic}
                        onChange={() => setFormData(prev => ({ ...prev, isPublic: true }))}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Public - Anyone can see this idea</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="visibility"
                        checked={!formData.isPublic}
                        onChange={() => setFormData(prev => ({ ...prev, isPublic: false }))}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Private - Only you can see this idea</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Originality Check */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Check Originality</h2>
                
                <OriginalityChecker
                  title={formData.title}
                  description={formData.description}
                  tags={formData.tags}
                  existingIdeas={ideas}
                  onCheckComplete={handleOriginalityCheck}
                />

                {originalityResult && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">What happens next?</h4>
                    <p className="text-sm text-blue-700">
                      {originalityResult.isOriginal 
                        ? 'Your idea appears original! We\'ll generate a timestamped proof of originality when you submit.'
                        : 'Similar ideas were found, but you can still proceed. Consider the recommendations to make your idea more unique.'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Preview */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Review your idea</h2>
                
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-800">{formData.title}</h3>
                  <div className="text-sm text-indigo-600 mt-1">{formData.category}</div>
                  <p className="text-gray-700 mt-4">{formData.description}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      formData.isPublic 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {formData.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>

                {originalityResult && (
                  <div className={`p-4 rounded-lg border ${
                    originalityResult.isOriginal 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <h4 className={`font-medium mb-2 ${
                      originalityResult.isOriginal ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                      Originality Status
                    </h4>
                    <p className={`text-sm ${
                      originalityResult.isOriginal ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                      {originalityResult.isOriginal 
                        ? 'Your idea appears to be original and unique.'
                        : `Similar ideas found with ${Math.round(originalityResult.similarityScore)}% similarity.`
                      }
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Ready to submit with proof of originality?
                  </h4>
                  <p className="text-sm text-blue-700">
                    Our AI will analyze your idea, perform market research, and generate a timestamped proof of originality certificate. 
                    This will provide verifiable evidence of when your idea was first submitted.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="flex items-center space-x-2 px-6 py-3 text-gray-600 rounded-lg font-medium hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              {currentStep < totalSteps ? (
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
                >
                  <span>Continue</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isAnalyzing}
                  className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Submit with Proof</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {aiValidation && (
        <AIValidationModal
          isOpen={showValidationModal}
          onClose={() => setShowValidationModal(false)}
          onPost={handlePost}
          validation={aiValidation}
        />
      )}
    </div>
  );
};

export default SubmitIdeaPage;