import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, User, LogOut, Shield, Bell, Menu, X } from 'lucide-react';
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowMobileMenu(false);
  };

  const verificationStatus = user ? verificationService.getVerificationStatus(user.id) : null;
  const canSubmitVerification = user ? verificationService.canSubmitVerificationRequest(user.id) : null;
  const unreadNotificationCount = user ? socialService.getUnreadNotificationCount(user.id) : 0;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40 border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 flex items-center justify-between max-w-6xl">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-4">
            <img 
              src="/Logo.png" 
              alt="CreativePro Logo" 
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            />
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">CreativePro</span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden lg:block flex-grow max-w-xl xl:max-w-2xl mx-8 xl:mx-12">
            <div className="relative">
              <input
                type="text"
                placeholder="Search ideas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 lg:py-4 pl-12 lg:pl-14 pr-6 lg:pr-8 rounded-xl border border-gray-300 lg:border-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 text-base lg:text-lg"
              />
              <Search className="absolute left-4 lg:left-5 top-3 lg:top-4.5 h-5 w-5 lg:h-6 lg:w-6 text-gray-400" />
            </div>
          </div>

          {/* Desktop User Actions */}
          <div className="hidden sm:flex items-center space-x-4 lg:space-x-6">
            {user ? (
              <>
                <Link
                  to="/submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 sm:py-3 lg:py-4 px-4 sm:px-6 lg:px-8 rounded-lg lg:rounded-xl transition duration-200 flex items-center space-x-2 lg:space-x-3 shadow-sm text-sm lg:text-base"
                >
                  <Plus className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="hidden md:inline">Submit Idea</span>
                  <span className="md:hidden">Submit</span>
                </Link>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2.5 lg:p-4 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg lg:rounded-xl transition-colors"
                  >
                    <Bell className="h-5 w-5 lg:h-6 lg:w-6" />
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 lg:h-6 lg:w-6 flex items-center justify-center font-medium">
                        {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                      </span>
                    )}
                  </button>
                </div>
                
                <div className="relative group">
                  <button className="flex items-center space-x-2 lg:space-x-4 p-2 lg:p-3 rounded-lg lg:rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-base lg:text-lg">
                      {user.name.charAt(0)}
                    </div>
                    {verificationStatus?.isVerified && verificationStatus.badge && (
                      <VerificationBadge badge={verificationStatus.badge} size="sm" showTooltip={false} />
                    )}
                  </button>
                  
                  <div className="absolute right-0 mt-2 lg:mt-3 w-72 lg:w-80 bg-white rounded-xl shadow-lg py-2 lg:py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200">
                    <div className="px-6 lg:px-8 py-3 lg:py-5 border-b border-gray-100">
                      <div className="flex items-center space-x-3 lg:space-x-4">
                        <div className="font-semibold text-gray-800 text-base lg:text-lg">{user.name}</div>
                        {verificationStatus?.isVerified && verificationStatus.badge && (
                          <VerificationBadge badge={verificationStatus.badge} size="sm" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1 lg:mt-2">{user.email}</div>
                    </div>
                    
                    <Link
                      to={`/profile/${user.id}`}
                      className="flex items-center px-6 lg:px-8 py-3 lg:py-4 text-sm lg:text-base text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="h-4 w-4 lg:h-5 lg:w-5 mr-3 lg:mr-4" />
                      Profile
                    </Link>
                    
                    {!verificationStatus?.isVerified && canSubmitVerification?.canSubmit && (
                      <button
                        onClick={() => setShowVerificationModal(true)}
                        className="flex items-center w-full px-6 lg:px-8 py-3 lg:py-4 text-sm lg:text-base text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Shield className="h-4 w-4 lg:h-5 lg:w-5 mr-3 lg:mr-4" />
                        Get Verified
                      </button>
                    )}
                    
                    {verificationStatus?.pendingRequest && (
                      <div className="px-6 lg:px-8 py-3 lg:py-4 text-sm lg:text-base text-orange-600 bg-orange-50">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 lg:h-5 lg:w-5 mr-3 lg:mr-4" />
                          Verification Pending
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-6 lg:px-8 py-3 lg:py-4 text-sm lg:text-base text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 lg:h-5 lg:w-5 mr-3 lg:mr-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 sm:py-3 lg:py-4 px-4 sm:px-6 lg:px-8 rounded-lg lg:rounded-xl transition duration-200 text-sm lg:text-base"
              >
                Sign In
              </Link>
            )}

            {/* Bolt Badge */}
            <a
              href="https://bolt.new/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 hover:scale-105 transition-transform duration-200"
              title="Made with Bolt"
            >
              <img
                src="/black_circle_360x360.png"
                alt="Made with Bolt"
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200"
              />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center space-x-2">
            {/* Mobile Bolt Badge */}
            <a
              href="https://bolt.new/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 hover:scale-105 transition-transform duration-200"
              title="Made with Bolt"
            >
              <img
                src="/black_circle_360x360.png"
                alt="Made with Bolt"
                className="w-8 h-8 rounded-full shadow-sm"
              />
            </a>
            
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="sm:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  
                  <Link
                    to="/submit"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center space-x-3 py-3 text-gray-700 hover:text-indigo-600"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Submit Idea</span>
                  </Link>
                  
                  <Link
                    to={`/profile/${user.id}`}
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center space-x-3 py-3 text-gray-700 hover:text-indigo-600"
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      setShowNotifications(true);
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center space-x-3 py-3 text-gray-700 hover:text-indigo-600 w-full text-left"
                  >
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                    {unreadNotificationCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                      </span>
                    )}
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 py-3 text-gray-700 hover:text-red-600 w-full text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setShowMobileMenu(false)}
                  className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 text-center"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
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