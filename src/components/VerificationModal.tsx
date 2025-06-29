import React, { useState } from 'react';
import { X, Shield, Building, Rocket, DollarSign, Star, GraduationCap, AlertCircle, CheckCircle } from 'lucide-react';
import { verificationService, CompanyVerificationData } from '../services/verification';
import { VerificationRequest } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<VerificationRequest['requestType']>('company');
  const [formData, setFormData] = useState<CompanyVerificationData>({
    companyName: '',
    companyWebsite: '',
    jobTitle: '',
    workEmail: '',
    linkedinProfile: '',
    githubProfile: '',
    portfolioUrl: '',
    additionalInfo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen || !user) return null;

  const verificationTypes = [
    {
      type: 'company' as const,
      icon: Building,
      title: 'Company Employee',
      description: 'Verify your employment at a company',
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    {
      type: 'founder' as const,
      icon: Rocket,
      title: 'Founder/Entrepreneur',
      description: 'Verify you as a company founder or entrepreneur',
      color: 'bg-purple-50 border-purple-200 text-purple-800'
    },
    {
      type: 'investor' as const,
      icon: DollarSign,
      title: 'Investor/VC',
      description: 'Verify your role as an investor or VC',
      color: 'bg-green-50 border-green-200 text-green-800'
    },
    {
      type: 'expert' as const,
      icon: Star,
      title: 'Industry Expert',
      description: 'Verify your expertise in a specific industry',
      color: 'bg-orange-50 border-orange-200 text-orange-800'
    },
    {
      type: 'academic' as const,
      icon: GraduationCap,
      title: 'Academic/Researcher',
      description: 'Verify your academic or research credentials',
      color: 'bg-indigo-50 border-indigo-200 text-indigo-800'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await verificationService.submitVerificationRequest(
        user.id,
        user,
        selectedType,
        formData
      );
      
      setSubmitResult(result);
      if (result.success) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: 'Failed to submit verification request. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedType('company');
    setFormData({
      companyName: '',
      companyWebsite: '',
      jobTitle: '',
      workEmail: '',
      linkedinProfile: '',
      githubProfile: '',
      portfolioUrl: '',
      additionalInfo: ''
    });
    setSubmitResult(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-white" />
              <h2 className="text-xl font-semibold text-white">Get Verified</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-white opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-blue-100 text-sm mt-1">
            Increase your credibility and build trust with the community
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {submitResult ? (
            // Success/Error State
            <div className="text-center py-8">
              {submitResult.success ? (
                <div className="space-y-4">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                  <h3 className="text-xl font-semibold text-gray-800">Verification Submitted!</h3>
                  <p className="text-gray-600">{submitResult.message}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
                  <h3 className="text-xl font-semibold text-gray-800">Submission Failed</h3>
                  <p className="text-gray-600">{submitResult.message}</p>
                  <button
                    onClick={() => setSubmitResult(null)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          ) : step === 1 ? (
            // Step 1: Choose Verification Type
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Choose Verification Type</h3>
                <p className="text-gray-600 text-sm">
                  Select the type of verification that best describes your professional status
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {verificationTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.type}
                      onClick={() => setSelectedType(type.type)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedType === type.type
                          ? type.color
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className="h-6 w-6 mt-1" />
                        <div>
                          <h4 className="font-medium">{type.title}</h4>
                          <p className="text-sm opacity-80">{type.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Continue
                </button>
              </div>
            </div>
          ) : (
            // Step 2: Verification Form
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {verificationTypes.find(t => t.type === selectedType)?.title} Verification
                </h3>
                <p className="text-gray-600 text-sm">
                  Provide the following information to verify your credentials
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company/Organization Name *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Google, Microsoft, Acme Corp"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Website *
                  </label>
                  <input
                    type="url"
                    value={formData.companyWebsite}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyWebsite: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://company.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title/Role *
                  </label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Software Engineer, CEO, Product Manager"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    value={formData.workEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, workEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="you@company.com"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must match your company domain for automatic verification
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    value={formData.linkedinProfile}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedinProfile: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GitHub Profile
                  </label>
                  <input
                    type="url"
                    value={formData.githubProfile}
                    onChange={(e) => setFormData(prev => ({ ...prev, githubProfile: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://github.com/yourusername"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Portfolio/Personal Website
                </label>
                <input
                  type="url"
                  value={formData.portfolioUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://yourportfolio.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Information
                </label>
                <textarea
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional information that might help verify your credentials..."
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Verification Process</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• We'll verify your work email domain matches your company</li>
                  <li>• LinkedIn and other profiles will be cross-referenced</li>
                  <li>• High-confidence verifications may be approved automatically</li>
                  <li>• Manual review typically takes 1-2 business days</li>
                </ul>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;