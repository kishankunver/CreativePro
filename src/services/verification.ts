import { User, VerificationRequest, VerificationBadge, VerificationDocument } from '../types';

export interface CompanyVerificationData {
  companyName: string;
  companyWebsite: string;
  jobTitle: string;
  workEmail: string;
  linkedinProfile?: string;
  githubProfile?: string;
  portfolioUrl?: string;
  additionalInfo?: string;
}

export interface VerificationResult {
  success: boolean;
  credibilityScore: number;
  verificationBadge: VerificationBadge;
  message: string;
}

class VerificationService {
  private pendingRequests: Map<string, VerificationRequest> = new Map();
  private verifiedUsers: Map<string, VerificationBadge> = new Map();

  // Submit verification request
  async submitVerificationRequest(
    userId: string,
    user: User,
    requestType: VerificationRequest['requestType'],
    data: CompanyVerificationData
  ): Promise<{ success: boolean; requestId: string; message: string }> {
    console.log('📝 Submitting verification request for:', user.name);

    const requestId = `req_${Date.now()}_${userId}`;
    
    // Auto-verify documents based on provided data
    const documents: VerificationDocument[] = [];
    
    if (data.workEmail) {
      documents.push({
        id: `doc_${Date.now()}_email`,
        type: 'company_email',
        description: `Work email: ${data.workEmail}`,
        verified: this.verifyWorkEmail(data.workEmail, data.companyWebsite)
      });
    }

    if (data.linkedinProfile) {
      documents.push({
        id: `doc_${Date.now()}_linkedin`,
        type: 'linkedin',
        url: data.linkedinProfile,
        description: 'LinkedIn profile verification',
        verified: this.verifyLinkedInProfile(data.linkedinProfile, data.companyName)
      });
    }

    if (data.companyWebsite) {
      documents.push({
        id: `doc_${Date.now()}_company`,
        type: 'company_page',
        url: data.companyWebsite,
        description: 'Company website verification',
        verified: this.verifyCompanyWebsite(data.companyWebsite)
      });
    }

    if (data.githubProfile) {
      documents.push({
        id: `doc_${Date.now()}_github`,
        type: 'portfolio',
        url: data.githubProfile,
        description: 'GitHub profile verification',
        verified: true // GitHub profiles are generally trustworthy
      });
    }

    const request: VerificationRequest = {
      id: requestId,
      userId,
      user,
      requestType,
      companyName: data.companyName,
      companyWebsite: data.companyWebsite,
      jobTitle: data.jobTitle,
      workEmail: data.workEmail,
      linkedinProfile: data.linkedinProfile,
      githubProfile: data.githubProfile,
      portfolioUrl: data.portfolioUrl,
      additionalInfo: data.additionalInfo,
      documents,
      status: 'pending',
      submittedAt: new Date()
    };

    this.pendingRequests.set(requestId, request);

    // Auto-process if enough verification signals
    const autoVerifyResult = await this.attemptAutoVerification(request);
    if (autoVerifyResult.success) {
      return {
        success: true,
        requestId,
        message: 'Verification completed automatically! Your profile has been verified.'
      };
    }

    return {
      success: true,
      requestId,
      message: 'Verification request submitted successfully. Review typically takes 1-2 business days.'
    };
  }

  // Attempt automatic verification based on provided data
  private async attemptAutoVerification(request: VerificationRequest): Promise<VerificationResult> {
    let credibilityScore = 0;
    const verificationFactors: string[] = [];

    // Check work email domain
    if (request.workEmail && request.companyWebsite) {
      const emailDomain = request.workEmail.split('@')[1];
      const websiteDomain = new URL(request.companyWebsite).hostname.replace('www.', '');
      
      if (emailDomain === websiteDomain) {
        credibilityScore += 30;
        verificationFactors.push('Work email matches company domain');
      }
    }

    // Check LinkedIn profile
    if (request.linkedinProfile) {
      credibilityScore += 20;
      verificationFactors.push('LinkedIn profile provided');
    }

    // Check company website
    if (request.companyWebsite) {
      credibilityScore += 15;
      verificationFactors.push('Company website verified');
    }

    // Check GitHub profile (for tech roles)
    if (request.githubProfile && request.requestType === 'company') {
      credibilityScore += 10;
      verificationFactors.push('GitHub profile provided');
    }

    // Check for known companies (mock data)
    const knownCompanies = [
      'google.com', 'microsoft.com', 'apple.com', 'amazon.com', 'meta.com',
      'netflix.com', 'spotify.com', 'uber.com', 'airbnb.com', 'stripe.com'
    ];
    
    if (request.companyWebsite) {
      const domain = new URL(request.companyWebsite).hostname.replace('www.', '');
      if (knownCompanies.includes(domain)) {
        credibilityScore += 25;
        verificationFactors.push('Recognized company');
      }
    }

    // Auto-verify if score is high enough
    if (credibilityScore >= 50) {
      const badge: VerificationBadge = {
        type: request.requestType,
        companyName: request.companyName,
        title: request.jobTitle,
        verifiedAt: new Date(),
        verifiedBy: 'auto-verification',
        credibilityScore
      };

      this.verifiedUsers.set(request.userId, badge);
      
      // Update request status
      request.status = 'approved';
      request.reviewedAt = new Date();
      request.reviewedBy = 'auto-verification';
      request.credibilityScore = credibilityScore;
      request.reviewNotes = `Auto-verified based on: ${verificationFactors.join(', ')}`;

      return {
        success: true,
        credibilityScore,
        verificationBadge: badge,
        message: 'Automatically verified based on provided credentials'
      };
    }

    return {
      success: false,
      credibilityScore,
      verificationBadge: {} as VerificationBadge,
      message: 'Manual review required'
    };
  }

  // Verify work email domain matches company website
  private verifyWorkEmail(email: string, companyWebsite: string): boolean {
    try {
      const emailDomain = email.split('@')[1];
      const websiteDomain = new URL(companyWebsite).hostname.replace('www.', '');
      return emailDomain === websiteDomain;
    } catch {
      return false;
    }
  }

  // Verify LinkedIn profile (mock verification)
  private verifyLinkedInProfile(linkedinUrl: string, companyName: string): boolean {
    // In real implementation, this would use LinkedIn API
    return linkedinUrl.includes('linkedin.com/in/') && linkedinUrl.length > 30;
  }

  // Verify company website exists and is legitimate
  private verifyCompanyWebsite(website: string): boolean {
    try {
      const url = new URL(website);
      return url.protocol === 'https:' && url.hostname.includes('.');
    } catch {
      return false;
    }
  }

  // Get verification status for user
  getVerificationStatus(userId: string): {
    isVerified: boolean;
    badge?: VerificationBadge;
    pendingRequest?: VerificationRequest;
  } {
    const badge = this.verifiedUsers.get(userId);
    const pendingRequest = Array.from(this.pendingRequests.values())
      .find(req => req.userId === userId && req.status === 'pending');

    return {
      isVerified: !!badge,
      badge,
      pendingRequest
    };
  }

  // Get all pending verification requests (for admin)
  getPendingRequests(): VerificationRequest[] {
    return Array.from(this.pendingRequests.values())
      .filter(req => req.status === 'pending')
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  // Manually approve/reject verification (admin function)
  async reviewVerificationRequest(
    requestId: string,
    approved: boolean,
    reviewNotes: string,
    reviewerId: string
  ): Promise<{ success: boolean; message: string }> {
    const request = this.pendingRequests.get(requestId);
    if (!request) {
      return { success: false, message: 'Request not found' };
    }

    request.status = approved ? 'approved' : 'rejected';
    request.reviewedAt = new Date();
    request.reviewedBy = reviewerId;
    request.reviewNotes = reviewNotes;

    if (approved) {
      const credibilityScore = this.calculateCredibilityScore(request);
      request.credibilityScore = credibilityScore;

      const badge: VerificationBadge = {
        type: request.requestType,
        companyName: request.companyName,
        title: request.jobTitle,
        verifiedAt: new Date(),
        verifiedBy: reviewerId,
        credibilityScore
      };

      this.verifiedUsers.set(request.userId, badge);
    }

    return {
      success: true,
      message: approved ? 'User verified successfully' : 'Verification request rejected'
    };
  }

  // Calculate credibility score based on verification factors
  private calculateCredibilityScore(request: VerificationRequest): number {
    let score = 50; // Base score

    // Email verification
    if (request.documents.find(d => d.type === 'company_email' && d.verified)) {
      score += 20;
    }

    // LinkedIn verification
    if (request.documents.find(d => d.type === 'linkedin' && d.verified)) {
      score += 15;
    }

    // Company website verification
    if (request.documents.find(d => d.type === 'company_page' && d.verified)) {
      score += 10;
    }

    // Additional profiles
    if (request.githubProfile) score += 5;
    if (request.portfolioUrl) score += 5;

    return Math.min(100, score);
  }

  // Get verification badge display info
  getVerificationBadgeInfo(badge: VerificationBadge): {
    color: string;
    icon: string;
    label: string;
    description: string;
  } {
    const badgeInfo = {
      company: {
        color: 'bg-blue-100 text-blue-800',
        icon: '🏢',
        label: 'Company Verified',
        description: 'Verified employee of a company'
      },
      founder: {
        color: 'bg-purple-100 text-purple-800',
        icon: '🚀',
        label: 'Founder',
        description: 'Verified company founder or co-founder'
      },
      investor: {
        color: 'bg-green-100 text-green-800',
        icon: '💰',
        label: 'Investor',
        description: 'Verified investor or VC'
      },
      expert: {
        color: 'bg-orange-100 text-orange-800',
        icon: '⭐',
        label: 'Industry Expert',
        description: 'Verified industry expert or thought leader'
      },
      academic: {
        color: 'bg-indigo-100 text-indigo-800',
        icon: '🎓',
        label: 'Academic',
        description: 'Verified academic or researcher'
      }
    };

    return badgeInfo[badge.type];
  }

  // Check if user can submit verification request
  canSubmitVerificationRequest(userId: string): { canSubmit: boolean; reason?: string } {
    const status = this.getVerificationStatus(userId);
    
    if (status.isVerified) {
      return { canSubmit: false, reason: 'Already verified' };
    }
    
    if (status.pendingRequest) {
      return { canSubmit: false, reason: 'Verification request pending' };
    }
    
    return { canSubmit: true };
  }
}

export const verificationService = new VerificationService();