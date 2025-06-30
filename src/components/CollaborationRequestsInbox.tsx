import React, { useState, useEffect } from 'react';
import { Users, Check, X, MessageCircle, DollarSign, Clock, User } from 'lucide-react';
import { CollaborationRequest } from '../types';
import { collaborationService } from '../services/collaboration';
import { useAuth } from '../contexts/AuthContext';
import { useIdeas } from '../contexts/IdeaContext';
import TipModal from './TipModal';

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
  const [showTipModal, setShowTipModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CollaborationRequest | null>(null);

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
    if (request.suggestedTipAmount && request.suggestedTipAmount > 0) {
      setSelectedRequest(request);
      setShowTipModal(true);
    } else {
      await processAcceptance(request, false);
    }
  };

  const processAcceptance = async (request: CollaborationRequest, withTip: boolean, tipAmount?: number) => {
    try {
      const result = await collaborationService.respondToCollaborationRequest({
        requestId: request.id,
        accepted: true,
        responseMessage: responseMessage || 'Welcome to the collaboration!',
        tipAmount: withTip ? tipAmount : undefined
      });

      if (result.success) {
        loadRequests();
        setResponseMessage('');
        setRespondingTo(null);
        alert('Collaboration request accepted! The idea has been released.');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Failed to accept collaboration request:', error);
      alert('Failed to accept collaboration request. Please try again.');
    }
  };

  const handleDecline = async (request: CollaborationRequest) => {
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
    <>
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
                            {request.status}
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

                      {/* Suggested Tip */}
                      {request.suggestedTipAmount && (
                        <div className="flex items-center space-x-1 text-sm text-green-600 mb-3">
                          <DollarSign className="h-4 w-4" />
                          <span>Suggested tip: ${request.suggestedTipAmount}</span>
                        </div>
                      )}

                      {/* Response Section */}
                      {request.status === 'pending' && (
                        <div className="mt-4">
                          {!isResponding ? (
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleAccept(request)}
                                className="flex items-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                              >
                                <Check className="h-4 w-4" />
                                <span>Accept</span>
                              </button>
                              <button
                                onClick={() => setRespondingTo(request.id)}
                                className="flex items-center space-x-1 bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
                              >
                                <MessageCircle className="h-4 w-4" />
                                <span>Respond</span>
                              </button>
                              <button
                                onClick={() => handleDecline(request)}
                                className="flex items-center space-x-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
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
                                placeholder="Add a personal message (optional)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                rows={2}
                              />
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleAccept(request)}
                                  className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                                >
                                  Accept & Release
                                </button>
                                <button
                                  onClick={() => handleDecline(request)}
                                  className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
                                >
                                  Decline
                                </button>
                                <button
                                  onClick={() => {
                                    setRespondingTo(null);
                                    setResponseMessage('');
                                  }}
                                  className="bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-400 transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Response Message */}
                      {request.status !== 'pending' && request.responseMessage && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Response:</strong> {request.responseMessage}
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

      {/* Tip Modal */}
      {showTipModal && selectedRequest && (
        <TipModal
          isOpen={showTipModal}
          onClose={() => {
            setShowTipModal(false);
            setSelectedRequest(null);
          }}
          suggestedAmount={selectedRequest.suggestedTipAmount || 0}
          recipientName={getUserById(selectedRequest.fromUserId)?.name || 'User'}
          onConfirm={(tipAmount) => {
            processAcceptance(selectedRequest, true, tipAmount);
            setShowTipModal(false);
            setSelectedRequest(null);
          }}
        />
      )}
    </>
  );
};

export default CollaborationRequestsInbox;