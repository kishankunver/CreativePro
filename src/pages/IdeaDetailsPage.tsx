import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, MessageCircle, Share2, Bookmark, Calendar, User, Flag, Send, Shield } from 'lucide-react';
import Header from '../components/Header';
import FlagModal from '../components/FlagModal';
import MessagingModal from '../components/MessagingModal';
import ProofOfOriginality from '../components/ProofOfOriginality';
import { useIdeas } from '../contexts/IdeaContext';
import { useAuth } from '../contexts/AuthContext';

const IdeaDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getIdea, voteIdea, addComment, flagIdea, recordIdeaView, getUserVote } = useIdeas();
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showProofOfOriginality, setShowProofOfOriginality] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const idea = id ? getIdea(id) : null;
  const userVote = user && idea ? getUserVote(idea.id, user.id) : null;

  useEffect(() => {
    // Record idea view for "view one, add one" rule
    if (idea && user) {
      recordIdeaView(user.id, idea.id);
    }
  }, [idea, user, recordIdeaView]);

  if (!idea) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 pt-24">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Idea not found</h1>
            <Link to="/" className="text-indigo-600 hover:text-indigo-800">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleVote = (vote: 'up' | 'down') => {
    if (!user) {
      alert('Please log in to vote on ideas');
      return;
    }
    voteIdea(idea.id, vote, user.id);
  };

  const handleComment = () => {
    if (commentText.trim() && user) {
      addComment(idea.id, commentText, user.id);
      setCommentText('');
    }
  };

  const handleFlag = (reason: string, details: string) => {
    if (user) {
      flagIdea(idea.id, reason, details, user.id);
      alert('Thank you for your report. We\'ll review this idea shortly.');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: idea.title,
        text: idea.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto py-8 px-4 pt-24">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-3/4 space-y-6">
            {/* Idea Details */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-3xl font-bold text-gray-800 flex-1">{idea.title}</h1>
                  <div className="flex items-center space-x-2 ml-4">
                    {idea.author.isVerified && (
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                        <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </div>
                    )}
                    <button
                      onClick={() => setShowProofOfOriginality(!showProofOfOriginality)}
                      className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium hover:bg-green-200 transition"
                    >
                      <Shield className="h-3 w-3" />
                      <span>Proof of Originality</span>
                    </button>
                    <button
                      onClick={() => setShowFlagModal(true)}
                      className="text-gray-400 hover:text-red-500 transition"
                      title="Flag this idea"
                    >
                      <Flag className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-500 text-sm mb-6">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Posted {formatTimeAgo(idea.createdAt)}</span>
                  <span className="mx-2">•</span>
                  <span>{idea.category}</span>
                  {idea.viewCount && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{idea.viewCount.toLocaleString()} views</span>
                    </>
                  )}
                </div>

                <div className="prose max-w-none text-gray-700 mb-6">
                  <p className="text-lg leading-relaxed">{idea.description}</p>
                  
                  {idea.noveltyScore && (
                    <div className="my-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                      <h3 className="font-semibold text-indigo-800 mb-2">AI Analysis</h3>
                      <div className="flex items-center space-x-4">
                        <div>
                          <span className="text-sm text-indigo-700">Novelty Score:</span>
                          <span className="ml-2 font-bold text-indigo-600">{idea.noveltyScore}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {idea.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleVote('up')}
                      className={`p-2 rounded-full transition ${
                        userVote === 'up'
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                      }`}
                    >
                      <ArrowUp className="h-5 w-5" />
                    </button>
                    <span className="font-semibold text-lg">{idea.upvotes - idea.downvotes}</span>
                    <button
                      onClick={() => handleVote('down')}
                      className={`p-2 rounded-full transition ${
                        userVote === 'down'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      <ArrowDown className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex items-center text-gray-600 space-x-4">
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-5 w-5" />
                      <span>{idea.comments.length} comments</span>
                    </div>
                    <button 
                      onClick={handleShare}
                      className="flex items-center space-x-1 hover:text-indigo-600 transition"
                    >
                      <Share2 className="h-5 w-5" />
                      <span>Share</span>
                    </button>
                    <button 
                      onClick={() => setIsBookmarked(!isBookmarked)}
                      className={`flex items-center space-x-1 transition ${
                        isBookmarked ? 'text-indigo-600' : 'hover:text-indigo-600'
                      }`}
                    >
                      <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                      <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Proof of Originality */}
            {showProofOfOriginality && (
              <ProofOfOriginality
                ideaId={idea.id}
                title={idea.title}
              />
            )}

            {/* Comments Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Comments ({idea.comments.length})
                </h2>

                {/* Comment Input */}
                {user && (
                  <div className="mb-8">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      rows={3}
                      placeholder="Share your thoughts..."
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={handleComment}
                        disabled={!commentText.trim()}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Post Comment
                      </button>
                    </div>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-6">
                  {idea.comments.map((comment) => (
                    <div key={comment.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {comment.author.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-800">{comment.author.name}</h4>
                            <span className="text-sm text-gray-500">
                              {formatTimeAgo(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-2">{comment.content}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <button className="text-gray-500 hover:text-indigo-600 transition">
                              <ArrowUp className="h-4 w-4 inline mr-1" />
                              {comment.upvotes}
                            </button>
                            <button className="text-gray-500 hover:text-indigo-600 transition">
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {idea.comments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No comments yet. Be the first to share your thoughts!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="sticky top-24 space-y-6">
              {/* Author Profile */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {idea.author.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-800">{idea.author.name}</h3>
                      <p className="text-sm text-gray-500">
                        {idea.author.company || 'Creator'}
                      </p>
                    </div>
                  </div>

                  {idea.author.bio && (
                    <p className="text-gray-600 text-sm mb-4">{idea.author.bio}</p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <div className="font-semibold text-indigo-600">{idea.author.ideas.length}</div>
                      <div className="text-xs text-gray-500">Ideas</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-indigo-600">{idea.author.followers}</div>
                      <div className="text-xs text-gray-500">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-indigo-600">{idea.author.karma}</div>
                      <div className="text-xs text-gray-500">Karma</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link
                      to={`/profile/${idea.author.id}`}
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition text-center block"
                    >
                      View Profile
                    </Link>
                    
                    {user && user.id !== idea.author.id && (
                      <button
                        onClick={() => setShowMessageModal(true)}
                        className="w-full bg-white border border-indigo-600 text-indigo-600 py-3 rounded-lg font-medium hover:bg-indigo-50 transition flex items-center justify-center space-x-2"
                      >
                        <Send className="h-4 w-4" />
                        <span>Message</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <FlagModal
        isOpen={showFlagModal}
        onClose={() => setShowFlagModal(false)}
        onSubmit={handleFlag}
        ideaTitle={idea.title}
      />

      <MessagingModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        recipient={idea.author}
        ideaTitle={idea.title}
      />
    </div>
  );
};

export default IdeaDetailsPage;