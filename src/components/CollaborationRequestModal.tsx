import React, { useState } from 'react';
import { X, Users, DollarSign, Send, Loader } from 'lucide-react';
import { collaborationService } from '../services/collaboration';
import { useAuth } from '../contexts/AuthContext';
import { demoNotificationService } from '../services/demoNotifications';

interface CollaborationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideaId: string;
  ideaTitle: string;
  ideaOwnerId: string;
  onSuccess: () => void;
}

const CollaborationRequestModal: React.FC<CollaborationRequestModalProps> = ({
  isOpen,
  onClose,
  ideaId,
  ideaTitle,
  ideaOwnerId,
  onSuccess
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [suggestedTip, setSuggestedTip] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableSkills = [
    'Design', 'Development', 'Marketing', 'Business', 'Research', 
    'Writing', 'Sales', 'Product', 'Strategy', 'Operations'
  ];

  if (!isOpen || !user) return null;

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      alert('Please enter a message explaining why you want to collaborate');
      return;
    }

    if (selectedSkills.length === 0) {
      alert('Please select at least one skill you can contribute');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await collaborationService.submitCollaborationRequest({
        ideaId,
        fromUserId: user.id,
        toUserId: ideaOwnerId,
        message: message.trim(),
        skills: selectedSkills,
        suggestedTipAmount: typeof suggestedTip === 'number' ? suggestedTip : undefined
      });

      if (result.success && result.requestId) {
        // Request notification permission for demo
        await demoNotificationService.requestNotificationPermission();
        
        // Schedule demo notifications
        demoNotificationService.scheduleCollaborationDemo(
          result.requestId,
          ideaTitle,
          'Emma Green', // Mock idea owner name
          typeof suggestedTip === 'number' ? suggestedTip : 25
        );

        onSuccess();
        onClose();
        
        // Reset form
        setMessage('');
        setSelectedSkills([]);
        setSuggestedTip('');

        // Show immediate confirmation with demo info
        alert(`🚀 Collaboration request sent!\n\nYou'll receive notifications if the idea creator accepts!`);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Failed to submit collaboration request:', error);
      alert('Failed to send collaboration request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-white" />
              <h2 className="text-xl font-semibold text-white">Request to Collaborate</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-indigo-100 text-sm mt-1">
            On: "{ideaTitle}"
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Demo Notice */}
          

          {/* Message */}
          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Why do you want to collaborate? *
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Explain your interest, relevant experience, and how you can contribute to this idea..."
              required
            />
          </div>

          {/* Skills */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What skills can you contribute? *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableSkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleSkillToggle(skill)}
                  className={`p-2 text-sm rounded-lg border transition-all ${
                    selectedSkills.includes(skill)
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-indigo-50'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
            {selectedSkills.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                Selected: {selectedSkills.join(', ')}
              </div>
            )}
          </div>

          {/* Optional Tip */}
          <div className="mb-6">
            <label htmlFor="tip" className="block text-sm font-medium text-gray-700 mb-2">
              Optional tip to show appreciation (USD)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="number"
                id="tip"
                value={suggestedTip}
                onChange={(e) => setSuggestedTip(e.target.value ? Number(e.target.value) : '')}
                min="1"
                max="1000"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="25"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This tip will be processed if your collaboration request is accepted
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-800 mb-2">What happens next?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• The idea owner will review your request</li>
              <li>• If accepted, the idea will be "released" to you</li>
              <li>• You'll become a collaborator on the project</li>
              <li>• Optional tip will be processed upon acceptance</li>
              <li>• <strong>Demo:</strong> Notifications will appear in 45 seconds</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !message.trim() || selectedSkills.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollaborationRequestModal;