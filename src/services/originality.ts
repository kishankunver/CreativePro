import { OriginalityProof, WitnessSignature, ProofCertificate, ChainOfCustodyEntry, OriginalityDispute, OriginalitySearchResult, PriorArtReference, Idea } from '../types';

export interface OriginalityCheckResult {
  isOriginal: boolean;
  similarityScore: number;
  similarIdeas: OriginalitySearchResult[];
  priorArt: PriorArtReference[];
  recommendedActions: string[];
}

export interface ProofGenerationOptions {
  includeBlockchain?: boolean;
  includeIPFS?: boolean;
  witnessCount?: number;
  certificateExpiry?: Date;
}

class OriginalityService {
  private proofs: Map<string, OriginalityProof> = new Map();
  private disputes: Map<string, OriginalityDispute> = new Map();
  private contentHashes: Map<string, string[]> = new Map(); // hash -> ideaIds
  private searchIndex: Map<string, Set<string>> = new Map(); // keyword -> ideaIds

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize with some mock proof data
    const mockProof: OriginalityProof = {
      id: 'proof_1',
      ideaId: '1',
      contentHash: 'sha256_abc123def456',
      submissionTimestamp: new Date('2024-01-20T10:30:00Z'),
      witnessSignatures: [
        {
          id: 'witness_1',
          witnessId: 'system',
          witnessName: 'CreativePro System',
          signature: 'sys_sig_abc123',
          timestamp: new Date('2024-01-20T10:30:01Z'),
          witnessType: 'system'
        }
      ],
      proofCertificate: {
        certificateId: 'cert_abc123',
        issuedAt: new Date('2024-01-20T10:30:02Z'),
        issuer: 'CreativePro Originality Authority',
        digitalSignature: 'cert_sig_def456',
        metadata: {
          algorithm: 'SHA-256',
          version: '1.0',
          chainOfCustody: [
            {
              id: 'custody_1',
              action: 'created',
              timestamp: new Date('2024-01-20T10:30:00Z'),
              actor: 'system',
              details: 'Initial idea submission and proof generation',
              currentHash: 'sha256_abc123def456'
            }
          ]
        }
      },
      verificationStatus: 'verified'
    };

    this.proofs.set('1', mockProof);
  }

  // Generate content hash for idea
  private generateContentHash(title: string, description: string, tags: string[]): string {
    const content = `${title.toLowerCase()}|${description.toLowerCase()}|${tags.sort().join(',')}`;
    // In a real implementation, this would use a proper cryptographic hash
    return `sha256_${btoa(content).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)}`;
  }

  // Check for similar content before submission
  async checkOriginality(title: string, description: string, tags: string[], existingIdeas: Idea[]): Promise<OriginalityCheckResult> {
    console.log('🔍 Checking originality for:', title);

    const contentHash = this.generateContentHash(title, description, tags);
    const similarIdeas: OriginalitySearchResult[] = [];
    const priorArt: PriorArtReference[] = [];

    // Check against existing ideas
    for (const idea of existingIdeas) {
      const similarity = this.calculateSimilarity(
        { title, description, tags },
        { title: idea.title, description: idea.description, tags: idea.tags }
      );

      if (similarity > 30) { // 30% similarity threshold
        similarIdeas.push({
          ideaId: idea.id,
          title: idea.title,
          similarity,
          submissionDate: idea.createdAt,
          author: idea.author.name,
          matchingElements: this.findMatchingElements(
            { title, description, tags },
            { title: idea.title, description: idea.description, tags: idea.tags }
          )
        });
      }
    }

    // Mock prior art search (in real implementation, this would search patents, publications, etc.)
    if (title.toLowerCase().includes('ai') || description.toLowerCase().includes('artificial intelligence')) {
      priorArt.push({
        id: 'prior_1',
        type: 'patent',
        title: 'Method and System for Artificial Intelligence Processing',
        url: 'https://patents.google.com/patent/US1234567',
        description: 'A patent describing AI processing methods',
        relevanceScore: 65,
        foundAt: new Date(),
        source: 'Google Patents'
      });
    }

    const maxSimilarity = Math.max(...similarIdeas.map(s => s.similarity), 0);
    const isOriginal = maxSimilarity < 70; // 70% similarity threshold for originality

    const recommendedActions: string[] = [];
    if (!isOriginal) {
      recommendedActions.push('Consider modifying your idea to increase uniqueness');
      recommendedActions.push('Review similar ideas and identify key differentiators');
    }
    if (priorArt.length > 0) {
      recommendedActions.push('Review prior art to ensure your approach is novel');
    }
    if (isOriginal && similarIdeas.length === 0) {
      recommendedActions.push('Your idea appears to be highly original!');
    }

    return {
      isOriginal,
      similarityScore: maxSimilarity,
      similarIdeas: similarIdeas.slice(0, 5), // Top 5 similar ideas
      priorArt: priorArt.slice(0, 3), // Top 3 prior art references
      recommendedActions
    };
  }

  // Generate proof of originality for an idea
  async generateProof(
    ideaId: string,
    title: string,
    description: string,
    tags: string[],
    authorId: string,
    options: ProofGenerationOptions = {}
  ): Promise<OriginalityProof> {
    console.log('📜 Generating proof of originality for idea:', ideaId);

    const contentHash = this.generateContentHash(title, description, tags);
    const timestamp = new Date();

    // Generate witness signatures
    const witnessSignatures: WitnessSignature[] = [
      {
        id: `witness_${Date.now()}_system`,
        witnessId: 'system',
        witnessName: 'CreativePro System',
        signature: `sys_${contentHash.substring(0, 16)}`,
        timestamp,
        witnessType: 'system'
      }
    ];

    // Add additional witnesses if requested
    const witnessCount = options.witnessCount || 1;
    for (let i = 1; i < witnessCount; i++) {
      witnessSignatures.push({
        id: `witness_${Date.now()}_${i}`,
        witnessId: `external_witness_${i}`,
        witnessName: `External Witness ${i}`,
        signature: `ext_${contentHash.substring(i * 4, (i * 4) + 16)}`,
        timestamp: new Date(timestamp.getTime() + i * 1000),
        witnessType: 'external'
      });
    }

    // Create chain of custody entry
    const custodyEntry: ChainOfCustodyEntry = {
      id: `custody_${Date.now()}`,
      action: 'created',
      timestamp,
      actor: authorId,
      details: 'Initial idea submission and proof generation',
      currentHash: contentHash
    };

    // Generate proof certificate
    const certificate: ProofCertificate = {
      certificateId: `cert_${Date.now()}_${ideaId}`,
      issuedAt: timestamp,
      expiresAt: options.certificateExpiry,
      issuer: 'CreativePro Originality Authority',
      digitalSignature: `cert_sig_${contentHash}`,
      metadata: {
        algorithm: 'SHA-256',
        version: '1.0',
        chainOfCustody: [custodyEntry]
      }
    };

    // Create the proof
    const proof: OriginalityProof = {
      id: `proof_${Date.now()}_${ideaId}`,
      ideaId,
      contentHash,
      submissionTimestamp: timestamp,
      blockchainHash: options.includeBlockchain ? `blockchain_${contentHash}` : undefined,
      ipfsHash: options.includeIPFS ? `ipfs_${contentHash}` : undefined,
      witnessSignatures,
      proofCertificate: certificate,
      verificationStatus: 'verified'
    };

    // Store the proof
    this.proofs.set(ideaId, proof);
    
    // Update content hash index
    if (!this.contentHashes.has(contentHash)) {
      this.contentHashes.set(contentHash, []);
    }
    this.contentHashes.get(contentHash)!.push(ideaId);

    // Update search index
    this.updateSearchIndex(ideaId, title, description, tags);

    console.log('✅ Proof of originality generated successfully');
    return proof;
  }

  // Get proof for an idea
  getProof(ideaId: string): OriginalityProof | null {
    return this.proofs.get(ideaId) || null;
  }

  // Verify proof authenticity
  verifyProof(proof: OriginalityProof): {
    isValid: boolean;
    issues: string[];
    confidence: number;
  } {
    const issues: string[] = [];
    let confidence = 100;

    // Check if proof exists
    const storedProof = this.proofs.get(proof.ideaId);
    if (!storedProof) {
      issues.push('Proof not found in system records');
      confidence -= 50;
    }

    // Verify content hash
    if (storedProof && storedProof.contentHash !== proof.contentHash) {
      issues.push('Content hash mismatch');
      confidence -= 30;
    }

    // Verify witness signatures
    if (proof.witnessSignatures.length === 0) {
      issues.push('No witness signatures found');
      confidence -= 20;
    }

    // Check certificate validity
    if (proof.proofCertificate.expiresAt && proof.proofCertificate.expiresAt < new Date()) {
      issues.push('Certificate has expired');
      confidence -= 15;
    }

    // Verify chain of custody
    if (proof.proofCertificate.metadata.chainOfCustody.length === 0) {
      issues.push('No chain of custody records');
      confidence -= 10;
    }

    return {
      isValid: issues.length === 0,
      issues,
      confidence: Math.max(0, confidence)
    };
  }

  // Submit originality dispute
  async submitDispute(
    originalIdeaId: string,
    disputingIdeaId: string,
    disputeType: OriginalityDispute['disputeType'],
    submittedBy: string,
    evidence: string[]
  ): Promise<OriginalityDispute> {
    const disputeId = `dispute_${Date.now()}`;
    
    const dispute: OriginalityDispute = {
      id: disputeId,
      originalIdeaId,
      disputingIdeaId,
      disputeType,
      submittedBy,
      submittedAt: new Date(),
      evidence: evidence.map((evidenceText, index) => ({
        id: `evidence_${Date.now()}_${index}`,
        type: 'other',
        description: evidenceText,
        submittedAt: new Date(),
        verificationStatus: 'pending'
      })),
      status: 'pending'
    };

    this.disputes.set(disputeId, dispute);
    return dispute;
  }

  // Get all disputes for an idea
  getDisputes(ideaId: string): OriginalityDispute[] {
    return Array.from(this.disputes.values()).filter(
      dispute => dispute.originalIdeaId === ideaId || dispute.disputingIdeaId === ideaId
    );
  }

  // Generate originality certificate for display
  generateCertificate(ideaId: string): {
    certificateHtml: string;
    downloadUrl: string;
  } | null {
    const proof = this.proofs.get(ideaId);
    if (!proof) return null;

    const certificateHtml = `
      <div class="originality-certificate">
        <h2>Certificate of Originality</h2>
        <p><strong>Idea ID:</strong> ${ideaId}</p>
        <p><strong>Submission Time:</strong> ${proof.submissionTimestamp.toISOString()}</p>
        <p><strong>Content Hash:</strong> ${proof.contentHash}</p>
        <p><strong>Certificate ID:</strong> ${proof.proofCertificate.certificateId}</p>
        <p><strong>Digital Signature:</strong> ${proof.proofCertificate.digitalSignature}</p>
        <p><strong>Verification Status:</strong> ${proof.verificationStatus}</p>
      </div>
    `;

    const downloadUrl = `data:text/html;charset=utf-8,${encodeURIComponent(certificateHtml)}`;

    return {
      certificateHtml,
      downloadUrl
    };
  }

  // Private helper methods
  private calculateSimilarity(
    idea1: { title: string; description: string; tags: string[] },
    idea2: { title: string; description: string; tags: string[] }
  ): number {
    // Simple similarity calculation based on common words and tags
    const words1 = new Set([
      ...idea1.title.toLowerCase().split(/\s+/),
      ...idea1.description.toLowerCase().split(/\s+/),
      ...idea1.tags.map(tag => tag.toLowerCase())
    ]);

    const words2 = new Set([
      ...idea2.title.toLowerCase().split(/\s+/),
      ...idea2.description.toLowerCase().split(/\s+/),
      ...idea2.tags.map(tag => tag.toLowerCase())
    ]);

    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);

    return (intersection.size / union.size) * 100;
  }

  private findMatchingElements(
    idea1: { title: string; description: string; tags: string[] },
    idea2: { title: string; description: string; tags: string[] }
  ): string[] {
    const matches: string[] = [];

    // Check title similarity
    const titleWords1 = new Set(idea1.title.toLowerCase().split(/\s+/));
    const titleWords2 = new Set(idea2.title.toLowerCase().split(/\s+/));
    const titleIntersection = new Set([...titleWords1].filter(word => titleWords2.has(word)));
    
    if (titleIntersection.size > 0) {
      matches.push(`Similar title keywords: ${Array.from(titleIntersection).join(', ')}`);
    }

    // Check tag overlap
    const tagIntersection = idea1.tags.filter(tag => 
      idea2.tags.some(tag2 => tag.toLowerCase() === tag2.toLowerCase())
    );
    
    if (tagIntersection.length > 0) {
      matches.push(`Common tags: ${tagIntersection.join(', ')}`);
    }

    return matches;
  }

  private updateSearchIndex(ideaId: string, title: string, description: string, tags: string[]) {
    const keywords = [
      ...title.toLowerCase().split(/\s+/),
      ...description.toLowerCase().split(/\s+/),
      ...tags.map(tag => tag.toLowerCase())
    ];

    keywords.forEach(keyword => {
      if (keyword.length > 2) { // Only index words longer than 2 characters
        if (!this.searchIndex.has(keyword)) {
          this.searchIndex.set(keyword, new Set());
        }
        this.searchIndex.get(keyword)!.add(ideaId);
      }
    });
  }

  // Get originality statistics
  getOriginalityStats(): {
    totalProofs: number;
    verifiedProofs: number;
    disputedProofs: number;
    averageProcessingTime: number;
    uniqueContentHashes: number;
  } {
    const proofs = Array.from(this.proofs.values());
    const disputes = Array.from(this.disputes.values());

    return {
      totalProofs: proofs.length,
      verifiedProofs: proofs.filter(p => p.verificationStatus === 'verified').length,
      disputedProofs: proofs.filter(p => p.verificationStatus === 'disputed').length,
      averageProcessingTime: 2.5, // Mock average in seconds
      uniqueContentHashes: this.contentHashes.size
    };
  }
}

export const originalityService = new OriginalityService();