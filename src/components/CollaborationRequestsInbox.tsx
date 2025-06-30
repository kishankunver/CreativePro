import React, { useState, useEffect } from 'react';
import { Users, Check, X, MessageCircle, Clock, User, Sparkles, PartyPopper } from 'lucide-react';
import { CollaborationRequest } from '../types';
import { collaborationService } from '../services/collaboration';
import { useAuth } from '../contexts/AuthContext';
import { useIdeas } from '../contexts/IdeaContext';

interface CollaborationRequestsInboxProps {
  className?: string;
}

const CollaborationRequestsInbox: React.FC<CollaborationRequestsInboxProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { getUserById } = useIdeas();
  const [requests, setRequests] = useState<CollaborationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  const loadRequests = () => {
    if (!user) return;
    
    setIsLoading(true);
    const userRequests = collaborationService.getCollaborationRequestsForUser(user.id);
    setRequests(userRequests);
    setIsLoading(false);
  };

  const handleAccept = async (request: CollaborationRequest) => {
    setProcessingRequest(request.id);
    
    try {
      const result = await collaborationService.respondToCollaborationRequest({
        requestId: request.id,
        accepted: true,
        responseMessage: responseMessage || 'Welcome to the collaboration! Looking forward to working together.'
      });

      if (result.success) {
        loadRequests();
        setResponseMessage('');
        setRespondingTo(null);
        
        // Show celebration message
        const requester = getUserById(request.fromUserId);
        alert(`🎉 COLLABORATION ACCEPTED! 🎉\n\n✅ Your idea has been successfully released to ${requester?.name}\n🤝 They can now work on bringing it to life\n💡 They'll have the option to send you a tip as appreciation\n\nGreat choice! Collaboration makes ideas stronger.`);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Failed to accept collaboration request:', error);
      alert('Failed to accept collaboration request. Please try again.');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDecline = async (request: CollaborationRequest) => {
    setProcessingRequest(request.id);
    
    try {
      const result = await collaborationService.respondToCollaborationRequest({
        requestId: request.id,
        accepted: false,
        responseMessage: responseMessage || 'Thank you for your interest, but I\'ve decided to pursue a different direction.'
      });

      if (result.success) {
        loadRequests();
        setResponseMessage('');
        setRespondingTo(null);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Failed to decline collaboration request:', error);
      alert('Failed to decline collaboration request. Please try again.');
    } finally {
      setProcessingRequest(null);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter(req => req.status === 'pending');

  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-800">Collaboration Requests</h3>
          {pendingRequests.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {pendingRequests.length}
            </span>
          )}
        </div>
      </div>

      {/* Requests List */}
      <div className="divide-y divide-gray-100">
        {requests.length > 0 ? (
          requests.map((request) => {
            const requester = getUserById(request.fromUserId);
            const isResponding = respondingTo === request.id;
            const isProcessing = processingRequest === request.id;
            
            return (
              <div key={request.id} className="p-6">
                <div className="flex items-start space-x-4">
                  {/* User Avatar */}
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {requester ? requester.name.charAt(0) : 'U'}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Request Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-800">
                          {requester ? requester.name : 'Unknown User'}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status === 'accepted' ? '🎉 Accepted' : 
                           request.status === 'declined' ? '❌ Declined' : 
                           '⏳ Pending'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTimeAgo(request.createdAt)}
                      </div>
                    </div>

                    {/* Request Message */}
                    <p className="text-gray-700 mb-3">{request.message}</p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {request.skills.map((skill) => (
                        <span
                          key={skill}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Suggested Tip Display */}
                    {request.suggestedTipAmount && (
                      <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-1 text-sm text-green-700">
                          <Sparkles className="h-4 w-4" />
                          <span>They're willing to send a ${request.suggestedTipAmount} tip after collaboration</span>
                        </div>
                      </div>
                    )}

                    {/* Collaboration Accepted Notice */}
                    {request.status === 'accepted' && (
                      <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <PartyPopper className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-800">🎉 Collaboration Successfully Released!</span>
                        </div>
                        <div className="text-sm text-green-700 space-y-1">
                          <p>✅ Your idea has been released to {requester?.name}</p>
                          <p>🤝 They can now work on bringing it to life</p>
                          <p>💝 They have the option to send you a tip as appreciation</p>
                        </div>
                        {request.responseMessage && (
                          <div className="mt-3 p-2 bg-green-100 rounded text-sm text-green-800">
                            <strong>Your welcome message:</strong> "{request.responseMessage}"
                          </div>
                        )}
                      </div>
                    )}

                    {/* Response Section */}
                    {request.status === 'pending' && (
                      <div className="mt-4">
                        {!isResponding ? (
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleAccept(request)}
                              disabled={isProcessing}
                              className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isProcessing ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  <span>Releasing...</span>
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4" />
                                  <span>Accept & Release Idea</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => setRespondingTo(request.id)}
                              disabled={isProcessing}
                              className="flex items-center space-x-1 bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
                            >
                              <MessageCircle className="h-4 w-4" />
                              <span>Add Message</span>
                            </button>
                            <button
                              onClick={() => handleDecline(request)}
                              disabled={isProcessing}
                              className="flex items-center space-x-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
                            >
                              <X className="h-4 w-4" />
                              <span>Decline</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <textarea
                              value={responseMessage}
                              onChange={(e) => setResponseMessage(e.target.value)}
                              placeholder="Add a personal welcome message (optional)"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              rows={2}
                            />
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleAccept(request)}
                                disabled={isProcessing}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
                              >
                                {isProcessing ? 'Releasing...' : '🎉 Accept & Release'}
                              </button>
                              <button
                                onClick={() => handleDecline(request)}
                                disabled={isProcessing}
                                className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => {
                                  setRespondingTo(null);
                                  setResponseMessage('');
                                }}
                                disabled={isProcessing}
                                className="bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-400 transition disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Response Message for Declined */}
                    {request.status === 'declined' && request.responseMessage && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Your response:</strong> {request.responseMessage}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h4 className="font-medium text-gray-800 mb-2">No collaboration requests</h4>
            <p className="text-sm">
              Collaboration requests will appear here when other users want to work on your ideas
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborationRequestsInbox;