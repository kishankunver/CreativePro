import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, User, LogOut, Shield, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useIdeas } from '../contexts/IdeaContext';
import VerificationModal from './VerificationModal';
import VerificationBadge from './VerificationBadge';
import NotificationCenter from './NotificationCenter';
import { verificationService } from '../services/verification';
import { socialService } from '../services/social';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { searchQuery, setSearchQuery } = useIdeas();
  const navigate = useNavigate();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const verificationStatus = user ? verificationService.getVerificationStatus(user.id) : null;
  const canSubmitVerification = user ? verificationService.canSubmitVerificationRequest(user.id) : null;
  const unreadNotificationCount = user ? socialService.getUnreadNotificationCount(user.id) : 0;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40 border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">CreativePro</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:block flex-grow max-w-lg mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search ideas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 pl-12 pr-6 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
              />
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 flex items-center space-x-2 shadow-sm"
                >
                  <Plus className="h-5 w-5" />
                  <span className="hidden sm:inline">Submit Idea</span>
                </Link>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <Bell className="h-6 w-6" />
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
                        {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                      </span>
                    )}
                  </button>
                </div>
                
                <div className="relative group">
                  <button className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0)}
                    </div>
                    {verificationStatus?.isVerified && verificationStatus.badge && (
                      <VerificationBadge badge={verificationStatus.badge} size="sm" showTooltip={false} />
                    )}
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="font-semibold text-gray-800">{user.name}</div>
                        {verificationStatus?.isVerified && verificationStatus.badge && (
                          <VerificationBadge badge={verificationStatus.badge} size="sm" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{user.email}</div>
                    </div>
                    
                    <Link
                      to={`/profile/${user.id}`}
                      className="flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="h-5 w-5 mr-3" />
                      Profile
                    </Link>
                    
                    {!verificationStatus?.isVerified && canSubmitVerification?.canSubmit && (
                      <button
                        onClick={() => setShowVerificationModal(true)}
                        className="flex items-center w-full px-6 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Shield className="h-5 w-5 mr-3" />
                        Get Verified
                      </button>
                    )}
                    
                    {verificationStatus?.pendingRequest && (
                      <div className="px-6 py-3 text-sm text-orange-600 bg-orange-50">
                        <div className="flex items-center">
                          <Shield className="h-5 w-5 mr-3" />
                          Verification Pending
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onSuccess={() => {
          // Refresh the page or update user context
          window.location.reload();
        }}
      />

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
};

export default Header;