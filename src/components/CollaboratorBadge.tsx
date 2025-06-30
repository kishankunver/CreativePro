import React, { useState } from 'react';
import { Users, Crown, User, Heart, DollarSign, ExternalLink } from 'lucide-react';
import { IdeaRelease } from '../types';
import { useIdeas } from '../contexts/IdeaContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { collaborationService } from '../services/collaboration';

interface CollaboratorBadgeProps {
  ideaId: string;
  release?: IdeaRelease;
  className?: string;
}

const CollaboratorBadge: React.FC<CollaboratorBadgeProps> = ({ 
  ideaId, 
  release, 
  className = '' 
}) => {
  const { getUserById } = useIdeas();
  const { user } = useAuth();
  const [isProcessingTip, setIsProcessingTip] = useState(false);

  if (!release) return null;

  const originalOwner = getUserById(release.originalOwnerId);
  const collaborator = getUserById(release.releasedToUserId);
  const isOriginalOwner = user?.id === release.originalOwnerId;
  const isCollaborator = user?.id === release.releasedToUserId;
  const canOfferTip = isCollaborator && !release.tipAmount;

  const handleSendTip = async () => {
    if (!originalOwner) return;
    
    setIsProcessingTip(true);
    
    try {
      // Create Stripe checkout session for tipping
      const tipAmount = 25; // Default amount, could be customizable
      
      // In production, this would create a real Stripe checkout session
      const result = await collaborationService.processTipPayment(release.id, tipAmount);
      
      if (result.success) {
        // Simulate redirect to Stripe checkout
        alert(`🎉 Tip processed! ${result.message}\n\nIn production, this would redirect to Stripe checkout.`);
        
        // Refresh the page to show updated tip status
        window.location.reload();
      } else {
        alert(`Failed to process tip: ${result.message}`);
      }
    } catch (error) {
      console.error('Tip processing error:', error);
      alert('Failed to process tip. Please try again.');
    } finally {
      setIsProcessingTip(false);
    }
  };

  return (
    <div className={`bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-2 mb-3">
        <Users className="h-5 w-5 text-purple-600" />
        <h4 className="font-medium text-purple-800">🎉 Active Collaboration</h4>
      </div>
      
      {/* Collaborators Display */}
      <div className="flex items-center space-x-4">
        {/* Original Owner */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {originalOwner ? originalOwner.name.charAt(0) : 'O'}
            </div>
            <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <Link 
              to={`/profile/${release.originalOwnerId}`}
              className="text-sm font-medium text-purple-800 hover:text-purple-900"
            >
              {originalOwner ? originalOwner.name : 'Original Owner'}
            </Link>
            <div className="text-xs text-purple-600">Idea Creator</div>
          </div>
        </div>

        {/* Collaboration Arrow */}
        <div className="flex items-center">
          <div className="w-8 border-t-2 border-purple-300"></div>
          <Users className="h-4 w-4 text-purple-500 mx-1" />
          <div className="w-8 border-t-2 border-purple-300"></div>
        </div>

        {/* Collaborator */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {collaborator ? collaborator.name.charAt(0) : 'C'}
          </div>
          <div>
            <Link 
              to={`/profile/${release.releasedToUserId}`}
              className="text-sm font-medium text-purple-800 hover:text-purple-900"
            >
              {collaborator ? collaborator.name : 'Collaborator'}
            </Link>
            <div className="text-xs text-purple-600">Active Collaborator</div>
          </div>
        </div>
      </div>

      {/* Release Info */}
      <div className="mt-3 pt-3 border-t border-purple-200">
        <div className="flex items-center justify-between text-xs text-purple-600">
          <span>✅ Released {new Date(release.releasedAt).toLocaleDateString()}</span>
          {release.tipAmount && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center space-x-1">
              <Heart className="h-3 w-3" />
              <span>${release.tipAmount} tip sent</span>
            </span>
          )}
        </div>
        {release.releaseNotes && (
          <p className="text-sm text-purple-700 mt-2 italic">
            "{release.releaseNotes}"
          </p>
        )}
      </div>

      {/* Tip Option for Collaborator (AFTER release) */}
      {canOfferTip && (
        <div className="mt-4 pt-3 border-t border-purple-200">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h5 className="font-medium text-green-800 text-sm mb-1">💝 Show Your Appreciation</h5>
                <p className="text-xs text-green-600">
                  Thank {originalOwner?.name} for sharing this amazing idea with you! 
                  Your tip shows appreciation and encourages more idea sharing.
                </p>
              </div>
              <button
                onClick={handleSendTip}
                disabled={isProcessingTip}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ml-3"
              >
                {isProcessingTip ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4" />
                    <span>Send $25 Tip</span>
                    <ExternalLink className="h-3 w-3" />
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-3 text-xs text-green-600 bg-green-100 rounded p-2">
              <strong>💳 Secure Payment:</strong> Powered by Stripe • Safe & encrypted • No card details stored
            </div>
          </div>
        </div>
      )}

      {/* Tip Sent Confirmation */}
      {release.tipAmount && isCollaborator && (
        <div className="mt-4 pt-3 border-t border-purple-200">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                🎉 You sent a ${release.tipAmount} tip to {originalOwner?.name}! Thank you for showing appreciation.
              </span>
            </div>
            {release.tipTransactionId && (
              <div className="mt-2 text-xs text-green-600">
                Transaction ID: {release.tipTransactionId}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tip Received Notification for Original Owner */}
      {release.tipAmount && isOriginalOwner && (
        <div className="mt-4 pt-3 border-t border-purple-200">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                💰 You received a ${release.tipAmount} tip from {collaborator?.name}!
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaboratorBadge;