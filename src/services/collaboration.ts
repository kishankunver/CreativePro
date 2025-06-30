import { CollaborationRequest, IdeaRelease, Idea, User, Notification } from '../types';
import { socialService } from './social';

export interface CollaborationRequestData {
  ideaId: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  skills: string[];
  suggestedTipAmount?: number;
}

export interface CollaborationResponse {
  requestId: string;
  accepted: boolean;
  responseMessage?: string;
}

class CollaborationService {
  private collaborationRequests: Map<string, CollaborationRequest> = new Map();
  private ideaReleases: Map<string, IdeaRelease> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock collaboration request
    const mockRequest: CollaborationRequest = {
      id: 'collab_1',
      ideaId: '1',
      fromUserId: '2',
      toUserId: '1',
      message: 'I love your digital garden concept! I have experience in IoT and sensor integration. Would love to collaborate on the technical implementation.',
      skills: ['Dev', 'IoT'],
      suggestedTipAmount: 25,
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    };

    this.collaborationRequests.set(mockRequest.id, mockRequest);
  }

  // Submit collaboration request
  async submitCollaborationRequest(data: CollaborationRequestData): Promise<{
    success: boolean;
    requestId?: string;
    message: string;
  }> {
    try {
      const requestId = `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const request: CollaborationRequest = {
        id: requestId,
        ideaId: data.ideaId,
        fromUserId: data.fromUserId,
        toUserId: data.toUserId,
        message: data.message,
        skills: data.skills,
        suggestedTipAmount: data.suggestedTipAmount,
        status: 'pending',
        createdAt: new Date()
      };

      this.collaborationRequests.set(requestId, request);

      // Create notification for idea owner
      socialService.createNotification(data.toUserId, {
        type: 'collaboration_request',
        title: '🤝 New Collaboration Request',
        message: 'wants to collaborate on your idea',
        actionUrl: `/idea/${data.ideaId}`,
        fromUserId: data.fromUserId,
        metadata: { requestId, ideaId: data.ideaId }
      });

      // Add to activity feed
      socialService.addActivityFeedItem({
        id: `activity_${Date.now()}`,
        type: 'collaboration_requested',
        userId: data.fromUserId,
        user: { id: data.fromUserId } as User,
        targetId: data.ideaId,
        targetType: 'idea',
        content: data.message,
        createdAt: new Date(),
        isPublic: true,
        engagement: { likes: 0, comments: 0, shares: 0 }
      });

      return {
        success: true,
        requestId,
        message: 'Collaboration request sent successfully!'
      };
    } catch (error) {
      console.error('Failed to submit collaboration request:', error);
      return {
        success: false,
        message: 'Failed to send collaboration request. Please try again.'
      };
    }
  }

  // Respond to collaboration request (NO IMMEDIATE TIPPING)
  async respondToCollaborationRequest(response: CollaborationResponse): Promise<{
    success: boolean;
    message: string;
    releaseId?: string;
  }> {
    try {
      const request = this.collaborationRequests.get(response.requestId);
      if (!request) {
        return { success: false, message: 'Collaboration request not found' };
      }

      // Update request status
      request.status = response.accepted ? 'accepted' : 'declined';
      request.respondedAt = new Date();
      request.responseMessage = response.responseMessage;

      let releaseId: string | undefined;

      if (response.accepted) {
        // Create idea release (WITHOUT TIP)
        releaseId = `release_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const release: IdeaRelease = {
          id: releaseId,
          ideaId: request.ideaId,
          originalOwnerId: request.toUserId,
          releasedToUserId: request.fromUserId,
          collaborationRequestId: request.id,
          releasedAt: new Date(),
          releaseNotes: response.responseMessage
          // NO tipAmount here - will be added later when collaborator chooses to tip
        };

        this.ideaReleases.set(releaseId, release);

        // Create notifications for both users
        socialService.createNotification(request.fromUserId, {
          type: 'collaboration_accepted',
          title: '🎉 Collaboration Accepted!',
          message: 'accepted your collaboration request',
          actionUrl: `/idea/${request.ideaId}`,
          fromUserId: request.toUserId,
          metadata: { requestId: request.id, releaseId }
        });

        // Add to activity feed
        socialService.addActivityFeedItem({
          id: `activity_${Date.now()}`,
          type: 'collaboration_accepted',
          userId: request.toUserId,
          user: { id: request.toUserId } as User,
          targetId: request.ideaId,
          targetType: 'idea',
          createdAt: new Date(),
          isPublic: true,
          engagement: { likes: 0, comments: 0, shares: 0 }
        });

        socialService.addActivityFeedItem({
          id: `activity_${Date.now() + 1}`,
          type: 'idea_released',
          userId: request.toUserId,
          user: { id: request.toUserId } as User,
          targetId: request.ideaId,
          targetType: 'idea',
          createdAt: new Date(),
          isPublic: true,
          engagement: { likes: 0, comments: 0, shares: 0 }
        });
      } else {
        // Create notification for declined request
        socialService.createNotification(request.fromUserId, {
          type: 'collaboration_declined',
          title: 'Collaboration Request Declined',
          message: 'declined your collaboration request',
          actionUrl: `/idea/${request.ideaId}`,
          fromUserId: request.toUserId,
          metadata: { requestId: request.id }
        });
      }

      return {
        success: true,
        message: response.accepted 
          ? '🎉 Collaboration request accepted! The idea has been released.'
          : 'Collaboration request declined.',
        releaseId
      };
    } catch (error) {
      console.error('Failed to respond to collaboration request:', error);
      return {
        success: false,
        message: 'Failed to respond to collaboration request. Please try again.'
      };
    }
  }

  // Process tip payment AFTER collaboration is established
  async processTipPayment(releaseId: string, tipAmount: number): Promise<{
    success: boolean;
    transactionId?: string;
    message: string;
  }> {
    try {
      // In production, this would integrate with Stripe
      console.log('🎯 Processing Stripe tip payment:', { releaseId, tipAmount });
      
      // Simulate Stripe checkout process
      const stripeCheckoutUrl = `https://checkout.stripe.com/pay/cs_test_${Date.now()}`;
      
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const transactionId = `tip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const release = this.ideaReleases.get(releaseId);
      if (release) {
        release.tipAmount = tipAmount;
        release.tipTransactionId = transactionId;
        
        // Create notification for tip recipient
        socialService.createNotification(release.originalOwnerId, {
          type: 'tip_received',
          title: '💝 Tip Received!',
          message: `received a $${tipAmount} tip for collaborating`,
          fromUserId: release.releasedToUserId,
          metadata: { tipAmount, transactionId, releaseId }
        });
      }

      return {
        success: true,
        transactionId,
        message: `Successfully sent $${tipAmount} tip via Stripe!`
      };
    } catch (error) {
      console.error('Failed to process tip payment:', error);
      return {
        success: false,
        message: 'Failed to process tip payment. Please try again.'
      };
    }
  }

  // Get collaboration requests for a user (received)
  getCollaborationRequestsForUser(userId: string): CollaborationRequest[] {
    return Array.from(this.collaborationRequests.values())
      .filter(request => request.toUserId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Get collaboration requests by a user (sent)
  getCollaborationRequestsByUser(userId: string): CollaborationRequest[] {
    return Array.from(this.collaborationRequests.values())
      .filter(request => request.fromUserId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Get collaboration requests for an idea
  getCollaborationRequestsForIdea(ideaId: string): CollaborationRequest[] {
    return Array.from(this.collaborationRequests.values())
      .filter(request => request.ideaId === ideaId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Get collaboration request by ID
  getCollaborationRequest(requestId: string): CollaborationRequest | null {
    return this.collaborationRequests.get(requestId) || null;
  }

  // Get idea release by idea ID
  getIdeaRelease(ideaId: string): IdeaRelease | null {
    return Array.from(this.ideaReleases.values())
      .find(release => release.ideaId === ideaId) || null;
  }

  // Get idea release by ID
  getIdeaReleaseById(releaseId: string): IdeaRelease | null {
    return this.ideaReleases.get(releaseId) || null;
  }

  // Check if user has pending collaboration request for idea
  hasPendingCollaborationRequest(userId: string, ideaId: string): boolean {
    return Array.from(this.collaborationRequests.values())
      .some(request => 
        request.fromUserId === userId && 
        request.ideaId === ideaId && 
        request.status === 'pending'
      );
  }

  // Check if idea is released
  isIdeaReleased(ideaId: string): boolean {
    return Array.from(this.ideaReleases.values())
      .some(release => release.ideaId === ideaId);
  }

  // Get collaboration statistics for user
  getCollaborationStats(userId: string): {
    requestsSent: number;
    requestsReceived: number;
    requestsAccepted: number;
    ideasReleased: number;
    ideasReceived: number;
  } {
    const requestsSent = this.getCollaborationRequestsByUser(userId).length;
    const requestsReceived = this.getCollaborationRequestsForUser(userId).length;
    const requestsAccepted = this.getCollaborationRequestsForUser(userId)
      .filter(req => req.status === 'accepted').length;
    const ideasReleased = Array.from(this.ideaReleases.values())
      .filter(release => release.originalOwnerId === userId).length;
    const ideasReceived = Array.from(this.ideaReleases.values())
      .filter(release => release.releasedToUserId === userId).length;

    return {
      requestsSent,
      requestsReceived,
      requestsAccepted,
      ideasReleased,
      ideasReceived
    };
  }
}

export const collaborationService = new CollaborationService();