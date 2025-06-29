import React, { useState, useEffect } from 'react';
import { Shield, Download, Clock, CheckCircle, AlertTriangle, FileText, Copy, ExternalLink } from 'lucide-react';
import { originalityService } from '../services/originality';
import { OriginalityProof } from '../types';

interface ProofOfOriginalityProps {
  ideaId: string;
  title: string;
  className?: string;
}

const ProofOfOriginality: React.FC<ProofOfOriginalityProps> = ({
  ideaId,
  title,
  className = ''
}) => {
  const [proof, setProof] = useState<OriginalityProof | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  useEffect(() => {
    loadProof();
  }, [ideaId]);

  const loadProof = () => {
    setIsLoading(true);
    const existingProof = originalityService.getProof(ideaId);
    setProof(existingProof);
    
    if (existingProof) {
      const verification = originalityService.verifyProof(existingProof);
      setVerificationResult(verification);
    }
    
    setIsLoading(false);
  };

  const handleDownloadCertificate = () => {
    const certificate = originalityService.generateCertificate(ideaId);
    if (certificate) {
      const link = document.createElement('a');
      link.href = certificate.downloadUrl;
      link.download = `originality-certificate-${ideaId}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!proof) {
    return (
      <div className={`bg-gray-50 rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Proof of Originality</h3>
          <p className="text-gray-600 text-sm">
            This idea was submitted before the proof of originality system was implemented.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Proof of Originality</h3>
              <p className="text-sm text-gray-600">Verified timestamp and authenticity</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {verificationResult && (
              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                verificationResult.isValid 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {verificationResult.isValid ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <span>{verificationResult.isValid ? 'Verified' : 'Invalid'}</span>
              </div>
            )}
            
            <button
              onClick={handleDownloadCertificate}
              className="flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
            >
              <Download className="h-4 w-4" />
              <span>Certificate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Key Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Submission Timestamp</label>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-800 font-mono">
                  {formatTimestamp(proof.submissionTimestamp)}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content Hash</label>
              <div className="flex items-center space-x-2">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-800 flex-1">
                  {proof.contentHash}
                </code>
                <button
                  onClick={() => copyToClipboard(proof.contentHash)}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Certificate ID</label>
              <div className="flex items-center space-x-2">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-800 flex-1">
                  {proof.proofCertificate.certificateId}
                </code>
                <button
                  onClick={() => copyToClipboard(proof.proofCertificate.certificateId)}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${
                proof.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                proof.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {proof.verificationStatus === 'verified' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : proof.verificationStatus === 'pending' ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <span className="capitalize">{proof.verificationStatus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Blockchain & IPFS Info */}
        {(proof.blockchainHash || proof.ipfsHash) && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-800 mb-3">Decentralized Storage</h4>
            <div className="space-y-2">
              {proof.blockchainHash && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Blockchain Hash:</span>
                  <code className="text-xs bg-blue-100 px-2 py-1 rounded font-mono text-blue-800">
                    {proof.blockchainHash}
                  </code>
                </div>
              )}
              {proof.ipfsHash && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">IPFS Hash:</span>
                  <code className="text-xs bg-blue-100 px-2 py-1 rounded font-mono text-blue-800">
                    {proof.ipfsHash}
                  </code>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Witness Signatures */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-800 mb-3">Witness Signatures ({proof.witnessSignatures.length})</h4>
          <div className="space-y-2">
            {proof.witnessSignatures.map((witness) => (
              <div key={witness.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    witness.witnessType === 'system' ? 'bg-blue-500' :
                    witness.witnessType === 'external' ? 'bg-green-500' : 'bg-purple-500'
                  }`} />
                  <div>
                    <div className="text-sm font-medium text-gray-800">{witness.witnessName}</div>
                    <div className="text-xs text-gray-500">
                      {formatTimestamp(witness.timestamp)}
                    </div>
                  </div>
                </div>
                <code className="text-xs bg-gray-200 px-2 py-1 rounded font-mono text-gray-700">
                  {witness.signature}
                </code>
              </div>
            ))}
          </div>
        </div>

        {/* Chain of Custody */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-800 mb-3">Chain of Custody</h4>
          <div className="space-y-3">
            {proof.proofCertificate.metadata.chainOfCustody.map((entry, index) => (
              <div key={entry.id} className="flex items-start space-x-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-indigo-600 rounded-full" />
                  {index < proof.proofCertificate.metadata.chainOfCustody.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-300 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-800 capitalize">{entry.action}</span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{entry.details}</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700 mt-1 inline-block">
                    {entry.currentHash}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Details */}
        {verificationResult && !verificationResult.isValid && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">Verification Issues</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {verificationResult.issues.map((issue: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                  {issue}
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <span className="text-sm text-red-700">
                Confidence Level: {verificationResult.confidence}%
              </span>
            </div>
          </div>
        )}

        {/* Legal Notice */}
        <div className="bg-gray-50 rounded-lg p-4 mt-6">
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Legal Notice:</p>
              <p>
                This proof of originality provides a timestamped record of idea submission. 
                It does not constitute legal protection or guarantee intellectual property rights. 
                For formal IP protection, consult with a qualified attorney.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProofOfOriginality;